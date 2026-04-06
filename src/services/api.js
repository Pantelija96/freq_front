function buildRuntimeApiBaseUrl() {
  if (typeof window === 'undefined') {
    return 'https://127.0.0.1:3000/api';
  }

  const { protocol, hostname } = window.location;
  const apiProtocol = protocol === 'https:' ? 'https:' : 'http:';
  return `${apiProtocol}//${hostname}:3000/api`;
}

function buildRuntimeWsBaseUrl() {
  if (typeof window === 'undefined') {
    return 'wss://127.0.0.1:3000/dashboard';
  }

  const { protocol, hostname } = window.location;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${hostname}:3000/dashboard`;
}

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || buildRuntimeApiBaseUrl();
export const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || buildRuntimeWsBaseUrl();
export const backendBaseUrl = apiBaseUrl.replace(/\/api$/, '');

export function buildApiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalized}`;
}
