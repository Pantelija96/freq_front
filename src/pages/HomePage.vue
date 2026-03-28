<template>
  <DashboardLayout :breadcrumbs="breadcrumbs" active-key="home">
    <div class="row">
      <div class="col-12 col-md-4" v-for="card in cards" :key="card.label">
        <div class="card bg-dark text-white dashboard-stat-card">
          <div class="card-body">
            <div class="dashboard-stat-label">{{ card.label }}</div>
            <p class="dashboard-stat-value">{{ card.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-3">
      <div class="col-xl-8">
        <div class="card bg-dark">
          <div class="card-header">
            <h6 class="mb-0">Active Devices Per Group</h6>
          </div>
          <div class="card-body">
            <div ref="devicesChartEl" style="height: 500px"></div>
          </div>
        </div>
      </div>

      <div class="col-xl-4">
        <div class="card bg-dark">
          <div class="card-header">
            <h6 class="mb-0">Group Distribution</h6>
          </div>
          <div class="card-body">
            <div ref="groupPieEl" style="height: 500px"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-dark mt-3">
      <div class="card-header">
        <h6 class="mb-0">Devices</h6>
      </div>

      <div class="card-body">
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="text-muted">{{ selectedCount }} devices selected</span>

          <div v-if="isAdmin" class="d-flex gap-2 flex-wrap">
            <button
              v-for="button in bulkButtons"
              :key="button.command"
              class="btn btn-sm bulk-command"
              :class="button.className"
              :disabled="bulkSending"
              @click="sendBulkCommand(button.command)"
            >
              {{ button.label }}
            </button>
          </div>
        </div>

        <table ref="devicesTableEl" class="table table-dark table-hover">
          <thead>
            <tr>
              <th width="40">
                <input id="checkAllDevices" type="checkbox" />
              </th>
              <th>Group</th>
              <th>Device Name</th>
              <th>IMEI</th>
              <th>Status</th>
              <th>Last Seen</th>
              <th width="140">Actions</th>
              <th width="100">Stats</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { buildApiUrl } from "../services/api";
import { getAuthHeaders, isAdminUser } from "../services/auth";
import { subscribeDashboardSocket } from "../services/dashboardSocket";

const breadcrumbs = [{ label: "Home", to: "/home" }, { label: "Dashboard" }];
const router = useRouter();
const isAdmin = isAdminUser();

const bulkButtons = [
  { command: "fix", label: "Fix", className: "btn-primary" },
  { command: "reset", label: "Reset", className: "btn-warning" },
  { command: "enable", label: "Enable", className: "btn-success" },
  { command: "disable", label: "Disable", className: "btn-danger" },
  { command: "stats", label: "Stats", className: "btn-info" },
  { command: "fix_mac", label: "NIC Define", className: "btn-pink" },
  { command: "reset_mac", label: "NIC Reset", className: "btn-indigo" },
];

const cardsState = ref({
  totalDevices: 0,
  onlineDevices: 0,
  total_groups: 0,
});

const cards = computed(() => [
  { label: "Total Devices", value: cardsState.value.totalDevices },
  { label: "Online Devices", value: cardsState.value.onlineDevices },
  { label: "Total Groups", value: cardsState.value.total_groups },
]);

const selectedCount = ref(0);
const bulkSending = ref(false);
const devicesChartEl = ref(null);
const groupPieEl = ref(null);
const devicesTableEl = ref(null);

const devices = {};
const groups = {};
const chartSeries = {};
const collapsedGroups = {};

let devicesChart = null;
let groupPieChart = null;
let dataTable = null;
let refreshLastSeenInterval = null;
let unsubscribeDashboardSocket = null;

function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: getAuthHeaders(options.headers || {}),
  });
}

async function fetchJson(url, options = {}) {
  const response = await authFetch(url, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
}

async function loadOverview() {
  const data = await fetchJson(buildApiUrl("/dashboard/overview"));
  cardsState.value = {
    totalDevices: data.total_devices || 0,
    onlineDevices: data.online_devices || 0,
    total_groups: data.total_groups || 0,
  };
}

async function loadDevices() {
  const data = await fetchJson(buildApiUrl("/dashboard/devices"));

  Object.keys(devices).forEach((key) => delete devices[key]);
  Object.keys(groups).forEach((key) => delete groups[key]);

  data.forEach((device) => {
    devices[device.id] = device;

    if (!groups[device.group_name]) {
      groups[device.group_name] = 0;
    }

    if (device.online) {
      groups[device.group_name] += 1;
    }
  });

  updateChart();
  updatePie();
  renderTable();
}

function initCharts() {
  devicesChart = window.echarts.init(devicesChartEl.value);
  devicesChart.setOption({
    backgroundColor: "#1e1e1e",
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#fff" } },
    xAxis: { type: "time", axisLabel: { color: "#aaa" } },
    yAxis: { type: "value", axisLabel: { color: "#aaa" } },
    series: [],
  });

  groupPieChart = window.echarts.init(groupPieEl.value);
  groupPieChart.setOption({
    backgroundColor: "#1e1e1e",
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: "70%",
        data: [],
      },
    ],
  });
}

function updateChart() {
  const now = new Date();

  Object.keys(groups).forEach((groupName) => {
    if (!chartSeries[groupName]) {
      chartSeries[groupName] = [];
    }

    chartSeries[groupName].push([now, groups[groupName]]);
    if (chartSeries[groupName].length > 50) {
      chartSeries[groupName].shift();
    }
  });

  const series = Object.keys(chartSeries).map((groupName) => ({
    name: groupName,
    type: "line",
    data: chartSeries[groupName],
    smooth: false,
  }));

  devicesChart.setOption({ series });
}

function updatePie() {
  const data = Object.keys(groups).map((groupName) => ({
    name: groupName,
    value: groups[groupName],
  }));

  groupPieChart.setOption({
    series: [{ data }],
  });
}

function renderTable() {
  if (!dataTable) {
    return;
  }

  dataTable.clear();

  Object.values(devices).forEach((device) => {
    const statusHTML = device.online
      ? '<span class="badge bg-success">ONLINE</span>'
      : '<span class="badge bg-danger">OFFLINE</span>';

    dataTable.row.add({
      checkbox: `
        <input type="checkbox"
          class="device-checkbox"
          data-device="${device.id}"
          data-group="${escapeAttribute(device.group_name || "No group")}">
      `,
      group: device.group_name || "No group",
      name: device.device_name || "",
      imei: device.imei,
      status: statusHTML,
      status_raw: device.online,
      last_seen: timeAgo(device.last_seen),
      last_seen_raw: device.last_seen,
      actions: `
        ${isAdmin ? `
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-light dropdown-toggle" data-bs-toggle="dropdown">
              Actions
            </button>
            <div class="dropdown-menu dropdown-menu-dark">
              ${bulkButtons
                .map(
                  (button) => `
                <a class="dropdown-item send-command" data-device="${device.id}" data-command="${button.command}">
                  ${button.label}
                </a>
              `,
                )
                .join("")}
            </div>
          </div>
        ` : `<span class="text-white-50 small">View only</span>`}
      `,
      stats: `<button type="button" class="btn btn-sm btn-info open-device-stats" data-device="${device.id}">Stats</button>`,
    });
  });

  dataTable.draw();
  syncGroupCheckboxes();
}

function initTable() {
  const $ = window.$;

  dataTable = $(devicesTableEl.value).DataTable({
    columns: [
      { data: "checkbox" },
      { data: "group" },
      { data: "name" },
      { data: "imei" },
      { data: "status" },
      { data: "last_seen" },
      { data: "actions" },
      { data: "stats" },
    ],
    pageLength: 25,
    columnDefs: [{ orderable: false, targets: [0, 4, 6, 7] }],
    order: [[3, "asc"]],
    rowGroup: {
      dataSrc: "group",
      startRender(rows, group) {
        const collapsed = !!collapsedGroups[group];
        rows.nodes().each((row) => {
          row.style.display = collapsed ? "none" : "";
          row.classList.add("device-row");
          row.dataset.group = group;
        });

        let online = 0;
        let offline = 0;
        rows.data().each((row) => {
          if (row.status_raw) online += 1;
          else offline += 1;
        });

        const icon = collapsed ? "&#9654;" : "&#9660;";

        return $(`
          <tr class="group-header" data-group="${escapeAttribute(group)}">
            <td>
              <input type="checkbox" class="group-checkbox" data-group="${escapeAttribute(group)}">
            </td>
            <td colspan="6">
              <span class="group-toggle" style="cursor:pointer">
                <span class="group-toggle-icon">${icon}</span>
                <b>${group}</b>
                <span class="group-summary ms-3">
                  <span class="text-success">${online} online</span> /
                  <span class="text-danger">${offline} offline</span>
                </span>
              </span>
            </td>
          </tr>
        `);
      },
    },
  });

  bindTableEvents();
}

function bindTableEvents() {
  const $ = window.$;

  $(document).off(".homePage");

  $(document).on("change.homePage", "#checkAllDevices", function onCheckAll() {
    const checked = $(this).prop("checked");
    $(".device-checkbox").prop("checked", checked);
    $(".group-checkbox").prop("checked", checked);
    updateSelectedCounter();
  });

  $(document).on(
    "change.homePage",
    ".group-checkbox",
    function onGroupCheckbox() {
      const group = $(this).data("group");
      const checked = $(this).prop("checked");
      $(`.device-checkbox[data-group="${escapeSelectorValue(group)}"]`).prop(
        "checked",
        checked,
      );
      updateSelectedCounter();
    },
  );

  $(document).on("click.homePage", ".group-checkbox", (event) => {
    event.stopPropagation();
  });

  $(document).on("click.homePage", ".group-toggle", function onGroupToggle() {
    const group = $(this).closest("tr").data("group");
    collapsedGroups[group] = !collapsedGroups[group];
    dataTable.draw(false);
    syncGroupCheckboxes();
  });

  $(document).on(
    "change.homePage",
    ".device-checkbox",
    function onDeviceCheckbox() {
      const row = $(this).closest("tr");
      const group = row.data("group");
      const all = $(
        `.device-row[data-group="${escapeSelectorValue(group)}"] .device-checkbox`,
      );
      const checked = all.filter(":checked");
      updateSelectedCounter();
      $(`.group-checkbox[data-group="${escapeSelectorValue(group)}"]`).prop(
        "checked",
        all.length === checked.length,
      );
    },
  );

  $(document).on("click.homePage", "input[type=checkbox]", (event) => {
    event.stopPropagation();
  });

  $(document).on("click.homePage", ".send-command", async (event) => {
    if (!isAdmin) {
      return;
    }
    const element = $(event.currentTarget);
    await sendCommandToDevice(
      Number(element.data("device")),
      element.data("command"),
    );
  });

  $(document).on("click.homePage", ".open-device-stats", (event) => {
    const deviceId = Number($(event.currentTarget).data("device"));
    router.push({ name: "one-device", query: { id: deviceId } });
  });
}

function connectWebSocket() {
  unsubscribeDashboardSocket = subscribeDashboardSocket((message) => {
    if (message.type === "device_online") {
      const device = devices[message.deviceId];
      if (!device) return;

      device.online = 1;
      groups[device.group_name] = (groups[device.group_name] || 0) + 1;
      cardsState.value.onlineDevices += 1;
      updateChart();
      updatePie();
      renderTable();
    }

    if (message.type === "device_offline" || message.type === "device_logout") {
      const device = devices[message.deviceId];
      if (!device) return;

      if (device.online) {
        cardsState.value.onlineDevices = Math.max(
          0,
          cardsState.value.onlineDevices - 1,
        );
      }

      device.online = 0;
      groups[device.group_name] = Math.max(
        0,
        (groups[device.group_name] || 0) - 1,
      );
      updateChart();
      updatePie();
      renderTable();
    }
  });
}

async function sendCommandToDevice(deviceId, command, options = {}) {
  if (!isAdmin) {
    await showAlert("warning", "Read-only user", "Only admins can send commands to devices.");
    return;
  }

  const { silent = false } = options;

  try {
    await fetchJson(buildApiUrl("/dashboard/command"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deviceId, command }),
    });

    await loadOverview();
    if (!silent) {
      await showAlert(
        "success",
        "Command sent",
        `Command "${command}" was queued for device ${deviceId}.`,
      );
    }
  } catch (error) {
    if (!silent) {
      await showAlert(
        "error",
        "Command failed",
        error.message || "The command could not be sent.",
      );
    }
    throw error;
  }
}

async function sendBulkCommand(command) {
  if (!isAdmin) {
    await showAlert("warning", "Read-only user", "Only admins can send commands to devices.");
    return;
  }

  const selected = getSelectedDevices();
  if (!selected.length) {
    await showAlert(
      "warning",
      "No devices selected",
      "Select at least one device first.",
    );
    return;
  }

  bulkSending.value = true;

  try {
    for (const deviceId of selected) {
      await sendCommandToDevice(deviceId, command, { silent: true });
    }
    await showAlert(
      "success",
      "Bulk command sent",
      `Command "${command}" was queued for ${selected.length} devices.`,
    );
  } catch (error) {
    await showAlert(
      "error",
      "Bulk command failed",
      error.message || "The bulk command could not be sent.",
    );
  } finally {
    bulkSending.value = false;
  }
}

function getSelectedDevices() {
  return window
    .$(".device-checkbox:checked")
    .map(function mapSelected() {
      return Number(window.$(this).data("device"));
    })
    .get();
}

function updateSelectedCounter() {
  selectedCount.value = window.$(".device-checkbox:checked").length;
}

function syncGroupCheckboxes() {
  const $ = window.$;

  $(".group-checkbox").each(function syncOneGroup() {
    const group = $(this).data("group");
    const all = $(
      `.device-row[data-group="${escapeSelectorValue(group)}"] .device-checkbox`,
    );
    const checked = all.filter(":checked");
    $(this).prop("checked", all.length > 0 && all.length === checked.length);
  });

  updateSelectedCounter();
}

function timeAgo(dateString) {
  if (!dateString) return "-";
  const parsedTime = new Date(dateString).getTime();
  if (Number.isNaN(parsedTime)) return "-";
  const seconds = Math.max(0, Math.floor((Date.now() - parsedTime) / 1000));
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return `${days} d ago`;
}

function escapeAttribute(value) {
  return String(value).replaceAll('"', "&quot;");
}

function escapeSelectorValue(value) {
  return String(value).replaceAll('"', '\\"');
}

function handleResize() {
  devicesChart?.resize();
  groupPieChart?.resize();

  if (dataTable) {
    dataTable.columns.adjust();
    dataTable.draw(false);
  }
}

async function showAlert(icon, title, text) {
  if (window.Swal?.fire) {
    return window.Swal.fire({
      icon,
      title,
      text,
      background: "#111",
      color: "#f5f5f5",
      confirmButtonColor: "#0d6efd",
    });
  }

  window.alert(`${title}\n\n${text}`);
  return Promise.resolve();
}

onMounted(async () => {
  await nextTick();
  initCharts();
  initTable();
  await Promise.all([loadOverview(), loadDevices()]);
  connectWebSocket();
  window.addEventListener("resize", handleResize);

  refreshLastSeenInterval = window.setInterval(() => {
    if (!dataTable) {
      return;
    }

    dataTable.rows().every(function refreshRow() {
      const rowData = this.data();
      if (rowData.last_seen_raw) {
        rowData.last_seen = timeAgo(rowData.last_seen_raw);
        this.data(rowData);
      }
    });
  }, 10000);
});

onBeforeUnmount(() => {
  window.$(document).off(".homePage");
  window.removeEventListener("resize", handleResize);
  if (unsubscribeDashboardSocket) {
    unsubscribeDashboardSocket();
    unsubscribeDashboardSocket = null;
  }
  if (refreshLastSeenInterval) {
    window.clearInterval(refreshLastSeenInterval);
  }
  if (dataTable) {
    dataTable.destroy();
  }
  if (devicesChart) {
    devicesChart.dispose();
  }
  if (groupPieChart) {
    groupPieChart.dispose();
  }
});
</script>
