import { useEffect } from 'react';

const DRAG_THRESHOLD_PX = 6;

/**
 * Horizontal scroll for property carousels (trackpad + drag + shift-wheel).
 * Vertical page scroll is never blocked.
 */
export function useNaturalHorizontalScroll(scrollerRef, containerRef, deps = []) {
  useEffect(() => {
    const scroller = scrollerRef.current;
    const container = containerRef?.current || scroller;
    if (!scroller || !container) return undefined;

    const canScroll = () => scroller.scrollWidth > scroller.clientWidth + 4;

    const onWheel = (e) => {
      if (!canScroll()) return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (e.shiftKey && absY > 0) {
        e.preventDefault();
        scroller.scrollLeft += e.deltaY;
        return;
      }

      if (absX > 0) {
        e.preventDefault();
        scroller.scrollLeft += e.deltaX;
      }
    };

    let dragStart = null;
    let didDrag = false;

    const onPointerDown = (e) => {
      if (e.button !== 0 || !canScroll()) return;
      dragStart = { x: e.clientX, scrollLeft: scroller.scrollLeft, id: e.pointerId };
      didDrag = false;
      scroller.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!dragStart || dragStart.id !== e.pointerId) return;
      const dx = e.clientX - dragStart.x;
      if (!didDrag && Math.abs(dx) < DRAG_THRESHOLD_PX) return;

      didDrag = true;
      scroller.classList.add('cursor-grabbing');
      scroller.classList.remove('cursor-grab');
      scroller.scrollLeft = dragStart.scrollLeft - dx;
    };

    const endDrag = (e) => {
      if (!dragStart || dragStart.id !== e.pointerId) return;
      if (scroller.hasPointerCapture(e.pointerId)) {
        scroller.releasePointerCapture(e.pointerId);
      }
      dragStart = null;
      scroller.classList.remove('cursor-grabbing');
      if (canScroll()) scroller.classList.add('cursor-grab');
    };

    const onClickCapture = (e) => {
      if (didDrag) {
        e.preventDefault();
        e.stopPropagation();
        didDrag = false;
      }
    };

    const onMouseEnter = () => {
      if (canScroll()) scroller.classList.add('cursor-grab');
    };

    const onMouseLeave = () => {
      scroller.classList.remove('cursor-grab', 'cursor-grabbing');
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    scroller.addEventListener('pointerdown', onPointerDown);
    scroller.addEventListener('pointermove', onPointerMove);
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    scroller.addEventListener('click', onClickCapture, true);
    scroller.addEventListener('mouseenter', onMouseEnter);
    scroller.addEventListener('mouseleave', onMouseLeave);

    return () => {
      container.removeEventListener('wheel', onWheel);
      scroller.removeEventListener('pointerdown', onPointerDown);
      scroller.removeEventListener('pointermove', onPointerMove);
      scroller.removeEventListener('pointerup', endDrag);
      scroller.removeEventListener('pointercancel', endDrag);
      scroller.removeEventListener('click', onClickCapture, true);
      scroller.removeEventListener('mouseenter', onMouseEnter);
      scroller.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [scrollerRef, containerRef, ...deps]);
}
