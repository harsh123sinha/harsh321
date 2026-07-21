import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { formatIndianPrice, formatListingPostedDate, parseImageUrls, DEFAULT_SITE_INQUIRY_PHONE } from '../../utils/helpers';
import { formatListingCardTitle } from '../../utils/listingTitleUtils';
import { saveListScroll } from '../../utils/listScrollRestore';
import PropertyCardImageCarousel from './PropertyCardImageCarousel';
import BookmarkButton from './BookmarkButton';
import PropertyShareButton from './PropertyShareButton';
import WhatsAppInquiryButton from './WhatsAppInquiryButton';
import PropertyChatButton from './PropertyChatButton';
import MaskedPhoneActionButton from './MaskedPhoneActionButton';
import {
  getImageCornerLabel,
  getListTypeBadge,
} from './propertyListCardSpecs';
import { buildMobileIconSpecs } from './propertyListCardMobileSpecs';

const CONTACT_PHONE = import.meta.env.VITE_CONTACT_OFFICE_1 || DEFAULT_SITE_INQUIRY_PHONE;

const PropertyListCard = ({ property, listKey, listIndex }) => {
  const location = useLocation();
  const scrollKey = listKey || location.pathname;
  const images = useMemo(() => parseImageUrls(property.image_url), [property.image_url]);
  const iconSpecs = useMemo(() => buildMobileIconSpecs(property), [property]);
  const postedLabel = formatListingPostedDate(property.created_at || property.updated_at);
  const locationLine = [property.location, property.city].filter(Boolean).join(', ');
  const detailPath =
    property.listing_kind === 'project' ? `/projects/${property.id}` : `/property/${property.id}`;
  const typeBadge = getListTypeBadge(property.type);
  const cornerLabel = getImageCornerLabel(property);

  const saveScrollForDetail = () => {
    saveListScroll(scrollKey, property.id, listIndex);
  };

  return (
    <article
      data-property-id={property.id}
      className="overflow-hidden rounded-md border border-stone-200 bg-white lg:rounded-xl lg:border-stone-200/90 lg:shadow-sm lg:transition lg:hover:shadow-md"
    >
      <div className="flex min-h-[11.5rem] items-stretch sm:min-h-[12rem] lg:min-h-[14.5rem]">
        {/* Left — photo + contact */}
        <div className="flex w-[44%] max-w-[10rem] shrink-0 flex-col p-1.5 sm:max-w-[11rem] lg:w-[55%] lg:max-w-none xl:w-[58%] lg:p-2.5">
          <Link
            to={detailPath}
            onClick={saveScrollForDetail}
            className="flex min-h-0 flex-1 overflow-hidden rounded-sm border border-stone-300"
          >
            <PropertyCardImageCarousel
              images={images}
              alt={property.title}
              cornerLabel={cornerLabel}
              typeBadge={typeBadge}
              olxMobile
              className="h-[8.5rem] w-full shrink-0 sm:h-[9rem] lg:h-auto lg:min-h-[12rem] lg:aspect-[5/4] xl:min-h-[14rem] xl:aspect-[4/3]"
            />
          </Link>

          <div className="mt-1 flex flex-col gap-1 rounded-sm border border-stone-200 bg-stone-50 px-1 py-0.5 lg:mt-1.5 lg:gap-1 lg:px-1.5 lg:py-1">
            <PropertyChatButton property={property} size="list" variant="outline" />
            <div className="flex items-stretch gap-1">
              <WhatsAppInquiryButton
                property={property}
                iconOnly
                compact
                className="h-7 flex-1 rounded-md lg:h-9"
              />
              <MaskedPhoneActionButton
                phoneRaw={CONTACT_PHONE}
                iconOnly
                compact
                className="h-7 flex-1 rounded-md lg:h-9"
              />
            </div>
          </div>
        </div>

        {/* Right — details in three sections */}
        <Link
          to={detailPath}
          onClick={saveScrollForDetail}
          className="flex min-w-0 flex-1 flex-col divide-y divide-stone-200 py-2 pl-2 pr-2 sm:py-2.5 sm:pl-2.5 lg:px-4 lg:py-3"
        >
          {/* Section 1 — price + title */}
          <div className="min-w-0 pb-2.5 lg:pb-3">
            <div className="flex items-start justify-between gap-1.5">
              <p className="min-w-0 text-[1.1rem] font-bold leading-tight tracking-tight text-[#0a1020] sm:text-xl lg:text-2xl lg:font-black">
                {formatIndianPrice(property.price)}
              </p>
              <div className="flex shrink-0 flex-col items-center gap-1 lg:gap-1.5">
                {postedLabel ? (
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-stone-400 sm:text-[10px] lg:text-[11px]">
                    {postedLabel}
                  </span>
                ) : null}
                <BookmarkButton
                  propertyId={property.id}
                  size="sm"
                  className="shrink-0 text-stone-400 hover:text-navy"
                />
                <PropertyShareButton
                  property={property}
                  size="sm"
                  className="shrink-0 text-stone-400 hover:text-navy"
                />
              </div>
            </div>

            <h3 className="mt-1.5 text-[11px] font-medium uppercase leading-snug tracking-wide text-stone-700 whitespace-normal break-words sm:text-xs lg:mt-2 lg:text-sm">
              {formatListingCardTitle(property.title)}
            </h3>
            {property.listed_by_staff ? (
              <span className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gold/15 text-navy border border-gold/30 sm:text-[10px]">
                Added by Harsh To Let Services
              </span>
            ) : null}
          </div>

          {/* Section 2 — specs */}
          <div className="flex min-h-0 flex-1 flex-col py-2.5 lg:py-3">
            {iconSpecs.length > 0 ? (
              <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 lg:gap-x-3 lg:gap-y-2">
                {iconSpecs.map((item, idx) => {
                  const Icon = item.Icon;
                  return (
                    <li key={`${item.text}-${idx}`} className="flex min-w-0 items-center gap-1 lg:gap-1.5">
                      <Icon className="h-3 w-3 shrink-0 text-stone-500 lg:h-3.5 lg:w-3.5" aria-hidden />
                      <span className="truncate text-[10px] font-medium text-stone-600 sm:text-[11px] lg:text-xs">
                        {item.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {/* Section 3 — location */}
          <div className="flex min-w-0 items-center gap-0.5 pt-2 lg:gap-1 lg:pt-3">
            <MapPin className="h-3 w-3 shrink-0 text-red-500 lg:h-3.5 lg:w-3.5" aria-hidden />
            <span className="truncate text-[10px] uppercase tracking-wide text-stone-500 sm:text-[11px] lg:text-xs">
              {locationLine}
            </span>
          </div>
        </Link>
      </div>
    </article>
  );
};

export default PropertyListCard;
