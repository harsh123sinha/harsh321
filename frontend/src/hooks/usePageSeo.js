import { useEffect } from 'react';
import { applyPageSeo } from '../utils/seoHead';

/** Per-page SEO override (e.g. property detail). */
export function usePageSeo(options) {
  useEffect(() => {
    if (!options) return undefined;
    applyPageSeo(options);
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- jsonLd compared via serialization
  }, [
    options?.title,
    options?.description,
    options?.path,
    options?.keywords,
    options?.image,
    options?.noindex,
    options?.jsonLdId,
    options ? JSON.stringify(options.jsonLd) : null,
  ]);
}
