<template>
  <DashboardLayout :breadcrumbs="breadcrumbs" active-key="home">
    <div class="row justify-content-center">
      <div class="col-xl-6 col-lg-8">
        <div class="card bg-dark account-password-card">
          <div class="card-header">
            <h5 class="mb-0">Change Password</h5>
          </div>
          <div class="card-body">
            <p class="text-muted mb-4">
              Update your account password. You will keep your current session after a successful change.
            </p>

            <form class="account-password-form" @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Current Password</label>
                <input
                  v-model="form.currentPassword"
                  type="password"
                  class="form-control"
                  autocomplete="current-password"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">New Password</label>
                <input
                  v-model="form.newPassword"
                  type="password"
                  class="form-control"
                  autocomplete="new-password"
                  required
                />
                <div class="form-text text-white-50">
                  Use at least 8 characters.
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label">Confirm New Password</label>
                <input
                  v-model="form.confirmPassword"
                  type="password"
                  class="form-control"
                  autocomplete="new-password"
                  required
                />
              </div>

              <div class="d-flex justify-content-end gap-2">
                <RouterLink to="/home" class="btn btn-light btn-sm">Cancel</RouterLink>
                <button class="btn btn-primary btn-sm" type="submit" :disabled="saving">
                  {{ saving ? "Saving..." : "Update Password" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { reactive, ref } from "vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { changePassword } from "../services/auth";

const breadcrumbs = [
  { label: "Home", to: "/home" },
  { label: "Account" },
  { label: "Change Password" },
];

const form = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const saving = ref(false);

async function handleSubmit() {
  if (saving.value) {
    return;
  }

  saving.value = true;

  try {
    await changePassword(
      form.currentPassword,
      form.newPassword,
      form.confirmPassword,
    );

    window.Swal?.fire({
      icon: "success",
      title: "Password updated",
      text: "Your password has been changed successfully.",
      confirmButtonText: "OK",
    });

    form.currentPassword = "";
    form.newPassword = "";
    form.confirmPassword = "";
  } catch (error) {
    window.Swal?.fire({
      icon: "error",
      title: "Password change failed",
      text: error.message || "Please try again.",
      confirmButtonText: "OK",
    });
  } finally {
    saving.value = false;
  }
}
</script>
