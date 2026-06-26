import { useEffect } from 'react';

/**
 * Makes trackpad/touchpad horizontal swipes match touch-drag direction on overflow carousels.
 * Without this, a left→right finger swipe often scrolls the strip the wrong way on Windows.
 */
export function useNaturalHorizontalScroll(scrollerRef, deps = []) {
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollLeft -= e.deltaX;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [scrollerRef, ...deps]);
}
