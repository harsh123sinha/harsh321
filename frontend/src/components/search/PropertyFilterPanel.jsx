import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { PATNA_LOCATION_OPTIONS } from '../../constants/patnaLocations';
import { useAreaOptions } from '../../hooks/useAreas';
import FilterChip from './FilterChip';
import FilterRangeSlider from './FilterRangeSlider';
import {
  BATHROOM_OPTIONS,
  BHK_OPTIONS,
  BUDGET_MAX,
  FACING_CHIPS,
  FURNISHING_CHIPS,
  PARKING_OPTIONS,
  PROPERTY_TYPE_CHIPS,
  SORT_OPTIONS,
  buildFilterPayload,
  formatBudgetLabel,
  searchParamsToFilterState,
} from './propertyFilterUtils';

const Section = ({ title, children, index = 0 }) => (
  <section
    className="htls-filter-section border-b border-stone-200 py-4"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    <h3 className="mb-3 text-base font-bold tracking-wide text-navy">{title}</h3>
    {children}
  </section>
);

const ChipRow = ({ children }) => (
  <div className="flex flex-wrap gap-2">{children}</div>
);

const PropertyFilterPanel = ({ presetLocation = '', presetType = '', onApply }) => {
  const [searchParams] = useSearchParams();
  const { options: areaOptions } = useAreaOptions();
  const locationOptions = useMemo(
    () => (areaOptions?.length ? areaOptions : PATNA_LOCATION_OPTIONS),
    [areaOptions]
  );

  const [state, setState] = useState(() =>
    searchParamsToFilterState(searchParams, presetLocation, presetType)
  );
  const [locationQ, setLocationQ] = useState(state.location);
  const [showLocList, setShowLocList] = useState(false);

  useEffect(() => {
    setState(searchParamsToFilterState(searchParams, presetLocation, presetType));
    setLocationQ(searchParams.get('location') || presetLocation || '');
  }, [searchParams, presetLocation, presetType]);

  const filteredLocations = useMemo(() => {
    const q = locationQ.trim().toLowerCase();
    if (!q) return locationOptions;
    return locationOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || String(o.value).toLowerCase().includes(q)
    );
  }, [locationQ, locationOptions]);

  const set = (patch) => setState((s) => ({ ...s, ...patch }));

  const toggle = (key, value) => {
    setState((s) => ({ ...s, [key]: s[key] === value ? '' : value }));
  };

  const handleApply = () => {
    const payload = buildFilterPayload({ ...state, location: locationQ.trim() });
    onApply?.(payload);
  };

  const budgetChip =
    state.minPrice > 0 || state.maxPrice < BUDGET_MAX
      ? `Budget : ${formatBudgetLabel(state.minPrice)} - ${formatBudgetLabel(state.maxPrice)}`
      : null;

  return (
    <div className="px-4 pb-4">
      {/* Location search */}
      <div
        className="htls-filter-section border-b border-stone-200 py-4"
        style={{ animationDelay: '0ms' }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-navy/40" />
          <input
            type="search"
            value={locationQ}
            onChange={(e) => {
              setLocationQ(e.target.value);
              setShowLocList(true);
            }}
            onFocus={() => setShowLocList(true)}
            placeholder="Search locality in Patna…"
            className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-navy placeholder:text-stone-400 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/15"
          />
        </div>
        <p className="mt-2 text-xs text-stone-500">
          Select cities, neighbourhoods or areas that you want to search properties in.
        </p>
        {showLocList && filteredLocations.length > 0 ? (
          <ul className="htls-filter-loc-list mt-2 max-h-40 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg shadow-navy/10">
            <li>
              <button
                type="button"
                className="w-full px-3 py-2.5 text-left text-sm text-navy/70 transition hover:bg-navy/5"
                onClick={() => {
                  setLocationQ('');
                  set({ location: '' });
                  setShowLocList(false);
                }}
              >
                Any area / whole Patna
              </button>
            </li>
            {filteredLocations.map((o) => (
              <li key={o.value || '__any'}>
                <button
                  type="button"
                  className="w-full px-3 py-2.5 text-left text-sm text-navy transition hover:bg-navy/5"
                  onClick={() => {
                    setLocationQ(o.value);
                    set({ location: o.value });
                    setShowLocList(false);
                  }}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Section title="Bathrooms" index={1}>
        <ChipRow>
          {BATHROOM_OPTIONS.map((o) => (
            <FilterChip
              key={o.value}
              active={state.bathrooms === o.value}
              onClick={() => toggle('bathrooms', o.value)}
            >
              {o.label}
            </FilterChip>
          ))}
        </ChipRow>
      </Section>

      <Section title="Budget" index={2}>
        <FilterRangeSlider
          min={0}
          max={BUDGET_MAX}
          valueMin={state.minPrice}
          valueMax={state.maxPrice}
          onChange={(min, max) => set({ minPrice: min, maxPrice: max })}
          formatLabel={formatBudgetLabel}
        />
        {budgetChip ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-navy/20 bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy">
            {budgetChip}
            <button
              type="button"
              aria-label="Clear budget"
              className="text-navy/60 hover:text-navy"
              onClick={() => set({ minPrice: 0, maxPrice: BUDGET_MAX })}
            >
              ×
            </button>
          </div>
        ) : null}
      </Section>

      <Section title="Facing" index={3}>
        <ChipRow>
          {FACING_CHIPS.map((o) => (
            <FilterChip
              key={o.value}
              active={state.facing === o.value}
              onClick={() => toggle('facing', o.value)}
            >
              {o.label}
            </FilterChip>
          ))}
        </ChipRow>
      </Section>

      <Section title="Property Type" index={4}>
        <ChipRow>
          {PROPERTY_TYPE_CHIPS.map((o) => (
            <FilterChip
              key={o.value || 'all'}
              active={state.propertyKind === o.value}
              onClick={() =>
                set({
                  propertyKind: o.value,
                  other_type: o.other_type,
                  type: o.value === 'plot' ? 'plot' : state.type,
                })
              }
            >
              {o.label}
            </FilterChip>
          ))}
        </ChipRow>
      </Section>

      <Section title="Car Parking" index={5}>
        <ChipRow>
          {PARKING_OPTIONS.map((o) => (
            <FilterChip
              key={o.value || 'any'}
              active={state.car_parking === o.value}
              onClick={() => toggle('car_parking', o.value)}
            >
              {o.label}
            </FilterChip>
          ))}
        </ChipRow>
      </Section>

      <Section title="BHK" index={6}>
        <ChipRow>
          {BHK_OPTIONS.map((o) => (
            <FilterChip
              key={o.value}
              active={state.bhk === o.value}
              onClick={() => toggle('bhk', o.value)}
            >
              {o.label}
            </FilterChip>
          ))}
        </ChipRow>
      </Section>

      <Section title="Furnishing" index={7}>
        <ChipRow>
          {FURNISHING_CHIPS.map((o) => (
            <FilterChip
              key={o.value}
              active={state.furnishing === o.value}
              onClick={() => toggle('furnishing', o.value)}
            >
              {o.label}
            </FilterChip>
          ))}
        </ChipRow>
      </Section>

      <Section title="Sort By" index={8}>
        <ChipRow>
          {SORT_OPTIONS.map((o) => (
            <FilterChip
              key={o.value}
              active={state.sort === o.value}
              onClick={() => set({ sort: o.value })}
            >
              {o.label}
            </FilterChip>
          ))}
        </ChipRow>
      </Section>

      <button
        type="button"
        onClick={handleApply}
        className="htls-filter-cta mt-4 w-full rounded-xl bg-navy py-3.5 text-base font-bold text-white shadow-lg shadow-navy/25 transition hover:bg-navy-light active:scale-[0.98] touch-manipulation"
      >
        View Properties
      </button>
    </div>
  );
};

export default PropertyFilterPanel;
