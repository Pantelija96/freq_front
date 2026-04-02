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
        <RouterLink
          :to="brandTo"
          class="d-inline-flex align-items-center app-brand"
        >
          <div>
            <h3 class="mb-0 text-white">{{ brandTitle }}</h3>
          </div>
        </RouterLink>
      </div>

      <div class="d-flex align-items-center gap-3 text-white">
        <div class="dropdown" v-if="displayName">
          <button
            class="btn btn-light btn-sm dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {{ displayName }}
          </button>
          <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
            <li>
              <RouterLink class="dropdown-item" to="/account/change-password">
                Change Password
              </RouterLink>
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li>
              <button
                class="dropdown-item"
                type="button"
                @click="handleLogout"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
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
