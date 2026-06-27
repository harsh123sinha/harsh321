import { useMemo, useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Users, IndianRupee } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import BrandLoader from '../components/ui/BrandLoader';
import VendorContactSection from '../components/vendors/VendorContactSection';
import {
  WORKER_PROFESSION_CATEGORIES,
  filterCategoriesBySearch,
  getCategoryLabelByProfession,
  formatWorkerPrice,
  getBrowseFiltersForCategory,
  listingMatchesBrowseFilter,
} from '../constants/workerProfessions';
import { formatMaterialListingRate } from '../constants/workerProfileTypes';

const cardShell = 'rounded-xl sm:rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow';
const cardImg = 'h-28 sm:h-40 w-full object-cover';
const cardBody = 'p-2 sm:p-4 space-y-1 sm:space-y-2';
const cardTitle = 'font-bold text-navy text-sm sm:text-base';
const cardSub = 'text-[10px] sm:text-xs text-stone-500';
const cardText = 'text-[11px] sm:text-sm text-stone-600';

function MarriageHallCard({ vendor, categoryLabel }) {
  return (
    <div className={cardShell}>
      <img src={vendor.hall_image_url || vendor.worker_image_url} alt={vendor.name} className={`${cardImg} sm:h-44`} />
      <div className={cardBody}>
        <h3 className={`${cardTitle} sm:text-lg`}>{vendor.name}</h3>
        <p className="text-[10px] sm:text-sm text-gold font-medium">{vendor.profession}</p>
        <p className={`${cardText} line-clamp-2`}>{vendor.description}</p>
        <div className="grid grid-cols-2 gap-1 sm:gap-2 text-[9px] sm:text-xs text-stone-600">
          <span>Area: {Number(vendor.area_sqft).toLocaleString('en-IN')} sq ft</span>
          <span>Outside: {vendor.outside_caterers_allowed ? 'Yes' : 'No'}</span>
          <span className="font-semibold text-navy col-span-2">
            Hall: ₹{Number(vendor.hall_booking_cost).toLocaleString('en-IN')}
          </span>
          {vendor.veg_platter_cost != null && (
            <span>Veg: ₹{Number(vendor.veg_platter_cost).toLocaleString('en-IN')}/plate</span>
          )}
          {vendor.nonveg_platter_cost != null && (
            <span>Non-veg: ₹{Number(vendor.nonveg_platter_cost).toLocaleString('en-IN')}/plate</span>
          )}
        </div>
        <VendorContactSection vendor={vendor} categoryLabel={categoryLabel} compact />
      </div>
    </div>
  );
}

function StandardVendorCard({ vendor, categoryLabel }) {
  const img = vendor.worker_image_url || vendor.hall_image_url;
  return (
    <div className={cardShell}>
      {img && <img src={img} alt={vendor.name} className={cardImg} />}
      <div className={cardBody}>
        <h3 className={cardTitle}>{vendor.name}</h3>
        <p className="text-[10px] sm:text-sm text-gold font-medium">{vendor.profession}</p>
        <p className={cardSub}>{getCategoryLabelByProfession(vendor.profession)}</p>
        <p className={`${cardText} line-clamp-2`}>{vendor.description}</p>
        {vendor.working_hours_per_day && (
          <p className={cardSub}>{vendor.working_hours_per_day} hrs/day · Off: {vendor.off_day}</p>
        )}
        <p className="text-[11px] sm:text-sm font-semibold text-navy flex items-center gap-1">
          <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 text-gold shrink-0" />
          {formatWorkerPrice(vendor) || 'Contact for pricing'}
        </p>
        <VendorContactSection vendor={vendor} categoryLabel={categoryLabel} compact />
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
        <img src={listing.image_url} alt={listing.title} className={cardImg} />
        <div className={cardBody}>
          <h3 className={cardTitle}>{listing.title}</h3>
          <p className={cardSub}>{vendor.name}</p>
          <p className={`${cardSub} capitalize`}>
            {listing.vehicle_type} · {listing.rental_mode?.replace('_', ' ')}
            {listing.model_year ? ` · ${listing.model_year}` : ''}
          </p>
          <p className="text-[11px] sm:text-sm font-semibold text-navy">{costLabel}</p>
          {kmLine && <p className={cardSub}>{kmLine}</p>}
          {listing.description && <p className={`${cardText} line-clamp-2`}>{listing.description}</p>}
          <VendorContactSection vendor={vendor} listing={listing} categoryLabel={categoryLabel} compact />
        </div>
      </div>
    );
  }

  return (
    <div className={cardShell}>
      <img src={listing.image_url} alt={listing.title} className={cardImg} />
      <div className={cardBody}>
        <h3 className={cardTitle}>{listing.material_type || listing.title}</h3>
        <p className={cardSub}>{vendor.name} · Building material</p>
        {listing.description && <p className={`${cardText} line-clamp-2`}>{listing.description}</p>}
        <p className="text-[11px] sm:text-sm font-semibold text-navy">{formatMaterialListingRate(listing)}</p>
        <VendorContactSection vendor={vendor} listing={listing} categoryLabel={categoryLabel} compact />
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
    <div className="min-h-screen bg-stone-100">
      <div className="bg-[#0a1020] text-white py-4 sm:py-8 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-lg sm:text-3xl font-bold">Our Vendors</h1>
          <p className="text-white/75 text-[11px] sm:text-sm mt-1 sm:mt-2 leading-snug">
            Find trusted service providers — plumbers, maids, marriage halls, rental cars & more
          </p>
          <Link to="/job-apply" className="inline-block mt-2 sm:mt-4 text-[11px] sm:text-sm font-semibold text-gold hover:underline">
            Register as a vendor →
          </Link>
        </div>
      </div>

      {/* Same side-by-side layout as desktop — narrower / smaller on mobile */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 flex flex-row gap-2 sm:gap-4 min-h-[70vh]">
        <aside className="w-28 sm:w-44 md:w-52 lg:w-64 shrink-0 bg-white rounded-lg sm:rounded-xl border border-stone-200 overflow-hidden flex flex-col max-h-[75vh] lg:max-h-none">
          <div className="p-1.5 sm:p-3 border-b border-stone-100">
            <p className="text-[10px] sm:text-sm font-bold text-navy mb-1 sm:mb-2">Categories</p>
            <div className="relative">
              <Search className="absolute left-1.5 sm:left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-stone-400" />
              <input
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-6 sm:pl-8 pr-1.5 sm:pr-3 py-1 sm:py-2 text-[10px] sm:text-sm border border-stone-200 rounded-md sm:rounded-lg focus:outline-none focus:border-gold"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredCategories.length === 0 ? (
              <p className="px-2 sm:px-4 py-4 text-[10px] sm:text-sm text-stone-500 text-center">No match.</p>
            ) : (
              filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full text-left px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-sm leading-tight border-b border-stone-50 transition-colors ${
                    categoryId === cat.id
                      ? 'bg-gold/10 border-l-4 border-l-gold font-semibold text-navy'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {!categoryId && (
            <div className="bg-white rounded-lg sm:rounded-xl border border-stone-200 p-6 sm:p-10 text-center text-stone-500 min-h-[200px] sm:min-h-[280px] flex flex-col items-center justify-center">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 mb-2 sm:mb-3 text-stone-300" />
              <p className="font-medium text-navy text-sm sm:text-base">Select a category</p>
              <p className="text-[10px] sm:text-sm mt-1 sm:mt-2 max-w-sm">
                Choose from the list on the left.
              </p>
            </div>
          )}

          {showSubcategories && (
            <div className="bg-white rounded-lg sm:rounded-xl border border-stone-200 p-2 sm:p-5 mb-2 sm:mb-4">
              <h2 className="font-bold text-navy text-xs sm:text-base mb-2 sm:mb-4">{selectedCategory?.label}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-3">
                {browseFilters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setProfession(f.id)}
                    className="rounded-lg sm:rounded-xl border-2 border-stone-200 p-2 sm:p-4 text-center text-[9px] sm:text-sm font-medium text-navy leading-tight hover:border-gold hover:bg-gold/5 transition-colors"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {readyToBrowse && (
            <>
              <div className="flex flex-row items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <h2 className="font-bold text-navy flex-1 text-xs sm:text-base leading-tight min-w-0 truncate">
                  {browseFilters.find((f) => f.id === profession)?.label || selectedCategory?.label}
                </h2>
                <div className="relative w-28 sm:w-64 shrink-0">
                  <Search className="absolute left-1.5 sm:left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-stone-400" />
                  <input
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                    placeholder="Search…"
                    className="w-full pl-6 sm:pl-8 pr-1.5 sm:pr-3 py-1 sm:py-2 text-[10px] sm:text-sm border border-stone-200 rounded-md sm:rounded-lg bg-white focus:outline-none focus:border-gold"
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
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
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
  );
}
