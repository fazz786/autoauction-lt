/* ─────────────────────────────────────────────────────────────────────────────
   api/bids.js
   Bid submission, retrieval, and admin approval/rejection.
───────────────────────────────────────────────────────────────────────────── */
import { apiFetch } from './config';

/**
 * Get bids for a specific auction.
 */
export async function getBidsForAuction(auctionId) {
  return apiFetch(`/bids/?auction=${auctionId}`);
}

/**
 * Get all bids placed by the logged-in user.
 */
export async function getMyBids() {
  return apiFetch('/bids/');
}

/**
 * Submit a new bid on an auction.
 */
export async function placeBid(auctionId, amount) {
  return apiFetch('/bids/', {
    method: 'POST',
    body: JSON.stringify({ auction: auctionId, amount }),
  });
}

/**
 * Admin: get all pending bids.
 */
export async function getPendingBids() {
  return apiFetch('/bids/pending/');
}

/**
 * Admin: approve a bid.
 * This triggers a WebSocket broadcast to all live clients.
 */
export async function approveBid(bidId) {
  return apiFetch(`/bids/${bidId}/approve/`, { method: 'POST' });
}

/**
 * Admin: reject a bid.
 */
export async function rejectBid(bidId) {
  return apiFetch(`/bids/${bidId}/reject/`, { method: 'POST' });
}
