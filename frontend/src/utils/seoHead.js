import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '../constants/seoConfig';

const MANAGED_SELECTOR = '[data-seo-managed]';

function upsertMeta(name, content, { property = false } = {}) {
  const attr = property ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${attr}="${name}"][${MANAGED_SELECTOR.slice(1, -1)}]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    el.setAttribute('data-seo-managed', 'true');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"][data-seo-managed]`);
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute('data-seo-managed', 'true');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Apply page-level SEO tags (title, meta, canonical, OG, optional JSON-LD).
 */
export function applyPageSeo({
  title,
  description,
  path = '/',
  keywords,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd = null,
  jsonLdId = 'seo-jsonld-page',
}) {
  const canonical = path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  document.title = title || SITE_NAME;

  upsertMeta('description', description);
  upsertMeta('keywords', keywords);
  upsertMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

  upsertLink('canonical', canonical);

  upsertMeta('og:title', title, { property: true });
  upsertMeta('og:description', description, { property: true });
  upsertMeta('og:url', canonical, { property: true });
  upsertMeta('og:type', 'website', { property: true });
  upsertMeta('og:site_name', SITE_NAME, { property: true });
  upsertMeta('og:image', image, { property: true });
  upsertMeta('og:locale', 'en_IN', { property: true });

  upsertMeta('twitter:card', 'summary_large_image', { property: true });
  upsertMeta('twitter:title', title, { property: true });
  upsertMeta('twitter:description', description, { property: true });
  upsertMeta('twitter:image', image, { property: true });

  upsertJsonLd(jsonLdId, jsonLd);
}

export { upsertJsonLd };
