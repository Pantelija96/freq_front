<template>
  <DashboardLayout :breadcrumbs="breadcrumbs" active-key="about">
    <div class="about-docs-page">
      <div class="about-docs-layout">
        <div class="about-docs-content">
          <section id="overview" :ref="registerSection" class="about-docs-section">
            <h1 class="about-docs-title">Device Efficiency Management: Platform Overview</h1>
            <p>
              Think of the Device Efficiency Management platform as the central nervous
              system for your Android fleet. It's a fully localized, all-in-one
              system combining the web app, backend, and database running securely inside
              your own private network.
            </p>
            <p>
              Our main goal is simple: to make life easier for operators. With one glance,
              you can see exactly which devices are online, what they've been doing
              recently, and if anything needs your attention right now. But it's not just a
              live feed; it acts as a trusty logbook. Even if a device goes offline, you
              can still pull up its history, recent stats, crashes, and activity to figure
              out what happened.
            </p>

            <div class="table-responsive border rounded about-docs-table-wrap">
              <table class="table about-docs-table mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Component</th>
                    <th>What it does</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Frontend</td>
                    <td>The daily dashboard for operators: live monitoring, device reviews, and pulling reports.</td>
                  </tr>
                  <tr>
                    <td>Backend</td>
                    <td>The engine room: talks to devices, keeps connections alive, queues commands, and crunches data.</td>
                  </tr>
                  <tr>
                    <td>Database</td>
                    <td>The memory bank: locally stores device details, command histories, stats, crashes, and user info.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="frontend" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">The Frontend Web App: Your Daily Command Center</h2>
            <p>
              This is where supervisors, operators, and support staff spend their time. We
              designed it to be intuitive, with no digging through raw, messy logs
              required. The focus is on surfacing the exact information you need, when you
              need it, so you can get back to work.
            </p>

            <div class="table-responsive border rounded about-docs-table-wrap">
              <table class="table about-docs-table mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Area</th>
                    <th>How it helps</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Dashboard</td>
                    <td>Your bird's-eye view of the fleet: total counts, group activity, and live status updates.</td>
                  </tr>
                  <tr>
                    <td>Single Device View</td>
                    <td>The deep dive: detailed charts, crash logs, command history, and specific reports for one device.</td>
                  </tr>
                  <tr>
                    <td>Reports</td>
                    <td>Clean, exportable PDFs summarizing activity for one or multiple devices.</td>
                  </tr>
                  <tr>
                    <td>Access Roles</td>
                    <td>Admins get the keys to send commands; standard users get full visibility without the control risk.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="backend" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">The Backend Service: The Engine Room</h2>
            <p>
              While the frontend looks pretty, the backend does the heavy lifting in the
              background. It listens to device traffic, holds connections open, processes
              incoming data, and serves it up to the web app. Essentially, it turns a
              chaotic stream of live device messages into organized history and real-time
              dashboard updates.
            </p>

            <div class="table-responsive border rounded about-docs-table-wrap">
              <table class="table about-docs-table mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Capability</th>
                    <th>What it handles</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Provisioning &amp; Login</td>
                    <td>Welcomes new devices, checks their credentials, and directs them where to go.</td>
                  </tr>
                  <tr>
                    <td>WebSocket Sessions</td>
                    <td>Tracks who is connected and beams live updates straight to your dashboard.</td>
                  </tr>
                  <tr>
                    <td>Command Queue</td>
                    <td>Acts as the dispatcher: saves your commands, fires them off to devices, and logs the results.</td>
                  </tr>
                  <tr>
                    <td>Data Processing</td>
                    <td>Neatly files away stats, crashes, and frequency data so the web app can actually use it.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="communication" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">How Everything Talks to Each Other</h2>
            <p>
              We mix standard web requests for simple things like logging in or loading a
              page with live, always-on connections for real-time device stats and
              commands. This keeps the app feeling snappy and responsive.
            </p>
            <p>Here is what a standard device lifecycle looks like:</p>

            <div class="about-docs-flow">
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">Registration</div>
                <p>A new device pops up, registers, and gets its access credentials.</p>
              </div>
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">Login</div>
                <p>The device signs in and establishes a live, continuous connection to the backend.</p>
              </div>
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">Live Operation</div>
                <p>Devices constantly ping back their stats, crashes, and command responses through this live channel.</p>
              </div>
              <div class="about-docs-flow-card">
                <div class="about-docs-flow-title">Dashboard Updates</div>
                <p>The backend instantly pushes the important stuff to the web app, with no manual page refreshing needed.</p>
              </div>
            </div>
          </section>

          <section id="data" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">What We Remember (Data Storage)</h2>
            <p>
              Our local database is the platform's memory. It is what lets you figure out
              what went wrong with a device before it went offline. Because everything is
              stored locally, you always have a historical record to fall back on.
            </p>

            <div class="table-responsive border rounded about-docs-table-wrap">
              <table class="table about-docs-table mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Category</th>
                    <th>Examples of what we store</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Device State</td>
                    <td>The basics: IMEI, assigned group, online/offline status, and when it was last seen.</td>
                  </tr>
                  <tr>
                    <td>Commands</td>
                    <td>The paper trail: what was sent, did it work, what was the reply, and who sent it.</td>
                  </tr>
                  <tr>
                    <td>Stats &amp; Crashes</td>
                    <td>The health check: app usage snapshots and detailed crash logs.</td>
                  </tr>
                  <tr>
                    <td>Frequency History</td>
                    <td>The trends: compressed historical data used to build out charts and reports.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="reports" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">Reports: Making Sense of the Data</h2>
            <p>
              Need to share what's happening? Our reporting tool turns raw history into
              clean, readable PDFs. Whether you are exporting data for a single device or
              a whole batch, each device gets its own dedicated page.
            </p>
            <p>
              It brings together crashes, frequency behaviors, and command logs so you can
              instantly see the full story and what actions were taken.
            </p>
          </section>

          <section id="offline" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">Built for the Real World (Local &amp; Offline Operation)</h2>
            <p>
              We built this system assuming the internet might drop. Everything, the
              frontend, backend, and database, runs smoothly on a local network. It does
              not rely on the public internet to function.
            </p>
            <p>
              This makes it a perfect fit for isolated environments like cruise ships,
              remote sites, or strictly secured facilities where local stability is
              non-negotiable.
            </p>
          </section>

          <section id="roles" :ref="registerSection" class="about-docs-section">
            <h2 class="about-docs-heading">Roles &amp; Access: Keeping Things Safe</h2>
            <p>Right now, we keep it simple with two roles: Admins and Users.</p>
            <p>
              Users have full visibility. They can monitor the fleet and read all the data
              to do their jobs effectively.
            </p>
            <p>
              Admins have the exact same view, but they hold the keys to actually send
              commands to the devices.
            </p>
            <p>
              This ensures everyone is in the loop, but actual fleet control stays safely
              in the right hands.
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
  { label: "About" },
];

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "communication", label: "Communication" },
  { id: "data", label: "Stored Data" },
  { id: "reports", label: "Reports" },
  { id: "offline", label: "Offline Operation" },
  { id: "roles", label: "Roles" },
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
