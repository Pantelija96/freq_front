<template>
  <DashboardLayout :breadcrumbs="breadcrumbs" active-key="licences">
    <div class="card bg-dark text-white">
      <div class="card-header">
        <h6 class="mb-0">Device Licences</h6>
      </div>

      <div class="card-body one-device-table-card-body">
        <table
          ref="licencesTableEl"
          class="table table-dark table-hover one-device-data-table"
        >
          <thead>
            <tr>
              <th>Licence Key</th>
              <th>Device ID</th>
              <th>IMEI</th>
              <th>Device Name</th>
              <th>Device MAC</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!licences.length">
              <td colspan="5" class="text-center text-white-50">
                No licence keys available.
              </td>
            </tr>
            <tr v-for="licence in licences" :key="licence.id">
              <td class="font-monospace small">{{ licence.licence_key }}</td>
              <td>{{ licence.device_id }}</td>
              <td>{{ licence.imei }}</td>
              <td>{{ licence.device_name || "-" }}</td>
              <td>{{ licence.device_mac || "-" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { buildApiUrl } from "../services/api";
import { getAuthHeaders } from "../services/auth";

const breadcrumbs = [{ label: "Home", to: "/home" }, { label: "Licences" }];

const licences = ref([]);
const licencesTableEl = ref(null);

let licencesTable = null;

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

async function loadLicences() {
  licences.value = await fetchJson(buildApiUrl("/dashboard/licences"));
  await nextTick();
  syncTable();
}

function initTable() {
  if (!licencesTableEl.value || licencesTable) {
    return;
  }

  licencesTable = window.$(licencesTableEl.value).DataTable({
    pageLength: 25,
    order: [[3, "asc"]],
  });
}

function syncTable() {
  if (licencesTable) {
    licencesTable.destroy();
    licencesTable = null;
  }

  nextTick(() => {
    initTable();
    handleResize();
  });
}

function handleResize() {
  licencesTable?.columns.adjust();
}

onMounted(async () => {
  await loadLicences();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (licencesTable) {
    licencesTable.destroy();
    licencesTable = null;
  }
});
</script>
