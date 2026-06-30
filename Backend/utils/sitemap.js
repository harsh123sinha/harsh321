import { PATNA_AREA_SLUGS } from '../constants/patnaAreas.js';

const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://www.harshtoletservices.in').replace(/\/$/, '');

/** Public pages included in the XML sitemap (listings added dynamically). */
const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/rent', changefreq: 'daily', priority: '0.9' },
  { path: '/buy', changefreq: 'daily', priority: '0.9' },
  { path: '/plots', changefreq: 'weekly', priority: '0.85' },
  { path: '/other', changefreq: 'weekly', priority: '0.8' },
  { path: '/shop', changefreq: 'weekly', priority: '0.85' },
  { path: '/patna', changefreq: 'weekly', priority: '0.85' },
  { path: '/our-vendors', changefreq: 'weekly', priority: '0.85' },
  { path: '/projects', changefreq: 'weekly', priority: '0.8' },
  { path: '/broker', changefreq: 'weekly', priority: '0.75' },
  { path: '/job-apply', changefreq: 'monthly', priority: '0.5' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, { changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

/**
 * @param {{ id: number, listing_kind?: string | null }[]} listings
 */
export function buildSitemapXml(listings = []) {
  const chunks = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const page of STATIC_PAGES) {
    chunks.push(urlEntry(`${SITE_URL}${page.path}`, page));
  }

  for (const slug of PATNA_AREA_SLUGS) {
    chunks.push(
      urlEntry(`${SITE_URL}/patna/${slug}/flats-for-rent`, {
        changefreq: 'weekly',
        priority: '0.8',
      })
    );
  }

  for (const row of listings) {
    const path =
      String(row.listing_kind || '').toLowerCase() === 'project'
        ? `/projects/${row.id}`
        : `/property/${row.id}`;
    chunks.push(
      urlEntry(`${SITE_URL}${path}`, {
        changefreq: 'weekly',
        priority: path.startsWith('/projects/') ? '0.75' : '0.7',
      })
    );
  }

  chunks.push('</urlset>');
  return `${chunks.join('\n')}\n`;
}
