/** Profile-type rules — keep in sync with frontend workerProfileTypes.js */

export const MARRIAGE_HALL_PROFESSION = 'Marriage/Function Hall Booking';
export const TENT_DECORATION_PROFESSION = 'Tent/Decoration Services';

export const LISTING_VENDOR_CATEGORY_IDS = ['rental-vehicle', 'building-material'];

export const CATERING_TYPES = [
  { value: 'veg', label: 'Veg only' },
  { value: 'nonveg', label: 'Non-veg only' },
  { value: 'both', label: 'Veg & Non-veg both' },
];

export const LISTING_PRICE_TYPES = ['daily', 'monthly', 'per_trip', 'per_unit', 'per_trolley', 'per_bag'];

export function getProfileType(profession, categoryId = '') {
  if (profession === MARRIAGE_HALL_PROFESSION) return 'marriage_hall';
  if (LISTING_VENDOR_CATEGORY_IDS.includes(categoryId)) return 'listing_vendor';
  return 'standard';
}

/** Hide daily/monthly charges on profile for these types */
export function shouldShowProfilePricing(profession, categoryId = '') {
  const type = getProfileType(profession, categoryId);
  if (type === 'marriage_hall' || type === 'listing_vendor') return false;
  if (profession === TENT_DECORATION_PROFESSION) return false;
  return true;
}

export function shouldShowStandardIdDocs(profession, categoryId = '') {
  return getProfileType(profession, categoryId) === 'standard';
}

export function shouldShowMarriageHallFields(profession) {
  return profession === MARRIAGE_HALL_PROFESSION;
}

export function canManageListings(profession, categoryId = '') {
  return getProfileType(profession, categoryId) === 'listing_vendor';
}

export function isValidCateringType(value) {
  return ['veg', 'nonveg', 'both'].includes(String(value || '').trim());
}

export function isValidListingPriceType(value) {
  return LISTING_PRICE_TYPES.includes(String(value || '').trim().toLowerCase());
}

export const VEHICLE_TYPES = ['car', 'bike'];
export const RENTAL_MODES = ['self_drive', 'with_driver'];
export const DRIVER_FUEL_OPTIONS = ['with_fuel', 'without_fuel'];
export const LISTING_KINDS = ['vehicle', 'material'];

export function isValidVehicleType(value) {
  return VEHICLE_TYPES.includes(String(value || '').trim().toLowerCase());
}

export function isValidRentalMode(value) {
  return RENTAL_MODES.includes(String(value || '').trim().toLowerCase());
}

export function isValidDriverFuelOption(value) {
  return DRIVER_FUEL_OPTIONS.includes(String(value || '').trim().toLowerCase());
}

export function isValidListingKind(value) {
  return LISTING_KINDS.includes(String(value || '').trim().toLowerCase());
}
