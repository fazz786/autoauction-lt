/* ─────────────────────────────────────────────────────────────────────────────
   api/auctions.js
   Fetches auctions and listings from the Django REST API.
───────────────────────────────────────────────────────────────────────────── */
import { apiFetch } from './config';

/* ── Auctions ──────────────────────────────────────────────────────────────── */

/**
 * Get all auctions.
 * Optional filter: status = 'live' | 'scheduled' | 'ended'
 */
export async function getAuctions(status = '') {
  const query = status ? `?status=${status}` : '';
  return apiFetch(`/auctions/${query}`);
}

/**
 * Get a single auction by ID (includes full listing details).
 */
export async function getAuction(id) {
  return apiFetch(`/auctions/${id}/`);
}

/**
 * Admin: create a new auction for an existing listing.
 */
export async function createAuction(data) {
  return apiFetch('/auctions/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Admin: change auction status (live / ended / cancelled).
 */
export async function setAuctionStatus(id, status) {
  return apiFetch(`/auctions/${id}/status/`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

/* ── Listings ──────────────────────────────────────────────────────────────── */

/**
 * Get all vehicle listings.
 * Optional filters: ?search=BMW  ?category=suv  ?status=active
 */
export async function getListings(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/listings/${query ? '?' + query : ''}`);
}

/**
 * Get a single listing by ID.
 */
export async function getListing(id) {
  return apiFetch(`/listings/${id}/`);
}

/**
 * Admin: create a new vehicle listing.
 */
export async function createListing(data) {
  return apiFetch('/listings/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Admin: update a listing.
 */
export async function updateListing(id, data) {
  return apiFetch(`/listings/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Admin: delete a listing.
 */
export async function deleteListing(id) {
  return apiFetch(`/listings/${id}/`, { method: 'DELETE' });
}
