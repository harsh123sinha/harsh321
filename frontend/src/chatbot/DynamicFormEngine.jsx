import { useEffect, useRef, useState } from 'react';
import LocationSearchDropdown from './LocationSearchDropdown';
import { STEP_KEYS } from './stepConfig';
import { FURNISHING_OPTIONS } from '../constants/propertyForm';
import { CHAT_SHOP_AREA_OPTIONS } from './chatShopAreaOptions';
import { useAreaOptions } from '../hooks/useAreas';

const Btn = ({ children, onClick, active, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    className={`min-h-[44px] rounded-xl border px-3 py-2 text-sm font-medium touch-manipulation ${
      active
        ? 'border-gold bg-gold/15 text-navy'
        : 'border-slate-200 bg-white text-navy hover:border-gold/60'
    }`}
  >
    {children}
  </button>
);

const DynamicFormEngine = ({ stepKey, category, onSubmit, disabled, isLastStep }) => {
  const { options: areaOptions } = useAreaOptions();
  const [listingType, setListingType] = useState('');
  const [location, setLocation] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [bhk, setBhk] = useState('');
  const [homeArea, setHomeArea] = useState('');
  const [floorPref, setFloorPref] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [plotArea, setPlotArea] = useState('');
  const [plotUnit, setPlotUnit] = useState('sqft');
  const [plotRoad, setPlotRoad] = useState('');
  const [plotFacing, setPlotFacing] = useState('');
  const [otherDesc, setOtherDesc] = useState('');
  const submittedRef = useRef(false);

  useEffect(() => {
    submittedRef.current = false;
  }, [stepKey]);

  const floorOpts = [
    { v: 'ground', l: 'Ground' },
    { v: 'low', l: 'Low (1–3)' },
    { v: 'mid', l: 'Mid (4–7)' },
    { v: 'high', l: 'High (8+)' },
    { v: 'any', l: 'Any' },
  ];

  const facingOpts = ['N', 'E', 'S', 'W', 'NE', 'NW', 'SE', 'SW', 'Any'];

  const submitOnce = (summary, patch) => {
    if (disabled) return;
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(summary, patch);
  };

  const handleLocation = () => {
    const label = location === '' ? 'Any area / Patna' : location;
    submitOnce(`Location: ${label}`, { location: location || '' });
  };

  const handleShopRangeSelect = (opt) => {
    submitOnce(`Shop size: ${opt.label}`, { shopSqftRange: opt.dbValue });
  };

  const handleShopBudget = (skipped) => {
    if (skipped) {
      submitOnce('Budget: skipped', { budgetMin: '', budgetMax: '' });
      return;
    }
    const parts = [];
    if (budgetMin) parts.push(`Min ₹${budgetMin}`);
    if (budgetMax) parts.push(`Max ₹${budgetMax}`);
    submitOnce(parts.length ? `Budget — ${parts.join(', ')}` : 'Budget: skipped', {
      budgetMin: budgetMin || '',
      budgetMax: budgetMax || '',
    });
  };

  const handleBhk = () => {
    if (!bhk) return;
    submitOnce(`${bhk} BHK`, { bhk });
  };

  const handleFloor = () => {
    if (!floorPref) return;
    const l = floorOpts.find((x) => x.v === floorPref)?.l || floorPref;
    submitOnce(`Floor preference: ${l}`, { floorPreference: floorPref });
  };

  const handleFurnish = () => {
    const opt = FURNISHING_OPTIONS.find((o) => o.value === furnishing);
    const label = opt?.label || 'Any';
    submitOnce(`Furnishing: ${label}`, { furnishing });
  };

  const handleHomeBudget = () => {
    const parts = [];
    if (budgetMin) parts.push(`Min ₹${budgetMin}`);
    if (budgetMax) parts.push(`Max ₹${budgetMax}`);
    submitOnce(parts.length ? `Budget — ${parts.join(', ')}` : 'Budget: flexible', {
      budgetMin: budgetMin || '',
      budgetMax: budgetMax || '',
    });
  };

  const handlePlotArea = () => {
    const n = Number(plotArea);
    if (!Number.isFinite(n) || n <= 0) return;
    const unitLabel = plotUnit === 'acres' ? 'acres' : 'sq ft';
    submitOnce(`Plot size: ${n} ${unitLabel}`, {
      plotAreaValue: n,
      plotAreaUnit: plotUnit,
    });
  };

  const handlePlotRoad = () => {
    const t = plotRoad.trim() || '—';
    submitOnce(`Road width: ${t}`, { plotRoadWidth: plotRoad.trim() });
  };

  const handlePlotFacing = () => {
    if (!plotFacing) return;
    submitOnce(`Facing: ${plotFacing}`, { plotFacing });
  };

  const handlePlotBudget = () => {
    const parts = [];
    if (budgetMin) parts.push(`Min ₹${budgetMin}`);
    if (budgetMax) parts.push(`Max ₹${budgetMax}`);
    submitOnce(parts.length ? `Budget — ${parts.join(', ')}` : 'Budget: flexible', {
      budgetMin: budgetMin || '',
      budgetMax: budgetMax || '',
    });
  };

  const handleOtherBudget = () => {
    const parts = [];
    if (budgetMin) parts.push(`Min ₹${budgetMin}`);
    if (budgetMax) parts.push(`Max ₹${budgetMax}`);
    submitOnce(parts.length ? `Budget — ${parts.join(', ')}` : 'Budget: flexible', {
      budgetMin: budgetMin || '',
      budgetMax: budgetMax || '',
    });
  };

  const handleOtherArea = () => {
    const t = homeArea.trim();
    submitOnce(t ? `Area: ${t}` : 'Area: flexible', { otherArea: t });
  };

  const handleOtherDesc = () => {
    const t = otherDesc.trim();
    if (!t) return;
    submitOnce(`Details: ${t.slice(0, 200)}${t.length > 200 ? '…' : ''}`, {
      description: t,
    });
  };

  if (stepKey === STEP_KEYS.LISTING_TYPE) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-600">Rent or buy?</p>
        <div className="flex gap-2">
          <Btn
            active={listingType === 'rent'}
            onClick={() => {
              if (disabled) return;
              setListingType('rent');
              onSubmit('Looking to Rent', { listingType: 'rent' });
            }}
          >
            Rent
          </Btn>
          <Btn
            active={listingType === 'buy'}
            onClick={() => {
              if (disabled) return;
              setListingType('buy');
              onSubmit('Looking to Buy', { listingType: 'buy' });
            }}
          >
            Buy
          </Btn>
        </div>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.LOCATION) {
    return (
      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-600">Location</label>
        <LocationSearchDropdown
          value={location}
          onChange={(v) => {
            setLocation(v);
            const label = v === '' ? 'Any area / Patna' : v;
            submitOnce(`Location: ${label}`, { location: v || '' });
          }}
          options={areaOptions}
          id="htls-loc"
          openOnMount
          dropUp
        />
      </div>
    );
  }

  if (stepKey === STEP_KEYS.SHOP_AREA) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-600">Approx. shop size (sq ft)</p>
        <p className="text-[11px] text-slate-500">Choose a range — we match listings in the same band.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHAT_SHOP_AREA_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              disabled={disabled}
              onClick={() => handleShopRangeSelect(o)}
              className="min-h-[48px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-navy shadow-sm transition hover:border-gold hover:bg-gold/5 active:scale-[0.99] disabled:opacity-40 touch-manipulation"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.SHOP_BUDGET) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-600">Budget range (optional)</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min ₹"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-2 text-sm"
          />
          <input
            type="number"
            min={0}
            placeholder="Max ₹"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleShopBudget(true)}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium touch-manipulation"
          >
            Skip
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleShopBudget(false)}
            className="flex-1 rounded-xl bg-navy py-3 text-sm font-semibold text-white touch-manipulation"
          >
            {isLastStep ? 'Search' : 'Apply'}
          </button>
        </div>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.BHK) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-600">BHK</p>
        <div className="flex flex-wrap gap-2">
          {['1', '2', '3', '4', '5+'].map((b) => (
            <Btn
              key={b}
              active={bhk === b}
              onClick={() => {
                if (disabled) return;
                setBhk(b);
                submitOnce(`${b} BHK`, { bhk: b });
              }}
            >
              {b} BHK
            </Btn>
          ))}
        </div>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.FLOOR_PREF) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-600">Floor preference</p>
        <div className="flex flex-wrap gap-2">
          {floorOpts.map((o) => (
            <Btn
              key={o.v}
              active={floorPref === o.v}
              onClick={() => {
                if (disabled) return;
                setFloorPref(o.v);
                submitOnce(`Floor preference: ${o.l}`, { floorPreference: o.v });
              }}
            >
              {o.l}
            </Btn>
          ))}
        </div>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.FURNISHING) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-600">Furnishing</p>
        <div className="flex flex-wrap gap-2">
          <Btn
            active={furnishing === ''}
            onClick={() => {
              if (disabled) return;
              setFurnishing('');
              submitOnce('Furnishing: Any', { furnishing: '' });
            }}
          >
            Any
          </Btn>
          {FURNISHING_OPTIONS.filter((o) => o.value).map((o) => (
            <Btn
              key={o.value}
              active={furnishing === o.value}
              onClick={() => {
                if (disabled) return;
                setFurnishing(o.value);
                submitOnce(`Furnishing: ${o.label}`, { furnishing: o.value });
              }}
            >
              {o.label}
            </Btn>
          ))}
        </div>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.HOME_BUDGET) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-600">Budget range</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min ₹"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            onBlur={handleHomeBudget}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleHomeBudget();
              }
            }}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-2 text-sm"
          />
          <input
            type="number"
            min={0}
            placeholder="Max ₹"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            onBlur={handleHomeBudget}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleHomeBudget();
              }
            }}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-2 text-sm"
          />
        </div>
        <p className="text-[11px] text-slate-500">Tip: just tap outside (or press Enter) to continue.</p>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.PLOT_AREA) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-medium touch-manipulation ${
              plotUnit === 'sqft' ? 'bg-white shadow text-navy' : 'text-slate-600'
            }`}
            onClick={() => setPlotUnit('sqft')}
          >
            Sq ft
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-medium touch-manipulation ${
              plotUnit === 'acres' ? 'bg-white shadow text-navy' : 'text-slate-600'
            }`}
            onClick={() => setPlotUnit('acres')}
          >
            Acres
          </button>
        </div>
        <input
          type="number"
          min={1}
          inputMode="decimal"
          value={plotArea}
          onChange={(e) => setPlotArea(e.target.value)}
          onBlur={handlePlotArea}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handlePlotArea();
            }
          }}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
          placeholder={plotUnit === 'acres' ? 'e.g. 2' : 'e.g. 2400'}
        />
        <p className="text-[11px] text-slate-500">Tip: tap outside (or press Enter) to continue.</p>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.PLOT_ROAD) {
    return (
      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-600">Road width (feet / meters as you prefer)</label>
        <input
          type="text"
          value={plotRoad}
          onChange={(e) => setPlotRoad(e.target.value)}
          onBlur={handlePlotRoad}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handlePlotRoad();
            }
          }}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
          placeholder="e.g. 30 ft"
        />
        <p className="text-[11px] text-slate-500">Tip: tap outside (or press Enter) to continue.</p>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.PLOT_FACING) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-600">Facing direction</p>
        <div className="flex flex-wrap gap-2">
          {facingOpts.map((f) => (
            <Btn
              key={f}
              active={plotFacing === f}
              onClick={() => {
                if (disabled) return;
                setPlotFacing(f);
                submitOnce(`Facing: ${f}`, { plotFacing: f });
              }}
            >
              {f}
            </Btn>
          ))}
        </div>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.PLOT_BUDGET) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-600">Budget range</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min ₹"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            onBlur={handlePlotBudget}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handlePlotBudget();
              }
            }}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-2 text-sm"
          />
          <input
            type="number"
            min={0}
            placeholder="Max ₹"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            onBlur={handlePlotBudget}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handlePlotBudget();
              }
            }}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-2 text-sm"
          />
        </div>
        <p className="text-[11px] text-slate-500">Tip: tap outside (or press Enter) to search.</p>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.OTHER_BUDGET) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-600">Budget range</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min ₹"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            onBlur={handleOtherBudget}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleOtherBudget();
              }
            }}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-2 text-sm"
          />
          <input
            type="number"
            min={0}
            placeholder="Max ₹"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            onBlur={handleOtherBudget}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleOtherBudget();
              }
            }}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-2 text-sm"
          />
        </div>
        <p className="text-[11px] text-slate-500">Tip: tap outside (or press Enter) to continue.</p>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.OTHER_AREA) {
    return (
      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-600">Approx. area (optional)</label>
        <input
          type="text"
          value={homeArea}
          onChange={(e) => setHomeArea(e.target.value)}
          onBlur={handleOtherArea}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleOtherArea();
            }
          }}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
          placeholder="Describe size"
        />
        <p className="text-[11px] text-slate-500">Tip: tap outside (or press Enter) to continue.</p>
      </div>
    );
  }

  if (stepKey === STEP_KEYS.OTHER_DESC) {
    return (
      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-600">Short description</label>
        <textarea
          value={otherDesc}
          onChange={(e) => setOtherDesc(e.target.value)}
          onBlur={handleOtherDesc}
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm touch-manipulation"
          placeholder="Tell us what you need…"
        />
        <p className="text-[11px] text-slate-500">Tip: tap outside to search.</p>
      </div>
    );
  }

  return <p className="text-sm text-slate-500">Unsupported step.</p>;
};

export default DynamicFormEngine;
