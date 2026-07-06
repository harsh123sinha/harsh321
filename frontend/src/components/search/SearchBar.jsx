import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAreaOptions } from '../../hooks/useAreas';
import { SHOP_SQFT_RANGES } from '../../constants/propertyForm';
import LocationSearchCombobox from './LocationSearchCombobox';
import { saveSearchSession } from '../../utils/searchSession';

function UnderlineField({ label, gold = false, children, className = '' }) {
  return (
    <div className={className}>
      <span
        className={`block text-[9px] font-semibold uppercase tracking-[0.1em] lg:text-[11px] lg:tracking-[0.14em] ${
          gold ? 'text-gold' : 'text-white/45'
        }`}
      >
        {label}
      </span>
      <div className={`mt-1 border-b pb-1.5 lg:mt-1.5 lg:pb-2 ${gold ? 'border-gold' : 'border-white/20'}`}>{children}</div>
    </div>
  );
}

const darkSelect =
  'htls-dark-select w-full cursor-pointer appearance-none border-0 bg-transparent py-0 text-xs font-semibold text-white outline-none touch-manipulation lg:py-0.5 lg:text-[15px]';

const darkInput =
  'w-full min-w-0 border-0 bg-transparent py-0 text-xs font-semibold text-white outline-none placeholder:font-normal placeholder:text-white/35 lg:py-0.5 lg:text-[15px]';

/**
 * Property search — underline hero (design #7) + boxed layout on listing pages.
 */
const SearchBar = ({ expanded = false, variant, onSearch, presetLocation = '', presetType = '' }) => {
  const resolvedVariant = variant ?? (expanded ? 'boxed' : 'underline');
  const { pickOptions: areaOptions } = useAreaOptions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('homes');
  const [transaction, setTransaction] = useState('rent');
  const [bhk, setBhk] = useState('');
  const [shopSqftRange, setShopSqftRange] = useState('');
  const [katha, setKatha] = useState('');
  const [kathaCustom, setKathaCustom] = useState('');
  const [otherFreeText, setOtherFreeText] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const loc = searchParams.get('location') || presetLocation || '';
    const type = searchParams.get('type') || presetType || '';
    const bhkParam = searchParams.get('bhk') || '';
    const shopSqftParam = searchParams.get('shop_sqft_range') || '';
    const kathaParam = searchParams.get('katha') || '';
    const otherType = (searchParams.get('other_type') || '').trim();
    const minPriceParam = searchParams.get('minPrice') || '';
    const maxPriceParam = searchParams.get('maxPrice') || '';

    setLocation(loc);
    setBhk(bhkParam);
    setShopSqftRange(shopSqftParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);

    if (type === 'plot_lease') {
      setCategory('plot');
      setTransaction('lease');
    } else if (type === 'plot_buy') {
      setCategory('plot');
      setTransaction('buy');
    } else if (type === 'plot') {
      setCategory('plot');
      setTransaction('any');
    } else if (type === 'other') {
      setCategory('other');
      setTransaction('rent');
      setOtherFreeText(otherType);
    } else if (otherType.toLowerCase() === 'shop') {
      setCategory('shop');
      setTransaction(type === 'buy' ? 'buy' : 'rent');
    } else if (otherType.toLowerCase() === 'flat') {
      setCategory('flat');
      setTransaction(type === 'buy' ? 'buy' : 'rent');
    } else if (otherType.toLowerCase() === 'apartment') {
      setCategory('apartment');
      setTransaction(type === 'buy' ? 'buy' : 'rent');
    } else {
      setCategory('homes');
      setTransaction(type === 'buy' ? 'buy' : 'rent');
    }

    if (kathaParam && ['1', '2', '3'].includes(kathaParam)) {
      setKatha(kathaParam);
      setKathaCustom('');
    } else if (kathaParam) {
      setKatha('custom');
      setKathaCustom(kathaParam);
    } else {
      setKatha('');
      setKathaCustom('');
    }
  }, [searchParams, presetLocation, presetType]);

  const isPlot = category === 'plot';
  const isShop = category === 'shop';
  const transactionLabel = isPlot ? 'Lease / Buy' : 'Rent / Sell';
  const thirdLabel = isPlot ? 'Katha' : isShop ? 'Sq ft' : 'BHK';

  const onCategoryChange = (v) => {
    setCategory(v);
    if (v === 'plot') {
      setTransaction('any');
      setBhk('');
      setShopSqftRange('');
    } else if (v === 'other') {
      setTransaction('rent');
      setShopSqftRange('');
    } else if (v === 'shop') {
      setBhk('');
    } else {
      setKatha('');
      setKathaCustom('');
      setShopSqftRange('');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    let typeParam = '';
    let otherTypeParam = '';
    if (category === 'plot') {
      if (transaction === 'buy') typeParam = 'plot_buy';
      else if (transaction === 'lease') typeParam = 'plot_lease';
      else typeParam = 'plot';
    } else if (category === 'other') {
      typeParam = 'other';
      otherTypeParam = otherFreeText.trim();
    } else if (category === 'shop') {
      typeParam = transaction;
      otherTypeParam = 'Shop';
    } else if (category === 'flat') {
      typeParam = transaction;
      otherTypeParam = 'Flat';
    } else if (category === 'apartment') {
      typeParam = transaction;
      otherTypeParam = 'Apartment';
    } else {
      typeParam = transaction;
    }

    const kathaVal =
      isPlot && katha === 'custom' ? kathaCustom.trim() : isPlot && katha ? katha : '';

    const payload = {
      location: location || '',
      type: typeParam,
      bhk: !isPlot && !isShop ? bhk || '' : '',
      shop_sqft_range: isShop ? shopSqftRange || '' : '',
      katha: kathaVal,
      other_type: otherTypeParam,
      minPrice: minPrice.trim(),
      maxPrice: maxPrice.trim(),
    };

    const params = new URLSearchParams();
    if (payload.location) params.append('location', payload.location);
    if (payload.type) params.append('type', payload.type);
    if (payload.bhk) params.append('bhk', payload.bhk);
    if (payload.shop_sqft_range) params.append('shop_sqft_range', payload.shop_sqft_range);
    if (payload.katha) params.append('katha', payload.katha);
    if (payload.other_type) params.append('other_type', payload.other_type);
    if (payload.minPrice) params.append('minPrice', payload.minPrice);
    if (payload.maxPrice) params.append('maxPrice', payload.maxPrice);

    if (onSearch) {
      saveSearchSession(payload);
      onSearch(payload);
    } else {
      saveSearchSession(payload);
      navigate(`/search?${params.toString()}`);
    }
  };

  const transactionField = (
    <select
      id="search-transaction"
      value={transaction}
      disabled={category === 'other'}
      onChange={(e) => setTransaction(e.target.value)}
      className={`${resolvedVariant === 'underline' ? darkSelect : boxedSelect} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isPlot ? (
        <>
          <option value="any">Any</option>
          <option value="lease">Lease</option>
          <option value="buy">Buy</option>
        </>
      ) : (
        <>
          <option value="rent">Rent</option>
          <option value="buy">Sell</option>
        </>
      )}
    </select>
  );

  const thirdField = isPlot ? (
    <select
      id="search-bhk-katha"
      value={katha}
      onChange={(e) => {
        setKatha(e.target.value);
        if (e.target.value !== 'custom') setKathaCustom('');
      }}
      className={resolvedVariant === 'underline' ? darkSelect : boxedSelect}
    >
      <option value="">{isPlot ? 'Any katha' : 'Any'}</option>
      <option value="1">1 Katha</option>
      <option value="2">2 Katha</option>
      <option value="3">3 Katha</option>
      <option value="custom">Exact…</option>
    </select>
  ) : isShop ? (
    <select
      id="search-bhk-katha"
      value={shopSqftRange}
      onChange={(e) => setShopSqftRange(e.target.value)}
      className={resolvedVariant === 'underline' ? darkSelect : boxedSelect}
    >
      <option value="">Any size</option>
      {SHOP_SQFT_RANGES.map((r) => (
        <option key={r.value} value={r.value}>
          {r.label}
        </option>
      ))}
    </select>
  ) : (
    <select
      id="search-bhk-katha"
      value={bhk}
      onChange={(e) => setBhk(e.target.value)}
      className={resolvedVariant === 'underline' ? darkSelect : boxedSelect}
    >
      <option value="">Any BHK</option>
      <option value="1">1 BHK</option>
      <option value="2">2 BHK</option>
      <option value="3">3 BHK</option>
      <option value="4">4 BHK</option>
      <option value="5">5+ BHK</option>
    </select>
  );

  const typeField = (
    <select
      id="search-category"
      value={category}
      onChange={(e) => onCategoryChange(e.target.value)}
      className={resolvedVariant === 'underline' ? darkSelect : boxedSelect}
    >
      <option value="homes">Homes & flats</option>
      <option value="plot">Plot</option>
      <option value="shop">Shop</option>
      <option value="flat">Flat</option>
      <option value="apartment">Apartment</option>
      <option value="other">Other</option>
    </select>
  );

  const locationField = (
    <LocationSearchCombobox
      value={location}
      onChange={setLocation}
      options={areaOptions}
      tone={resolvedVariant === 'underline' ? 'dark' : 'light'}
      triggerClassName={resolvedVariant === 'underline' ? darkSelect : boxedSelect}
      dropUp
      emptyLabel="All areas"
    />
  );

  const budgetField = (
    <div className="flex items-center gap-1.5 lg:gap-2">
      <input
        id="search-min-price"
        type="number"
        min="0"
        inputMode="numeric"
        placeholder="₹ Min"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        className={resolvedVariant === 'underline' ? darkInput : boxedInput}
      />
      <span className={resolvedVariant === 'underline' ? 'text-white/35' : 'text-stone-400'}>–</span>
      <input
        id="search-max-price"
        type="number"
        min="0"
        inputMode="numeric"
        placeholder="₹ Max"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className={resolvedVariant === 'underline' ? darkInput : boxedInput}
      />
    </div>
  );

  const minBudgetOnly = (
    <input
      id="search-min-price-boxed"
      type="number"
      min="0"
      inputMode="numeric"
      placeholder="e.g. 10,000"
      value={minPrice}
      onChange={(e) => setMinPrice(e.target.value)}
      className={boxedInput}
    />
  );

  const maxBudgetOnly = (
    <input
      id="search-max-price-boxed"
      type="number"
      min="0"
      inputMode="numeric"
      placeholder="e.g. 25,000"
      value={maxPrice}
      onChange={(e) => setMaxPrice(e.target.value)}
      className={boxedInput}
    />
  );

  const searchButton = (
    <button
      type="submit"
      aria-label="Search properties"
      className={
        resolvedVariant === 'underline'
          ? 'flex w-full items-center justify-center gap-1.5 rounded-lg bg-gold px-4 py-2.5 text-xs font-bold text-navy shadow-md transition hover:bg-gold-light active:scale-[0.99] lg:w-auto lg:min-w-[7.5rem] lg:shrink-0 lg:gap-2 lg:rounded-lg lg:px-5 lg:py-4 lg:text-sm lg:shadow-lg'
          : 'flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-navy shadow-md transition hover:bg-gold-light sm:min-h-[46px] sm:px-5 sm:py-3 sm:text-sm lg:min-h-[48px] lg:text-base'
      }
    >
      <Search className="h-3.5 w-3.5 shrink-0 lg:h-5 lg:w-5" aria-hidden />
      <span>Search</span>
    </button>
  );

  const extras = (
    <>
      {isPlot && katha === 'custom' && (
        <div className={resolvedVariant === 'underline' ? 'lg:col-span-5' : 'max-w-xs'}>
          {resolvedVariant === 'underline' ? (
            <UnderlineField label="Katha (decimal)">
              <input
                id="search-katha-custom"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 1.5"
                value={kathaCustom}
                onChange={(e) => setKathaCustom(e.target.value)}
                className={darkInput}
              />
            </UnderlineField>
          ) : (
            <div>
              <label className={boxedLabel} htmlFor="search-katha-custom">
                Katha (decimal)
              </label>
              <div className={boxedShell}>
                <input
                  id="search-katha-custom"
                  type="text"
                  value={kathaCustom}
                  onChange={(e) => setKathaCustom(e.target.value)}
                  className={boxedInput}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {category === 'other' && (
        <div className={resolvedVariant === 'underline' ? '' : ''}>
          {resolvedVariant === 'underline' ? (
            <UnderlineField label="Other type (required)">
              <input
                type="text"
                value={otherFreeText}
                onChange={(e) => setOtherFreeText(e.target.value)}
                placeholder="Describe property type"
                className={darkInput}
              />
            </UnderlineField>
          ) : (
            <div>
              <label className={boxedLabel}>Other type (required)</label>
              <div className={boxedShell}>
                <input
                  type="text"
                  value={otherFreeText}
                  onChange={(e) => setOtherFreeText(e.target.value)}
                  className={boxedInput}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );

  if (resolvedVariant === 'underline') {
    return (
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <form
          onSubmit={handleSearch}
          className="rounded-xl border-2 border-black bg-navy px-3 py-3.5 shadow-lg sm:px-5 sm:py-5 lg:rounded-2xl lg:px-8 lg:py-7"
        >
          {/* Mobile — design #7 stacked */}
          <div className="space-y-3 lg:hidden">
            <div className="grid grid-cols-2 gap-x-3 gap-y-0">
              <UnderlineField label={transactionLabel}>{transactionField}</UnderlineField>
              <UnderlineField label={thirdLabel}>{thirdField}</UnderlineField>
            </div>
            <UnderlineField label="Location">{locationField}</UnderlineField>
            <UnderlineField label="Type">{typeField}</UnderlineField>
            <UnderlineField label="Budget" gold>
              {budgetField}
            </UnderlineField>
            {extras}
            <div className="pt-0.5">{searchButton}</div>
          </div>

          {/* Desktop — design #7 single row */}
          <div className="hidden lg:grid lg:grid-cols-[0.85fr_1.35fr_1.1fr_0.75fr_1.15fr_auto] lg:items-end lg:gap-5">
            <UnderlineField label={transactionLabel}>{transactionField}</UnderlineField>
            <UnderlineField label="Location">{locationField}</UnderlineField>
            <UnderlineField label="Type">{typeField}</UnderlineField>
            <UnderlineField label={thirdLabel}>{thirdField}</UnderlineField>
            <UnderlineField label="Budget" gold>
              {budgetField}
            </UnderlineField>
            <div className="pb-0.5">{searchButton}</div>
          </div>

          {(isPlot && katha === 'custom') || category === 'other' ? (
            <div className="hidden lg:block mt-4 space-y-4">{extras}</div>
          ) : null}
        </form>
      </div>
    );
  }

  /* Boxed variant — listing pages */
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl">
      <form onSubmit={handleSearch} className="w-full space-y-2.5 sm:space-y-4">
        <div>
          <label className={boxedLabel} htmlFor="search-location">
            Location
          </label>
          <div className={boxedShell}>{locationField}</div>
        </div>

        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-12 lg:items-end lg:gap-3">
          <div className="xs:col-span-1 lg:col-span-3">
            <label className={boxedLabel} htmlFor="search-category">
              Property type
            </label>
            <div className={boxedShell}>{typeField}</div>
          </div>
          <div className="xs:col-span-1 lg:col-span-3">
            <label className={boxedLabel} htmlFor="search-bhk-katha">
              {thirdLabel}
            </label>
            <div className={boxedShell}>{thirdField}</div>
          </div>
          <div className="xs:col-span-1 lg:col-span-3">
            <label className={boxedLabel} htmlFor="search-transaction">
              {transactionLabel}
            </label>
            <div className={boxedShell}>{transactionField}</div>
          </div>
          <div className="xs:col-span-1 lg:col-span-3">
            <span className={`${boxedLabel} hidden lg:block`} aria-hidden>
              Search
            </span>
            {searchButton}
          </div>
        </div>

        {extras}

        <div className="grid grid-cols-1 gap-2.5 xs:grid-cols-2 sm:gap-3">
          <div>
            <label className={boxedLabel} htmlFor="search-min-price-boxed">
              Min budget (₹)
            </label>
            <div className={boxedShell}>{minBudgetOnly}</div>
          </div>
          <div>
            <label className={boxedLabel} htmlFor="search-max-price-boxed">
              Max budget (₹)
            </label>
            <div className={boxedShell}>{maxBudgetOnly}</div>
          </div>
        </div>
      </form>
    </div>
  );
};

const boxedLabel =
  'mb-1 block text-[10px] font-semibold uppercase tracking-wider text-navy/65 sm:mb-1.5 sm:text-xs';

const boxedShell =
  'flex min-h-[40px] w-full items-center rounded-lg border border-stone-200/90 bg-white px-2.5 shadow-sm focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20 sm:min-h-[46px] sm:rounded-xl sm:px-3 lg:min-h-[48px] lg:px-3.5';

const boxedSelect =
  'w-full cursor-pointer appearance-none border-0 bg-transparent py-1.5 text-xs font-medium text-navy outline-none sm:py-2 sm:text-sm';

const boxedInput =
  'w-full border-0 bg-transparent py-1.5 text-xs text-navy outline-none placeholder:text-stone-400 sm:py-2 sm:text-sm';

export default SearchBar;
