/** Canonical public site URL (no trailing slash). */
export const SITE_URL = (
  import.meta.env.VITE_PUBLIC_SITE_URL || 'https://www.harshtoletservices.in'
).replace(/\/$/, '');

export const SITE_NAME = 'Harsh To Let Services';
export const SITE_TAGLINE = 'Find · Visit · Move In';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.png`;

export const SOCIAL_PROFILES = [
  'https://www.facebook.com/profile.php?id=61575885901043',
  'https://www.instagram.com/harsh_to_let_service/',
  'https://www.linkedin.com/in/harsh-tolet-services-796b1741a',
];

export const ORGANIZATION = {
  name: SITE_NAME,
  email: 'harshtoletservices@gmail.com',
  phone: '+919334072476',
  phoneAlt: '+918210078910',
  locality: 'Patna',
  region: 'Bihar',
  country: 'IN',
};

/** Paths that should not be indexed by search engines. */
export const NOINDEX_PATH_PREFIXES = [
  '/admin',
  '/subadmin',
  '/dashboard',
  '/login',
  '/signup',
  '/forgot-password',
  '/add-property',
  '/edit-property',
  '/my-properties',
  '/notifications',
  '/saved',
];

export const SEO_PAGES = {
  home: {
    title: `${SITE_NAME} | Real Estate & To Let Services in Patna, Bihar`,
    description:
      'Harsh To Let Services — Patna\'s trusted real estate platform. Rent or buy flats, houses, plots & shops in Patna. Verified listings, brokers, packers, movers & home services.',
    path: '/',
    keywords:
      'real estate Patna, to let Patna, to let services Patna, rent house Patna, flat for rent Patna, property Patna, Harsh To Let Services, flats in Patna, plots Patna',
  },
  rent: {
    title: `Properties for Rent in Patna | Flats & Houses — ${SITE_NAME}`,
    description:
      'Find verified rental properties in Patna — 1 BHK, 2 BHK, 3 BHK flats, houses & shops for rent. Browse to-let listings across Boring Road, Rajiv Nagar & all Patna areas.',
    path: '/rent',
    keywords:
      'rent house Patna, flat for rent Patna, to let Patna, rental property Patna, 1 BHK rent Patna, 2 BHK Patna',
  },
  buy: {
    title: `Properties for Sale in Patna | Buy Flats & Homes — ${SITE_NAME}`,
    description:
      'Buy flats, houses & commercial property in Patna. Verified listings for sale with trusted agents. Find your dream home in Bihar with Harsh To Let Services.',
    path: '/buy',
    keywords:
      'buy property Patna, flat for sale Patna, house for sale Patna, real estate Patna, property for sale Bihar',
  },
  plots: {
    title: `Plots for Sale in Patna | Land & Plot Listings — ${SITE_NAME}`,
    description:
      'Browse residential and commercial plots for sale in Patna and Bihar. Verified plot listings with location, price & details on Harsh To Let Services.',
    path: '/plots',
    keywords: 'plots for sale Patna, land for sale Patna, plot Patna, real estate plots Bihar',
  },
  other: {
    title: `Other Properties in Patna | Shops, PG & More — ${SITE_NAME}`,
    description:
      'Explore shops, PG, hostels, godowns & other property types for rent or sale in Patna. Verified listings on Harsh To Let Services.',
    path: '/other',
    keywords: 'shop for rent Patna, PG Patna, commercial property Patna, godown Patna',
  },
  shop: {
    title: `Shops for Rent in Patna | Commercial Spaces — ${SITE_NAME}`,
    description:
      'Find shops and commercial spaces for rent in Patna. Browse verified shop listings by area, size and budget on Harsh To Let Services.',
    path: '/shop',
    keywords: 'shop for rent Patna, commercial shop Patna, retail space Patna, to let shop Bihar',
  },
  vendors: {
    title: `Home Services & Vendors in Patna | Packers, Legal & More — ${SITE_NAME}`,
    description:
      'Trusted vendors in Patna — rental cars, packers & movers, legal help, home repair, construction, cleaning & more. Book verified service providers.',
    path: '/our-vendors',
    keywords:
      'packers movers Patna, home services Patna, rental car Patna, vendors Patna, to let services Patna',
  },
  projects: {
    title: `New Projects & Enclaves in Patna — ${SITE_NAME}`,
    description:
      'Explore new residential projects, apartments & enclaves in Patna. Verified developer listings with BHK options, pricing & brochures.',
    path: '/projects',
    keywords: 'new projects Patna, apartment project Patna, enclave Patna, real estate project Bihar',
  },
  broker: {
    title: `Find Property Brokers in Patna — ${SITE_NAME}`,
    description:
      'Search verified property brokers and agents in Patna. View broker listings, reviews and properties on Harsh To Let Services.',
    path: '/broker',
    keywords: 'property broker Patna, real estate agent Patna, broker Patna Bihar',
  },
  search: {
    title: `Search Properties in Patna — ${SITE_NAME}`,
    description:
      'Search rent and sale properties in Patna by location, BHK, budget and type. Verified listings on Harsh To Let Services.',
    path: '/search',
    keywords: 'search property Patna, find flat Patna, real estate search Patna',
  },
  jobApply: {
    title: `Careers & Job Apply — ${SITE_NAME} Patna`,
    description: 'Apply for jobs at Harsh To Let Services — real estate, brokers and field roles in Patna, Bihar.',
    path: '/job-apply',
    keywords: 'real estate jobs Patna, broker jobs Patna',
  },
  terms: {
    title: `Terms & Conditions — ${SITE_NAME}`,
    description: 'Terms and conditions for using Harsh To Let Services property platform in Patna, Bihar.',
    path: '/terms',
  },
  privacy: {
    title: `Privacy Policy — ${SITE_NAME}`,
    description: 'Privacy policy for Harsh To Let Services — how we handle your data on our Patna real estate platform.',
    path: '/privacy',
  },
  patnaAreas: {
    title: `Patna Areas — Flats for Rent by Locality | ${SITE_NAME}`,
    description:
      'Browse flats and houses for rent by area in Patna — Boring Road, Kankarbagh, Bailey Road and more. Verified listings on Harsh To Let Services.',
    path: '/patna',
    keywords: 'flats for rent Patna areas, rent Boring Road Patna, to let Patna locality',
  },
};

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateAgent',
        '@id': `${SITE_URL}/#organization`,
        name: ORGANIZATION.name,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.png`,
        image: `${SITE_URL}/favicon.png`,
        telephone: ORGANIZATION.phone,
        email: ORGANIZATION.email,
        address: {
          '@type': 'PostalAddress',
          addressLocality: ORGANIZATION.locality,
          addressRegion: ORGANIZATION.region,
          addressCountry: ORGANIZATION.country,
        },
        areaServed: {
          '@type': 'City',
          name: 'Patna',
        },
        sameAs: SOCIAL_PROFILES,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: ORGANIZATION.name,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?location={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export function buildPropertyJsonLd(property, canonicalPath) {
  if (!property) return null;
  const images = [];
  try {
    const parsed = JSON.parse(property.image_url || '[]');
    if (Array.isArray(parsed)) images.push(...parsed.filter(Boolean));
  } catch {
    if (property.image_url) images.push(property.image_url);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${SITE_URL}${canonicalPath}`,
    image: images.slice(0, 5).map((src) => (src.startsWith('http') ? src : `${SITE_URL}${src}`)),
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'INR',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city || 'Patna',
      addressRegion: property.state || 'Bihar',
      streetAddress: property.location || undefined,
    },
  };
}

export function buildProjectJsonLd(project, canonicalPath) {
  if (!project) return null;
  const images = [];
  try {
    const parsed = JSON.parse(project.image_url || '[]');
    if (Array.isArray(parsed)) images.push(...parsed.filter(Boolean));
  } catch {
    if (project.image_url) images.push(project.image_url);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: project.title,
    description: project.description,
    url: `${SITE_URL}${canonicalPath}`,
    image: images.slice(0, 5).map((src) => (src.startsWith('http') ? src : `${SITE_URL}${src}`)),
    address: {
      '@type': 'PostalAddress',
      addressLocality: project.city || 'Patna',
      addressRegion: project.state || 'Bihar',
      streetAddress: project.location || undefined,
    },
  };
}

export function resolveStaticSeo(pathname, search = '') {
  if (pathname === '/') return SEO_PAGES.home;
  if (pathname === '/rent') return SEO_PAGES.rent;
  if (pathname === '/buy') return SEO_PAGES.buy;
  if (pathname === '/plots') return SEO_PAGES.plots;
  if (pathname === '/shop') return SEO_PAGES.shop;
  if (pathname === '/other') return SEO_PAGES.other;
  if (pathname === '/our-vendors') return SEO_PAGES.vendors;
  if (pathname === '/projects') return SEO_PAGES.projects;
  if (pathname === '/broker') return SEO_PAGES.broker;
  if (pathname === '/job-apply') return SEO_PAGES.jobApply;
  if (pathname === '/terms') return SEO_PAGES.terms;
  if (pathname === '/privacy') return SEO_PAGES.privacy;
  if (pathname === '/patna') return SEO_PAGES.patnaAreas;
  if (pathname === '/search') {
    const params = new URLSearchParams(search);
    if (params.get('other_type') === 'Shop') return SEO_PAGES.shop;
    return SEO_PAGES.search;
  }
  return null;
}

export function shouldNoindex(pathname) {
  return NOINDEX_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
