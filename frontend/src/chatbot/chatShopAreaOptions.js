/**
 * Chat-friendly shop size bands shown to the user.
 * `dbValue` must match Backend `SHOP_SQFT_RANGE_VALUES` for search + listings.
 */
export const CHAT_SHOP_AREA_OPTIONS = [
  { id: 'sq0', dbValue: '200-800', label: '0 – 500 sq ft' },
  { id: 'sq1', dbValue: '800-1500', label: '500 – 1,000 sq ft' },
  { id: 'sq2', dbValue: '800-1500', label: '1,000 – 1,500 sq ft' },
  { id: 'sq3', dbValue: '1500-2000', label: '1,500 – 2,000 sq ft' },
  { id: 'sq4', dbValue: '2000+', label: '2,000+ sq ft' },
];
