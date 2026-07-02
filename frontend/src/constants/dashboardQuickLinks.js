import { Plus, List, Wrench, Users } from 'lucide-react';

/** Shared dashboard shortcuts — property tools + browse services/vendors. */
export const PROPERTY_OWNER_QUICK_LINKS = [
  { to: '/add-property', icon: Plus, title: 'Add Property', desc: 'List a new property' },
  { to: '/my-properties', icon: List, title: 'My Properties', desc: 'View and manage your listings' },
  { to: '/our-vendors', icon: Wrench, title: 'Our Services', desc: 'Browse vendors — plumbers, halls, rental cars & more' },
  { to: '/our-vendors', icon: Users, title: 'Our Vendors', desc: 'Find trusted service providers in Patna' },
];

export const BUYER_QUICK_LINKS = [
  { to: '/saved', icon: List, title: 'Saved Properties', desc: 'View listings you bookmarked' },
  { to: '/our-vendors', icon: Wrench, title: 'Our Services', desc: 'Home services, halls, cars & building materials' },
  { to: '/rent', icon: Plus, title: 'Browse Rentals', desc: 'Find flats and houses for rent in Patna' },
];
