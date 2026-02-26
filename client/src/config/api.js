export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://casawave-app.onrender.com';

export const DEFAULT_SERVER_ERROR_MESSAGE = 'Server error, please try again later.';

let lastAlertTimestamp = 0;
let lastAlertMessage = '';

export function parseApiError(error, fallback = DEFAULT_SERVER_ERROR_MESSAGE) {
  return error?.response?.data?.message || error?.message || fallback;
}

export function notifyUser(message = DEFAULT_SERVER_ERROR_MESSAGE) {
  if (typeof window === 'undefined') return;

  const nextMessage = String(message || DEFAULT_SERVER_ERROR_MESSAGE);
  const now = Date.now();

  // Avoid alert spam from polling requests.
  if (nextMessage === lastAlertMessage && now - lastAlertTimestamp < 10000) {
    return;
  }

  lastAlertMessage = nextMessage;
  lastAlertTimestamp = now;
  window.alert(nextMessage);
}
