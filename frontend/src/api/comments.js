/* ─────────────────────────────────────────────────────────────────────────────
   api/comments.js
───────────────────────────────────────────────────────────────────────────── */
import { apiFetch } from './config';

export async function getComments(auctionId) {
  return apiFetch(`/comments/?auction=${auctionId}`);
}

export async function postComment(auctionId, text) {
  return apiFetch('/comments/', {
    method: 'POST',
    body: JSON.stringify({ auction: auctionId, text }),
  });
}

export async function likeComment(commentId) {
  return apiFetch(`/comments/${commentId}/like/`, { method: 'POST' });
}

export async function deleteComment(commentId) {
  return apiFetch(`/comments/${commentId}/`, { method: 'DELETE' });
}
