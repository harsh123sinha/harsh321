import { SITE_NAME } from './seoConfig';
import { PATNA_LOCATION_OPTIONS } from './patnaLocations';

export function slugifyArea(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

/** Areas with dedicated SEO landing pages (excludes broad "Patna" / any area). */
export const PATNA_AREA_PAGES = PATNA_LOCATION_OPTIONS.filter(
  (option) => option.value && option.value !== 'Patna'
).map((option) => {
  const slug = slugifyArea(option.value);
  return {
    name: option.label,
    searchLocation: option.value,
    slug,
    path: `/patna/${slug}/flats-for-rent`,
  };
});

/** Shown in footer and area index — high-intent Patna localities. */
export const FEATURED_PATNA_AREAS = [
  'boring-road',
  'kankarbagh',
  'bailey-road',
  'rajendra-nagar',
  'patliputra',
  'danapur',
  'saguna-more',
  'ashiana-nagar',
]
  .map((slug) => PATNA_AREA_PAGES.find((area) => area.slug === slug))
  .filter(Boolean);

export function getAreaBySlug(slug) {
  return PATNA_AREA_PAGES.find((area) => area.slug === slug);
}

export function buildAreaRentSeo(area) {
  const name = area.name;
  return {
    title: `Flats for Rent in ${name}, Patna | ${SITE_NAME}`,
    description: `Find flats and houses for rent in ${name}, Patna — verified 1 BHK, 2 BHK, 3 BHK and family homes. Browse to-let listings in ${name} on Harsh To Let Services.`,
    keywords: `flat for rent ${name} Patna, rent house ${name}, to let ${name} Patna, 1 BHK ${name}, 2 BHK ${name} Patna, rental property ${name}`,
    path: area.path,
  };
}
