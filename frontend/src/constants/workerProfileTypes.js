/** Profile-type rules — keep in sync with Backend utils/workerProfileTypes.js */

export const MARRIAGE_HALL_PROFESSION = 'Marriage/Function Hall Booking';
export const TENT_DECORATION_PROFESSION = 'Tent/Decoration Services';

export const LISTING_VENDOR_CATEGORY_IDS = ['rental-vehicle', 'building-material'];

export const CATERING_TYPES = [
  { value: 'veg', label: 'Veg only' },
  { value: 'nonveg', label: 'Non-veg only' },
  { value: 'both', label: 'Veg & Non-veg both' },
];

export const LISTING_PRICE_TYPES = [
  { value: 'daily', label: 'Per day' },
  { value: 'monthly', label: 'Per month' },
  { value: 'per_trip', label: 'Per trip' },
  { value: 'per_unit', label: 'Per unit (bag/load)' },
];

export function getProfileType(profession, categoryId = '') {
  if (profession === MARRIAGE_HALL_PROFESSION) return 'marriage_hall';
  if (LISTING_VENDOR_CATEGORY_IDS.includes(categoryId)) return 'listing_vendor';
  return 'standard';
}

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

export const VEHICLE_TYPES = [
  { value: 'car', label: 'Car' },
  { value: 'bike', label: 'Bike / Scooter' },
];

export const RENTAL_MODES = [
  { value: 'self_drive', label: 'Self drive' },
  { value: 'with_driver', label: 'With driver' },
];

export const DRIVER_FUEL_OPTIONS = [
  { value: 'with_fuel', label: 'Driver + Vehicle + Fuel' },
  { value: 'without_fuel', label: 'Driver + Vehicle' },
];

export const MATERIAL_UNIT_TYPES = [
  { value: 'per_trolley', label: 'Per trolley' },
  { value: 'per_bag', label: 'Per bag' },
];

export const BUILDING_MATERIAL_TYPES = [
  { value: 'balu_ujla', label: 'Balu (Ujla)', price_type: 'per_trolley' },
  { value: 'balu_bhura', label: 'Balu (Bhura)', price_type: 'per_trolley' },
  { value: 'gitti', label: 'Gitti / Small stone', price_type: 'per_trolley' },
  { value: 'brick', label: 'Brick (Eeta)', price_type: 'per_trolley' },
  { value: 'cement', label: 'Cement', price_type: 'per_bag' },
];

export function resolveBuildingMaterial(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  return (
    BUILDING_MATERIAL_TYPES.find((m) => m.value === lower) ||
    BUILDING_MATERIAL_TYPES.find((m) => m.label.toLowerCase() === lower) ||
    null
  );
}

export function formatMaterialListingRate(listing) {
  if (!listing?.rate_amount) return '';
  const amt = `₹${Number(listing.rate_amount).toLocaleString('en-IN')}`;
  const mat = resolveBuildingMaterial(listing.material_type || listing.title);
  const unit = mat?.price_type || listing.price_type;
  if (unit === 'per_bag') return `${amt} / bag`;
  if (unit === 'per_trolley') return `${amt} / trolley`;
  const label = unit?.replace('_', ' ') || 'unit';
  return `${amt} / ${label}`;
}
