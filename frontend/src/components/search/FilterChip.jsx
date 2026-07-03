const FilterChip = ({ active, children, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-all duration-200 touch-manipulation active:scale-95 ${
      active
        ? 'scale-105 border-navy bg-navy text-white shadow-md shadow-navy/20'
        : 'border-stone-200 bg-white text-navy hover:border-navy/40 hover:bg-navy/5'
    } ${className}`}
  >
    {children}
  </button>
);

export default FilterChip;
