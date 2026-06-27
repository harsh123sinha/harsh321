/** Service categories & professions — keep in sync with Backend utils/workerProfessions.js */

import { shouldShowProfilePricing } from './workerProfileTypes.js';

export const WORKER_PROFESSION_CATEGORIES = [
  {
    id: 'home-repair',
    label: 'Home Repair & Maintenance',
    professions: [
      'Plumber',
      'Electrician',
      'AC Repair/Service Technician',
      'RO/Water Purifier Technician',
      'Appliance Repair (Washing Machine, Fridge, Microwave)',
      'Carpenter',
      'Welder/Fabricator (Grills, Gates)',
      'Glass & Aluminum Work',
      'Borewell/Water Tanker Service',
      'Solar Panel Installer/Technician',
    ],
  },
  {
    id: 'construction',
    label: 'Construction & Renovation',
    professions: [
      'Contractor/Thekedar',
      'Mason (Mistri)',
      'Tile/Flooring Worker',
      'Waterproofing Specialist',
      'False Ceiling/POP Worker',
      'Painter',
      'Interior Designer',
      'Architect Consultant',
    ],
  },
  {
    id: 'cleaning-household',
    label: 'Cleaning & Household Help',
    professions: [
      'Maid',
      'Cleaner',
      'Cook',
      'Daily Worker',
      'Sofa/Carpet Deep Cleaning',
      'Water Tank Cleaning',
      'Pest Control',
      'Gardener/Landscaping',
    ],
  },
  {
    id: 'vehicle-services',
    label: 'Vehicle Services',
    professions: ['Car Painter', 'Bike/Car Washer', 'Car/Bike Mechanic'],
  },
  {
    id: 'personal-family-care',
    label: 'Personal & Family Care',
    professions: [
      'Babysitter/Nanny',
      'Elderly Care/Nursing Attendant',
      'Security Guard/Watchman',
    ],
  },
  {
    id: 'driver-services',
    label: 'Driver Services',
    professions: [
      'Personal/Family Driver (Full-Time/Part-Time)',
      'Outstation Driver',
      'Designated Driver (Occasional/On-Call)',
    ],
  },
  {
    id: 'rental-vehicle',
    label: 'Rental Car & Bike Booking',
    professions: ['Rental Car & Bike Booking'],
  },
  {
    id: 'security-smart-home',
    label: 'Security & Smart Home',
    professions: [
      'CCTV/Security System Installer',
      'Home Automation/Smart Home Installer',
    ],
  },
  {
    id: 'moving-logistics',
    label: 'Moving & Logistics',
    professions: ['Packers & Movers'],
  },
  {
    id: 'legal-documentation',
    label: 'Legal & Documentation',
    professions: [
      'Property Lawyer',
      'Documentation/Registration Agent',
      'Vastu Consultant',
      'Home Loan/Financial Advisor',
    ],
  },
  {
    id: 'events-celebrations',
    label: 'Marriage Hall / Events & Celebrations',
    professions: [
      'Marriage/Function Hall Booking',
      'Catering Services',
      'Tent/Decoration Services',
    ],
  },
  {
    id: 'religious-services',
    label: 'Religious Services',
    professions: ['Pandit ji (Pooja/Ritual Services)', 'Astrologer'],
  },
  {
    id: 'building-material',
    label: 'Building Material Dealer',
    professions: ['Building Material Dealer'],
  },
];

export const WORKER_PROFESSIONS = WORKER_PROFESSION_CATEGORIES.flatMap((c) => c.professions);

export const WORKER_OFF_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'No fixed off day',
];

export function getCategoryById(categoryId) {
  return WORKER_PROFESSION_CATEGORIES.find((c) => c.id === categoryId) || null;
}

export function getProfessionsByCategoryId(categoryId) {
  return getCategoryById(categoryId)?.professions || [];
}

export function getCategoryLabelByProfession(profession) {
  const id = findCategoryIdByProfession(profession);
  return id ? getCategoryById(id)?.label || '' : '';
}

export const WORKER_PRICE_TYPES = [
  { value: 'daily', label: 'Daily (per day)' },
  { value: 'monthly', label: 'Monthly (per month)' },
];

export function formatWorkerPrice(worker) {
  if (!worker) return '';
  if (worker.profile_type === 'marriage_hall' && worker.hall_booking_cost != null) {
    return `₹${Number(worker.hall_booking_cost).toLocaleString('en-IN')} / booking`;
  }
  if (worker.profile_type === 'listing_vendor') return 'See listings for rates';
  if (!shouldShowProfilePricing(worker.profession, findCategoryIdByProfession(worker.profession))) {
    return 'Contact for pricing';
  }
  const amount = Number(worker.price_amount ?? worker.price_per_day);
  if (!Number.isFinite(amount)) return '';
  const formatted = `₹${amount.toLocaleString('en-IN')}`;
  const type = worker.price_type || 'daily';
  return type === 'monthly' ? `${formatted} / month` : `${formatted} / day`;
}

export function filterCategoriesBySearch(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return WORKER_PROFESSION_CATEGORIES;
  return WORKER_PROFESSION_CATEGORIES.filter(
    (cat) =>
      cat.label.toLowerCase().includes(q) ||
      cat.professions.some((p) => p.toLowerCase().includes(q))
  );
}

export const RENTAL_VEHICLE_FILTERS = [
  { id: 'self_drive_car', label: 'Self-Drive Car Rental', vehicle_type: 'car', rental_mode: 'self_drive' },
  { id: 'self_drive_bike', label: 'Self-Drive Bike/Scooter Rental', vehicle_type: 'bike', rental_mode: 'self_drive' },
  { id: 'car_with_driver', label: 'Car with Driver (Rental)', vehicle_type: 'car', rental_mode: 'with_driver' },
  { id: 'long_term', label: 'Long-Term/Monthly Vehicle Rental', price_type: 'monthly' },
];

const LEGACY_RENTAL_PROFESSIONS = RENTAL_VEHICLE_FILTERS.map((f) => f.label);

export function findCategoryIdByProfession(profession) {
  const p = String(profession || '').trim();
  if (LEGACY_RENTAL_PROFESSIONS.includes(p)) return 'rental-vehicle';
  const match = WORKER_PROFESSION_CATEGORIES.find((c) => c.professions.includes(p));
  return match?.id || '';
}

export function getBrowseFiltersForCategory(categoryId) {
  if (categoryId === 'rental-vehicle') return RENTAL_VEHICLE_FILTERS;
  return getProfessionsByCategoryId(categoryId).map((label) => ({ id: label, label }));
}

export function listingMatchesBrowseFilter(listing, filterId, categoryId) {
  if (categoryId !== 'rental-vehicle') return true;
  const f = RENTAL_VEHICLE_FILTERS.find((x) => x.id === filterId);
  if (!f) return true;
  if (f.price_type === 'monthly') return listing.price_type === 'monthly';
  if (f.vehicle_type && listing.vehicle_type !== f.vehicle_type) return false;
  if (f.rental_mode && listing.rental_mode !== f.rental_mode) return false;
  return true;
}

export function shouldShowSubcategoryStep(categoryId) {
  if (categoryId === 'rental-vehicle') return true;
  return getProfessionsByCategoryId(categoryId).length > 1;
}

export function shouldShowSubcategoryStepForProfile(categoryId) {
  if (categoryId === 'rental-vehicle' || categoryId === 'building-material') return false;
  return getProfessionsByCategoryId(categoryId).length > 1;
}
