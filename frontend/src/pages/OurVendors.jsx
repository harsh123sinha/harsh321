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

const cardShell =
  'flex h-full flex-col rounded-md sm:rounded-lg border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow';
const cardImg = 'h-11 sm:h-28 md:h-32 w-full object-cover shrink-0';
const cardBody = 'flex flex-1 flex-col p-1 sm:p-2 md:p-2.5 space-y-px sm:space-y-1 min-h-0';
const cardTitle = 'font-bold text-navy text-[9px] leading-tight line-clamp-1 sm:text-xs md:text-sm';
const cardSub = 'text-[7px] leading-tight line-clamp-1 sm:text-[10px] md:text-xs text-stone-500';
const cardText = 'hidden md:block text-xs text-stone-600 line-clamp-2';
const cardPrice = 'text-[8px] sm:text-[10px] md:text-xs font-semibold text-navy leading-tight line-clamp-2';

function MarriageHallCard({ vendor, categoryLabel }) {
  return (
    <div className={cardShell}>
      <img src={vendor.hall_image_url || vendor.worker_image_url} alt={vendor.name} className={cardImg} />
      <div className={cardBody}>
        <h3 className={`${cardTitle} md:text-base`}>{vendor.name}</h3>
        <p className="text-[7px] sm:text-[10px] md:text-xs text-gold font-medium line-clamp-1">{vendor.profession}</p>
        <p className={cardText}>{vendor.description}</p>
        <div className="grid grid-cols-1 gap-px sm:grid-cols-2 sm:gap-2 text-[8px] sm:text-xs text-stone-600 leading-tight">
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
        <div className="mt-auto">
          <VendorContactSection vendor={vendor} categoryLabel={categoryLabel} compact />
        </div>
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
        <p className="text-[7px] sm:text-[10px] md:text-xs text-gold font-medium line-clamp-1">{vendor.profession}</p>
        <p className={cardSub}>{getCategoryLabelByProfession(vendor.profession)}</p>
        <p className={cardText}>{vendor.description}</p>
        {vendor.working_hours_per_day && (
          <p className={`hidden sm:block ${cardSub}`}>
            {vendor.working_hours_per_day} hrs/day · Off: {vendor.off_day}
          </p>
        )}
        <p className={`${cardPrice} flex items-center gap-0.5 sm:gap-1`}>
          <IndianRupee className="h-2 w-2 sm:h-3 sm:w-3 text-gold shrink-0" />
          <span className="line-clamp-2">{formatWorkerPrice(vendor) || 'Contact for pricing'}</span>
        </p>
        <div className="mt-auto">
          <VendorContactSection vendor={vendor} categoryLabel={categoryLabel} compact />
        </div>
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
          <p className={cardPrice}>{costLabel}</p>
          {kmLine && <p className={cardSub}>{kmLine}</p>}
          {listing.description && <p className={cardText}>{listing.description}</p>}
          <div className="mt-auto">
            <VendorContactSection vendor={vendor} listing={listing} categoryLabel={categoryLabel} compact />
          </div>
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
        {listing.description && <p className={cardText}>{listing.description}</p>}
        <p className={`${cardPrice} line-clamp-2`}>{formatMaterialListingRate(listing)}</p>
        <div className="mt-auto">
          <VendorContactSection vendor={vendor} listing={listing} categoryLabel={categoryLabel} compact />
        </div>
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

      {/* Categories + scrollable 3-column vendor grid */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
        {/* Mobile / tablet — horizontal category strip (full width for 3-col grid) */}
        <div className="lg:hidden mb-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search categories…"
              className="w-full pl-8 pr-3 py-2 text-xs border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-gold"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-0.5 px-0.5">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[10px] font-medium leading-tight transition-colors ${
                  categoryId === cat.id
                    ? 'border-gold bg-gold/15 text-navy font-semibold'
                    : 'border-stone-200 bg-white text-stone-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:gap-5">
          {/* Desktop — category sidebar */}
          <aside className="hidden lg:flex lg:w-48 xl:w-56 shrink-0 bg-white rounded-xl border border-stone-200 overflow-hidden flex-col lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)]">
            <div className="p-3 border-b border-stone-100">
              <p className="text-sm font-bold text-navy mb-2">Categories</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredCategories.length === 0 ? (
                <p className="px-4 py-4 text-sm text-stone-500 text-center">No match.</p>
              ) : (
                filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm leading-tight border-b border-stone-50 transition-colors ${
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
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 items-stretch pb-6">
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
