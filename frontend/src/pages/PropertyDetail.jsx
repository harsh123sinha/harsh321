import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Home, Phone, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api, { getImageUrl } from '../utils/api';
import {
  formatIndianPrice,
  parseImageUrls,
  getPropertyTypeBadge,
  getListingParty,
  toTelHref,
  DEFAULT_SITE_INQUIRY_PHONE,
  getShopSqftRangeLabel,
  getFurnishingLabel,
} from '../utils/helpers';
import PropertyCard from '../components/properties/PropertyCard';
import WhatsAppInquiryButton from '../components/properties/WhatsAppInquiryButton';

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    setDescExpanded(false);
  }, [id]);

  const { data, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  const property = data?.property;
  const relatedProperties = data?.relatedProperties || [];

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy mb-2">Property Not Found</h2>
          <Link to="/" className="text-gold hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const images = parseImageUrls(property.image_url);
  const badge = getPropertyTypeBadge(property.type);
  const listingParty = getListingParty(property.owner_role);

  const CONTACT_OFFICE_PHONE_1 =
    import.meta.env.VITE_CONTACT_OFFICE_1 || DEFAULT_SITE_INQUIRY_PHONE;
  const CONTACT_OFFICE_PHONE_2 =
    import.meta.env.VITE_CONTACT_OFFICE_2 || DEFAULT_SITE_INQUIRY_PHONE;

  const isShop = String(property.other_type || '').toLowerCase() === 'shop';
  const shopSqftLabel = getShopSqftRangeLabel(property.shop_sqft_range);
  const furnishingLabel = getFurnishingLabel(property.furnishing_status);

  const specParts = [];
  if (!isShop && property.bhk) specParts.push(`${property.bhk} BHK`);
  if (!isShop && furnishingLabel) specParts.push(furnishingLabel);
  if (isShop && shopSqftLabel) specParts.push(shopSqftLabel);
  if (property.katha) specParts.push(String(property.katha));
  if (property.other_type) specParts.push(String(property.other_type));
  if (!isShop && property.balconies != null && Number(property.balconies) > 0) specParts.push(`${property.balconies} balcony`);
  if (!isShop && property.bathrooms != null && Number(property.bathrooms) > 0) specParts.push(`${property.bathrooms} bath`);
  if (!isShop && property.floor_no) specParts.push(`Floor ${property.floor_no}`);
  if (!isShop && property.garden) specParts.push('Garden');
  if (property.car_parking) specParts.push('Car parking');
  if (property.bike_parking) specParts.push('Bike parking');
  if (isShop && property.shop_road_distance) specParts.push(`Road dist ${property.shop_road_distance}`);
  if (isShop && property.shop_token_amount != null && Number(property.shop_token_amount) > 0) {
    specParts.push(`Token ${formatIndianPrice(property.shop_token_amount)}`);
  }
  const specLine = specParts.join(' · ');
  const descriptionText = property.description || '';
  const descriptionIsLong = descriptionText.length > 120;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto">
          {images.length > 0 ? (
            <div className="relative h-52 lg:h-[500px] bg-navy">
              <img
                src={getImageUrl(images[currentImageIndex])}
                alt={property.title}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowLightbox(true)}
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors touch-target"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors touch-target"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-52 lg:h-[500px] bg-gradient-to-br from-navy to-navy-light flex items-center justify-center">
              <Home className="h-20 w-20 text-gold/30" />
            </div>
          )}

          {/* Thumbnail Strip (Mobile: Horizontal Scroll) */}
          {images.length > 1 && (
            <div className="p-2 lg:p-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-min">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? 'border-gold scale-105' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 xl:py-12">
        {/* Title & address — tighter on small screens; full size from lg */}
        <div className="mb-3 lg:mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-1.5 lg:mb-3">
            <span
              className={`${badge.bg} text-white rounded-full font-semibold px-2.5 py-0.5 text-xs lg:px-3 lg:py-1 lg:text-sm`}
            >
              {badge.text}
            </span>
            {property.featured && (
              <span className="bg-gold text-navy rounded-full font-semibold px-2.5 py-0.5 text-xs lg:px-3 lg:py-1 lg:text-sm">
                Featured
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-navy mb-1.5 leading-snug lg:text-2xl xl:text-3xl 2xl:text-4xl lg:mb-3">
            {property.title}
          </h1>
          <div className="flex items-start space-x-2 text-gray-darker">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-gold lg:h-5 lg:w-5" />
            <p className="text-sm leading-snug lg:text-base xl:text-lg">
              {property.location}, {property.city}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-8">
          <div className="lg:col-span-2 lg:space-y-6">
            {/* Mobile / tablet (screens below lg): one compact card */}
            <div className="lg:hidden bg-white p-3 rounded-xl shadow-md space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className="text-[11px] text-gray uppercase tracking-wide">Price</span>
                <p className="text-xl font-bold text-gold leading-none tabular-nums">
                  {formatIndianPrice(property.price)}
                </p>
              </div>

              {specLine && (
                <div className="border-t border-gray-light/80 pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray mb-0.5">Details</p>
                  <p className="text-xs font-semibold text-navy leading-snug">{specLine}</p>
                </div>
              )}

              <div className="border-t border-gray-light/80 pt-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray mb-0.5">Description</p>
                <p
                  className={`text-[11px] text-gray leading-snug whitespace-pre-line ${
                    !descExpanded && descriptionIsLong ? 'line-clamp-3' : ''
                  }`}
                >
                  {descriptionText || '—'}
                </p>
                {descriptionIsLong && (
                  <button
                    type="button"
                    onClick={() => setDescExpanded((e) => !e)}
                    className="mt-1 text-[11px] font-semibold text-gold hover:underline"
                  >
                    {descExpanded ? 'Show less' : 'Show full description'}
                  </button>
                )}
              </div>
            </div>

            {/* Desktop (lg+): original three-card layout */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-gray mb-1">Price</p>
                <p className="text-3xl sm:text-4xl font-bold text-gold">{formatIndianPrice(property.price)}</p>
              </div>

              {(property.bhk ||
                property.furnishing_status ||
                property.shop_sqft_range ||
                property.shop_road_distance ||
                (property.shop_token_amount != null && Number(property.shop_token_amount) > 0) ||
                property.katha ||
                property.other_type ||
                property.balconies != null ||
                property.bathrooms != null ||
                property.floor_no ||
                property.garden ||
                property.car_parking ||
                property.bike_parking) && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-xl sm:text-2xl font-bold text-navy mb-4">Property Details</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {!isShop && property.bhk && (
                      <div>
                        <p className="text-sm text-gray mb-1">BHK</p>
                        <p className="text-lg font-semibold text-navy">{property.bhk} BHK</p>
                      </div>
                    )}
                    {!isShop && furnishingLabel && (
                      <div>
                        <p className="text-sm text-gray mb-1">Furnishing</p>
                        <p className="text-lg font-semibold text-navy">{furnishingLabel}</p>
                      </div>
                    )}
                    {isShop && shopSqftLabel && (
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-sm text-gray mb-1">Shop size</p>
                        <p className="text-lg font-semibold text-navy">{shopSqftLabel}</p>
                      </div>
                    )}
                    {property.katha && (
                      <div>
                        <p className="text-sm text-gray mb-1">Katha</p>
                        <p className="text-lg font-semibold text-navy">{property.katha}</p>
                      </div>
                    )}
                    {property.other_type && (
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-sm text-gray mb-1">Type</p>
                        <p className="text-lg font-semibold text-navy">{property.other_type}</p>
                      </div>
                    )}
                    {!isShop && property.balconies != null && Number(property.balconies) > 0 && (
                      <div>
                        <p className="text-sm text-gray mb-1">Balconies</p>
                        <p className="text-lg font-semibold text-navy">{property.balconies}</p>
                      </div>
                    )}
                    {!isShop && property.bathrooms != null && Number(property.bathrooms) > 0 && (
                      <div>
                        <p className="text-sm text-gray mb-1">Bathrooms</p>
                        <p className="text-lg font-semibold text-navy">{property.bathrooms}</p>
                      </div>
                    )}
                    {!isShop && property.floor_no && (
                      <div>
                        <p className="text-sm text-gray mb-1">Floor</p>
                        <p className="text-lg font-semibold text-navy">{property.floor_no}</p>
                      </div>
                    )}
                    {!isShop && property.garden ? (
                      <div>
                        <p className="text-sm text-gray mb-1">Garden</p>
                        <p className="text-lg font-semibold text-navy">Yes</p>
                      </div>
                    ) : null}
                    {property.car_parking ? (
                      <div>
                        <p className="text-sm text-gray mb-1">Car parking</p>
                        <p className="text-lg font-semibold text-navy">Yes</p>
                      </div>
                    ) : null}
                    {property.bike_parking ? (
                      <div>
                        <p className="text-sm text-gray mb-1">Bike parking</p>
                        <p className="text-lg font-semibold text-navy">Yes</p>
                      </div>
                    ) : null}
                    {isShop && property.shop_road_distance && (
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-sm text-gray mb-1">Road dist</p>
                        <p className="text-lg font-semibold text-navy">{property.shop_road_distance}</p>
                      </div>
                    )}
                    {isShop && property.shop_token_amount != null && Number(property.shop_token_amount) > 0 && (
                      <div>
                        <p className="text-sm text-gray mb-1">Token amount</p>
                        <p className="text-lg font-semibold text-navy">{formatIndianPrice(property.shop_token_amount)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl sm:text-2xl font-bold text-navy mb-4">Description</h2>
                <p className="text-gray leading-relaxed whitespace-pre-line">{descriptionText || '—'}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-3 lg:p-6 rounded-xl shadow-md lg:sticky lg:top-20">
              <h3 className="text-lg font-bold text-navy mb-2 lg:text-xl lg:mb-3">Contact Us</h3>

              <div
                className={`mb-3 rounded-lg border-2 px-3 py-2 lg:mb-4 lg:rounded-xl lg:px-4 lg:py-3 ${
                  listingParty.key === 'owner'
                    ? 'border-gold bg-gold/10'
                    : listingParty.key === 'broker'
                      ? 'border-navy bg-navy/5'
                      : 'border-gold/60 bg-gradient-to-br from-navy/5 to-gold/10'
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray mb-0.5 lg:text-xs lg:mb-1">
                  Listed by
                </p>
                <p className="text-base font-bold text-navy leading-tight lg:text-lg">{listingParty.label}</p>
                <p className="text-[10px] text-gray mt-0.5 leading-snug lg:text-xs lg:mt-1">{listingParty.description}</p>
              </div>

              <div className="space-y-3 lg:space-y-4">
                <div className="space-y-1.5 lg:space-y-2">
                  <p className="text-xs font-semibold text-navy lg:text-sm">Reach Harsh To Let Services</p>
                  <a
                    href={toTelHref(CONTACT_OFFICE_PHONE_1)}
                    className="flex items-center space-x-2 p-3 bg-navy hover:bg-navy-light rounded-lg transition-colors touch-target lg:space-x-3 lg:p-4"
                  >
                    <Phone className="h-5 w-5 text-gold flex-shrink-0 lg:h-6 lg:w-6" />
                    <span className="text-sm font-semibold text-white lg:text-base">+91 {CONTACT_OFFICE_PHONE_1}</span>
                  </a>
                  <a
                    href={toTelHref(CONTACT_OFFICE_PHONE_2)}
                    className="flex items-center space-x-2 p-3 bg-navy hover:bg-navy-light rounded-lg transition-colors touch-target lg:space-x-3 lg:p-4"
                  >
                    <Phone className="h-5 w-5 text-gold flex-shrink-0 lg:h-6 lg:w-6" />
                    <span className="text-sm font-semibold text-white lg:text-base">+91 {CONTACT_OFFICE_PHONE_2}</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-gray-light">
                  <WhatsAppInquiryButton
                    property={property}
                    className="!py-2.5 text-sm lg:!py-3 lg:text-base"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-6 sm:mb-8">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gold transition-colors touch-target"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={getImageUrl(images[currentImageIndex])}
            alt={property.title}
            className="max-h-full max-w-full object-contain"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-colors touch-target"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-colors touch-target"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
