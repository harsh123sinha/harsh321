const MODES = [
  { id: 'property', label: 'Property' },
  { id: 'project', label: 'Project' },
];

export default function AddListingModeToggle({ mode, onChange }) {
  return (
    <div className="md:col-span-2">
      <p className="mb-2 text-sm font-medium text-navy">Listing type *</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`rounded-xl border-2 px-4 py-3 text-left transition ${
                active
                  ? 'border-gold bg-gold/10 shadow-sm'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <span className="block text-sm font-bold text-navy">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
