<template>
  <DashboardLayout :breadcrumbs="breadcrumbs" active-key="stats">
    <div v-if="!deviceId" class="card bg-dark text-white">
      <div class="card-header one-device-section-title">Select a Device</div>
      <div class="card-body one-device-table-card-body">
        <p class="text-white-50 mb-3">
          Choose a device to open its statistics page.
        </p>

        <table
          ref="devicePickerTableEl"
          class="table table-dark table-hover one-device-data-table"
        >
          <thead>
            <tr>
              <th>Device Name</th>
              <th>IMEI</th>
              <th>Group</th>
              <th>Status</th>
              <th width="100">Stats</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="deviceOption in deviceOptions" :key="deviceOption.id">
              <td>{{ deviceOption.device_name || `Device ${deviceOption.id}` }}</td>
              <td>{{ deviceOption.imei }}</td>
              <td>{{ deviceOption.group_name || "Unknown" }}</td>
              <td>
                <span :class="deviceOption.online ? 'badge bg-success' : 'badge bg-danger'">
                  {{ deviceOption.online ? "ONLINE" : "OFFLINE" }}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-sm btn-info"
                  @click="selectDevice(deviceOption.id)"
                >
                  Stats
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template v-else>
      <div class="device-header-wrapper">
        <div class="card bg-dark text-white device-header">
          <div
            class="card-body d-flex justify-content-between align-items-center flex-wrap gap-3"
          >
            <div>
              <h5 class="mb-0">
                {{ device?.device_name || `Device ${deviceId}` }}
              </h5>
              <small>
                Group: {{ device?.group_name || "Unknown" }} | IMEI:
                {{ device?.imei || "-" }} | Status:
                <span :class="device?.online ? 'text-success' : 'text-danger'">
                  {{ device?.online ? "ONLINE" : "OFFLINE" }}
                </span>
              </small>
              <div class="mt-2">
                <button
                  type="button"
                  class="btn btn-sm btn-light"
                  :disabled="reportLoading"
                  @click="downloadDeviceReport"
                >
                  {{ reportLoading ? "Generating Report..." : "Generate Report" }}
                </button>
              </div>
            </div>

            <div v-if="isAdmin" class="d-flex gap-2 flex-wrap">
              <button
                v-for="button in commandButtons"
                :key="button.command"
                class="btn btn-sm"
                :class="button.className"
                :disabled="sendingCommand"
                @click="sendCommand(button.command)"
              >
                {{ button.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-xl-12">
          <div class="card bg-dark">
            <div class="card-header">
              <h6 class="mb-0">CPU Frequency Timeline</h6>
            </div>
            <div class="card-body">
              <div ref="cpuChartEl" style="height: 420px"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-6 col-xl-3">
          <div class="card bg-dark text-white dashboard-stat-card h-100">
            <div class="card-body">
              <div class="dashboard-stat-label">Observed Time</div>
              <p class="dashboard-stat-value fs-2">{{ formatDuration(cpuSummary.total_observed_ms) }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="card bg-dark text-white dashboard-stat-card h-100">
            <div class="card-body">
              <div class="dashboard-stat-label">Fixed Time</div>
              <p class="dashboard-stat-value fs-2">{{ formatDuration(cpuSummary.fixed_time_ms) }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="card bg-dark text-white dashboard-stat-card h-100">
            <div class="card-body">
              <div class="dashboard-stat-label">Fixed Sessions</div>
              <p class="dashboard-stat-value">{{ cpuSummary.fixed_session_count || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="card bg-dark text-white dashboard-stat-card h-100">
            <div class="card-body">
              <div class="dashboard-stat-label">Fixed Percentage</div>
              <p class="dashboard-stat-value">{{ formatPercent(cpuSummary.fixed_percent) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-6 col-xl-3">
          <div class="card bg-dark text-white dashboard-stat-card h-100">
            <div class="card-body">
              <div class="dashboard-stat-label">Crashes During Fixed</div>
              <p class="dashboard-stat-value">{{ cpuSummary.crashes_during_fixed || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="card bg-dark text-white dashboard-stat-card h-100">
            <div class="card-body">
              <div class="dashboard-stat-label">Crashes Outside Fixed</div>
              <p class="dashboard-stat-value">{{ cpuSummary.crashes_outside_fixed || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="card bg-dark text-white dashboard-stat-card h-100">
            <div class="card-body">
              <div class="dashboard-stat-label">Top Small Fixed</div>
              <p class="dashboard-stat-value fs-2">{{ formatFrequency(cpuSummary.top_small_fixed_freq_khz) }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="card bg-dark text-white dashboard-stat-card h-100">
            <div class="card-body">
              <div class="dashboard-stat-label">Top Big Fixed</div>
              <p class="dashboard-stat-value fs-2">{{ formatFrequency(cpuSummary.top_big_fixed_freq_khz) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-dark text-white mt-4">
        <div class="card-header one-device-section-title">Fixed Sessions</div>
        <div class="card-body one-device-table-card-body">
          <table
            ref="fixedSessionsTableEl"
            class="table table-dark table-hover one-device-data-table"
          >
            <thead>
              <tr>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th>Small</th>
                <th>Big</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="session in fixedSessions" :key="session.id">
                <td>{{ formatDateTime(session.start_timestamp) }}</td>
                <td>{{ formatDateTime(session.end_timestamp) }}</td>
                <td>{{ formatDuration(session.duration_ms) }}</td>
                <td>{{ formatFrequency(session.small_frequency_khz) }}</td>
                <td>{{ formatFrequency(session.big_frequency_khz) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-lg-6">
          <div class="card bg-dark text-white h-100">
            <div class="card-header one-device-section-title">App Statistics</div>
            <div class="card-body one-device-table-card-body">
              <table ref="appsTableEl" class="table table-dark table-hover one-device-data-table">
                <thead>
                  <tr>
                    <th>App</th>
                    <th>CPU Time</th>
                    <th>Battery</th>
                    <th>RX</th>
                    <th>TX</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="app in stats.apps" :key="app.package_name">
                    <td>{{ app.app_name || app.package_name }}</td>
                    <td>{{ formatNumber(app.cpu_time_sec, 2) }} s</td>
                    <td>{{ formatNumber(app.battery_pct, 2) }}%</td>
                    <td>{{ formatNumber(app.received_mb, 2) }} MB</td>
                    <td>{{ formatNumber(app.transmitted_mb, 2) }} MB</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card bg-dark text-white h-100">
            <div class="card-header one-device-section-title">Crash History</div>
            <div class="card-body one-device-table-card-body">
              <table ref="crashesTableEl" class="table table-dark table-hover one-device-data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>App</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="crash in stats.crashes"
                    :key="`${crash.package_name}-${crash.crash_time}`"
                  >
                    <td>{{ formatDateTime(crash.crash_time) }}</td>
                    <td>{{ crash.app_name || crash.package_name }}</td>
                    <td>{{ crash.reason || "-" }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-dark text-white mt-4">
        <div class="card-header one-device-section-title">Command History</div>
        <div class="card-body one-device-table-card-body">
          <table ref="commandsTableEl" class="table table-dark table-hover one-device-data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Command</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="command in commands" :key="command.id">
                <td>{{ formatDateTime(command.created_at) }}</td>
                <td>
                  <span :class="commandNameClass(command.command)">
                    {{ command.command }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="commandStatusClass(command.status)"
                  >
                    {{ command.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { buildApiUrl } from "../services/api";
import { getAuthHeaders, isAdminUser } from "../services/auth";
import { subscribeDashboardSocket } from "../services/dashboardSocket";

const route = useRoute();
const router = useRouter();
const isAdmin = isAdminUser();

const commandButtons = [
  { command: "fix", label: "Fix", className: "btn-primary" },
  { command: "reset", label: "Reset", className: "btn-warning" },
  { command: "enable", label: "Enable", className: "btn-success" },
  { command: "disable", label: "Disable", className: "btn-danger" },
  { command: "stats", label: "Stats", className: "btn-info" },
  { command: "fix_mac", label: "NIC Define", className: "btn-pink" },
  { command: "reset_mac", label: "NIC Reset", className: "btn-indigo" },
];

const device = ref(null);
const deviceOptions = ref([]);
const commands = ref([]);
const sendingCommand = ref(false);
const reportLoading = ref(false);
const CPU_OVERLAP_OFFSET_KHZ = 12000;
const cpuSummary = ref({
  total_observed_ms: 0,
  fixed_time_ms: 0,
  fixed_percent: 0,
  fixed_session_count: 0,
  crashes_during_fixed: 0,
  crashes_outside_fixed: 0,
  top_small_fixed_freq_khz: null,
  top_big_fixed_freq_khz: null,
});
const fixedSessions = ref([]);
const stats = ref({
  apps: [],
  crashes: [],
});
const cpuChartEl = ref(null);
const devicePickerTableEl = ref(null);
const fixedSessionsTableEl = ref(null);
const appsTableEl = ref(null);
const crashesTableEl = ref(null);
const commandsTableEl = ref(null);

let cpuChart = null;
let devicePickerTable = null;
let fixedSessionsTable = null;
let appsTable = null;
let crashesTable = null;
let commandsTable = null;
let unsubscribeDashboardSocket = null;

const deviceId = computed(() => {
  const parsed = Number(route.query.id);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});

const breadcrumbs = computed(() => [
  { label: "Home", to: "/home" },
  { label: "One Device" },
  {
    label:
      device.value?.device_name ||
      (deviceId.value ? `Device ${deviceId.value}` : "Statistics"),
  },
]);

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

async function loadPageData() {
  if (!deviceId.value) {
    device.value = null;
    deviceOptions.value = await fetchJson(buildApiUrl("/dashboard/devices"));
    commands.value = [];
    cpuSummary.value = {
      total_observed_ms: 0,
      fixed_time_ms: 0,
      fixed_percent: 0,
      fixed_session_count: 0,
      crashes_during_fixed: 0,
      crashes_outside_fixed: 0,
      top_small_fixed_freq_khz: null,
      top_big_fixed_freq_khz: null,
    };
    fixedSessions.value = [];
    stats.value = { apps: [], crashes: [] };
    syncTables();
    return;
  }

  const [deviceData, commandRows, statsData, cpuData] = await Promise.all([
    fetchJson(buildApiUrl(`/dashboard/device/${deviceId.value}`)),
    fetchJson(buildApiUrl(`/dashboard/device/${deviceId.value}/commands`)),
    fetchJson(buildApiUrl(`/dashboard/device/${deviceId.value}/stats`)),
    fetchJson(
      buildApiUrl(`/dashboard/device/${deviceId.value}/cpu-frequencies`),
    ),
  ]);

  device.value = deviceData;
  commands.value = commandRows;
  cpuSummary.value = cpuData.summary || {
    total_observed_ms: 0,
    fixed_time_ms: 0,
    fixed_percent: 0,
    fixed_session_count: 0,
    crashes_during_fixed: 0,
    crashes_outside_fixed: 0,
    top_small_fixed_freq_khz: null,
    top_big_fixed_freq_khz: null,
  };
  fixedSessions.value = cpuData.fixed_sessions || [];
  stats.value = {
    apps: statsData.apps || [],
    crashes: statsData.crashes || [],
  };

  await nextTick();
  updateCpuChart(cpuData.series || []);
  syncTables();
}

function selectDevice(id) {
  router.push({ name: "one-device", query: { id } });
}

function ensureCpuChart() {
  if (!cpuChartEl.value || cpuChart) {
    return;
  }

  cpuChart = window.echarts.init(cpuChartEl.value);
  cpuChart.setOption({
    backgroundColor: "#12284f",
    tooltip: {
      trigger: "axis",
      formatter(params) {
        const lines = [];
        const seen = new Set();

        params.forEach((param, index) => {
          const rawValue = param.data?.rawValue ?? param.value?.[1] ?? param.value;
          const label = `${param.seriesName}-${rawValue}`;
          if (seen.has(label)) {
            return;
          }
          seen.add(label);

          if (index === 0) {
            lines.push(new Date(param.value[0]).toLocaleString());
          }

          lines.push(`${param.marker}${param.seriesName}: ${(Number(rawValue) / 1000).toFixed(1)} MHz`);
        });

        return lines.join("<br>");
      },
    },
    legend: { textStyle: { color: "#fff" } },
    grid: { top: 50, left: 60, right: 30, bottom: 50 },
    xAxis: {
      type: "time",
      axisLabel: { color: "#d6e3ff" },
      splitLine: { lineStyle: { color: "rgba(173, 194, 255, 0.16)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#d6e3ff", formatter: (value) => `${value / 1000} MHz` },
      splitLine: { lineStyle: { color: "rgba(173, 194, 255, 0.16)" } },
    },
    series: [],
  });
}

function updateCpuChart(series) {
  ensureCpuChart();
  if (!cpuChart) {
    return;
  }

  const adjustedSeries = buildSeparatedSeries(series);
  const mappedSeries = adjustedSeries.map((entry) => ({
    ...entry,
    type: "line",
    showSymbol: false,
    lineStyle: {
      width: 3,
      color: entry.name.includes("Small") ? "#6f92e8" : "#80dcff",
    },
  }));

  cpuChart.setOption({ series: mappedSeries });
  cpuChart.resize();
}

function appendFrequencyBatch(batch) {
  ensureCpuChart();
  if (!cpuChart) {
    return;
  }

  const option = cpuChart.getOption();
  const nextSeries = (option.series || []).map((series) => {
    const existingData = Array.isArray(series.data) ? [...series.data] : [];
    const source = series.name?.includes("Small") ? batch.small : batch.big;

    if (!Array.isArray(source)) {
      return series;
    }

    source.forEach((frequency, index) => {
      existingData.push([
        Number(batch.start) + index * (batch.interval || 250),
        frequency,
      ]);
    });

    return {
      ...series,
      data: existingData
        .slice(-400)
        .map((point) => ({
          value: point,
          rawValue: point[1],
        })),
    };
  });

  const rawSeries = nextSeries.map((series) => ({
    name: series.name,
    data: (series.data || []).map((point) => point.value || point),
  }));
  const adjustedSeries = buildSeparatedSeries(rawSeries).map((series, index) => ({
    ...nextSeries[index],
    data: series.data,
  }));

  cpuChart.setOption({ series: adjustedSeries });
}

function buildSeparatedSeries(series) {
  const smallSeries = series.find((entry) => entry.name.includes("Small"));
  const bigSeries = series.find((entry) => entry.name.includes("Big"));

  if (!smallSeries || !bigSeries) {
    return series.map((entry) => ({
      ...entry,
      data: (entry.data || []).map((point) => normalizeChartPoint(point)),
    }));
  }

  const smallMap = new Map(
    (smallSeries.data || []).map((point) => {
      const normalized = normalizeChartPoint(point);
      return [normalized.value[0], normalized.rawValue];
    }),
  );
  const bigMap = new Map(
    (bigSeries.data || []).map((point) => {
      const normalized = normalizeChartPoint(point);
      return [normalized.value[0], normalized.rawValue];
    }),
  );

  return series.map((entry) => {
    const isSmall = entry.name.includes("Small");
    const isBig = entry.name.includes("Big");

    return {
      ...entry,
      data: (entry.data || []).map((point) => {
        const normalized = normalizeChartPoint(point);
        const timestamp = normalized.value[0];
        const ownRawValue = normalized.rawValue;

        if (isSmall && bigMap.get(timestamp) === ownRawValue) {
          return {
            ...normalized,
            value: [timestamp, ownRawValue - CPU_OVERLAP_OFFSET_KHZ],
          };
        }

        if (isBig && smallMap.get(timestamp) === ownRawValue) {
          return {
            ...normalized,
            value: [timestamp, ownRawValue + CPU_OVERLAP_OFFSET_KHZ],
          };
        }

        return normalized;
      }),
    };
  });
}

function normalizeChartPoint(point) {
  if (Array.isArray(point)) {
    return {
      value: point,
      rawValue: point[1],
    };
  }

  return {
    ...point,
    value: Array.isArray(point.value) ? point.value : [point.x, point.y],
    rawValue: point.rawValue ?? point.value?.[1] ?? point.y ?? null,
  };
}

async function sendCommand(command) {
  if (!isAdmin) {
    await showAlert("warning", "Read-only user", "Only admins can send commands to devices.");
    return;
  }

  if (!deviceId.value) {
    return;
  }

  sendingCommand.value = true;

  try {
    await fetchJson(buildApiUrl("/dashboard/command"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceId: deviceId.value,
        command,
      }),
    });

    await showAlert(
      "success",
      "Command sent",
      `Command "${command}" was queued for device ${deviceId.value}.`,
    );
    commands.value = await fetchJson(
      buildApiUrl(`/dashboard/device/${deviceId.value}/commands`),
    );
  } catch (error) {
    await showAlert(
      "error",
      "Command failed",
      error.message || "The command could not be sent.",
    );
  } finally {
    sendingCommand.value = false;
  }
}

async function downloadDeviceReport() {
  if (!deviceId.value) {
    return;
  }

  reportLoading.value = true;

  try {
    const response = await authFetch(buildApiUrl("/dashboard/report/devices"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceIds: [deviceId.value],
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || `Report request failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `device-${deviceId.value}-report-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    await showAlert(
      "error",
      "Report failed",
      error.message || "Failed to generate the device report.",
    );
  } finally {
    reportLoading.value = false;
  }
}

function connectWebSocket() {
  if (unsubscribeDashboardSocket) {
    unsubscribeDashboardSocket();
  }

  unsubscribeDashboardSocket = subscribeDashboardSocket(async (message) => {
    if (!deviceId.value || message.deviceId !== deviceId.value) {
      return;
    }

    if (message.type === "device_online") {
      if (device.value) {
        device.value = {
          ...device.value,
          online: 1,
          last_seen: message.timestamp || new Date().toISOString(),
        };
      }
      return;
    }

    if (message.type === "device_offline" || message.type === "device_logout") {
      if (device.value) {
        device.value = {
          ...device.value,
          online: 0,
          last_seen: message.timestamp || device.value.last_seen,
        };
      }
      return;
    }

    if (message.type === "command_update" || message.type === "command_result") {
      commands.value = await fetchJson(
        buildApiUrl(`/dashboard/device/${deviceId.value}/commands`),
      );
      syncTables();
      return;
    }

    if (message.type === "device_stats") {
      stats.value = {
        apps: message.apps || [],
        crashes: message.crashes || [],
      };
      syncTables();
      return;
    }

    if (message.type === "frequency_batch") {
      appendFrequencyBatch(message);
    }
  });
}

function commandStatusClass(status) {
  return (
    {
      pending: "bg-secondary",
      sent: "bg-info",
      acknowledged: "bg-primary",
      done: "bg-success",
      failed: "bg-danger",
      cancelled: "bg-warning text-dark",
    }[status] || "bg-secondary"
  );
}

function commandNameClass(command) {
  return {
    fix: "command-name command-name-fix",
    reset: "command-name command-name-reset",
    enable: "command-name command-name-enable",
    disable: "command-name command-name-disable",
    stats: "command-name command-name-stats",
    fix_mac: "command-name command-name-fix-mac",
    reset_mac: "command-name command-name-reset-mac",
  }[command] || "command-name";
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function formatNumber(value, digits = 0) {
  return Number(value || 0).toFixed(digits);
}

function formatDuration(value) {
  const duration = Number(value);
  if (!Number.isFinite(duration)) {
    return "-";
  }

  const totalSeconds = Math.max(0, Math.round(duration / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function formatFrequency(value) {
  const frequency = Number(value);
  if (!Number.isFinite(frequency)) {
    return "-";
  }

  return `${(frequency / 1000).toFixed(1)} MHz`;
}

function formatPercent(value) {
  const percent = Number(value);
  if (!Number.isFinite(percent)) {
    return "0%";
  }

  return `${percent.toFixed(2)}%`;
}

function initTables() {
  const $ = window.$;

  if (!deviceId.value && !devicePickerTable && devicePickerTableEl.value) {
    devicePickerTable = $(devicePickerTableEl.value).DataTable({
      pageLength: 10,
      order: [[0, "asc"]],
      columnDefs: [{ orderable: false, targets: [3, 4] }],
      language: {
        emptyTable: "No devices available.",
      },
    });
  }

  if (!appsTable && appsTableEl.value) {
    appsTable = $(appsTableEl.value).DataTable({
      pageLength: 10,
      order: [[1, "desc"]],
      columnDefs: [{ type: "num", targets: [1, 2, 3, 4] }],
      language: {
        emptyTable: "No app stats yet.",
      },
    });
  }

  if (!fixedSessionsTable && fixedSessionsTableEl.value) {
    fixedSessionsTable = $(fixedSessionsTableEl.value).DataTable({
      pageLength: 10,
      order: [[0, "desc"]],
      language: {
        emptyTable: "No fixed sessions detected.",
      },
    });
  }

  if (!crashesTable && crashesTableEl.value) {
    crashesTable = $(crashesTableEl.value).DataTable({
      pageLength: 10,
      order: [[0, "desc"]],
      language: {
        emptyTable: "No crashes recorded.",
      },
    });
  }

  if (!commandsTable && commandsTableEl.value) {
    commandsTable = $(commandsTableEl.value).DataTable({
      pageLength: 10,
      order: [[0, "desc"]],
      language: {
        emptyTable: "No commands sent yet.",
      },
    });
  }
}

function syncTables() {
  if (devicePickerTable) {
    devicePickerTable.destroy();
    devicePickerTable = null;
  }
  if (appsTable) {
    appsTable.destroy();
    appsTable = null;
  }
  if (fixedSessionsTable) {
    fixedSessionsTable.destroy();
    fixedSessionsTable = null;
  }
  if (crashesTable) {
    crashesTable.destroy();
    crashesTable = null;
  }
  if (commandsTable) {
    commandsTable.destroy();
    commandsTable = null;
  }

  nextTick(() => {
    initTables();
    handleResize();
  });
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
  cpuChart?.resize();
  devicePickerTable?.columns.adjust();
  fixedSessionsTable?.columns.adjust();
  appsTable?.columns.adjust();
  crashesTable?.columns.adjust();
  commandsTable?.columns.adjust();
}

onMounted(async () => {
  ensureCpuChart();
  await loadPageData();
  connectWebSocket();
  window.addEventListener("resize", handleResize);
});

watch(deviceId, async () => {
  await loadPageData();
  connectWebSocket();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (unsubscribeDashboardSocket) {
    unsubscribeDashboardSocket();
    unsubscribeDashboardSocket = null;
  }
  if (devicePickerTable) {
    devicePickerTable.destroy();
    devicePickerTable = null;
  }
  if (appsTable) {
    appsTable.destroy();
    appsTable = null;
  }
  if (fixedSessionsTable) {
    fixedSessionsTable.destroy();
    fixedSessionsTable = null;
  }
  if (crashesTable) {
    crashesTable.destroy();
    crashesTable = null;
  }
  if (commandsTable) {
    commandsTable.destroy();
    commandsTable = null;
  }
  if (cpuChart) {
    cpuChart.dispose();
    cpuChart = null;
  }
});
</script>
