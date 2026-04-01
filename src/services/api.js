const defaultBaseUrl = 'https://127.0.0.1:3000/api';

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultBaseUrl;
export const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'wss://127.0.0.1:3000/dashboard';
export const backendBaseUrl = apiBaseUrl.replace(/\/api$/, '');

export function buildApiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalized}`;
}
