import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** After login/signup return with `#contact`, scroll to the inquiry block. */
export function useScrollToContactOnAuth(anchorId, ready = true) {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash !== '#contact' || !ready) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [hash, anchorId, ready]);
}
