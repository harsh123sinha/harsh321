/** Centered property/project carousel — 85% of viewport width */
export const CAROUSEL_WIDTH_SHELL =
  'relative mx-auto w-[85%] max-w-[85vw] overflow-hidden';

const CAROUSEL_ARROW_BASE =
  'absolute top-1/2 z-20 -translate-y-1/2 rounded-full border border-stone-200 bg-white p-2.5 text-navy shadow-md ring-1 ring-stone-100/80 transition hover:border-navy hover:bg-navy hover:text-white hover:ring-navy/20 disabled:pointer-events-none disabled:opacity-30';

export const CAROUSEL_ARROW_LEFT = `${CAROUSEL_ARROW_BASE} left-0 sm:left-1 md:left-2 hidden sm:flex`;
export const CAROUSEL_ARROW_RIGHT = `${CAROUSEL_ARROW_BASE} right-0 sm:right-1 md:right-2 hidden sm:flex`;

export const CAROUSEL_SCROLLER_PAD = 'px-1 sm:px-2';

/** Hidden scrollbars — touch + horizontal trackpad swipe */
export const CAROUSEL_SCROLLER =
  'scrollbar-hide flex snap-x snap-proximity gap-3 overflow-x-auto overflow-y-visible overscroll-x-contain pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 sm:gap-5 sm:pb-4 sm:pt-1 md:gap-6';

export const CAROUSEL_SCROLL_HINT =
  'Swipe sideways on the trackpad, drag with mouse, or use the arrows';
