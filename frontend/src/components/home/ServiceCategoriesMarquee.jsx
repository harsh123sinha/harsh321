import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { WORKER_PROFESSION_CATEGORIES } from '../../constants/workerProfessions';
import { getServiceCategoryDisplay } from '../../constants/serviceCategoryIcons';

function CategoryItem({ cat }) {
  const { shortLabel, Icon } = getServiceCategoryDisplay(cat.id);

  return (
    <Link
      to={`/our-vendors?categoryId=${encodeURIComponent(cat.id)}`}
      className="group flex w-[4.75rem] shrink-0 flex-col items-center gap-2 sm:w-[5.5rem] sm:gap-2.5 touch-target"
      title={cat.label}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full border-[2.5px] border-gold bg-white/95 shadow-md transition-transform duration-200 group-hover:scale-105 group-active:scale-95 sm:h-16 sm:w-16">
        <Icon className="h-6 w-6 text-navy sm:h-7 sm:w-7" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="max-w-[4.75rem] text-center text-[10px] font-semibold leading-tight text-white/90 sm:max-w-[5.25rem] sm:text-xs">
        {shortLabel}
      </span>
    </Link>
  );
}

/**
 * Our Services panel — heading + infinite category strip on dark navy background.
 * @param {object} props
 * @param {string} [props.className]
 * @param {React.RefObject<HTMLElement>} [props.panelRef] — top border used as hero story ground
 */
export default function ServiceCategoriesMarquee({ className = '', panelRef }) {
  const scrollerRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef(null);

  const normalizeScrollLoop = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const loopWidth = el.scrollWidth / 2;
    if (loopWidth <= 0) return;
    if (el.scrollLeft >= loopWidth) el.scrollLeft -= loopWidth;
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const resumeNow = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    pausedRef.current = false;
  }, []);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    el.scrollLeft = 0;
    return undefined;
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;

    let rafId;
    const speed = 1.15;

    const tick = () => {
      if (!pausedRef.current && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += speed;
        normalizeScrollLoop();
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [normalizeScrollLoop]);

  const items = WORKER_PROFESSION_CATEGORIES;
  const loopItems = [...items, ...items];

  return (
    <section
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:max-w-[88rem] lg:px-6 xl:max-w-[96rem] xl:px-8 2xl:max-w-[104rem] 2xl:px-10 ${className}`}
    >
      <div
        ref={panelRef}
        className="overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-navy via-[#0c1630] to-navy-light shadow-lg"
      >
        <div className="relative flex flex-col gap-3 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
          <div className="min-w-0 text-center sm:text-left">
            <h2 className="htls-services-title-shimmer text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
              Our Services &amp; Vendors
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-white/70 sm:text-sm">
              Plumbers, maids, marriage halls, rental cars, building materials &amp; more — tap a
              category or browse all
            </p>
          </div>
          <Link
            to="/our-vendors"
            className="inline-flex shrink-0 items-center justify-center gap-1 self-center rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-navy transition hover:bg-gold-light sm:self-auto sm:px-6 sm:py-3 sm:text-sm"
          >
            Browse all
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div
          className="relative bg-[#070d1a]/50"
          onMouseEnter={pause}
          onMouseLeave={resumeNow}
          aria-label="Browse service categories"
        >
          <div
            ref={scrollerRef}
            className="flex w-full overflow-hidden py-4 pl-5 sm:py-5 sm:pl-7"
          >
            <div className="flex w-max gap-10 sm:gap-14 md:gap-16">
              {loopItems.map((cat, index) => (
                <CategoryItem key={`${cat.id}-${index}`} cat={cat} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
