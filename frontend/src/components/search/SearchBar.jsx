import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PATNA_LOCATION_OPTIONS } from '../../constants/patnaLocations';
import { SHOP_SQFT_RANGES } from '../../constants/propertyForm';
import LocationSearchCombobox from './LocationSearchCombobox';

/**
 * Compact horizontal toolbar: smallest on narrow phones, scales up (responsive grid + type).
 * Category + transaction map to API `type` / `other_type` / `katha` / `bhk`.
 */
const SearchBar = ({ expanded = false, onSearch }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [location, setLocation] = useState('');
  /** homes | plot | shop | flat | apartment | other */
  const [category, setCategory] = useState('homes');
  /** rent | buy (homes & commercial); lease | buy | any for plot (any → type plot = all plot kinds) */
  const [transaction, setTransaction] = useState('rent');
  const [bhk, setBhk] = useState('');
  const [shopSqftRange, setShopSqftRange] = useState('');
  const [katha, setKatha] = useState('');
  const [kathaCustom, setKathaCustom] = useState('');
  const [otherFreeText, setOtherFreeText] = useState('');

  useEffect(() => {
    const loc = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    const bhkParam = searchParams.get('bhk') || '';
    const shopSqftParam = searchParams.get('shop_sqft_range') || '';
    const kathaParam = searchParams.get('katha') || '';
    const otherType = (searchParams.get('other_type') || '').trim();

    setLocation(loc);
    setBhk(bhkParam);
    setShopSqftRange(shopSqftParam);

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
  }, [searchParams]);

  const isPlot = category === 'plot';
  const isShop = category === 'shop';
  const transactionLabel = isPlot ? 'Lease / Buy' : 'Rent / Sell';
  const thirdLabel = isPlot ? 'Katha' : isShop ? 'Sq ft' : 'BHK';

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
      isPlot && katha === 'custom'
        ? kathaCustom.trim()
        : isPlot && katha
          ? katha
          : '';

    const payload = {
      location: location || '',
      type: typeParam,
      bhk: !isPlot && !isShop ? bhk || '' : '',
      shop_sqft_range: isShop ? shopSqftRange || '' : '',
      katha: kathaVal,
      other_type: otherTypeParam,
    };

    const params = new URLSearchParams();
    if (payload.location) params.append('location', payload.location);
    if (payload.type) params.append('type', payload.type);
    if (payload.bhk) params.append('bhk', payload.bhk);
    if (payload.shop_sqft_range) params.append('shop_sqft_range', payload.shop_sqft_range);
    if (payload.katha) params.append('katha', payload.katha);
    if (payload.other_type) params.append('other_type', payload.other_type);

    if (onSearch) {
      onSearch(payload);
    } else {
      navigate(`/search?${params.toString()}`);
    }
  };

  const chip =
    'flex min-h-[38px] min-w-0 flex-col justify-center gap-0 rounded border border-gray-200/90 bg-white px-1 py-0.5 shadow-sm transition-colors focus-within:border-gold focus-within:ring-1 focus-within:ring-gold/25 sm:min-h-[42px] sm:gap-0.5 sm:rounded-md sm:px-1.5 sm:py-1 md:min-h-[46px] md:px-2 md:py-1.5';

  const chipLabel =
    'whitespace-nowrap text-[7px] font-semibold uppercase leading-none tracking-wide text-navy/55 xs:text-[8px] sm:text-[9px] md:text-[10px]';

  const chipSelect =
    'w-full min-h-[20px] cursor-pointer rounded border-0 bg-transparent py-0 pl-0 pr-3 text-[10px] font-medium leading-tight text-navy outline-none touch-manipulation xs:min-h-[22px] xs:pr-4 xs:text-[11px] sm:min-h-[24px] sm:pr-5 sm:text-xs md:min-h-[26px] md:text-[13px]';

  void expanded;

  const gridBar =
    'grid w-full max-w-full grid-cols-[minmax(0,1.02fr)_minmax(0,1.08fr)_minmax(2rem,0.34fr)_minmax(3rem,0.46fr)_auto] items-stretch gap-1 xs:gap-1.5 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.12fr)_minmax(2.25rem,0.38fr)_minmax(3.25rem,0.48fr)_auto] sm:gap-2 md:grid-cols-[minmax(0,1.12fr)_minmax(0,1.18fr)_minmax(2.5rem,0.4fr)_minmax(3.5rem,0.52fr)_auto]';

  return (
    <div className="mx-auto w-full min-w-0 max-w-full">
      <form
        onSubmit={handleSearch}
        className="flex min-w-0 max-w-full flex-col items-center gap-1 xs:gap-1.5"
      >
        <div
          className="min-w-0 w-full overflow-x-auto overscroll-x-contain pb-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]"
          role="presentation"
        >
          <div className={`${gridBar} min-w-[min(100%,20rem)] max-w-full`} role="group" aria-label="Search filters">
            <div className={`${chip} min-w-0`}>
              <label className={chipLabel} htmlFor="search-location">
                Location
              </label>
              <LocationSearchCombobox
                value={location}
                onChange={setLocation}
                options={PATNA_LOCATION_OPTIONS}
                triggerClassName={chipSelect}
              />
            </div>

            <div className={`${chip} min-w-0`}>
              <label className={chipLabel} htmlFor="search-category">
                Type
              </label>
              <select
                id="search-category"
                value={category}
                onChange={(e) => {
                  const v = e.target.value;
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
                }}
                className={chipSelect}
              >
                <option value="homes">Homes & flats</option>
                <option value="plot">Plot</option>
                <option value="shop">Shop</option>
                <option value="flat">Flat</option>
                <option value="apartment">Apartment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={`${chip} min-w-0`}>
              <label className={chipLabel} htmlFor="search-bhk-katha">
                {thirdLabel}
              </label>
              {isPlot ? (
                <select
                  id="search-bhk-katha"
                  value={katha}
                  onChange={(e) => {
                    setKatha(e.target.value);
                    if (e.target.value !== 'custom') setKathaCustom('');
                  }}
                  className={chipSelect}
                >
                  <option value="">Any katha</option>
                  <option value="1">1 Katha</option>
                  <option value="2">2 Katha</option>
                  <option value="3">3 Katha</option>
                  <option value="custom">Exact value…</option>
                </select>
              ) : isShop ? (
                <select
                  id="search-bhk-katha"
                  value={shopSqftRange}
                  onChange={(e) => setShopSqftRange(e.target.value)}
                  className={chipSelect}
                >
                  <option value="">Any size</option>
                  {SHOP_SQFT_RANGES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              ) : (
                <select id="search-bhk-katha" value={bhk} onChange={(e) => setBhk(e.target.value)} className={chipSelect}>
                  <option value="">Any BHK</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              )}
            </div>

            <div className={`${chip} min-w-0`}>
              <label className={chipLabel} htmlFor="search-transaction">
                {transactionLabel}
              </label>
              <select
                id="search-transaction"
                value={transaction}
                disabled={category === 'other'}
                onChange={(e) => setTransaction(e.target.value)}
                className={`${chipSelect} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isPlot ? (
                  <>
                    <option value="any">Any (lease or buy)</option>
                    <option value="lease">Lease only</option>
                    <option value="buy">Buy only</option>
                  </>
                ) : (
                  <>
                    <option value="rent">Rent</option>
                    <option value="buy">Sell</option>
                  </>
                )}
              </select>
            </div>

            <button
              type="submit"
              aria-label="Search properties"
              className="flex min-h-[38px] min-w-[2.25rem] shrink-0 flex-col items-center justify-center gap-0 rounded border border-gold/30 bg-gold px-1 text-[9px] font-bold leading-none text-navy shadow-sm transition-colors hover:bg-gold/90 touch-manipulation xs:min-h-[40px] xs:min-w-[2.75rem] xs:gap-0.5 xs:px-1.5 xs:text-[10px] sm:min-h-[42px] sm:min-w-0 sm:flex-row sm:gap-1 sm:rounded-md sm:px-2.5 sm:text-xs md:min-h-[46px] md:px-3 md:text-sm"
            >
              <Search className="h-3 w-3 shrink-0 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" aria-hidden />
              <span className="hidden min-[340px]:inline">Search</span>
            </button>
          </div>
        </div>

        {isPlot && katha === 'custom' && (
          <div className="w-full max-w-xs px-1">
            <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-navy/60" htmlFor="search-katha-custom">
              Katha (decimal)
            </label>
            <input
              id="search-katha-custom"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 1.5"
              value={kathaCustom}
              onChange={(e) => setKathaCustom(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-light px-2 py-1 text-xs focus:border-gold focus:outline-none"
            />
          </div>
        )}

        {category === 'other' && (
          <div className="w-full max-w-md px-1">
            <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-navy/60 xs:text-[10px]">
              Other type (required)
            </label>
            <input
              type="text"
              value={otherFreeText}
              onChange={(e) => setOtherFreeText(e.target.value)}
              placeholder="Describe property type"
              className="w-full rounded-lg border-2 border-gray-light px-2 py-1.5 text-xs focus:border-gold focus:outline-none sm:text-sm"
            />
          </div>
        )}

        {category === 'homes' && (
          <p className="max-w-md text-center text-[8px] leading-snug text-gray xs:text-[9px] sm:text-[10px] md:max-w-lg md:text-xs">
            Use BHK for homes. For shops, flats, or apartments, pick them under Type.
          </p>
        )}
        {category === 'plot' && (
          <p className="max-w-md text-center text-[8px] leading-snug text-gray xs:text-[9px] sm:text-[10px] md:max-w-lg md:text-xs">
            Default &quot;Any&quot; finds lease and buy plots. Choose Lease only or Buy only to narrow. Location matches area, city, or district.
          </p>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
