import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { WORKER_PROFESSION_CATEGORIES } from '../../constants/workerProfessions';
import { getServiceCategoryVisual } from '../../constants/serviceCategoryVisuals';
import ServiceCategory3DIcon from '../vendors/ServiceCategory3DIcon';
import CategoryMarqueeStrip from '../vendors/CategoryMarqueeStrip';

function CategoryItem({ cat }) {
  const { shortLabel } = getServiceCategoryVisual(cat.id);

  return (
    <Link
      to={`/our-vendors/category/${encodeURIComponent(cat.id)}`}
      className="group flex w-[3.25rem] shrink-0 flex-col items-center gap-0.5 xs:w-[3.5rem] sm:w-24 sm:gap-2.5 touch-target"
      title={cat.label}
    >
      <ServiceCategory3DIcon
        categoryId={cat.id}
        size="marquee"
        className="group-hover:drop-shadow-lg svc-3d-tile--flat"
      />
      <span className="max-w-[3.25rem] text-center text-[8px] font-semibold leading-tight text-white/90 xs:max-w-[3.5rem] xs:text-[9px] sm:max-w-24 sm:text-xs">
        {shortLabel}
      </span>
    </Link>
  );
}

/**
 * Our Services panel — heading + infinite category strip on dark navy background.
 */
export default function ServiceCategoriesMarquee({ className = '', panelRef }) {
  const items = WORKER_PROFESSION_CATEGORIES;

  return (
    <section
      className={`mx-auto w-full max-w-7xl px-2 sm:px-6 lg:max-w-[88rem] lg:px-6 xl:max-w-[96rem] xl:px-8 2xl:max-w-[104rem] 2xl:px-10 ${className}`}
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

        <div className="relative bg-[#070d1a]/50">
          <CategoryMarqueeStrip
            items={items}
            renderItem={(cat) => <CategoryItem cat={cat} />}
          />
        </div>
      </div>
    </section>
  );
}
