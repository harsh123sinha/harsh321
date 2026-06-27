import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { useNaturalHorizontalScroll } from '../../hooks/useNaturalHorizontalScroll';

/** Horizontal carousel for featured projects — mobile swipe + desktop arrows. */
export default function FeaturedProjectsCarousel({ projects }) {
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
  }, [projects, syncScrollState]);

  useNaturalHorizontalScroll(scrollerRef, [projects?.length]);

  const scrollByDir = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(300, Math.round(el.clientWidth * 0.8));
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (!projects?.length) return null;

  return (
    <div className="relative px-1 sm:px-10 md:px-12">
      {scrollable && (
        <>
          <button
            type="button"
            aria-label="Previous projects"
            disabled={atStart}
            onClick={() => scrollByDir(-1)}
            className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-stone-200 bg-white p-2.5 text-navy shadow-md transition hover:bg-navy hover:text-white disabled:opacity-30 sm:flex"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            type="button"
            aria-label="Next projects"
            disabled={atEnd}
            onClick={() => scrollByDir(1)}
            className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-stone-200 bg-white p-2.5 text-navy shadow-md transition hover:bg-navy hover:text-white disabled:opacity-30 sm:flex"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </>
      )}

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
        aria-label="Featured projects"
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pt-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:gap-5 md:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((project) => (
          <div
            key={project.id}
            className="w-[min(92vw,22rem)] shrink-0 snap-start sm:w-[26rem] md:w-[28rem] lg:w-[30rem]"
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      <p className="mt-1 text-center text-[11px] text-stone-500 sm:hidden">Swipe to see more projects</p>
    </div>
  );
}
