import { useMemo, useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Users, IndianRupee } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import BrandLoader from '../components/ui/BrandLoader';
import VendorCardFooter from '../components/vendors/VendorCardFooter';
import ServiceCategory3DIcon from '../components/vendors/ServiceCategory3DIcon';
import { getServiceCategoryVisual, getMaterialEmoji } from '../constants/serviceCategoryVisuals';
import {
  WORKER_PROFESSION_CATEGORIES,
  filterCategoriesBySearch,
  getCategoryLabelByProfession,
  formatWorkerPrice,
  getBrowseFiltersForCategory,
  listingMatchesBrowseFilter,
} from '../constants/workerProfessions';
import { formatMaterialListingRate } from '../constants/workerProfileTypes';

const cardShell =
  'vendor-card-shell flex h-full min-w-0 flex-col rounded-md sm:rounded-lg border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow max-[499px]:rounded-sm max-[399px]:rounded max-[399px]:shadow-none lg:rounded-xl lg:shadow-md';
const cardImg =
  'vendor-card-img h-11 sm:h-28 md:h-32 w-full object-cover shrink-0 max-[499px]:h-9 max-[399px]:h-7 lg:h-44 xl:h-48';
const cardBody =
  'vendor-card-body flex flex-1 flex-col p-1 sm:p-2 md:p-2.5 space-y-px sm:space-y-1 min-h-0 max-[499px]:p-0.5 max-[499px]:space-y-0 max-[399px]:p-px lg:p-4 lg:space-y-2 xl:p-5';
const cardTitle =
  'font-bold text-navy text-[9px] leading-tight line-clamp-1 sm:text-xs md:text-sm max-[499px]:text-[8px] max-[399px]:text-[7px] lg:text-base xl:text-lg';
const cardSub =
  'text-[7px] leading-tight line-clamp-1 sm:text-[10px] md:text-xs text-stone-500 max-[499px]:text-[6px] max-[399px]:text-[5px] lg:text-sm';
const cardText = 'hidden lg:block text-sm xl:text-base text-stone-600 line-clamp-3';
const cardPrice =
  'text-[8px] sm:text-[10px] md:text-xs font-semibold text-navy leading-tight line-clamp-2 max-[499px]:text-[7px] max-[399px]:text-[6px] lg:text-sm xl:text-base';

function CardServiceBadge({ categoryId, professionId, emoji, className = '' }) {
  return (
    <div
      className={`absolute top-0.5 right-0.5 z-10 max-[499px]:top-0 max-[499px]:right-0 max-[499px]:scale-[0.72] max-[399px]:scale-[0.62] sm:top-1.5 sm:right-1.5 sm:scale-100 lg:top-3 lg:right-3 lg:scale-100 ${className}`}
    >
      <span className="lg:hidden">
        <ServiceCategory3DIcon
          categoryId={categoryId}
          professionId={professionId}
          emoji={emoji}
          size="xs"
          className="svc-3d-tile--flat svc-3d-tile--crisp"
        />
      </span>
      <span className="hidden lg:inline-flex">
        <ServiceCategory3DIcon
          categoryId={categoryId}
          professionId={professionId}
          emoji={emoji}
          size="md"
          className="svc-3d-tile--flat svc-3d-tile--crisp"
        />
      </span>
    </div>
  );
}

function MarriageHallCard({ vendor, categoryLabel }) {
  const categoryId = vendor.category_id || 'events-celebrations';
  return (
    <div className={cardShell}>
      <div className="relative shrink-0">
        <img src={vendor.hall_image_url || vendor.worker_image_url} alt={vendor.name} className={cardImg} />
        <CardServiceBadge categoryId={categoryId} />
      </div>
      <div className={cardBody}>
        <h3 className={`${cardTitle} md:text-base`}>{vendor.name}</h3>
        <p className="text-[7px] sm:text-[10px] md:text-xs text-gold font-medium line-clamp-1 max-[499px]:text-[6px] max-[399px]:text-[5px] lg:text-sm">{vendor.profession}</p>
        <p className={cardText}>{vendor.description}</p>
        <div className="grid grid-cols-1 gap-px sm:grid-cols-2 sm:gap-2 text-[8px] sm:text-xs text-stone-600 leading-tight max-[499px]:text-[6px] max-[399px]:text-[5px] lg:text-sm lg:gap-3">
          <span className="line-clamp-1">Area: {Number(vendor.area_sqft).toLocaleString('en-IN')} sq ft</span>
          <span className="line-clamp-1">Outside: {vendor.outside_caterers_allowed ? 'Yes' : 'No'}</span>
          <span className={`font-semibold text-navy col-span-2 line-clamp-1`}>
            Hall: ₹{Number(vendor.hall_booking_cost).toLocaleString('en-IN')}
          </span>
          {vendor.veg_platter_cost != null && (
            <span className="line-clamp-1">Veg: ₹{Number(vendor.veg_platter_cost).toLocaleString('en-IN')}/plate</span>
          )}
          {vendor.nonveg_platter_cost != null && (
            <span className="line-clamp-1">Non-veg: ₹{Number(vendor.nonveg_platter_cost).toLocaleString('en-IN')}/plate</span>
          )}
        </div>
        <VendorCardFooter vendor={vendor} categoryLabel={categoryLabel} />
      </div>
    </div>
  );
}

function StandardVendorCard({ vendor, categoryLabel }) {
  const img = vendor.worker_image_url || vendor.hall_image_url;
  const categoryId = vendor.category_id || 'home-repair';
  return (
    <div className={cardShell}>
      {img && (
        <div className="relative shrink-0">
          <img src={img} alt={vendor.name} className={cardImg} />
          <CardServiceBadge categoryId={categoryId} professionId={vendor.profession} />
        </div>
      )}
      <div className={cardBody}>
        <h3 className={cardTitle}>{vendor.name}</h3>
        <p className="text-[7px] sm:text-[10px] md:text-xs text-gold font-medium line-clamp-1 max-[499px]:text-[6px] max-[399px]:text-[5px] lg:text-sm">{vendor.profession}</p>
        <p className={cardSub}>{getCategoryLabelByProfession(vendor.profession)}</p>
        <p className={cardText}>{vendor.description}</p>
        {vendor.working_hours_per_day && (
          <p className={`hidden lg:block ${cardSub}`}>
            {vendor.working_hours_per_day} hrs/day · Off: {vendor.off_day}
          </p>
        )}
        <p className={`${cardPrice} flex items-center gap-0.5 sm:gap-1`}>
          <IndianRupee className="h-2 w-2 max-[499px]:h-1.5 max-[499px]:w-1.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-gold shrink-0" />
          <span className="line-clamp-2">{formatWorkerPrice(vendor) || 'Contact for pricing'}</span>
        </p>
        <VendorCardFooter vendor={vendor} categoryLabel={categoryLabel} />
      </div>
    </div>
  );
}

function ListingItemCard({ listing, vendor, categoryLabel }) {
  const isVehicle = listing.listing_kind === 'vehicle' || listing.vehicle_type;

  if (isVehicle) {
    const amt = `₹${Number(listing.rate_amount).toLocaleString('en-IN')}`;
    let costLabel = `${amt} (self drive)`;
    if (listing.rental_mode === 'with_driver') {
      costLabel =
        listing.driver_fuel_option === 'without_fuel'
          ? `${amt} (driver + vehicle)`
          : `${amt} (driver + vehicle + fuel)`;
    }

    let kmLine = null;
    if (listing.rental_mode === 'with_driver' && listing.driver_fuel_option === 'without_fuel') {
      if (listing.fuel_cost_per_km != null) {
        kmLine = `Fuel: ₹${Number(listing.fuel_cost_per_km).toLocaleString('en-IN')}/km`;
      }
    } else {
      const parts = [];
      if (listing.included_km != null) parts.push(`${listing.included_km} km incl.`);
      if (listing.extra_km_rate != null) {
        parts.push(`₹${Number(listing.extra_km_rate).toLocaleString('en-IN')}/km after`);
      }
      kmLine = parts.length ? parts.join(' · ') : null;
    }

    return (
      <div className={cardShell}>
        <div className="relative shrink-0">
          <img src={listing.image_url} alt={listing.title} className={cardImg} />
          <CardServiceBadge
            categoryId="rental-vehicle"
            professionId={listing.vehicle_type === 'bike' ? 'self_drive_bike' : 'car_with_driver'}
          />
        </div>
        <div className={cardBody}>
          <h3 className={cardTitle}>{listing.title}</h3>
          <p className={cardSub}>{vendor.name}</p>
          <p className={`${cardSub} capitalize`}>
            {listing.vehicle_type} · {listing.rental_mode?.replace('_', ' ')}
            {listing.model_year ? ` · ${listing.model_year}` : ''}
          </p>
          <p className={cardPrice}>{costLabel}</p>
          {kmLine && <p className={cardSub}>{kmLine}</p>}
          {listing.description && <p className={cardText}>{listing.description}</p>}
          <VendorCardFooter vendor={vendor} listing={listing} categoryLabel={categoryLabel} />
        </div>
      </div>
    );
  }

  return (
    <div className={cardShell}>
      <div className="relative shrink-0">
        <img src={listing.image_url} alt={listing.title} className={cardImg} />
        <CardServiceBadge
          categoryId="building-material"
          emoji={getMaterialEmoji(listing.material_type || listing.title)}
        />
      </div>
      <div className={cardBody}>
        <h3 className={cardTitle}>{listing.material_type || listing.title}</h3>
        <p className={cardSub}>{vendor.name} · Building material</p>
        {listing.description && <p className={cardText}>{listing.description}</p>}
        <p className={`${cardPrice} line-clamp-2`}>{formatMaterialListingRate(listing)}</p>
        <VendorCardFooter vendor={vendor} listing={listing} categoryLabel={categoryLabel} />
      </div>
    </div>
  );
}

export default function OurVendors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategoryId = searchParams.get('categoryId') || '';

  const [categoryId, setCategoryId] = useState(urlCategoryId);
  const [profession, setProfession] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');

  const applyCategorySelection = useCallback((id, { syncUrl = true } = {}) => {
    setCategoryId(id);
    setProfession('');
    const filters = getBrowseFiltersForCategory(id);
    if (filters.length === 1) setProfession(filters[0].id);
    if (syncUrl) {
      if (id) setSearchParams({ categoryId: id }, { replace: true });
      else setSearchParams({}, { replace: true });
    }
  }, [setSearchParams]);

  useEffect(() => {
    if (urlCategoryId && WORKER_PROFESSION_CATEGORIES.some((c) => c.id === urlCategoryId)) {
      applyCategorySelection(urlCategoryId, { syncUrl: false });
    }
  }, [urlCategoryId, applyCategorySelection]);

  const filteredCategories = useMemo(
    () => filterCategoriesBySearch(categorySearch),
    [categorySearch]
  );

  const selectedCategory = WORKER_PROFESSION_CATEGORIES.find((c) => c.id === categoryId);
  const browseFilters = categoryId ? getBrowseFiltersForCategory(categoryId) : [];
  const showSubcategories = categoryId && browseFilters.length > 1 && !profession;
  const isRentalCategory = categoryId === 'rental-vehicle';
  const readyToBrowse = categoryId && (profession || browseFilters.length <= 1);

  const { data, isLoading } = useQuery({
    queryKey: ['publicVendors', categoryId, isRentalCategory ? '' : profession, vendorSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId) params.set('categoryId', categoryId);
      if (!isRentalCategory && profession) params.set('profession', profession);
      if (vendorSearch.trim()) params.set('q', vendorSearch.trim());
      const res = await api.get(`/workers/public?${params.toString()}`);
      return res.data;
    },
    enabled: Boolean(readyToBrowse),
  });

  const displayCards = useMemo(() => {
    const vendors = data?.vendors || [];
    const cards = [];
    for (const v of vendors) {
      if (v.profile_type === 'listing_vendor') {
        const items = (v.listings || []).filter((l) =>
          listingMatchesBrowseFilter(l, profession, categoryId)
        );
        if (items.length) {
          for (const l of items) cards.push({ type: 'listing', listing: l, vendor: v });
        } else if (!profession) {
          cards.push({ type: 'standard', vendor: v });
        }
      } else if (v.profile_type === 'marriage_hall') {
        cards.push({ type: 'marriage_hall', vendor: v });
      } else {
        cards.push({ type: 'standard', vendor: v });
      }
    }
    return cards;
  }, [data, profession, categoryId]);

  const handleCategorySelect = (id) => {
    applyCategorySelection(id);
  };

  return (
    <div className="min-h-screen bg-stone-100 our-vendors-page">
      <div className="bg-[#0a1020] text-white py-4 sm:py-8 lg:py-10 px-3 sm:px-4 lg:px-10 xl:px-14">
        <div className="max-w-7xl mx-auto lg:max-w-none">
          <h1 className="text-lg sm:text-3xl lg:text-4xl xl:text-5xl font-bold">Our Vendors</h1>
          <p className="text-white/75 text-[11px] sm:text-sm lg:text-base xl:text-lg mt-1 sm:mt-2 lg:mt-3 leading-snug max-w-3xl">
            Find trusted service providers — plumbers, maids, marriage halls, rental cars & more
          </p>
          <Link to="/job-apply" className="inline-block mt-2 sm:mt-4 lg:mt-5 text-[11px] sm:text-sm lg:text-base font-semibold text-gold hover:underline">
            Register as a vendor →
          </Link>
        </div>
      </div>

      {/* Full-width on desktop — sidebar flush left */}
      <div className="w-full max-w-7xl mx-auto px-1 max-[499px]:px-1 sm:px-4 py-2 max-[499px]:py-2 sm:py-6 lg:max-w-none lg:mx-0 lg:px-0 lg:py-0">
        <div className="flex flex-row gap-1 max-[499px]:gap-1 sm:gap-3 lg:gap-0">
          {/* Category sidebar */}
          <aside className="flex w-[3.25rem] max-[399px]:w-[2.85rem] xs:w-[4rem] sm:w-36 shrink-0 bg-navy rounded-md max-[499px]:rounded-md sm:rounded-xl border border-gold/30 overflow-hidden flex-col sticky top-14 sm:top-16 lg:top-20 self-start max-h-[calc(100dvh-3.75rem)] sm:max-h-[calc(100dvh-4.5rem)] lg:max-h-[calc(100vh-5rem)] lg:w-72 xl:w-80 lg:rounded-none lg:rounded-r-2xl lg:border-l-0 lg:border-y-0 lg:border-r lg:shadow-lg lg:min-h-[calc(100vh-5rem)]">
            <div className="p-1 max-[499px]:p-1 sm:p-3 lg:p-5 border-b border-gold/20">
              <p className="text-[8px] max-[399px]:text-[7px] sm:text-sm lg:text-lg font-bold text-gold mb-0.5 sm:mb-2 lg:mb-3 leading-tight">Categories</p>
              <div className="relative">
                <Search className="absolute left-1 max-[499px]:h-2.5 max-[499px]:w-2.5 sm:left-2.5 lg:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-gold/60" />
                <input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-5 max-[499px]:pl-5 sm:pl-8 lg:pl-10 pr-1 sm:pr-3 lg:pr-4 py-0.5 max-[499px]:py-0.5 sm:py-2 lg:py-3 text-[8px] max-[399px]:text-[7px] sm:text-sm lg:text-base border border-gold/30 rounded max-[499px]:rounded sm:rounded-lg lg:rounded-xl bg-navy-light text-white placeholder:text-white/50 focus:outline-none focus:border-gold"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filteredCategories.length === 0 ? (
                <p className="px-2 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-sm text-white/60 text-center">No match.</p>
              ) : (
                filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`w-full flex flex-col lg:flex-row items-center gap-0 max-[499px]:gap-0 lg:gap-4 text-center lg:text-left px-0.5 py-1 max-[499px]:py-1 sm:px-3 sm:py-2.5 lg:px-5 lg:py-4 border-b border-white/10 transition-colors ${
                      categoryId === cat.id
                        ? 'bg-gold/15 border-l-2 sm:border-l-4 border-l-gold'
                        : 'hover:bg-white/5 border-l-2 sm:border-l-4 border-l-transparent'
                    }`}
                  >
                    <span className="shrink-0 scale-[0.82] max-[399px]:scale-[0.72] lg:hidden origin-center">
                      <ServiceCategory3DIcon
                        categoryId={cat.id}
                        size="xs"
                        className="svc-3d-tile--flat svc-3d-tile--crisp"
                      />
                    </span>
                    <span className="hidden shrink-0 lg:inline-flex">
                      <ServiceCategory3DIcon
                        categoryId={cat.id}
                        size="md"
                        className="svc-3d-tile--flat svc-3d-tile--crisp"
                      />
                    </span>
                    <span
                      className={`text-[6px] max-[399px]:text-[5px] xs:text-[7px] sm:text-[10px] lg:text-sm xl:text-base leading-tight flex-1 line-clamp-2 lg:line-clamp-none ${
                        categoryId === cat.id ? 'font-semibold text-gold-light' : 'text-gold'
                      }`}
                    >
                      <span className="lg:hidden">{getServiceCategoryVisual(cat.id).shortLabel}</span>
                      <span className="hidden lg:inline">{cat.label}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </aside>

        <main className="flex-1 min-w-0 lg:px-8 xl:px-12 lg:py-8 xl:py-10">
          {!categoryId && (
            <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl border border-stone-200 p-6 sm:p-10 lg:p-16 text-center text-stone-500 min-h-[200px] sm:min-h-[280px] lg:min-h-[360px] flex flex-col items-center justify-center">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mb-2 sm:mb-3 lg:mb-4 text-stone-300" />
              <p className="font-medium text-navy text-sm sm:text-base lg:text-xl">Select a category</p>
              <p className="text-[10px] sm:text-sm lg:text-base mt-1 sm:mt-2 lg:mt-3 max-w-sm">
                Choose from the list on the left.
              </p>
            </div>
          )}

          {showSubcategories && (
            <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl border border-stone-200 p-2 max-[499px]:p-1.5 sm:p-5 lg:p-8 mb-2 max-[499px]:mb-1.5 sm:mb-4 lg:mb-6">
              <h2 className="font-bold text-navy text-[10px] max-[499px]:text-[9px] sm:text-base lg:text-2xl mb-1.5 max-[499px]:mb-1 sm:mb-4 lg:mb-6">{selectedCategory?.label}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 max-[499px]:gap-1 sm:gap-3 lg:gap-5">
                {browseFilters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setProfession(f.id)}
                    className={`flex flex-col items-center gap-1 max-[499px]:gap-0.5 sm:gap-2 lg:gap-3 rounded-lg max-[499px]:rounded-md lg:rounded-xl border-2 p-1.5 max-[499px]:p-1 sm:p-3 lg:p-5 text-center transition-colors ${
                      profession === f.id
                        ? 'border-gold bg-gold/10 shadow-md'
                        : 'border-stone-200 hover:border-gold/60 hover:bg-gold/5'
                    }`}
                  >
                    <span className="scale-90 max-[499px]:scale-[0.78] max-[399px]:scale-[0.7] sm:scale-100 lg:scale-110">
                      <span className="lg:hidden">
                        <ServiceCategory3DIcon
                          categoryId={categoryId}
                          professionId={f.id}
                          size="sm"
                          className="svc-3d-tile--flat svc-3d-tile--crisp"
                        />
                      </span>
                      <span className="hidden lg:inline-flex">
                        <ServiceCategory3DIcon
                          categoryId={categoryId}
                          professionId={f.id}
                          size="lg"
                          className="svc-3d-tile--flat svc-3d-tile--crisp"
                        />
                      </span>
                    </span>
                    <span className="text-[8px] max-[499px]:text-[7px] max-[399px]:text-[6px] sm:text-xs lg:text-sm xl:text-base font-medium text-navy leading-tight line-clamp-3">
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {readyToBrowse && (
            <>
              <div className="flex flex-row items-center gap-1 max-[499px]:gap-1 sm:gap-3 lg:gap-6 mb-1.5 max-[499px]:mb-1.5 sm:mb-4 lg:mb-8">
                <h2 className="font-bold text-navy flex-1 text-[10px] max-[499px]:text-[9px] max-[399px]:text-[8px] sm:text-base lg:text-2xl xl:text-3xl leading-tight min-w-0 truncate">
                  {browseFilters.find((f) => f.id === profession)?.label || selectedCategory?.label}
                </h2>
                <div className="relative w-[4.25rem] max-[499px]:w-[4rem] max-[399px]:w-[3.5rem] sm:w-64 lg:w-80 xl:w-96 shrink-0">
                  <Search className="absolute left-1 max-[499px]:h-2.5 max-[499px]:w-2.5 sm:left-2.5 lg:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-stone-400" />
                  <input
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                    placeholder="Search…"
                    className="w-full pl-5 max-[499px]:pl-5 sm:pl-8 lg:pl-10 pr-1 sm:pr-3 lg:pr-4 py-0.5 max-[499px]:py-0.5 sm:py-2 lg:py-3 text-[8px] max-[399px]:text-[7px] sm:text-sm lg:text-base border border-stone-200 rounded max-[499px]:rounded sm:rounded-lg lg:rounded-xl bg-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {isLoading ? (
                <BrandLoader />
              ) : displayCards.length === 0 ? (
                <div className="bg-white rounded-lg sm:rounded-xl border border-stone-200 p-6 sm:p-10 text-center text-stone-500">
                  <MapPin className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-stone-300" />
                  <p className="text-sm sm:text-base">No vendors listed yet.</p>
                  <Link to="/job-apply" className="text-gold font-medium text-[11px] sm:text-sm mt-2 inline-block">
                    Be the first to register →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 max-[499px]:gap-0.5 max-[399px]:gap-px sm:gap-2 md:gap-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 lg:gap-6 xl:gap-8 items-stretch pb-4 max-[499px]:pb-3 lg:pb-10 min-w-0">
                  {displayCards.map((card) => {
                    if (card.type === 'listing') {
                      return (
                        <ListingItemCard
                          key={`l-${card.listing.id}`}
                          listing={card.listing}
                          vendor={card.vendor}
                          categoryLabel={selectedCategory?.label}
                        />
                      );
                    }
                    if (card.type === 'marriage_hall') {
                      return (
                        <MarriageHallCard
                          key={`h-${card.vendor.id}`}
                          vendor={card.vendor}
                          categoryLabel={selectedCategory?.label}
                        />
                      );
                    }
                    return (
                      <StandardVendorCard
                        key={`v-${card.vendor.id}`}
                        vendor={card.vendor}
                        categoryLabel={selectedCategory?.label}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
        </div>
      </div>
    </div>
  );
}
