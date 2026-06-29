/** Centered property/project carousel — 85% of viewport width */
export const CAROUSEL_WIDTH_SHELL =
  'relative mx-auto w-[85%] max-w-[85vw] overflow-hidden';

/** Full-bleed carousel (e.g. property detail recommended) */
export const CAROUSEL_WIDTH_SHELL_FULL =
  'relative w-full overflow-hidden';

const CAROUSEL_ARROW_BASE =
  'absolute top-1/2 z-20 -translate-y-1/2 rounded-full border border-stone-200 bg-white p-2.5 text-navy shadow-md ring-1 ring-stone-100/80 transition hover:border-navy hover:bg-navy hover:text-white hover:ring-navy/20 disabled:pointer-events-none disabled:opacity-30';

export const CAROUSEL_ARROW_LEFT = `${CAROUSEL_ARROW_BASE} left-0 sm:left-1 md:left-2 hidden sm:flex`;
export const CAROUSEL_ARROW_RIGHT = `${CAROUSEL_ARROW_BASE} right-0 sm:right-1 md:right-2 hidden sm:flex`;

export const CAROUSEL_ARROW_LEFT_FULL = `${CAROUSEL_ARROW_BASE} left-2 sm:left-4 md:left-6 lg:left-8 hidden sm:flex`;
export const CAROUSEL_ARROW_RIGHT_FULL = `${CAROUSEL_ARROW_BASE} right-2 sm:right-4 md:right-6 lg:right-8 hidden sm:flex`;

export const CAROUSEL_SCROLLER_PAD = 'px-1 sm:px-2';
export const CAROUSEL_SCROLLER_PAD_FULL = 'px-3 sm:px-5 md:px-8 lg:px-10';
/** Hidden scrollbars — touch swipe + trackpad + mouse drag */
export const CAROUSEL_SCROLLER =
  'scrollbar-hide flex snap-x snap-proximity gap-3 overflow-x-auto overflow-y-visible overscroll-x-contain scroll-smooth scroll-pl-1 pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [touch-action:pan-x] [&::-webkit-scrollbar]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 sm:gap-5 sm:scroll-pl-2 sm:pb-4 sm:pt-1 md:gap-6';

export const CAROUSEL_SLIDE =
  'shrink-0 snap-start [touch-action:pan-x]';

export const CAROUSEL_SCROLL_HINT =
  'Swipe left or right, drag with mouse, or use the arrows';

/** Scroll carousel by one card in direction (-1 | 1). */
export function scrollCarouselByDir(scrollerEl, dir) {
  if (!scrollerEl || !dir) return;

  const slides = Array.from(scrollerEl.querySelectorAll('[data-carousel-slide]'));
  if (!slides.length) {
    const step = Math.max(280, Math.round(scrollerEl.clientWidth * 0.8));
    scrollerEl.scrollBy({ left: dir * step, behavior: 'smooth' });
    return;
  }

  const { scrollLeft, clientWidth } = scrollerEl;
  const anchor = scrollLeft + clientWidth * 0.15;

  let currentIndex = slides.findIndex(
    (slide) => slide.offsetLeft + slide.offsetWidth > anchor
  );
  if (currentIndex < 0) currentIndex = slides.length - 1;

  const nextIndex = Math.max(0, Math.min(slides.length - 1, currentIndex + dir));
  slides[nextIndex].scrollIntoView({
    behavior: 'smooth',
    inline: 'start',
    block: 'nearest',
  });
}
