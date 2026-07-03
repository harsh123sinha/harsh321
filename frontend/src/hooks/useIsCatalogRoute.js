import { useLocation } from 'react-router-dom';

const CATALOG_PATHS = new Set(['/search', '/rent', '/buy', '/plots', '/shop', '/other']);

export function useIsCatalogRoute() {
  const { pathname } = useLocation();
  if (CATALOG_PATHS.has(pathname)) return true;
  return /^\/patna\/[^/]+\/flats-for-rent$/.test(pathname);
}
