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
  scrollCarouselByDir,
  CAROUSEL_SLIDE,
} from '../../constants/carouselLayout';

/** Full-width featured properties slider — touchpad swipe + arrow buttons. */
export default function FeaturedPropertiesCarousel({ properties }) {
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
        aria-label="Featured properties"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            scrollByDir(-1);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            scrollByDir(1);
          }
        }}
        className={`${CAROUSEL_SCROLLER} ${CAROUSEL_SCROLLER_PAD}`}
      >
        {properties.map((property) => (
          <div
            key={property.id}
            data-carousel-slide
            className={`w-[min(100%,320px)] sm:w-80 md:w-[22rem] lg:w-[23rem] h-full ${CAROUSEL_SLIDE}`}
            role="group"
            aria-roledescription="slide"
          >
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
    </div>
  );
}
