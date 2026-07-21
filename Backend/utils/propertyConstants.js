/** All values allowed in `properties.type` */
export const VALID_PROPERTY_TYPES = ['rent', 'buy', 'other', 'plot', 'plot_lease', 'plot_buy'];

/** Types that use katha instead of BHK */
export const PLOT_TYPES = ['plot', 'plot_lease', 'plot_buy'];

/** Stored in `properties.shop_sqft_range` when `other_type` is Shop / Commercial space */
export const SHOP_SQFT_RANGE_VALUES = ['200-800', '800-1500', '1500-2000', '2000+'];

/** Price is total ₹ or ₹ per sq ft (shops / commercial) */
export const PRICE_UNIT_VALUES = ['total', 'per_sqft'];

/** Stored in `properties.furnishing_status` for home / flat / apartment (rent & buy) */
export const FURNISHING_STATUS_VALUES = ['furnished', 'semi_furnished', 'unfurnished'];

/** Shop-like commercial listings (no BHK; use shop size + optional per-sq-ft price) */
export function isShopLikeOtherType(otherType) {
  const ot = String(otherType ?? '').trim().toLowerCase();
  return ot === 'shop' || ot === 'commercial space';
}

export function parsePriceUnitForDb(otherType, raw) {
  if (!isShopLikeOtherType(otherType)) return 'total';
  const v = String(raw ?? '').trim().toLowerCase();
  return PRICE_UNIT_VALUES.includes(v) ? v : 'total';
}

export function isValidShopSqftRange(value) {
  return SHOP_SQFT_RANGE_VALUES.includes(String(value ?? '').trim());
}

/** @returns {string|null} DB value or null if not applicable / invalid */
export function parseFurnishingForDb(type, other_type, raw) {
  const otherTrim = String(other_type ?? '').trim();
  const eligible =
    (type === 'rent' || type === 'buy') && ['', 'Flat', 'Apartment'].includes(otherTrim);
  if (!eligible) return null;
  const v = String(raw ?? '').trim();
  if (!v || !FURNISHING_STATUS_VALUES.includes(v)) return null;
  return v;
}
