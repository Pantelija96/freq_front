<template>
  <div
    class="sidebar sidebar-main sidebar-expand-lg align-self-start"
    :class="{ 'sidebar-mobile-expanded': mobileOpen }"
  >
    <div class="sidebar-content">
      <div class="sidebar-brand-panel">
        <img src="/freq-logo.jfif" alt="Freq logo" class="sidebar-brand-logo" />
        <div>
          <div class="sidebar-brand-title">Device Efficiency</div>
          <div class="sidebar-brand-subtitle">Frontend Console</div>
        </div>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-section-body d-flex justify-content-center">
          <h5 class="sidebar-resize-hide flex-grow-1 my-auto">Navigation</h5>

          <div>
            <button type="button" class="btn btn-light btn-icon btn-sm rounded-pill border-transparent sidebar-control sidebar-main-resize d-none d-lg-inline-flex">
              <i class="ph-arrows-left-right"></i>
            </button>

                        <button
                          type="button"
                          class="btn btn-light btn-icon btn-sm rounded-pill border-transparent sidebar-mobile-main-toggle d-lg-none"
                          @click="$emit('close-sidebar')"
                        >
                            <i class="ph-x"></i>
                        </button>
          </div>
        </div>
      </div>

      <div class="sidebar-section">
        <ul class="nav nav-sidebar" data-nav-type="accordion">
          <li class="nav-item-header pt-0">
            <div class="text-uppercase fs-sm lh-sm opacity-50 sidebar-resize-hide">Main</div>
            <i class="ph-dots-three sidebar-resize-show"></i>
          </li>

          <li v-for="item in items" :key="item.label" class="nav-item">
            <a
              v-if="item.external && !item.disabled"
              :href="item.to"
              class="nav-link"
              :class="{ active: activeKey === item.key }"
              :target="item.newTab ? '_blank' : null"
              :rel="item.newTab ? 'noopener noreferrer' : null"
              @click="$emit('close-sidebar')"
            >
              <i :class="item.icon"></i>
              <span>{{ item.label }}</span>
            </a>

            <RouterLink
              v-else-if="!item.disabled"
              :to="item.to"
              class="nav-link"
              :class="{ active: activeKey === item.key }"
              @click="$emit('close-sidebar')"
            >
              <i :class="item.icon"></i>
              <span>{{ item.label }}</span>
            </RouterLink>

            <a
              v-else
              href="#"
              class="nav-link disabled"
              @click.prevent
            >
              <i :class="item.icon"></i>
              <span>{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { backendBaseUrl } from "../services/api";

defineEmits(["close-sidebar"]);

defineProps({
  activeKey: {
    type: String,
    default: 'home'
  },
  mobileOpen: {
    type: Boolean,
    default: false
  }
});

const items = [
  { key: 'home', label: 'Dashboard', to: '/home', icon: 'ph-house', disabled: false },
  { key: 'about', label: 'About', to: '/about', icon: 'ph-address-book', disabled: false },
  { key: 'admin', label: 'Administration', to: '/administration', icon: 'ph-pencil', disabled: false },
  { key: 'docs', label: 'Documentation', to: `${backendBaseUrl}/downloads/docs/latest-pdf`, icon: 'ph-stamp', disabled: false, external: true, newTab: true },
  { key: 'apk', label: 'Download APK', to: `${backendBaseUrl}/downloads/apk/latest`, icon: 'ph-download-simple', disabled: false, external: true },
  { key: 'licences', label: 'Licences', to: '/licences', icon: 'ph-link', disabled: false },
  { key: 'report', label: 'Report', to: '/device', icon: 'ph-database', disabled: false },
  { key: 'stats', label: 'Statistics', to: '/one-device', icon: 'ph-app-window', disabled: false }
];
</script>
