import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { getImageUrl } from '../../utils/api';

/**
 * In-card horizontal image strip. Left/right arrows appear only while the card is on screen.
 */
const PropertyCardImageCarousel = ({
  images = [],
  alt,
  typeBadge,
  cornerLabel,
  olxMobile = false,
  className = '',
}) => {
  const rootRef = useRef(null);
  const scrollerRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [failed, setFailed] = useState({});

  const syncScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, clientWidth, scrollWidth } = el;
    setAtStart(scrollLeft <= 2);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 2);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.35, rootMargin: '0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    syncScroll();
    el.addEventListener('scroll', syncScroll, { passive: true });
    const ro = new ResizeObserver(syncScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', syncScroll);
      ro.disconnect();
    };
  }, [images, syncScroll]);

  useEffect(() => {
    setFailed({});
  }, [images]);

  const scrollByDir = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  const showArrows = inView && images.length > 1;

  const badgeClass =
    'pointer-events-none absolute z-10 rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-white shadow-sm sm:text-[9px] lg:text-[10px] lg:px-2 lg:py-1 bg-red-600';

  const onArrowClick = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    scrollByDir(dir);
  };

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden bg-stone-200 ${className || 'h-[7.25rem] w-full'}`}
    >
      {images.length > 0 ? (
        <div
          ref={scrollerRef}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, idx) => (
            <div key={`${src}-${idx}`} className="h-full w-full shrink-0 snap-center">
              {!failed[idx] ? (
                <img
                  src={getImageUrl(src)}
                  alt={alt ? `${alt} — photo ${idx + 1}` : `Property photo ${idx + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={() => setFailed((prev) => ({ ...prev, [idx]: true }))}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0a1020] to-[#1a2844]">
                  <Home className="h-8 w-8 text-gold/35" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0a1020] to-[#1a2844]">
          <Home className="h-8 w-8 text-gold/35" />
        </div>
      )}

      {cornerLabel ? (
        <span className={`left-1 top-1 ${badgeClass}`}>{cornerLabel}</span>
      ) : null}

      {typeBadge ? (
        <span className={`right-1 top-1 ${badgeClass}`}>{typeBadge}</span>
      ) : null}

      {images.length > 1 && !olxMobile && !typeBadge ? (
        <span className="pointer-events-none absolute bottom-1.5 right-1.5 z-10 rounded-full bg-black/55 px-1.5 py-0.5 text-[8px] font-semibold text-white">
          {images.length} photos
        </span>
      ) : null}

      {showArrows ? (
        <button
          type="button"
          aria-label="Previous photo"
          onClick={(e) => onArrowClick(e, -1)}
          disabled={atStart}
          className={`absolute left-0.5 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy shadow ring-1 ring-black/10 transition hover:bg-white disabled:pointer-events-none disabled:opacity-35 ${
            olxMobile ? 'h-7 w-7 lg:h-8 lg:w-8' : 'left-1 h-7 w-7'
          }`}
        >
          <ChevronLeft className={olxMobile ? 'h-4 w-4 lg:h-5 lg:w-5' : 'h-4 w-4'} aria-hidden />
        </button>
      ) : null}

      {showArrows ? (
        <button
          type="button"
          aria-label="Next photo"
          onClick={(e) => onArrowClick(e, 1)}
          disabled={atEnd}
          className={`absolute right-0.5 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy shadow ring-1 ring-black/10 transition hover:bg-white disabled:pointer-events-none disabled:opacity-35 ${
            olxMobile ? 'h-7 w-7 lg:h-8 lg:w-8' : 'right-1 h-7 w-7'
          }`}
        >
          <ChevronRight className={olxMobile ? 'h-4 w-4 lg:h-5 lg:w-5' : 'h-4 w-4'} aria-hidden />
        </button>
      ) : null}
    </div>
  );
};

export default PropertyCardImageCarousel;
