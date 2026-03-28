import { wsBaseUrl } from "./api";
import { getStoredToken } from "./auth";

let socket = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
const listeners = new Set();

function connect() {
  if (socket || !listeners.size) {
    return;
  }

  const token = getStoredToken();
  if (!token) {
    return;
  }

  socket = new WebSocket(`${wsBaseUrl}?token=${encodeURIComponent(token)}`);

  socket.onopen = () => {
    reconnectAttempts = 0;
  };

  socket.onmessage = (event) => {
    let parsed;
    try {
      parsed = JSON.parse(event.data);
    } catch {
      return;
    }

    listeners.forEach((listener) => {
      try {
        listener(parsed);
      } catch (error) {
        console.error("dashboard_socket_listener_error", error);
      }
    });
  };

  socket.onclose = () => {
    socket = null;

    if (!listeners.size) {
      return;
    }

    reconnectAttempts += 1;
    const delay = Math.min(1000 * reconnectAttempts, 5000);
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  };
}

function disconnectIfIdle() {
  if (listeners.size) {
    return;
  }

  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (socket) {
    socket.close();
    socket = null;
  }
}

export function subscribeDashboardSocket(listener) {
  listeners.add(listener);
  connect();

  return () => {
    listeners.delete(listener);
    disconnectIfIdle();
  };
}
