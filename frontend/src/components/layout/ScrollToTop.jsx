import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll the window to the top on every route change (path or query).
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}
