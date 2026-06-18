import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from './PropertyCard';

/**
 * Horizontal slider for featured listings — touch swipe + arrow buttons (mobile & desktop).
 * Cards use scroll-snap; arrows scroll ~one viewport width.
 */
export default function FeaturedPropertiesCarousel({ properties }) {
  const scrollerRef = useRef(null);
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
    if (!el) return;
    syncScrollState();
    el.addEventListener('scroll', syncScrollState, { passive: true });
    const ro = new ResizeObserver(syncScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', syncScrollState);
      ro.disconnect();
    };
  }, [properties, syncScrollState]);

  const scrollByDir = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(280, Math.round(el.clientWidth * 0.75));
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (!properties?.length) return null;

  return (
    <div className="relative px-1 sm:px-10 md:px-12">
      {scrollable && (
        <>
          <button
            type="button"
            aria-label="Previous properties"
            disabled={atStart}
            onClick={() => scrollByDir(-1)}
            className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-stone-200 bg-white p-2.5 text-navy shadow-md ring-1 ring-stone-100/80 transition hover:border-navy hover:bg-navy hover:text-white hover:ring-navy/20 disabled:pointer-events-none disabled:opacity-30 sm:flex sm:left-1 md:left-2"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next properties"
            disabled={atEnd}
            onClick={() => scrollByDir(1)}
            className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-stone-200 bg-white p-2.5 text-navy shadow-md ring-1 ring-stone-100/80 transition hover:border-navy hover:bg-navy hover:text-white hover:ring-navy/20 disabled:pointer-events-none disabled:opacity-30 sm:flex sm:right-1 md:right-2"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
          </button>
        </>
      )}

      {/* Mobile: floating compact arrows inside track */}
      {scrollable && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-1 sm:hidden">
          <button
            type="button"
            aria-label="Previous"
            disabled={atStart}
            onClick={() => scrollByDir(-1)}
            className="pointer-events-auto rounded-full border border-stone-200 bg-white/90 p-2 text-navy shadow-md disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={atEnd}
            onClick={() => scrollByDir(1)}
            className="pointer-events-auto rounded-full border border-stone-200 bg-white/90 p-2 text-navy shadow-md disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
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
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible overscroll-x-contain pb-3 pt-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 sm:gap-5 md:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        {properties.map((property) => (
          <div
            key={property.id}
            className="w-[min(88vw,20rem)] shrink-0 snap-start sm:w-80 md:w-[22rem] lg:w-[23rem]"
            role="group"
            aria-roledescription="slide"
          >
            <PropertyCard property={property} />
          </div>
        ))}
      </div>

      <p className="mt-1 text-center text-[11px] text-stone-500 sm:text-xs md:hidden">
        Swipe sideways to see more
      </p>
    </div>
  );
}
