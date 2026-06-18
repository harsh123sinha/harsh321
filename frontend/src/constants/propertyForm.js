/** Building subtype stored in `other_type` for rent/buy listings */
export const BUILDING_SUBTYPES = [
  { value: '', label: 'Home / generic (use BHK)' },
  { value: 'Shop', label: 'Shop' },
  { value: 'Flat', label: 'Flat' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Office', label: 'Office' },
  { value: 'Warehouse', label: 'Warehouse' },
];

/** Preset katha sizes; custom value stored as typed decimal string */
export const KATHA_PRESET_VALUES = ['1', '2', '3'];

/** Stored in DB as `shop_sqft_range` when type is Shop */
export const SHOP_SQFT_RANGES = [
  { value: '200-800', label: '200 – 800 sq ft' },
  { value: '800-1500', label: '800 – 1,500 sq ft' },
  { value: '1500-2000', label: '1,500 – 2,000 sq ft' },
  { value: '2000+', label: 'More than 2,000 sq ft' },
];

/** Stored as `furnishing_status` for home / flat / apartment */
export const FURNISHING_OPTIONS = [
  { value: '', label: 'Select furnishing' },
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi_furnished', label: 'Semi-furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];
