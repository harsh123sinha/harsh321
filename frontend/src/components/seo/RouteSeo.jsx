import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  buildOrganizationJsonLd,
  resolveStaticSeo,
  shouldNoindex,
  SITE_NAME,
} from '../../constants/seoConfig';
import { applyPageSeo, upsertJsonLd } from '../../utils/seoHead';

const SKIP_PREFIXES = ['/property/', '/projects/', '/patna/'];

/**
 * Applies SEO for static public routes. Dynamic pages set their own tags.
 */
export default function RouteSeo() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    upsertJsonLd('seo-jsonld-org', buildOrganizationJsonLd());
  }, []);

  useEffect(() => {
    if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return undefined;

    if (shouldNoindex(pathname)) {
      applyPageSeo({
        title: SITE_NAME,
        description: 'Harsh To Let Services — Patna real estate and to-let platform.',
        path: pathname,
        noindex: true,
        jsonLd: null,
        jsonLdId: 'seo-jsonld-page',
      });
      return undefined;
    }

    const config = resolveStaticSeo(pathname, search);
    if (!config) return undefined;

    applyPageSeo({
      title: config.title,
      description: config.description,
      path: config.path || `${pathname}${search}`,
      keywords: config.keywords,
      jsonLd: null,
      jsonLdId: 'seo-jsonld-page',
    });

    return undefined;
  }, [pathname, search]);

  return null;
}
