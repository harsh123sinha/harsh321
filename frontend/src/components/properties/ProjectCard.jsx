import { Link } from 'react-router-dom';
import { MapPin, Building2 } from 'lucide-react';
import { getImageUrl } from '../../utils/api';
import {
  formatBhkOptions,
  formatIndianPrice,
  formatProjectPriceFrom,
  formatSqftRange,
  getProjectTypeLabel,
  parseImageUrls,
} from '../../utils/helpers';

/** Magicbricks-style featured project card — image on top, details below. */
export default function ProjectCard({ project }) {
  const images = parseImageUrls(project.image_url);
  const imageSrc = images[0] ? getImageUrl(images[0]) : null;
  const bhkLabel = formatBhkOptions(project.bhk_options);
  const sqftLabel = formatSqftRange(project.sqft_from, project.sqft_to);
  const typeLabel = getProjectTypeLabel(project.project_type);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy/10">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={project.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            <Building2 className="h-12 w-12" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-md bg-navy/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {typeLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:flex-row sm:gap-4 sm:p-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-navy sm:text-lg">
            {project.title}
          </h3>
          {project.developer_name && (
            <p className="text-xs text-stone-600 sm:text-sm">
              by <span className="font-medium text-navy">{project.developer_name}</span>
            </p>
          )}
          <p className="flex items-start gap-1 text-xs text-stone-600 sm:text-sm">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
            <span className="line-clamp-2">
              {project.location}
              {project.city ? `, ${project.city}` : ''}
            </span>
          </p>
          {project.marketed_by && (
            <p className="text-[11px] text-stone-500 sm:text-xs">
              Marketed by {project.marketed_by}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col justify-center border-t border-stone-100 pt-2 sm:w-[42%] sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          {bhkLabel && (
            <p className="text-xs font-semibold text-navy sm:text-sm">{bhkLabel}</p>
          )}
          {sqftLabel && (
            <p className="mt-0.5 text-[11px] text-stone-600 sm:text-xs">{sqftLabel}</p>
          )}
          <p className="mt-1.5 text-sm font-bold text-navy sm:mt-2 sm:text-base">
            {formatProjectPriceFrom(project.price)}
          </p>
          <p className="text-[10px] text-stone-500 sm:text-xs">
            Base: {formatIndianPrice(project.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}
