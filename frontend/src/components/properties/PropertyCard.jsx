import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MapPin, Home, Star } from 'lucide-react';
import {
  formatIndianPrice,
  parseImageUrls,
  truncateText,
  getPropertyTypeBadge,
  getListingParty,
  getShopSqftRangeLabel,
  getFurnishingLabel,
} from '../../utils/helpers';
import { getImageUrl } from '../../utils/api';
import WhatsAppInquiryButton from './WhatsAppInquiryButton';
import BookmarkButton from './BookmarkButton';

const PropertyCard = ({ property }) => {
  const images = parseImageUrls(property.image_url);
  const mainImage = images[0] || null;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [property.id, mainImage]);

  const badge = getPropertyTypeBadge(property.type);
  const listingParty = getListingParty(property.owner_role);

  const isShop = String(property.other_type || '').toLowerCase() === 'shop';
  const shopSqftLabel = getShopSqftRangeLabel(property.shop_sqft_range);
  const furnishingLabel = getFurnishingLabel(property.furnishing_status);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-light/30">
      <Link to={`/property/${property.id}`} className="block">
        {/* Image */}
        <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-light">
          {mainImage && !imageFailed ? (
            <img
              src={getImageUrl(mainImage)}
              alt={property.title}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy to-navy-light">
              <Home className="h-16 w-16 text-gold/30" />
            </div>
          )}

          {/* Type Badge */}
          <div className={`absolute top-3 left-3 ${badge.bg} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
            {badge.text}
          </div>

          <div className="absolute top-3 right-3 z-10">
            <BookmarkButton
              propertyId={property.id}
              className="bg-white/95 text-navy p-2 shadow-md hover:bg-white"
            />
          </div>

          {/* Featured Badge */}
          {property.featured && (
            <div className="absolute top-14 right-3 bg-gold text-navy px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>Featured</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-navy mb-2 line-clamp-1">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-start space-x-2 text-gray-darker mb-3">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-1 text-gold" />
            <p className="text-sm line-clamp-2">
              {property.location}
              {property.road_no ? `, Road ${property.road_no}` : ''}, {property.city}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-gray mb-4 line-clamp-2">
            {truncateText(property.description, 80)}
          </p>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {!isShop && property.bhk && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                {property.bhk} BHK
              </span>
            )}
            {isShop && shopSqftLabel && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                {shopSqftLabel}
              </span>
            )}
            {!isShop && furnishingLabel && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                {furnishingLabel}
              </span>
            )}
            {property.katha && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                {property.katha} Katha
              </span>
            )}
            {property.other_type && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                {property.other_type}
              </span>
            )}
            {!isShop && property.balconies != null && Number(property.balconies) > 0 && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                {property.balconies} balcony{Number(property.balconies) !== 1 ? 's' : ''}
              </span>
            )}
            {!isShop && property.bathrooms != null && Number(property.bathrooms) > 0 && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                {property.bathrooms} bath
              </span>
            )}
            {!isShop && property.floor_no && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                Floor {property.floor_no}
              </span>
            )}
            {!isShop && !!property.garden && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                Garden
              </span>
            )}
            {!!property.car_parking && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                Car parking
              </span>
            )}
            {!!property.bike_parking && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                Bike parking
              </span>
            )}
            {isShop && property.shop_road_distance && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                Road dist {property.shop_road_distance}
              </span>
            )}
            {isShop && property.shop_token_amount != null && Number(property.shop_token_amount) > 0 && (
              <span className="bg-navy/5 text-navy px-3 py-1 rounded-full text-xs font-medium">
                Token {formatIndianPrice(property.shop_token_amount)}
              </span>
            )}
          </div>

          {/* Price and Owner — bottom of clickable area */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-light pb-1">
            <div>
              <p className="text-xs text-gray mb-1">Price</p>
              <p className="text-xl sm:text-2xl font-bold text-gold">
                {formatIndianPrice(property.price)}
              </p>
            </div>

            <div className="text-right max-w-[48%]">
              <p className="text-xs text-gray mb-1">Listing</p>
              <p className="text-sm font-semibold text-navy leading-tight">{listingParty.label}</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Full-width WhatsApp CTA (outside Link to avoid nested <a>) */}
      <div className="bg-white px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-light">
        <WhatsAppInquiryButton property={property} />
      </div>
    </div>
  );
};

export default PropertyCard;
