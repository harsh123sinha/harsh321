import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { useNaturalHorizontalScroll } from '../../hooks/useNaturalHorizontalScroll';
import {
  CAROUSEL_WIDTH_SHELL,
  CAROUSEL_WIDTH_SHELL_FULL,
  CAROUSEL_ARROW_LEFT,
  CAROUSEL_ARROW_RIGHT,
  CAROUSEL_ARROW_LEFT_FULL,
  CAROUSEL_ARROW_RIGHT_FULL,
  CAROUSEL_SCROLLER,
  CAROUSEL_SCROLLER_PAD,
  CAROUSEL_SCROLLER_PAD_FULL,
  CAROUSEL_SCROLL_HINT,
  scrollCarouselByDir,
  CAROUSEL_SLIDE,
} from '../../constants/carouselLayout';

const shellClass =
  'w-[min(100%,320px)] sm:w-[300px] md:w-[320px] lg:w-[340px] xl:w-[360px] h-full';

/** 85% width property strip — touchpad swipe, no visible scrollbars. */
const PropertyListRow = ({ properties, renderCard, fullWidth = false }) => {
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
    scrollCarouselByDir(scrollerRef.current, dir);
  };

  if (!properties?.length) return null;

  const shellClassName = fullWidth ? CAROUSEL_WIDTH_SHELL_FULL : CAROUSEL_WIDTH_SHELL;
  const arrowLeftClass = fullWidth ? CAROUSEL_ARROW_LEFT_FULL : CAROUSEL_ARROW_LEFT;
  const arrowRightClass = fullWidth ? CAROUSEL_ARROW_RIGHT_FULL : CAROUSEL_ARROW_RIGHT;
  const scrollerPadClass = fullWidth ? CAROUSEL_SCROLLER_PAD_FULL : CAROUSEL_SCROLLER_PAD;

  return (
    <div ref={containerRef} className={shellClassName}>
      {scrollable && (
        <>
          <button
            type="button"
            aria-label="Previous properties"
            disabled={atStart}
            onClick={() => scrollByDir(-1)}
            className={arrowLeftClass}
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next properties"
            disabled={atEnd}
            onClick={() => scrollByDir(1)}
            className={arrowRightClass}
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
        className={`${CAROUSEL_SCROLLER} ${scrollerPadClass}`}
      >
        {properties.map((property) => (
          <div
            key={property.id}
            data-carousel-slide
            className={`${shellClass} ${CAROUSEL_SLIDE} relative`}
            role="group"
            aria-roledescription="slide"
          >
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
