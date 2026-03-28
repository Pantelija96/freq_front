<template>
  <div class="navbar navbar-dark navbar-expand-lg navbar-static">
    <div class="container-fluid">
      <div class="d-flex d-lg-none me-2">
        <button
          type="button"
          class="navbar-toggler sidebar-mobile-main-toggle rounded-pill"
          @click="$emit('toggle-sidebar')"
        >
          <i class="ph-list"></i>
        </button>
      </div>

      <div class="navbar-brand flex-1 flex-lg-0">
        <RouterLink :to="brandTo" class="d-inline-flex align-items-center app-brand">
          <img src="/freq-logo.jfif" alt="Freq logo" class="app-brand-logo" />
          <div>
            <div class="app-brand-eyebrow">Freq Suite</div>
            <h3 class="mb-0 text-white">{{ brandTitle }}</h3>
          </div>
        </RouterLink>
      </div>

      <div class="d-flex align-items-center gap-3 text-white">
        <span v-if="displayName" class="small text-white-50">{{
          displayName
        }}</span>
        <button
          class="btn btn-light btn-sm"
          type="button"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { getStoredUser, logout } from "../services/auth";

const router = useRouter();

defineProps({
  brandTitle: {
    type: String,
    default: "Device Efficiency Management",
  },
  brandTo: {
    type: [String, Object],
    default: "/home",
  },
  searchPlaceholder: {
    type: String,
    default: "Search",
  },
});

defineEmits(["toggle-sidebar"]);

const currentUser = getStoredUser();
const displayName = computed(() => {
  if (!currentUser) {
    return "";
  }

  const fullName = [currentUser.first_name, currentUser.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || currentUser.username || "";
});

async function handleLogout() {
  await logout();
  router.push("/");
}
</script>
