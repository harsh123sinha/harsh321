import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  formatPropertyPrice,
  parseImageUrls,
  truncateText,
  getPropertyTypeBadge,
} from '../utils/helpers';
import { getImageUrl } from '../utils/api';
import { MapPin } from 'lucide-react';

/**
 * Compact property card for in-chat horizontal carousel.
 * @param {() => void} [onAfterNavigate] — e.g. close chat panel when user opens a listing.
 */
const PropertyCard = ({ property, onAfterNavigate }) => {
  const images = parseImageUrls(property.image_url);
  const main = images[0];
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [property.id, main]);

  const badge = getPropertyTypeBadge(property.type);
  const highlights = [];
  if (property.bhk) highlights.push(`${property.bhk} BHK`);
  if (property.other_type) highlights.push(property.other_type);
  if (property.shop_sqft_range) highlights.push(`${property.shop_sqft_range} sq ft band`);

  return (
    <article className="w-[220px] flex-shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Link
        to={`/property/${property.id}`}
        className="block touch-manipulation"
        onClick={() => onAfterNavigate?.()}
      >
        <div className="relative h-28 bg-slate-100">
          {main && !imageFailed ? (
            <img
              src={getImageUrl(main)}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No image
            </div>
          )}
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${badge.bg}`}
          >
            {badge.text}
          </span>
        </div>
        <div className="space-y-1 p-2.5">
          <p className="text-sm font-bold text-navy line-clamp-1">
            {formatPropertyPrice(property)}
          </p>
          <p className="flex items-start gap-1 text-[11px] text-slate-600 line-clamp-2">
            <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0 text-gold" />
            {property.location}
            {property.city ? `, ${property.city}` : ''}
          </p>
          {highlights.length > 0 ? (
            <p className="text-[10px] text-slate-500 line-clamp-2">{highlights.join(' · ')}</p>
          ) : null}
          {property.description ? (
            <p className="text-[10px] text-slate-400 line-clamp-2">
              {truncateText(property.description, 70)}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
};

export default PropertyCard;
