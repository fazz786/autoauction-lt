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
 * Admin: mark this bid as the winner — ends the auction.
 */
export async function setWinner(bidId) {
  return apiFetch(`/bids/${bidId}/winner/`, { method: 'POST' });
}
