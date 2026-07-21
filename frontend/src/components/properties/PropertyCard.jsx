import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MapPin, Home, Star } from 'lucide-react';
import {
  formatIndianPrice,
  formatPropertyPrice,
  parseImageUrls,
  truncateText,
  getPropertyTypeBadge,
  getListingParty,
  getShopSqftRangeLabel,
  getFurnishingLabel,
  isShopLikeListing,
} from '../../utils/helpers';
import { getImageUrl } from '../../utils/api';
import WhatsAppInquiryButton from './WhatsAppInquiryButton';
import PropertyChatButton from './PropertyChatButton';
import BookmarkButton from './BookmarkButton';
import PropertyShareButton from './PropertyShareButton';
import { getAgentListingInfo } from './AgentListingInfo';

const PropertyCard = ({ property }) => {
  const images = parseImageUrls(property.image_url);
  const mainImage = images[0] || null;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [property.id, mainImage]);

  const badge = getPropertyTypeBadge(property.type);
  const listingParty = getListingParty(property.owner_role);
  const agentInfo = getAgentListingInfo(property);

  const isShop = isShopLikeListing(property);
  const shopSqftLabel = getShopSqftRangeLabel(property.shop_sqft_range);
  const furnishingLabel = getFurnishingLabel(property.furnishing_status);

  const ownerRole = (property.owner_role || '').toLowerCase();
  const partyBadge =
    ownerRole === 'agent' ? 'Agent' : ownerRole === 'owner' ? 'Owner' : null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-light/30 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl sm:rounded-xl">
      <Link to={`/property/${property.id}`} className="block flex min-h-0 flex-1 flex-col">
        {/* Image — shorter on mobile so the full card fits one screen */}
        <div className="relative h-32 overflow-hidden bg-gray-light sm:h-48 md:h-56">
          {mainImage && !imageFailed ? (
            <img
              src={getImageUrl(mainImage)}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy to-navy-light">
              <Home className="h-10 w-10 text-gold/30 sm:h-16 sm:w-16" />
            </div>
          )}

          <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
            <div className={`${badge.bg} rounded-full px-2 py-0.5 text-[9px] font-semibold text-white sm:px-3 sm:py-1 sm:text-xs`}>
              {badge.text}
            </div>
            {partyBadge && (
              <div className="rounded-full bg-navy px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-white sm:px-2.5 sm:py-0.5 sm:text-[10px]">
                {partyBadge}
              </div>
            )}
          </div>

          <div className="absolute right-2 top-2 z-10 flex flex-col items-center gap-1 sm:right-3 sm:top-3">
            <BookmarkButton
              propertyId={property.id}
              className="bg-white/95 p-1.5 text-navy shadow-md hover:bg-white sm:p-2"
            />
            <PropertyShareButton
              property={property}
              size="sm"
              className="bg-white/95 p-1.5 text-navy shadow-md hover:bg-white sm:p-2"
            />
          </div>

          {property.featured && (
            <div className="absolute right-2 top-[4.75rem] flex items-center space-x-0.5 rounded-full bg-gold px-2 py-0.5 text-[9px] font-semibold text-navy sm:right-3 sm:top-[5.25rem] sm:space-x-1 sm:px-3 sm:py-1 sm:text-xs">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span>Featured</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-2.5 sm:p-4 md:p-5">
          <h3 className="mb-1 line-clamp-2 text-sm font-bold leading-snug text-navy sm:mb-2 sm:line-clamp-1 sm:text-lg md:text-xl">
            {property.title}
          </h3>

          <div className="mb-1.5 flex items-start gap-1 text-gray-darker sm:mb-3 sm:gap-2">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-gold sm:mt-1 sm:h-4 sm:w-4" />
            <p className="line-clamp-2 text-[11px] leading-snug sm:text-sm">
              {property.location}
              {property.road_no ? `, Road ${property.road_no}` : ''}, {property.city}
            </p>
          </div>

          <p className="mb-2 line-clamp-2 text-[10px] leading-snug text-gray sm:mb-4 sm:text-sm">
            {truncateText(property.description, 80)}
          </p>

          <div className="flex flex-wrap content-start items-start gap-1 sm:min-h-[4.5rem] sm:gap-2">
            {!isShop && property.bhk && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                {property.bhk} BHK
              </span>
            )}
            {isShop && shopSqftLabel && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                {shopSqftLabel}
              </span>
            )}
            {!isShop && furnishingLabel && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                {furnishingLabel}
              </span>
            )}
            {property.katha && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                {property.katha} Katha
              </span>
            )}
            {property.other_type && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                {property.other_type}
              </span>
            )}
            {!isShop && property.balconies != null && Number(property.balconies) > 0 && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                {property.balconies} balcony{Number(property.balconies) !== 1 ? 's' : ''}
              </span>
            )}
            {!isShop && property.bathrooms != null && Number(property.bathrooms) > 0 && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                {property.bathrooms} bath
              </span>
            )}
            {!isShop && property.floor_no && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                Floor {property.floor_no}
              </span>
            )}
            {!isShop && !!property.garden && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                Garden
              </span>
            )}
            {!!property.car_parking && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                Car parking
              </span>
            )}
            {!!property.bike_parking && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                Bike parking
              </span>
            )}
            {isShop && property.shop_road_distance && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                Road dist {property.shop_road_distance}
              </span>
            )}
            {isShop && property.shop_token_amount != null && Number(property.shop_token_amount) > 0 && (
              <span className="rounded-full bg-navy/5 px-1.5 py-0.5 text-[9px] font-medium text-navy sm:px-3 sm:py-1 sm:text-xs">
                Token {formatIndianPrice(property.shop_token_amount)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-auto flex items-center gap-2 border-t border-gray-light px-2.5 pb-2 pt-2 sm:items-start sm:gap-5 sm:px-4 sm:pb-3 sm:pt-4 md:px-5">
        <Link to={`/property/${property.id}`} className="shrink-0 hover:opacity-90">
          <p className="mb-0.5 text-[9px] text-gray sm:mb-1 sm:text-xs">Price</p>
          <p className="whitespace-nowrap text-base font-bold leading-tight text-gold sm:text-xl md:text-2xl">
            {formatPropertyPrice(property)}
          </p>
        </Link>

        <div className="min-w-0 flex-1 text-right">
          <p className="mb-0.5 text-[9px] text-gray sm:mb-1 sm:text-xs">Listing</p>
          <div className="sm:min-h-[3.75rem]">
            <div className="sm:hidden">
              {agentInfo ? (
                <>
                  <p className="text-[10px] font-semibold leading-tight text-navy">Listed by Agent</p>
                  <p className="line-clamp-1 text-[10px] font-bold leading-tight text-navy">{agentInfo.name}</p>
                  {agentInfo.profileUrl ? (
                    <Link
                      to={agentInfo.profileUrl}
                      className="inline-block text-[9px] font-semibold leading-tight text-gold hover:underline"
                    >
                      Agent Profile
                    </Link>
                  ) : null}
                </>
              ) : ownerRole === 'owner' ? (
                <>
                  <p className="text-[10px] font-semibold leading-tight text-navy">Listed by Owner</p>
                  <p className="line-clamp-1 text-[10px] font-bold leading-tight text-navy">
                    {property.owner_name || 'Direct owner'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-semibold leading-tight text-navy">Listed by</p>
                  <p className="line-clamp-1 text-[10px] font-bold leading-tight text-navy">{listingParty.label}</p>
                </>
              )}
            </div>
            <div className="hidden sm:block">
              {agentInfo ? (
                <>
                  <p className="text-sm font-semibold leading-snug text-navy">Listed by Agent</p>
                  <p className="break-words text-sm font-bold leading-snug text-navy">{agentInfo.name}</p>
                  {agentInfo.profileUrl ? (
                    <Link
                      to={agentInfo.profileUrl}
                      className="inline-block text-xs font-semibold leading-snug text-gold hover:underline"
                    >
                      Agent Profile
                    </Link>
                  ) : (
                    <span className="inline-block h-[18px]" aria-hidden />
                  )}
                </>
              ) : ownerRole === 'owner' ? (
                <>
                  <p className="text-sm font-semibold leading-snug text-navy">Listed by Owner</p>
                  <p className="break-words text-sm font-bold leading-snug text-navy">
                    {property.owner_name || 'Direct owner'}
                  </p>
                  <span className="inline-block h-[18px]" aria-hidden />
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold leading-snug text-navy">Listed by</p>
                  <p className="break-words text-sm font-bold leading-snug text-navy">{listingParty.label}</p>
                  <span className="inline-block h-[18px]" aria-hidden />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-light bg-white px-2.5 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 space-y-2">
        <PropertyChatButton property={property} size="card" />
        <WhatsAppInquiryButton property={property} />
      </div>
    </div>
  );
};

export default PropertyCard;
