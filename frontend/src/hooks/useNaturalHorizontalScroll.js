import { useEffect } from 'react';

const DRAG_THRESHOLD_PX = 8;
const TOUCH_SCROLL_CLICK_GUARD_PX = 6;

function normalizeWheelDelta(value, deltaMode) {
  if (deltaMode === 1) return value * 16;
  if (deltaMode === 2) {
    return value * (typeof window !== 'undefined' ? window.innerHeight : 800);
  }
  return value;
}

/**
 * Horizontal scroll for property carousels (trackpad, mouse drag, shift+wheel).
 * Touch devices use native overflow scrolling (vertical page scroll allowed on cards).
 */
export function useNaturalHorizontalScroll(scrollerRef, containerRef, deps = []) {
  useEffect(() => {
    const scroller = scrollerRef.current;
    const container = containerRef?.current || scroller;
    if (!scroller || !container) return undefined;

    const canScroll = () => scroller.scrollWidth > scroller.clientWidth + 4;

    const onWheel = (e) => {
      if (!canScroll()) return;

      let deltaX = normalizeWheelDelta(e.deltaX, e.deltaMode);
      let deltaY = normalizeWheelDelta(e.deltaY, e.deltaMode);

      if (e.shiftKey && Math.abs(deltaY) > 0.5) {
        e.preventDefault();
        scroller.scrollLeft += deltaY;
        return;
      }

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX < 0.5) return;

      const horizontalIntent = absX >= absY * 0.55 || absY < 2;
      if (!horizontalIntent) return;

      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const nextScroll = scroller.scrollLeft + deltaX;
      const atStart = scroller.scrollLeft <= 1;
      const atEnd = scroller.scrollLeft >= maxScroll - 1;

      if ((deltaX < 0 && atStart) || (deltaX > 0 && atEnd)) return;

      e.preventDefault();
      scroller.scrollLeft = Math.max(0, Math.min(maxScroll, nextScroll));
    };

    let dragStart = null;
    let didDrag = false;
    let activePointerId = null;

    const onPointerDown = (e) => {
      if (e.button !== 0 || !canScroll()) return;
      if (e.pointerType === 'touch') return;

      dragStart = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: scroller.scrollLeft,
        id: e.pointerId,
      };
      didDrag = false;
      activePointerId = e.pointerId;
    };

    const onPointerMove = (e) => {
      if (!dragStart || dragStart.id !== e.pointerId) return;

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      if (!didDrag) {
        if (Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          dragStart = null;
          activePointerId = null;
          return;
        }
        didDrag = true;
        scroller.setPointerCapture(e.pointerId);
        scroller.classList.add('cursor-grabbing');
        scroller.classList.remove('cursor-grab');
      }

      e.preventDefault();
      scroller.scrollLeft = dragStart.scrollLeft - dx;
    };

    const endDrag = (e) => {
      if (!dragStart || dragStart.id !== e.pointerId) return;
      if (scroller.hasPointerCapture(e.pointerId)) {
        scroller.releasePointerCapture(e.pointerId);
      }
      dragStart = null;
      activePointerId = null;
      scroller.classList.remove('cursor-grabbing');
      if (canScroll()) scroller.classList.add('cursor-grab');
    };

    let touchTracking = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartScrollLeft = 0;
    let touchIsPanning = false;
    let suppressNextClick = false;

    const onClickCapture = (e) => {
      if (didDrag || suppressNextClick) {
        e.preventDefault();
        e.stopPropagation();
        didDrag = false;
        suppressNextClick = false;
      }
    };

    const onMouseEnter = () => {
      if (canScroll()) scroller.classList.add('cursor-grab');
    };

    const onMouseLeave = () => {
      scroller.classList.remove('cursor-grab', 'cursor-grabbing');
      if (!didDrag) {
        dragStart = null;
        activePointerId = null;
      }
    };

    const onTouchStart = (e) => {
      if (!canScroll() || e.touches.length !== 1) return;
      touchTracking = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartScrollLeft = scroller.scrollLeft;
      touchIsPanning = false;
      suppressNextClick = false;
    };

    const onTouchMove = (e) => {
      if (!touchTracking) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dx) > TOUCH_SCROLL_CLICK_GUARD_PX && Math.abs(dx) > Math.abs(dy)) {
        touchIsPanning = true;
      }
    };

    const onTouchEnd = () => {
      if (!touchTracking) return;
      if (
        touchIsPanning
        || Math.abs(scroller.scrollLeft - touchStartScrollLeft) > TOUCH_SCROLL_CLICK_GUARD_PX
      ) {
        suppressNextClick = true;
      }
      touchTracking = false;
      touchIsPanning = false;
    };

    const onDocumentPointerMove = (e) => {
      if (activePointerId == null || e.pointerId !== activePointerId) return;
      onPointerMove(e);
    };

    const onDocumentPointerUp = (e) => {
      if (activePointerId == null || e.pointerId !== activePointerId) return;
      endDrag(e);
    };

    container.addEventListener('wheel', onWheel, { passive: false, capture: true });

    scroller.addEventListener('pointerdown', onPointerDown, true);
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    document.addEventListener('pointermove', onDocumentPointerMove);
    document.addEventListener('pointerup', onDocumentPointerUp);
    document.addEventListener('pointercancel', onDocumentPointerUp);
    scroller.addEventListener('click', onClickCapture, true);
    scroller.addEventListener('mouseenter', onMouseEnter);
    scroller.addEventListener('mouseleave', onMouseLeave);
    scroller.addEventListener('touchstart', onTouchStart, { passive: true });
    scroller.addEventListener('touchmove', onTouchMove, { passive: true });
    scroller.addEventListener('touchend', onTouchEnd, { passive: true });
    scroller.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', onWheel, true);
      scroller.removeEventListener('pointerdown', onPointerDown, true);
      scroller.removeEventListener('pointerup', endDrag);
      scroller.removeEventListener('pointercancel', endDrag);
      document.removeEventListener('pointermove', onDocumentPointerMove);
      document.removeEventListener('pointerup', onDocumentPointerUp);
      document.removeEventListener('pointercancel', onDocumentPointerUp);
      scroller.removeEventListener('click', onClickCapture, true);
      scroller.removeEventListener('mouseenter', onMouseEnter);
      scroller.removeEventListener('mouseleave', onMouseLeave);
      scroller.removeEventListener('touchstart', onTouchStart);
      scroller.removeEventListener('touchmove', onTouchMove);
      scroller.removeEventListener('touchend', onTouchEnd);
      scroller.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [scrollerRef, containerRef, ...deps]);
}
