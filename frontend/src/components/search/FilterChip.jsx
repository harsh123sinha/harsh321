const FilterChip = ({ active, children, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-all duration-200 touch-manipulation active:scale-95 ${
      active
        ? 'scale-105 border-gold bg-gold text-navy shadow-md shadow-gold/25'
        : 'border-gold/35 bg-navy-light/80 text-gold/90 hover:border-gold/60 hover:bg-gold/10'
    } ${className}`}
  >
    {children}
  </button>
);

export default FilterChip;
