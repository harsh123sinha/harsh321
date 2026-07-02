/** Long-form copy for service category detail pages (Patna-focused SEO). */
export const SERVICE_CATEGORY_DESCRIPTIONS = {
  'home-repair': {
    summary:
      'Verified plumbers, electricians, carpenters and appliance technicians in Patna for quick home repairs and maintenance.',
    details: [
      'Book trusted home repair professionals across Patna — from leaking taps and wiring issues to AC service, RO repair, and carpentry.',
      'All vendors are registered with Harsh To Let Services so you can compare services and contact our office for verified inquiries.',
    ],
  },
  construction: {
    summary: 'Contractors, masons, painters and interior experts for construction and renovation in Patna.',
    details: [
      'Find contractors, mistri, tile workers, waterproofing specialists, and interior designers for residential and commercial projects in Patna.',
      'Ideal for flat renovation, new construction support, POP ceiling, and painting work across Bihar.',
    ],
  },
  'cleaning-household': {
    summary: 'Maids, cooks, cleaners, pest control and deep-cleaning services in Patna.',
    details: [
      'Hire household help — daily maid, cook, sofa cleaning, water tank cleaning, pest control, and gardening services in Patna.',
      'Browse profiles with working hours, off days, and pricing before you contact us.',
    ],
  },
  'vehicle-services': {
    summary: 'Car and bike wash, mechanic, and vehicle care services in Patna.',
    details: [
      'Local vehicle service providers for washing, detailing, and mechanical repairs in Patna.',
    ],
  },
  'personal-family-care': {
    summary: 'Babysitters, elderly care attendants, and security guards in Patna.',
    details: [
      'Find nanny, elderly nursing attendant, and watchman services for homes and properties in Patna.',
    ],
  },
  'driver-services': {
    summary: 'Personal, outstation, and on-call drivers in Patna.',
    details: [
      'Hire full-time or part-time drivers, outstation drivers, or designated drivers for events in Patna.',
    ],
  },
  'rental-vehicle': {
    summary: 'Self-drive and chauffeur-driven cars and bikes for rent in Patna.',
    details: [
      'Compare rental cars and bikes — self drive or with driver, daily or monthly packages, with clear km and fuel terms.',
      'Popular for weddings, outstation trips, and business travel in Patna and Bihar.',
    ],
  },
  'security-smart-home': {
    summary: 'CCTV installation and smart home automation in Patna.',
    details: [
      'Security system installers and home automation experts for flats, shops, and offices in Patna.',
    ],
  },
  'moving-logistics': {
    summary: 'Packers and movers for home and office shifting in Patna.',
    details: [
      'Reliable packers & movers for local and outstation relocation within Patna and Bihar.',
    ],
  },
  'legal-documentation': {
    summary: 'Property lawyers, registration agents, and loan advisors in Patna.',
    details: [
      'Legal help for property registration, documentation, vastu consultation, and home loan guidance in Patna.',
    ],
  },
  'events-celebrations': {
    summary: 'Marriage halls, catering, tents and decoration for events in Patna.',
    details: [
      'Book marriage and function halls in Patna with area, catering options, and platter pricing.',
      'Also find catering and tent/decoration vendors for weddings and celebrations.',
    ],
  },
  'religious-services': {
    summary: 'Pandit ji and astrologer services in Patna.',
    details: [
      'Book pooja/ritual services and astrologers for housewarming, weddings, and personal consultations in Patna.',
    ],
  },
  'building-material': {
    summary: 'Building material dealers — balu, gitti, sand, cement and more in Patna.',
    details: [
      'Compare rates for balu, gitti (aggregate), sand, cement, bricks, and steel from verified dealers in Patna.',
      'Ideal for construction sites and renovation projects — per unit or bulk pricing shown on listings.',
    ],
  },
};

export function getServiceCategoryContent(categoryId, categoryLabel = '') {
  const copy = SERVICE_CATEGORY_DESCRIPTIONS[categoryId];
  if (copy) return copy;
  return {
    summary: `Browse verified ${categoryLabel || 'service'} providers in Patna through Harsh To Let Services.`,
    details: [
      'Compare vendor profiles, pricing, and services. Contact our office for verified inquiries.',
    ],
  };
}
