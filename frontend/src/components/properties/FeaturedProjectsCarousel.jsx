import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { useNaturalHorizontalScroll } from '../../hooks/useNaturalHorizontalScroll';
import {
  CAROUSEL_WIDTH_SHELL,
  CAROUSEL_ARROW_LEFT,
  CAROUSEL_ARROW_RIGHT,
  CAROUSEL_SCROLLER,
  CAROUSEL_SCROLLER_PAD,
  CAROUSEL_SCROLL_HINT,
  scrollCarouselByDir,
  CAROUSEL_SLIDE,
} from '../../constants/carouselLayout';

/** Full-width featured projects carousel — touchpad swipe + arrow buttons. */
export default function FeaturedProjectsCarousel({ projects }) {
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
  }, [projects, syncScrollState]);

  useNaturalHorizontalScroll(scrollerRef, containerRef, [projects?.length]);

  const scrollByDir = (dir) => {
    scrollCarouselByDir(scrollerRef.current, dir);
  };

  if (!projects?.length) return null;

  return (
    <div ref={containerRef} className={CAROUSEL_WIDTH_SHELL}>
      {scrollable && (
        <>
          <button
            type="button"
            aria-label="Previous projects"
            disabled={atStart}
            onClick={() => scrollByDir(-1)}
            className={CAROUSEL_ARROW_LEFT}
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next projects"
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
        aria-label="Featured projects"
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
        {projects.map((project) => (
          <div
            key={project.id}
            data-carousel-slide
            className={`w-[min(100%,22rem)] sm:w-[26rem] md:w-[28rem] lg:w-[30rem] ${CAROUSEL_SLIDE}`}
          >
            <ProjectCard project={project} />
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
}
