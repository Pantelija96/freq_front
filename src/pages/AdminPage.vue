<template>
  <DashboardLayout :breadcrumbs="breadcrumbs" active-key="admin">
    <div class="about-docs-page">
      <div class="about-docs-layout">
        <div class="about-docs-content">
          <section id="overview" :ref="registerSection" class="about-docs-section">
            <h1 class="about-docs-title">Administration Documentation</h1>
            <p>
              This page provides a technical overview of the platform for administrators
              and operators responsible for deployment, maintenance, and troubleshooting.
              It focuses on the communication model, authentication model, database
              structure, installation model, and runtime behavior of the system.
            </p>
            <p>
              The platform is composed of three main layers: a Vue frontend, a Node.js
              backend, and a local MySQL database. The frontend consumes protected
              backend APIs and subscribes to live dashboard updates, while Android devices
              communicate directly with the backend for registration, login, live sessions,
              and telemetry delivery.
            </p>

            <div class="table-responsive border rounded about-docs-table-wrap">
              <table class="table about-docs-table mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Layer</th>
                    <th>Responsibility</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Frontend</td>
                    <td>Dashboard UI, authenticated API access, live dashboard updates, reporting, and operator workflows.</td>
                  </tr>
                  <tr>
                    <td>Backend</td>
                    <td>HTTPS API, WSS device sessions, dashboard WebSocket feed, command dispatch, telemetry ingestion, and PDF generation.</td>
                  </tr>
                  <tr>
                    <td>Database</td>
                    <td>Persistent storage for devices, commands, users, licences, app stats, crashes, frequency segments, and processed batch metadata.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="transport" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">Transport And Communication Model</h2>
            <p>
              The platform uses two transport paths: HTTPS for request/response operations
              and WSS for long-lived live communication. This split keeps standard web
              interactions simple while allowing devices and the dashboard to receive live
              updates without repeated polling.
            </p>

            <div class="table-responsive border rounded about-docs-table-wrap">
              <table class="table about-docs-table mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Transport</th>
                    <th>Primary use</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>HTTPS</td>
                    <td>Dashboard login, protected API routes, reports, licences, device registration, and device login.</td>
                  </tr>
                  <tr>
                    <td>WSS</td>
                    <td>Device live sessions, command delivery, acknowledgements, stats ingestion, frequency batches, and dashboard live events.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="about-docs-flow">
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">1. Provision</div>
                <p>A device registers through the open provisioning flow and receives the credentials required for later login.</p>
              </div>
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">2. Login</div>
                <p>The device authenticates through HTTPS and receives the WSS endpoint it should use for its live session.</p>
              </div>
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">3. Session</div>
                <p>The device opens a WSS session, authenticates, and is marked online in memory and in the database.</p>
              </div>
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">4. Live traffic</div>
                <p>Commands, stats, crashes, and frequency batches move through the live channel and are then persisted for later review.</p>
              </div>
            </div>
          </section>

          <section id="auth" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">Authentication And Access Control</h2>
            <p>
              Dashboard users authenticate through the backend and receive a JWT signed
              with the configured dashboard secret. Protected dashboard routes require that
              token, and the dashboard WebSocket authorization path accepts the same
              dashboard secret or a valid JWT.
            </p>
            <p>
              The system currently supports two dashboard roles: <strong>admin</strong> and
              <strong>user</strong>. Both roles can view operational data, while only admins
              are allowed to send device commands through the standard dashboard UI.
            </p>

            <div class="table-responsive border rounded about-docs-table-wrap">
              <table class="table about-docs-table mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Access layer</th>
                    <th>Behavior</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>JWT dashboard auth</td>
                    <td>Used by the frontend after login to call protected dashboard routes.</td>
                  </tr>
                  <tr>
                    <td>Dashboard WebSocket auth</td>
                    <td>Uses the dashboard secret or a verified JWT for live dashboard updates.</td>
                  </tr>
                  <tr>
                    <td>Role checks</td>
                    <td>Applied on backend routes and reflected in the UI so non-admin users cannot send commands.</td>
                  </tr>
                  <tr>
                    <td>Provisioning</td>
                    <td>Currently open by design for the device-registration workflow in the target environment.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="database" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">Database Model</h2>
            <p>
              The database stores both live-operational state and historical records.
              Devices, users, and licences provide the base identity layer. Commands,
              stats, crashes, and frequency segments provide the operational history used
              by the frontend and reporting layer.
            </p>
            <p>
              For deployment, the recommended database model uses a private maintenance
              account for installation and controlled support access, plus a separate
              restricted application account used by the backend service itself. The
              backend should never run with the maintenance credentials.
            </p>

            <div class="table-responsive border rounded about-docs-table-wrap">
              <table class="table about-docs-table mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Table area</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Devices / groups / licences</td>
                    <td>Core inventory and assignment data, including local device identity and licence mapping.</td>
                  </tr>
                  <tr>
                    <td>Users</td>
                    <td>Dashboard access, hashed passwords, roles, and last-login tracking.</td>
                  </tr>
                  <tr>
                    <td>Commands</td>
                    <td>Queued commands, lifecycle status, execution result, error state, and operator attribution.</td>
                  </tr>
                  <tr>
                    <td>Stats / crashes</td>
                    <td>Collected device snapshots, per-app statistics, and crash history.</td>
                  </tr>
                  <tr>
                    <td>Frequency segments</td>
                    <td>Compressed CPU frequency history used for device charts, analytics, and reports.</td>
                  </tr>
                  <tr>
                    <td>Processed batches</td>
                    <td>Deduplication and processing state for incoming frequency batches.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="table-responsive border rounded about-docs-table-wrap mt-3">
              <table class="table about-docs-table mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Database user</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Private maintenance user</td>
                    <td>Used only for installation, direct maintenance, and controlled administrative access such as VPN-based support.</td>
                  </tr>
                  <tr>
                    <td>Backend application user</td>
                    <td>Used by the Node.js backend on the same host with access limited to the application database.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="optimization" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">Optimization Strategy</h2>
            <p>
              The platform already uses a few important optimizations so the data remains
              practical to store and query. The most important example is frequency
              ingestion: repeated values are compressed into segments rather than stored as
              raw repeated samples.
            </p>
            <p>
              The schema also includes indexes around recent-history access patterns, such
              as device command history, device stats retrieval, and frequency timeline
              lookups. This supports the current dashboard pages and report generator
              without requiring full-table reads for the most common workflows.
            </p>

            <div class="about-docs-flow">
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">Compressed frequency storage</div>
                <p>Frequency batches are transformed into segments so repeated values do not multiply storage cost unnecessarily.</p>
              </div>
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">Recent-history indexing</div>
                <p>Commands, devices, stats, and frequency tables use indexes aimed at the main dashboard and report queries.</p>
              </div>
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">Push-based live updates</div>
                <p>The frontend does not need to poll everything continuously because live events are pushed over WSS.</p>
              </div>
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">Stored analytics</div>
                <p>Frequency sessions and report summaries are derived from stored segments instead of requiring raw-sample rendering everywhere.</p>
              </div>
            </div>
          </section>

          <section id="frontend" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">Frontend Runtime Behavior</h2>
            <p>
              The frontend authenticates against the backend, stores the dashboard token,
              and uses that token for protected API requests. For live behavior, it also
              opens the dashboard WSS connection and listens for events such as
              online/offline changes, command updates, stats updates, and live frequency
              activity.
            </p>
            <p>
              In development, the frontend can run on its own configurable Vite port.
              In production, it is built into static files and served by nginx on the same
              machine as the backend. That means the frontend and backend can stay in
              separate repositories while still being deployed together on one Linux host.
            </p>
            <p>
              Role-based behavior is enforced in two places: the backend rejects
              unauthorized actions, and the frontend hides command controls for read-only
              users. This keeps the UI consistent with the actual permission model.
            </p>

            <div class="table-responsive border rounded about-docs-table-wrap">
              <table class="table about-docs-table mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Frontend mechanism</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>JWT session</td>
                    <td>Provides authenticated access to dashboard APIs after login.</td>
                  </tr>
                  <tr>
                    <td>Dashboard WSS client</td>
                    <td>Receives live device and command events without full-page refreshes.</td>
                  </tr>
                  <tr>
                    <td>Role-aware UI</td>
                    <td>Keeps visibility available to all logged-in users while limiting command execution controls to admins.</td>
                  </tr>
                  <tr>
                    <td>Offline-friendly assets</td>
                    <td>Frontend runtime dependencies are served locally so the UI does not depend on public CDNs.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="installation" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">Installation</h2>
            <p>
              The platform is intended to support a single-machine Linux deployment. In
              that model, nginx, the built Vue frontend, the Node.js backend, and MySQL
              all run on the same host. This is the recommended starting point for shipboard
              installation because it keeps the environment simple and fully local.
            </p>
            <p>
              The frontend and backend do not need to be merged into one repository to
              support this. They can stay in separate repositories and still be copied to
              the same server, built separately, and served together through nginx.
            </p>

            <div class="table-responsive border rounded about-docs-table-wrap">
              <table class="table about-docs-table mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Component</th>
                    <th>Recommended location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Backend</td>
                    <td><code>/opt/freq/backend</code></td>
                  </tr>
                  <tr>
                    <td>Frontend</td>
                    <td><code>/opt/freq/frontend</code></td>
                  </tr>
                  <tr>
                    <td>Certificates</td>
                    <td><code>/opt/freq/cert</code></td>
                  </tr>
                  <tr>
                    <td>Logs</td>
                    <td><code>/var/log/freq</code></td>
                  </tr>
                  <tr>
                    <td>Database</td>
                    <td>Local MySQL service on <code>127.0.0.1:3306</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="table-responsive border rounded about-docs-table-wrap mt-3">
              <table class="table about-docs-table mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Configurable port</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Backend <code>PORT</code></td>
                    <td>Defaults to <code>3000</code>. This is the internal HTTPS and WSS service port used behind nginx.</td>
                  </tr>
                  <tr>
                    <td>Frontend <code>VITE_DEV_PORT</code></td>
                    <td>Defaults to <code>5173</code>. This is only for local development and is not used in production after the frontend is built.</td>
                  </tr>
                  <tr>
                    <td>MySQL <code>3306</code></td>
                    <td>Recommended to remain local on the host and not be exposed broadly.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="about-docs-flow">
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">1. Install base software</div>
                <p>Install nginx, MySQL, Node.js LTS, and the required certificates on the Linux host.</p>
              </div>
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">2. Deploy both repositories</div>
                <p>Copy the backend and frontend projects to the same machine in separate directories under <code>/opt/freq</code>.</p>
              </div>
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">3. Configure MySQL users</div>
                <p>Create the private maintenance DB user and the restricted backend application user, then point the backend to the app account.</p>
              </div>
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">4. Build and serve</div>
                <p>Build the frontend, run the backend as a systemd service, and use nginx as the single operator-facing entry point.</p>
              </div>
            </div>

            <p>
              The full installation procedure is documented in the deployment guide shipped
              with the backend under <code>deploy/linux-vcenter/DEPLOYMENT.md</code>.
            </p>
          </section>

          <section id="notes" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">Operational Notes</h2>
            <p>
              The platform is designed for local deployment, including environments where
              internet access may be intermittent or unavailable. For normal operation, the
              main dependencies are local reachability of the backend, local database
              availability, and correct device access to the configured HTTPS and WSS
              endpoints.
            </p>
            <p>
              From an administration point of view, the most important routine checks are:
              backend service health, database reachability, device connectivity, and
              enough local storage for continuing operational history and report generation.
            </p>
          </section>
        </div>

        <aside class="about-docs-nav">
          <h6 class="about-docs-nav-title">On this page</h6>
          <ul class="nav flex-column about-docs-nav-list">
            <li v-for="item in navItems" :key="item.id" class="nav-item">
              <a
                :href="`#${item.id}`"
                class="nav-link"
                :class="{ active: activeSection === item.id }"
                @click="activeSection = item.id"
              >
                {{ item.label }}
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";

const breadcrumbs = [
  { label: "Home", to: "/home" },
  { label: "Administration" },
];

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "transport", label: "Transport" },
  { id: "auth", label: "Authentication" },
  { id: "database", label: "Database" },
  { id: "optimization", label: "Optimization" },
  { id: "frontend", label: "Frontend" },
  { id: "installation", label: "Installation" },
  { id: "notes", label: "Operational Notes" },
];

const activeSection = ref("overview");
const sectionElements = [];
let observer = null;

function registerSection(element) {
  if (element && !sectionElements.includes(element)) {
    sectionElements.push(element);
  }
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleSections.length > 0) {
        activeSection.value = visibleSections[0].target.id;
      }
    },
    {
      root: null,
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0.1, 0.25, 0.4, 0.6],
    },
  );

  sectionElements.forEach((element) => observer?.observe(element));
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>
