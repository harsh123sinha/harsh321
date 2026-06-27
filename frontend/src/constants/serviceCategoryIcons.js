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

/** Short label + icon for home page service carousel */
export const SERVICE_CATEGORY_DISPLAY = {
  'home-repair': { shortLabel: 'Home Repair', Icon: Wrench },
  construction: { shortLabel: 'Construction', Icon: HardHat },
  'cleaning-household': { shortLabel: 'Cleaning', Icon: Sparkles },
  'vehicle-services': { shortLabel: 'Car Wash', Icon: Car },
  'personal-family-care': { shortLabel: 'Family Care', Icon: HeartHandshake },
  'driver-services': { shortLabel: 'Drivers', Icon: UserCircle },
  'rental-vehicle': { shortLabel: 'Rental Car', Icon: CarFront },
  'security-smart-home': { shortLabel: 'Smart Home', Icon: ShieldCheck },
  'moving-logistics': { shortLabel: 'Packers/Movers', Icon: Truck },
  'legal-documentation': { shortLabel: 'Legal', Icon: Scale },
  'events-celebrations': { shortLabel: 'Events/Halls', Icon: PartyPopper },
  'religious-services': { shortLabel: 'Religious', Icon: Flower2 },
  'building-material': { shortLabel: 'Building Material', Icon: Package },
};

export function getServiceCategoryDisplay(categoryId) {
  return (
    SERVICE_CATEGORY_DISPLAY[categoryId] || {
      shortLabel: categoryId,
      Icon: Wrench,
    }
  );
}
