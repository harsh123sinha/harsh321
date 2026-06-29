import { useEffect } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Trap Tab focus inside a container while active (e.g. mobile nav drawer).
 */
export function useFocusTrap(containerRef, active) {
  useEffect(() => {
    if (!active || !containerRef.current) return undefined;

    const container = containerRef.current;
    const getFocusable = () => Array.from(container.querySelectorAll(FOCUSABLE));

    const focusables = getFocusable();
    focusables[0]?.focus();

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const items = getFocusable();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [active, containerRef]);
}
