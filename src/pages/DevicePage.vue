<template>
  <DashboardLayout :breadcrumbs="breadcrumbs" active-key="report">
    <div class="card bg-dark text-white mt-3">
      <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h6 class="mb-0">Generate Device Report</h6>
        <button
          class="btn btn-primary"
          :disabled="reportLoading"
          @click="downloadReport"
        >
          {{ reportLoading ? "Generating PDF..." : "Generate PDF" }}
        </button>
      </div>

      <div class="card-body">
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="text-muted">{{ selectedCount }} devices selected</span>
          <span class="text-white-50 small">
            Select individual devices or entire groups, then generate a multi-page PDF.
          </span>
        </div>

        <table ref="devicesTableEl" class="table table-dark table-hover">
          <thead>
            <tr>
              <th width="40">
                <input id="checkAllReportDevices" type="checkbox" />
              </th>
              <th>Group</th>
              <th>Device Name</th>
              <th>IMEI</th>
              <th>Status</th>
              <th>Last Seen</th>
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
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { buildApiUrl } from "../services/api";
import { getAuthHeaders } from "../services/auth";

const breadcrumbs = [{ label: "Home", to: "/home" }, { label: "Report" }];

const devicesTableEl = ref(null);
const selectedCount = ref(0);
const reportLoading = ref(false);

const devices = {};
const collapsedGroups = {};

let dataTable = null;

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
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}

async function loadDevices() {
  const rows = await fetchJson(buildApiUrl("/dashboard/devices"));

  Object.keys(devices).forEach((key) => delete devices[key]);
  rows.forEach((device) => {
    devices[device.id] = device;
  });

  renderTable();
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
    ],
    pageLength: 25,
    columnDefs: [{ orderable: false, targets: [0, 4] }],
    order: [[2, "asc"]],
    rowGroup: {
      dataSrc: "group",
      startRender(rows, group) {
        const collapsed = !!collapsedGroups[group];
        rows.nodes().each((row) => {
          row.style.display = collapsed ? "none" : "";
          row.classList.add("device-row");
          row.dataset.group = group;
        });

        const total = rows.count();
        const icon = collapsed ? "&#9654;" : "&#9660;";

        return $(`
          <tr class="group-header" data-group="${escapeAttribute(group)}">
            <td>
              <input type="checkbox" class="group-checkbox" data-group="${escapeAttribute(group)}">
            </td>
            <td colspan="5">
              <span class="group-toggle" style="cursor:pointer">
                <span class="group-toggle-icon">${icon}</span>
                <b>${group}</b>
                <span class="group-summary ms-3">${total} device${total === 1 ? "" : "s"}</span>
              </span>
            </td>
          </tr>
        `);
      },
    },
  });

  bindTableEvents();
}

function renderTable() {
  if (!dataTable) {
    return;
  }

  dataTable.clear();

  Object.values(devices).forEach((device) => {
    dataTable.row.add({
      checkbox: `
        <input type="checkbox"
          class="device-checkbox"
          data-device="${device.id}"
          data-group="${escapeAttribute(device.group_name || "No group")}">
      `,
      group: device.group_name || "No group",
      name: device.device_name || `Device ${device.id}`,
      imei: device.imei || "-",
      status: device.online
        ? '<span class="badge bg-success">ONLINE</span>'
        : '<span class="badge bg-danger">OFFLINE</span>',
      last_seen: timeAgo(device.last_seen),
    });
  });

  dataTable.draw();
  syncGroupCheckboxes();
}

function bindTableEvents() {
  const $ = window.$;

  $(document).off(".reportPage");

  $(document).on("change.reportPage", "#checkAllReportDevices", function onCheckAll() {
    const checked = $(this).prop("checked");
    $(".device-checkbox").prop("checked", checked);
    $(".group-checkbox").prop("checked", checked);
    updateSelectedCounter();
  });

  $(document).on("change.reportPage", ".group-checkbox", function onGroupCheckbox() {
    const group = $(this).data("group");
    const checked = $(this).prop("checked");
    $(`.device-checkbox[data-group="${escapeSelectorValue(group)}"]`).prop("checked", checked);
    updateSelectedCounter();
  });

  $(document).on("click.reportPage", ".group-checkbox", (event) => {
    event.stopPropagation();
  });

  $(document).on("click.reportPage", ".group-toggle", function onGroupToggle() {
    const group = $(this).closest("tr").data("group");
    collapsedGroups[group] = !collapsedGroups[group];
    dataTable.draw(false);
    syncGroupCheckboxes();
  });

  $(document).on("change.reportPage", ".device-checkbox", function onDeviceCheckbox() {
    const row = $(this).closest("tr");
    const group = row.data("group");
    const all = $(`.device-row[data-group="${escapeSelectorValue(group)}"] .device-checkbox`);
    const checked = all.filter(":checked");
    updateSelectedCounter();
    $(`.group-checkbox[data-group="${escapeSelectorValue(group)}"]`).prop(
      "checked",
      all.length > 0 && all.length === checked.length,
    );
  });

  $(document).on("click.reportPage", "input[type=checkbox]", (event) => {
    event.stopPropagation();
  });
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
    const all = $(`.device-row[data-group="${escapeSelectorValue(group)}"] .device-checkbox`);
    const checked = all.filter(":checked");
    $(this).prop("checked", all.length > 0 && all.length === checked.length);
  });

  updateSelectedCounter();
}

async function downloadReport() {
  const deviceIds = getSelectedDevices();
  if (!deviceIds.length) {
    await showAlert("warning", "No devices selected", "Select at least one device or group first.");
    return;
  }

  reportLoading.value = true;

  try {
    const response = await authFetch(buildApiUrl("/dashboard/report/devices"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deviceIds }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || `Report request failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `device-report-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    await showAlert("error", "Report failed", error.message || "Failed to generate the report.");
  } finally {
    reportLoading.value = false;
  }
}

async function showAlert(icon, title, text) {
  if (window.Swal?.fire) {
    return window.Swal.fire({
      icon,
      title,
      text,
      background: "#12284f",
      color: "#eef4ff",
      confirmButtonColor: "#3e5ea7",
    });
  }

  window.alert(`${title}\n\n${text}`);
  return Promise.resolve();
}

function handleResize() {
  dataTable?.columns.adjust();
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

onMounted(async () => {
  await nextTick();
  initTable();
  await loadDevices();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.$(document).off(".reportPage");
  window.removeEventListener("resize", handleResize);
  if (dataTable) {
    dataTable.destroy();
    dataTable = null;
  }
});
</script>
