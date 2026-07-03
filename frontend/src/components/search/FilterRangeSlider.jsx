import { useMemo } from 'react';

const BARS = [12, 28, 45, 62, 38, 55, 72, 48, 30, 18, 8];

/** Budget range with navy histogram on white filter theme. */
const FilterRangeSlider = ({ min, max, valueMin, valueMax, onChange, formatLabel }) => {
  const lo = Number(valueMin) || min;
  const hi = Number(valueMax) || max;
  const span = Math.max(max - min, 1);

  const loPct = ((lo - min) / span) * 100;
  const hiPct = ((hi - min) / span) * 100;

  const bars = useMemo(() => BARS, []);

  const onLo = (e) => {
    const v = Math.min(Number(e.target.value), hi);
    onChange(v, hi);
  };

  const onHi = (e) => {
    const v = Math.max(Number(e.target.value), lo);
    onChange(lo, v);
  };

  return (
    <div className="space-y-3">
      <div className="flex h-16 items-end justify-between gap-0.5 px-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="htls-filter-bar flex-1 origin-bottom rounded-t-sm bg-navy/20"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 45}ms`,
            }}
            aria-hidden
          />
        ))}
      </div>

      <div className="relative h-8 px-1">
        <div className="absolute left-1 right-1 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-stone-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-navy transition-all duration-150"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={lo}
          onChange={onLo}
          className="filter-range-input absolute inset-x-0 top-0 h-8 w-full cursor-pointer appearance-none bg-transparent"
          aria-label="Minimum budget"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={hi}
          onChange={onHi}
          className="filter-range-input absolute inset-x-0 top-0 h-8 w-full cursor-pointer appearance-none bg-transparent"
          aria-label="Maximum budget"
        />
      </div>

      <div className="flex justify-between text-xs font-semibold text-navy/70">
        <span>{formatLabel ? formatLabel(lo) : lo.toLocaleString('en-IN')}</span>
        <span>{formatLabel ? formatLabel(hi) : hi.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

export default FilterRangeSlider;
