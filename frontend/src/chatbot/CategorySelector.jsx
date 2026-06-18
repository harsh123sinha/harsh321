const CATEGORIES = [
  { id: 'shop', label: 'Shop' },
  { id: 'house_flat', label: 'House & Flat' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'plots', label: 'Plots' },
  { id: 'other', label: 'Other' },
];

const CategorySelector = ({ onSelect, disabled }) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
    {CATEGORIES.map((c) => (
      <button
        key={c.id}
        type="button"
        disabled={disabled}
        onClick={() => onSelect(c.id)}
        className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm font-medium text-navy shadow-sm transition hover:border-gold hover:bg-gold/5 active:scale-[0.98] disabled:opacity-50 touch-manipulation"
      >
        {c.label}
      </button>
    ))}
  </div>
);

export default CategorySelector;
export { CATEGORIES };
