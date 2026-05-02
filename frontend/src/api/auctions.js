/* ─────────────────────────────────────────────────────────────────────────────
   api/auctions.js
   Fetches auctions and listings from the Django REST API.
───────────────────────────────────────────────────────────────────────────── */
import { apiFetch, BASE_URL } from './config';

/**
 * Admin: delete a single image from a listing.
 */
export async function deleteListingImage(listingId, imageId) {
  return apiFetch(`/listings/${listingId}/images/${imageId}/`, { method: 'DELETE' });
}

/**
 * Upload a single image to a listing (multipart/form-data).
 */
export async function uploadListingImage(listingId, file) {
  const form = new FormData();
  form.append('image', file);
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/listings/${listingId}/images/`, {
    method: 'POST',
    headers: token ? { Authorization: `Token ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Upload failed (${res.status})`);
  }
  return res.json();
}

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

/**
 * Admin: partially update an auction (start/end time, status).
 */
export async function updateAuction(id, data) {
  return apiFetch(`/auctions/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Admin: delete/cancel an auction.
 */
export async function deleteAuction(id) {
  return apiFetch(`/auctions/${id}/`, { method: 'DELETE' });
}
