<template>
  <div class="login-page">
    <div class="navbar navbar-dark navbar-static py-2">
      <div class="container-fluid">
        <div class="navbar-brand">
          <h3 class="mb-0">Device Efficiency Management</h3>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="content-wrapper">
        <div class="content-inner">
          <div class="content d-flex justify-content-center align-items-center">
            <form class="login-form w-100" @submit.prevent="login">
              <div class="card login-card mb-0">
                <div class="card-body">
                  <div class="text-center mb-3">
                    <div
                      class="d-inline-flex flex-column align-items-center justify-content-center mb-4 mt-2 gap-2"
                    >
                      <img src="/freq-logo.jfif" alt="Freq logo" class="login-logo" />
                      <div class="app-brand-eyebrow app-brand-eyebrow-dark">Freq Suite</div>
                      <h3 class="mb-0">Device Efficiency Management</h3>
                    </div>
                    <h5 class="mb-0">Login to your account</h5>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Username</label>
                    <div
                      class="form-control-feedback form-control-feedback-start"
                    >
                      <input
                        v-model="username"
                        type="text"
                        class="form-control"
                        placeholder="john@doe.com"
                      />
                      <div class="form-control-feedback-icon">
                        <i class="ph-user-circle text-muted"></i>
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Password</label>
                    <div
                      class="form-control-feedback form-control-feedback-start"
                    >
                      <input
                        v-model="password"
                        type="password"
                        class="form-control"
                        placeholder="********"
                      />
                      <div class="form-control-feedback-icon">
                        <i class="ph-lock text-muted"></i>
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <button
                      type="submit"
                      class="btn btn-primary w-100"
                      :disabled="loading"
                    >
                      {{ loading ? "Signing in..." : "Log in" }}
                    </button>
                  </div>

                  <div v-if="error" class="alert alert-danger mb-0">
                    {{ error }}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login as loginRequest } from "../services/auth";

const router = useRouter();
const username = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function login() {
  loading.value = true;

  try {
    await loginRequest(username.value, password.value);
    error.value = "";
    await router.push("/home");
  } catch (err) {
    error.value = err.message || "Invalid username or password";
  } finally {
    loading.value = false;
  }
}
</script>
