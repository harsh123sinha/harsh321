import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { useNaturalHorizontalScroll } from '../../hooks/useNaturalHorizontalScroll';
import {
  CAROUSEL_WIDTH_SHELL,
  CAROUSEL_ARROW_LEFT,
  CAROUSEL_ARROW_RIGHT,
  CAROUSEL_SCROLLER,
  CAROUSEL_SCROLLER_PAD,
  CAROUSEL_SCROLL_HINT,
} from '../../constants/carouselLayout';

const shellClass =
  'w-[min(100%,320px)] flex-shrink-0 snap-start sm:w-[300px] md:w-[320px] lg:w-[340px] xl:w-[360px] h-full';

/** 85% width property strip — touchpad swipe, no visible scrollbars. */
const PropertyListRow = ({ properties, renderCard }) => {
  const scrollerRef = useRef(null);
  const containerRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [scrollable, setScrollable] = useState(false);

  const syncScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, clientWidth, scrollWidth } = el;
    setScrollable(scrollWidth > clientWidth + 4);
    setAtStart(scrollLeft <= 4);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    syncScrollState();
    el.addEventListener('scroll', syncScrollState, { passive: true });
    const ro = new ResizeObserver(syncScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', syncScrollState);
      ro.disconnect();
    };
  }, [properties, syncScrollState]);

  useNaturalHorizontalScroll(scrollerRef, containerRef, [properties?.length]);

  const scrollByDir = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(280, Math.round(el.clientWidth * 0.75));
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (!properties?.length) return null;

  return (
    <div ref={containerRef} className={CAROUSEL_WIDTH_SHELL}>
      {scrollable && (
        <>
          <button
            type="button"
            aria-label="Previous properties"
            disabled={atStart}
            onClick={() => scrollByDir(-1)}
            className={CAROUSEL_ARROW_LEFT}
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next properties"
            disabled={atEnd}
            onClick={() => scrollByDir(1)}
            className={CAROUSEL_ARROW_RIGHT}
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
          </button>
        </>
      )}

      {scrollable && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-2 sm:hidden">
          <button
            type="button"
            aria-label="Previous"
            disabled={atStart}
            onClick={() => scrollByDir(-1)}
            className="pointer-events-auto rounded-full border border-stone-200 bg-white/90 p-2 text-navy shadow-md disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={atEnd}
            onClick={() => scrollByDir(1)}
            className="pointer-events-auto rounded-full border border-stone-200 bg-white/90 p-2 text-navy shadow-md disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}

      <div
        ref={scrollerRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Property listings"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            scrollByDir(-1);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            scrollByDir(1);
          }
        }}
        className={`${CAROUSEL_SCROLLER} ${CAROUSEL_SCROLLER_PAD} select-none`}
      >
        {properties.map((property) => (
          <div key={property.id} className={`${shellClass} relative`} role="group" aria-roledescription="slide">
            {renderCard ? renderCard(property) : <PropertyCard property={property} />}
          </div>
        ))}
      </div>

      {scrollable && (
        <p className="mt-2 text-center text-[11px] text-stone-500 sm:text-xs">
          {CAROUSEL_SCROLL_HINT}
        </p>
      )}
    </div>
  );
};

export default PropertyListRow;
