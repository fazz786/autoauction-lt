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

export async function replyToMessage(messageId, reply) {
  return apiFetch(`/messages/${messageId}/reply/`, {
    method: 'POST',
    body: JSON.stringify({ reply }),
  });
}
