/* ─────────────────────────────────────────────────────────────────────────────
   api/auth.js
   Handles login, register, logout, and profile updates.
   Stores the auth token in localStorage after login.
───────────────────────────────────────────────────────────────────────────── */
import { apiFetch } from './config';

/**
 * Register a new user account.
 * Returns { token, user }
 */
export async function register(data) {
  const result = await apiFetch('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      username:   data.username || data.email.split('@')[0],
      email:      data.email,
      first_name: data.name.split(' ')[0] || '',
      last_name:  data.name.split(' ').slice(1).join(' ') || '',
      phone:      data.phone || '',
      country:    data.country || 'Lithuania',
      password:   data.password,
      password2:  data.confirm,
    }),
  });
  localStorage.setItem('token', result.token);
  return result;
}

/**
 * Log in with username + password.
 * Returns { token, user }
 */
export async function login(username, password) {
  const result = await apiFetch('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem('token', result.token);
  return result;
}

/**
 * Log out — deletes token from server and localStorage.
 */
export async function logout() {
  try {
    await apiFetch('/auth/logout/', { method: 'POST' });
  } catch (_) {
    // Even if server call fails, clear local token
  }
  localStorage.removeItem('token');
}

/**
 * Get the currently logged-in user's profile.
 */
export async function getMe() {
  return apiFetch('/auth/me/');
}

/**
 * Update the logged-in user's profile.
 */
export async function updateMe(data) {
  return apiFetch('/auth/me/', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Admin: get all users.
 */
export async function getAllUsers() {
  return apiFetch('/auth/users/');
}

/**
 * Admin: block or unblock a user.
 */
export async function toggleBlockUser(userId) {
  return apiFetch(`/auth/users/${userId}/block/`, { method: 'POST' });
}

/**
 * Admin: set or remove admin role for a user.
 */
export async function setUserRole(userId, role) {
  return apiFetch(`/auth/users/${userId}/role/`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

/**
 * Check if a token exists in localStorage (used on app load).
 */
export function getSavedToken() {
  return localStorage.getItem('token');
}
