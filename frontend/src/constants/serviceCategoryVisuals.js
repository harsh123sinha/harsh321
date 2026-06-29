import {
  Wrench,
  HardHat,
  Sparkles,
  Car,
  HeartHandshake,
  UserCircle,
  CarFront,
  ShieldCheck,
  Truck,
  Scale,
  PartyPopper,
  Flower2,
  Package,
} from 'lucide-react';

/** Colorful 3D tile config per service category */
export const SERVICE_CATEGORY_VISUALS = {
  'home-repair': {
    shortLabel: 'Home Repair',
    Icon: Wrench,
    emoji: '🔧',
    gradient: ['#38bdf8', '#0ea5e9', '#0369a1'],
    shadow: '#075985',
    glow: 'rgba(56, 189, 248, 0.45)',
  },
  construction: {
    shortLabel: 'Construction',
    Icon: HardHat,
    emoji: '🏗️',
    gradient: ['#fb923c', '#f97316', '#c2410c'],
    shadow: '#9a3412',
    glow: 'rgba(251, 146, 60, 0.45)',
  },
  'cleaning-household': {
    shortLabel: 'Cleaning',
    Icon: Sparkles,
    emoji: '✨',
    gradient: ['#a78bfa', '#8b5cf6', '#6d28d9'],
    shadow: '#5b21b6',
    glow: 'rgba(167, 139, 250, 0.45)',
  },
  'vehicle-services': {
    shortLabel: 'Car Wash',
    Icon: Car,
    emoji: '🚗',
    gradient: ['#34d399', '#10b981', '#047857'],
    shadow: '#065f46',
    glow: 'rgba(52, 211, 153, 0.45)',
  },
  'personal-family-care': {
    shortLabel: 'Family Care',
    Icon: HeartHandshake,
    emoji: '💝',
    gradient: ['#f472b6', '#ec4899', '#be185d'],
    shadow: '#9d174d',
    glow: 'rgba(244, 114, 182, 0.45)',
  },
  'driver-services': {
    shortLabel: 'Drivers',
    Icon: UserCircle,
    emoji: '🧑‍✈️',
    gradient: ['#60a5fa', '#3b82f6', '#1d4ed8'],
    shadow: '#1e3a8a',
    glow: 'rgba(96, 165, 250, 0.45)',
  },
  'rental-vehicle': {
    shortLabel: 'Rental Car',
    Icon: CarFront,
    emoji: '🚙',
    gradient: ['#fbbf24', '#f59e0b', '#b45309'],
    shadow: '#92400e',
    glow: 'rgba(251, 191, 36, 0.5)',
  },
  'security-smart-home': {
    shortLabel: 'Smart Home',
    Icon: ShieldCheck,
    emoji: '🛡️',
    gradient: ['#22d3ee', '#06b6d4', '#0e7490'],
    shadow: '#155e75',
    glow: 'rgba(34, 211, 238, 0.45)',
  },
  'moving-logistics': {
    shortLabel: 'Packers',
    Icon: Truck,
    emoji: '📦',
    gradient: ['#f87171', '#ef4444', '#b91c1c'],
    shadow: '#991b1b',
    glow: 'rgba(248, 113, 113, 0.45)',
  },
  'legal-documentation': {
    shortLabel: 'Legal',
    Icon: Scale,
    emoji: '⚖️',
    gradient: ['#94a3b8', '#64748b', '#334155'],
    shadow: '#1e293b',
    glow: 'rgba(148, 163, 184, 0.4)',
  },
  'events-celebrations': {
    shortLabel: 'Events',
    Icon: PartyPopper,
    emoji: '🎉',
    gradient: ['#e879f9', '#d946ef', '#a21caf'],
    shadow: '#86198f',
    glow: 'rgba(232, 121, 249, 0.45)',
  },
  'religious-services': {
    shortLabel: 'Religious',
    Icon: Flower2,
    emoji: '🪔',
    gradient: ['#fcd34d', '#f59e0b', '#d97706'],
    shadow: '#b45309',
    glow: 'rgba(252, 211, 77, 0.5)',
  },
  'building-material': {
    shortLabel: 'Materials',
    Icon: Package,
    emoji: '🧱',
    gradient: ['#78716c', '#57534e', '#292524'],
    shadow: '#1c1917',
    glow: 'rgba(168, 162, 158, 0.4)',
  },
};

/** Emoji for profession / sub-filter tiles */
export const PROFESSION_EMOJI = {
  Plumber: '🚿',
  Electrician: '⚡',
  'AC Repair/Service Technician': '❄️',
  'RO/Water Purifier Technician': '💧',
  'Appliance Repair (Washing Machine, Fridge, Microwave)': '🔌',
  Carpenter: '🪚',
  'Welder/Fabricator (Grills, Gates)': '🔥',
  'Glass & Aluminum Work': '🪟',
  'Borewell/Water Tanker Service': '🚰',
  'Solar Panel Installer/Technician': '☀️',
  'Contractor/Thekedar': '👷',
  'Mason (Mistri)': '🧱',
  'Tile/Flooring Worker': '🔲',
  'Waterproofing Specialist': '💦',
  'False Ceiling/POP Worker': '🏠',
  Painter: '🎨',
  'Interior Designer': '🛋️',
  'Architect Consultant': '📐',
  Maid: '🧹',
  Cleaner: '🧽',
  Cook: '👨‍🍳',
  'Daily Worker': '💪',
  'Sofa/Carpet Deep Cleaning': '🛋️',
  'Water Tank Cleaning': '🪣',
  'Pest Control': '🐜',
  'Gardener/Landscaping': '🌿',
  'Car Painter': '🎨',
  'Bike/Car Washer': '🫧',
  'Car/Bike Mechanic': '🔩',
  'Babysitter/Nanny': '👶',
  'Elderly Care/Nursing Attendant': '🩺',
  'Security Guard/Watchman': '🚧',
  'Personal/Family Driver (Full-Time/Part-Time)': '🚘',
  'Outstation Driver': '🛣️',
  'Designated Driver (Occasional/On-Call)': '🥂',
  'Rental Car & Bike Booking': '🚙',
  'CCTV/Security System Installer': '📹',
  'Home Automation/Smart Home Installer': '🏡',
  'Packers & Movers': '📦',
  'Property Lawyer': '📜',
  'Documentation/Registration Agent': '📋',
  'Vastu Consultant': '🧭',
  'Home Loan/Financial Advisor': '💰',
  'Marriage/Function Hall Booking': '💒',
  'Catering Services': '🍽️',
  'Tent/Decoration Services': '🎪',
  'Pandit ji (Pooja/Ritual Services)': '🙏',
  Astrologer: '⭐',
  'Building Material Dealer': '🧱',
  self_drive_car: '🚗',
  self_drive_bike: '🏍️',
  car_with_driver: '🚕',
  long_term: '📅',
};

/** Building material listing types */
export const MATERIAL_EMOJI = {
  balu: '🪨',
  gitti: '🧱',
  giiti: '🧱',
  sand: '🏖️',
  cement: '🏗️',
  brick: '🧱',
  steel: '🔩',
  aggregate: '🪨',
  stone: '🪨',
  rod: '⚙️',
  tmt: '⚙️',
};

export function getMaterialEmoji(materialType) {
  const k = String(materialType || '').trim().toLowerCase();
  if (!k) return '🧱';
  for (const [key, emoji] of Object.entries(MATERIAL_EMOJI)) {
    if (k.includes(key)) return emoji;
  }
  return '🧱';
}

const RENTAL_FILTER_LABELS = {
  self_drive_car: 'Self-Drive Car',
  self_drive_bike: 'Self-Drive Bike',
  car_with_driver: 'Car + Driver',
  long_term: 'Monthly Rental',
};

export function getServiceCategoryVisual(categoryId) {
  return (
    SERVICE_CATEGORY_VISUALS[categoryId] || {
      shortLabel: categoryId,
      Icon: Wrench,
      emoji: '⭐',
      gradient: ['#d4a853', '#b8860b', '#8b6914'],
      shadow: '#6b5010',
      glow: 'rgba(212, 168, 83, 0.45)',
    }
  );
}

export function getProfessionEmoji(professionOrFilterId) {
  const key = String(professionOrFilterId || '').trim();
  return PROFESSION_EMOJI[key] || getServiceCategoryVisual(findCategoryForProfession(key))?.emoji || '⭐';
}

export function getProfessionShortLabel(professionOrFilterId) {
  const key = String(professionOrFilterId || '').trim();
  if (RENTAL_FILTER_LABELS[key]) return RENTAL_FILTER_LABELS[key];
  if (key.length > 22) return `${key.slice(0, 20)}…`;
  return key;
}

function findCategoryForProfession(profession) {
  // fallback only — callers should pass categoryId when known
  return 'home-repair';
}

/** @deprecated use getServiceCategoryVisual */
export function getServiceCategoryDisplay(categoryId) {
  const v = getServiceCategoryVisual(categoryId);
  return { shortLabel: v.shortLabel, Icon: v.Icon };
}
