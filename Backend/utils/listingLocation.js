/**
 * Location fields kept in DB for search/filters; forms only collect city + address.
 * District mirrors city; state defaults for this product region.
 */
export function normalizeListingLocation(city) {
  const c = String(city ?? '').trim() || '—';
  return {
    district: c,
    state: 'Bihar',
    pincode: null,
  };
}
