import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SCROLL_STEP = 300;
const SCROLL_STEP_MOBILE = 240;
const MOBILE_MAX = 639;
const AUTO_SPEED = 1.15;

const ARROW_THEMES = {
  dark: 'border border-white/25 bg-navy text-gold shadow-lg hover:bg-gold hover:text-navy',
  light: 'border border-stone-200 bg-white text-navy shadow-md hover:bg-gold hover:text-navy',
};

/**
 * Infinite horizontal category strip — auto-scrolls continuously;
 * pauses while the pointer is over the strip; left/right arrows for manual swipe.
 */
export default function CategoryMarqueeStrip({
  items = [],
  renderItem,
  className = '',
  scrollerClassName = '',
  ariaLabel = 'Browse service categories',
  theme = 'dark',
}) {
  const scrollerRef = useRef(null);
  const hoverPausedRef = useRef(false);

  const normalizeScrollLoop = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const loopWidth = el.scrollWidth / 2;
    if (loopWidth <= 0) return;
    if (el.scrollLeft >= loopWidth) el.scrollLeft -= loopWidth;
    if (el.scrollLeft < 0) el.scrollLeft += loopWidth;
  }, []);

  const scrollByStep = useCallback(
    (direction) => {
      const el = scrollerRef.current;
      if (!el) return;
      const mobile = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches;
      const step = mobile ? SCROLL_STEP_MOBILE : SCROLL_STEP;
      el.scrollLeft += direction * step;
      normalizeScrollLoop();
    },
    [normalizeScrollLoop]
  );

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    el.scrollLeft = 0;
    return undefined;
  }, [items]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;

    let rafId;

    const tick = () => {
      if (!hoverPausedRef.current && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += AUTO_SPEED;
        normalizeScrollLoop();
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [items, normalizeScrollLoop]);

  if (!items.length || !renderItem) return null;

  const loopItems = [...items, ...items];
  const arrowClass = ARROW_THEMES[theme] || ARROW_THEMES.dark;

  return (
    <div
      className={`relative ${className}`}
      aria-label={ariaLabel}
      onMouseEnter={() => {
        hoverPausedRef.current = true;
      }}
      onMouseLeave={() => {
        hoverPausedRef.current = false;
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          scrollByStep(-1);
        }}
        className={`absolute left-0.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition sm:left-2 sm:h-10 sm:w-10 ${arrowClass}`}
        aria-label="Scroll categories left"
      >
        <ChevronLeft className="pointer-events-none h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          scrollByStep(1);
        }}
        className={`absolute right-0.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition sm:right-2 sm:h-10 sm:w-10 ${arrowClass}`}
        aria-label="Scroll categories right"
      >
        <ChevronRight className="pointer-events-none h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <div
        ref={scrollerRef}
        className={`w-full overflow-x-auto overflow-y-hidden scrollbar-hide py-3 pl-9 pr-9 sm:py-6 sm:pl-14 sm:pr-14 ${scrollerClassName}`}
      >
        <div className="flex w-max min-w-full gap-1 xs:gap-1.5 sm:gap-8 md:gap-12">
          {loopItems.map((cat, index) => (
            <div key={`${cat.id}-${index}`} className="shrink-0">
              {renderItem(cat, index % items.length)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
