import { buildApiUrl } from './api';

const TOKEN_KEY = 'freq_dashboard_token';
const USER_KEY = 'freq_dashboard_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAdminUser() {
  return getStoredUser()?.role === "admin";
}

export function setAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user || null));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getStoredToken());
}

export function getAuthHeaders(extraHeaders = {}) {
  const token = getStoredToken();
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function login(username, password) {
  const response = await fetch(buildApiUrl('/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'Login failed');
  }

  setAuthSession(data.token, data.user);
  return data;
}

export async function logout() {
  const token = getStoredToken();

  if (token) {
    await fetch(buildApiUrl('/auth/logout'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch(() => null);
  }

  clearAuthSession();
}
