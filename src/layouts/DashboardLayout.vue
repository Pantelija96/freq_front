<template>
  <div>
    <AppNavbar @toggle-sidebar="toggleSidebar" />
    <AppBreadcrumbs :crumbs="breadcrumbs" />

    <div class="page-content pt-0">
      <div
        v-if="sidebarOpen"
        class="sidebar-mobile-overlay d-lg-none"
        @click="closeSidebar"
      />

      <AppSidebar
        :active-key="activeKey"
        :mobile-open="sidebarOpen"
        @close-sidebar="closeSidebar"
      />

      <div class="content-wrapper">
        <div class="content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppBreadcrumbs from '../components/AppBreadcrumbs.vue';
import AppNavbar from '../components/AppNavbar.vue';
import AppSidebar from '../components/AppSidebar.vue';

const sidebarOpen = ref(false);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function closeSidebar() {
  sidebarOpen.value = false;
}

defineProps({
  activeKey: {
    type: String,
    default: 'home'
  },
  breadcrumbs: {
    type: Array,
    default: () => [{ label: 'Home', to: '/home' }]
  }
});
</script>
