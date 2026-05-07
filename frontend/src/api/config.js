/* ─────────────────────────────────────────────────────────────────────────────
   api/config.js
   Central place for all API configuration.
   Change BASE_URL here if your Django server runs on a different port.
───────────────────────────────────────────────────────────────────────────── */

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Derive WebSocket URL from the API URL (https → wss, http → ws)
const _wsBase = BASE_URL.replace(/^https/, 'wss').replace(/^http/, 'ws').replace(/\/api$/, '');
export const WS_URL = process.env.REACT_APP_WS_URL || `${_wsBase}/ws`;

/**
 * Returns headers for every API request.
 * Automatically includes the auth token if the user is logged in.
 */
export function getHeaders(includeAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Token ${token}`;
  }
  return headers;
}

/**
 * Generic fetch wrapper with error handling.
 * Throws a readable error message on failure.
 */
export async function apiFetch(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      error.detail ||
      Object.values(error).flat().join(' ') ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  // 204 No Content — nothing to parse
  if (response.status === 204) return null;
  return response.json();
}
