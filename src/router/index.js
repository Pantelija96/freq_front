import { createRouter, createWebHistory } from 'vue-router';

import LoginPage from '../pages/LoginPage.vue';
import HomePage from '../pages/HomePage.vue';
import LicencesPage from '../pages/LicencesPage.vue';
import DevicePage from '../pages/DevicePage.vue';
import OneDevicePage from '../pages/OneDevicePage.vue';
import { isAuthenticated } from '../services/auth';

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginPage,
    meta: {
      title: 'Login',
      guestOnly: true
    }
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage,
    meta: {
      title: 'Dashboard',
      requiresAuth: true
    }
  },
  {
    path: '/licences',
    name: 'licences',
    component: LicencesPage,
    meta: {
      title: 'Licences',
      requiresAuth: true
    }
  },
  {
    path: '/device',
    name: 'device',
    component: DevicePage,
    meta: {
      title: 'Report',
      requiresAuth: true
    }
  },
  {
    path: '/one-device',
    name: 'one-device',
    component: OneDevicePage,
    meta: {
      title: 'One Device',
      requiresAuth: true
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: 'login' };
  }

  if (to.meta.guestOnly && isAuthenticated()) {
    return { name: 'home' };
  }

  return true;
});

router.afterEach((to) => {
  document.title = `Device Efficiency Management - ${to.meta.title || 'App'}`;
});

export default router;
