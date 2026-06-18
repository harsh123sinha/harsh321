import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from './PropertyCard';

const scrollerClass =
  'scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible scroll-smooth pb-2 pt-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 sm:gap-3.5 sm:pb-2.5 [&::-webkit-scrollbar]:hidden';

/**
 * Horizontal strip of compact listing cards (many results scroll sideways).
 */
const PropertyCarousel = ({ properties, onAfterPropertyNavigate }) => {
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
    const step = Math.max(200, Math.round(el.clientWidth * 0.72));
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (!properties?.length) return null;

  return (
    <div className="-mx-0.5 min-w-0 sm:-mx-1">
      <p className="mb-1.5 text-xs font-medium text-slate-600">
        Swipe or use arrows for more →
      </p>
      <div className="relative px-0.5 sm:px-9">
        {scrollable && (
          <>
            <button
              type="button"
              aria-label="Previous listings"
              disabled={atStart}
              onClick={() => scrollByDir(-1)}
              className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-navy shadow-md disabled:pointer-events-none disabled:opacity-30 sm:flex"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next listings"
              disabled={atEnd}
              onClick={() => scrollByDir(1)}
              className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-navy shadow-md disabled:pointer-events-none disabled:opacity-30 sm:flex"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </>
        )}

        {scrollable && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-0.5 sm:hidden">
            <button
              type="button"
              aria-label="Previous"
              disabled={atStart}
              onClick={() => scrollByDir(-1)}
              className="pointer-events-auto rounded-full border border-slate-200 bg-white/95 p-1.5 text-navy shadow-md disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next"
              disabled={atEnd}
              onClick={() => scrollByDir(1)}
              className="pointer-events-auto rounded-full border border-slate-200 bg-white/95 p-1.5 text-navy shadow-md disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}

        <div
          ref={scrollerRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Property matches from assistant"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              scrollByDir(-1);
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              scrollByDir(1);
            }
          }}
          className={scrollerClass}
        >
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} onAfterNavigate={onAfterPropertyNavigate} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyCarousel;
