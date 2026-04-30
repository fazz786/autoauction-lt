/* ─────────────────────────────────────────────────────────────────────────────
   api/messages.js
───────────────────────────────────────────────────────────────────────────── */
import { apiFetch } from './config';

export async function sendMessage(subject, body) {
  return apiFetch('/messages/send/', {
    method: 'POST',
    body: JSON.stringify({ subject, body }),
  });
}

export async function getMessages() {
  return apiFetch('/messages/');
}

export async function getMyMessages() {
  return apiFetch('/messages/my/');
}

export async function replyToMessage(messageId, reply) {
  return apiFetch(`/messages/${messageId}/reply/`, {
    method: 'POST',
    body: JSON.stringify({ reply }),
  });
}

/** Public — no auth required. Submit a seller contact inquiry from the homepage. */
export async function submitSellerInquiry(data) {
  return apiFetch('/messages/inquiry/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Admin — fetch all seller inquiries. */
export async function getSellerInquiries() {
  return apiFetch('/messages/inquiries/');
}

/** Admin — get unread inquiry count. */
export async function getInquiryUnreadCount() {
  return apiFetch('/messages/inquiries/unread/');
}
