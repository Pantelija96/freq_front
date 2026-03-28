<template>
  <div class="page-header page-header-light shadow mb-3">
    <div class="page-header-content d-lg-flex">
      <div class="d-flex">
        <div class="breadcrumb py-2">
          <RouterLink to="/home" class="breadcrumb-item"><i class="ph-house"></i></RouterLink>
          <RouterLink
            v-for="crumb in crumbs.slice(0, -1)"
            :key="crumb.label"
            :to="crumb.to || '/home'"
            class="breadcrumb-item"
          >
            {{ crumb.label }}
          </RouterLink>
          <span class="breadcrumb-item active">{{ crumbs[crumbs.length - 1]?.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  crumbs: {
    type: Array,
    default: () => [{ label: 'Dashboard', to: '/home' }]
  }
});
</script>
