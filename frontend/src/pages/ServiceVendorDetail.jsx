import { useMemo } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, IndianRupee } from 'lucide-react';
import api from '../utils/api';
import BrandLoader from '../components/ui/BrandLoader';
import ServiceCategory3DIcon from '../components/vendors/ServiceCategory3DIcon';
import VendorCardFooter from '../components/vendors/VendorCardFooter';
import { VendorProfileRating } from '../components/vendors/VendorProfileRating';
import {
  formatWorkerPrice,
  getCategoryLabelByProfession,
  getCategoryById,
} from '../constants/workerProfessions';
import { formatMaterialListingRate } from '../constants/workerProfileTypes';
import { getMaterialEmoji } from '../constants/serviceCategoryVisuals';
import { usePageSeo } from '../hooks/usePageSeo';
import { SITE_NAME } from '../constants/seoConfig';

function DetailImage({ src, alt }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="w-full max-h-72 sm:max-h-96 object-cover rounded-xl border border-stone-200"
    />
  );
}

export default function ServiceVendorDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listingId');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicVendor', id],
    queryFn: async () => {
      const res = await api.get(`/workers/public/${id}`);
      return res.data.vendor;
    },
    enabled: Boolean(id),
  });

  const vendor = data;
  const categoryId = vendor?.category_id || 'home-repair';
  const category = getCategoryById(categoryId);
  const categoryLabel = category?.label || getCategoryLabelByProfession(vendor?.profession);

  const activeListing = useMemo(() => {
    if (!vendor?.listings?.length) return null;
    if (listingId) {
      return vendor.listings.find((l) => String(l.id) === String(listingId)) || vendor.listings[0];
    }
    return vendor.listings.length === 1 ? vendor.listings[0] : null;
  }, [vendor, listingId]);

  const pageTitle = activeListing
    ? `${activeListing.title || activeListing.material_type} — ${vendor?.name}`
    : vendor?.name;

  usePageSeo(
    vendor
      ? {
          title: `${pageTitle} | ${categoryLabel} Patna | ${SITE_NAME}`,
          description: (activeListing?.description || vendor.description || `${vendor.name} — ${vendor.profession} in Patna`).slice(0, 160),
          path: listingId
            ? `/our-vendors/vendor/${id}?listingId=${listingId}`
            : `/our-vendors/vendor/${id}`,
          keywords: `${vendor.profession} Patna, ${categoryLabel} vendor Bihar`,
          jsonLdId: 'seo-jsonld-page',
        }
      : null
  );

  if (isLoading) return <BrandLoader fullScreen />;
  if (isError || !vendor) return <Navigate to="/our-vendors" replace />;

  const isMarriageHall = vendor.profile_type === 'marriage_hall';
  const isVehicle = activeListing?.listing_kind === 'vehicle' || activeListing?.vehicle_type;
  const isMaterial = activeListing && !isVehicle;

  const heroImage =
    activeListing?.image_url ||
    vendor.hall_image_url ||
    vendor.worker_image_url;

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="bg-[#0a1020] text-white py-5 sm:py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to={categoryId ? `/our-vendors?categoryId=${encodeURIComponent(categoryId)}` : '/our-vendors'}
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-gold mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {categoryLabel}
          </Link>
          <div className="flex items-start gap-4">
            <ServiceCategory3DIcon categoryId={categoryId} size="md" className="svc-3d-tile--flat shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold leading-tight">
                {activeListing?.title || activeListing?.material_type || vendor.name}
              </h1>
              <p className="text-gold font-medium mt-1">{vendor.profession}</p>
              {activeListing && (
                <p className="text-white/70 text-sm mt-1">Listed by {vendor.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <DetailImage src={heroImage} alt={pageTitle} />

        <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-8 shadow-sm space-y-5">
          <VendorProfileRating vendor={vendor} compact={false} />

          {vendor.description && (
            <div>
              <h2 className="text-lg font-bold text-navy mb-2">About</h2>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {vendor.description}
              </p>
            </div>
          )}

          {isMarriageHall && (
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-stone-700">
              <p>
                <span className="font-semibold text-navy">Hall area:</span>{' '}
                {Number(vendor.area_sqft).toLocaleString('en-IN')} sq ft
              </p>
              <p>
                <span className="font-semibold text-navy">Outside caterers:</span>{' '}
                {vendor.outside_caterers_allowed ? 'Allowed' : 'Not allowed'}
              </p>
              <p className="sm:col-span-2 font-semibold text-navy">
                Hall booking: ₹{Number(vendor.hall_booking_cost).toLocaleString('en-IN')}
              </p>
              {vendor.veg_platter_cost != null && (
                <p>Veg platter: ₹{Number(vendor.veg_platter_cost).toLocaleString('en-IN')}/plate</p>
              )}
              {vendor.nonveg_platter_cost != null && (
                <p>Non-veg platter: ₹{Number(vendor.nonveg_platter_cost).toLocaleString('en-IN')}/plate</p>
              )}
            </div>
          )}

          {isVehicle && activeListing && (
            <div className="space-y-2 text-sm sm:text-base text-stone-700">
              <p className="capitalize">
                {activeListing.vehicle_type} · {activeListing.rental_mode?.replace('_', ' ')}
                {activeListing.model_year ? ` · ${activeListing.model_year}` : ''}
              </p>
              <p className="font-semibold text-navy flex items-center gap-1">
                <IndianRupee className="h-4 w-4 text-gold" />
                {(() => {
                  const amt = `₹${Number(activeListing.rate_amount).toLocaleString('en-IN')}`;
                  if (activeListing.rental_mode === 'with_driver') {
                    return activeListing.driver_fuel_option === 'without_fuel'
                      ? `${amt} (driver + vehicle)`
                      : `${amt} (driver + vehicle + fuel)`;
                  }
                  return `${amt} (self drive)`;
                })()}
              </p>
              {activeListing.description && (
                <p className="text-stone-600 leading-relaxed">{activeListing.description}</p>
              )}
            </div>
          )}

          {isMaterial && (
            <div className="space-y-2">
              <p className="text-2xl">{getMaterialEmoji(activeListing.material_type || activeListing.title)}</p>
              <p className="font-semibold text-navy">{formatMaterialListingRate(activeListing)}</p>
              {activeListing.description && (
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed">{activeListing.description}</p>
              )}
            </div>
          )}

          {!isMarriageHall && !activeListing && formatWorkerPrice(vendor) && (
            <p className="font-semibold text-navy flex items-center gap-1">
              <IndianRupee className="h-4 w-4 text-gold" />
              {formatWorkerPrice(vendor)}
            </p>
          )}

          {vendor.working_hours_per_day && (
            <p className="text-sm text-stone-600">
              Working hours: {vendor.working_hours_per_day} hrs/day · Off day: {vendor.off_day || '—'}
            </p>
          )}

          {vendor.listings?.length > 1 && (
            <div>
              <h2 className="text-lg font-bold text-navy mb-3">Other listings</h2>
              <ul className="space-y-2">
                {vendor.listings.map((l) => (
                  <li key={l.id}>
                    <Link
                      to={`/our-vendors/vendor/${vendor.id}?listingId=${l.id}`}
                      className={`block rounded-lg border px-4 py-3 text-sm transition-colors ${
                        String(l.id) === String(listingId)
                          ? 'border-gold bg-gold/10 font-semibold text-navy'
                          : 'border-stone-200 hover:border-gold/50'
                      }`}
                    >
                      {l.title || l.material_type || 'Listing'}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div id="vendor-contact" className="pt-4 border-t border-stone-100">
            <VendorCardFooter
              vendor={vendor}
              listing={activeListing}
              categoryLabel={categoryLabel}
              compact={false}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
