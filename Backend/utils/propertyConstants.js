/** All values allowed in `properties.type` */
export const VALID_PROPERTY_TYPES = ['rent', 'buy', 'other', 'plot', 'plot_lease', 'plot_buy'];

/** Types that use katha instead of BHK */
export const PLOT_TYPES = ['plot', 'plot_lease', 'plot_buy'];

/** Stored in `properties.shop_sqft_range` when `other_type` is Shop */
export const SHOP_SQFT_RANGE_VALUES = ['200-800', '800-1500', '1500-2000', '2000+'];

/** Stored in `properties.furnishing_status` for home / flat / apartment (rent & buy) */
export const FURNISHING_STATUS_VALUES = ['furnished', 'semi_furnished', 'unfurnished'];

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
