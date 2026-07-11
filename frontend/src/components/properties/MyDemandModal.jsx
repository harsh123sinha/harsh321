import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { isValidIndianMobile } from '../../utils/helpers';
import { digitsOnly, blockNonDigitKeyDown } from '../../utils/numericInput';
import {
  FACING_OPTIONS,
  FURNISHING_OPTIONS,
  LISTING_CITIES,
  SHOP_SQFT_RANGES,
} from '../../constants/propertyForm';
import LocationSearchCombobox from '../search/LocationSearchCombobox';
import { useAreaOptions } from '../../hooks/useAreas';

const CATEGORIES = [
  { id: 'homes', label: 'Homes' },
  { id: 'flat', label: 'Flat' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'shop', label: 'Shop' },
  { id: 'plot', label: 'Plot' },
  { id: 'other', label: 'Other' },
];

const BHK_OPTS = ['1', '2', '3', '4', '5'];
const FLOOR_OPTS = [
  { value: '', label: 'Any floor' },
  { value: 'ground', label: 'Ground' },
  { value: '1-3', label: '1st – 3rd' },
  { value: '4-7', label: '4th – 7th' },
  { value: '8+', label: '8th & above' },
];

function emptyForm(prefill = {}) {
  return {
    contact_name: prefill.contact_name || '',
    contact_phone: prefill.contact_phone || '',
    category: prefill.category || 'homes',
    listing_type: prefill.listing_type || 'rent',
    requirements: prefill.requirements || '',
    location: prefill.location || '',
    city: prefill.city || 'Patna',
    bhk: prefill.bhk || '',
    floor_pref: prefill.floor_pref || '',
    facing: prefill.facing || '',
    furnishing: prefill.furnishing || '',
    shop_sqft_range: prefill.shop_sqft_range || '',
    katha: prefill.katha || '',
    budget_min: prefill.budget_min || '',
    budget_max: prefill.budget_max || '',
  };
}

function mapPrefillCategory(raw) {
  const v = String(raw || '').toLowerCase();
  if (CATEGORIES.some((c) => c.id === v)) return v;
  if (v === 'house_flat' || v === 'home') return 'homes';
  if (v === 'plots') return 'plot';
  return 'homes';
}

/**
 * Guest demand form — no login required.
 * @param {{ open: boolean, onClose: () => void, prefill?: object }} props
 */
export default function MyDemandModal({ open, onClose, prefill = {} }) {
  const { pickOptions: areaOptions } = useAreaOptions();
  const [form, setForm] = useState(() => emptyForm(prefill));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      emptyForm({
        ...prefill,
        category: mapPrefillCategory(prefill.category),
        listing_type:
          prefill.listing_type ||
          (mapPrefillCategory(prefill.category) === 'plot' ? 'plot_buy' : 'rent'),
        location: prefill.location || '',
        city: prefill.city || 'Patna',
        bhk: prefill.bhk != null ? String(prefill.bhk) : '',
        facing: prefill.facing || '',
        furnishing: prefill.furnishing || '',
        shop_sqft_range: prefill.shop_sqft_range || '',
        katha: prefill.katha || '',
        budget_min: prefill.budget_min || prefill.minPrice || '',
        budget_max: prefill.budget_max || prefill.maxPrice || '',
      })
    );
    // Only hydrate when modal opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const isHomeLike = ['homes', 'flat', 'apartment'].includes(form.category);
  const isShop = form.category === 'shop';
  const isPlot = form.category === 'plot';

  const selectCategory = (id) => {
    const patch = { category: id };
    if (id === 'plot') {
      patch.listing_type =
        form.listing_type === 'plot_lease' || form.listing_type === 'plot_buy'
          ? form.listing_type
          : 'plot_buy';
    } else if (id === 'other') {
      patch.listing_type = '';
    } else {
      patch.listing_type =
        form.listing_type === 'rent' || form.listing_type === 'buy' ? form.listing_type : 'rent';
    }
    set(patch);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!String(form.requirements || '').trim()) {
      toast.error('Please describe your requirements');
      return;
    }
    if (!isValidIndianMobile(form.contact_phone)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    if (isHomeLike && !form.bhk) {
      toast.error('Select BHK');
      return;
    }
    if ((isHomeLike || isShop) && !form.listing_type) {
      toast.error('Select rent or buy');
      return;
    }
    if (isPlot && !form.listing_type) {
      toast.error('Select plot lease or buy');
      return;
    }

    setSaving(true);
    try {
      await api.post('/demands', {
        contact_name: form.contact_name.trim() || undefined,
        contact_phone: form.contact_phone,
        category: form.category,
        listing_type: form.listing_type || undefined,
        requirements: form.requirements.trim(),
        location: form.location.trim() || undefined,
        city: form.city || 'Patna',
        bhk: isHomeLike ? form.bhk : undefined,
        floor_pref: isHomeLike ? form.floor_pref || undefined : undefined,
        facing: form.facing || undefined,
        furnishing: isHomeLike ? form.furnishing || undefined : undefined,
        shop_sqft_range: isShop ? form.shop_sqft_range || undefined : undefined,
        katha: isPlot ? form.katha || undefined : undefined,
        budget_min: form.budget_min || undefined,
        budget_max: form.budget_max || undefined,
      });
      toast.success('Demand submitted. We will contact you soon.');
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not submit demand');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border-2 border-gray-light px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none';

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        role="dialog"
        aria-labelledby="my-demand-title"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 sm:px-5">
          <h2 id="my-demand-title" className="text-lg font-bold text-navy">
            My Demand
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Your requirements *</label>
              <textarea
                required
                rows={3}
                value={form.requirements}
                onChange={(e) => set({ requirements: e.target.value })}
                placeholder="e.g. Need 2 BHK near Boring Road under ₹15,000, east facing preferred"
                className={inputClass}
                maxLength={2000}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-navy">Looking for *</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const on = form.category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCategory(c.id)}
                      className={`rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition ${
                        on
                          ? 'border-gold bg-gold/15 text-navy'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {(isHomeLike || isShop) && (
              <div>
                <p className="mb-2 text-sm font-medium text-navy">Rent or buy *</p>
                <div className="flex gap-2">
                  {['rent', 'buy'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set({ listing_type: t })}
                      className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold capitalize ${
                        form.listing_type === t
                          ? 'border-gold bg-gold/15 text-navy'
                          : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isPlot && (
              <div>
                <p className="mb-2 text-sm font-medium text-navy">Plot type *</p>
                <div className="flex gap-2">
                  {[
                    { id: 'plot_buy', label: 'Buy' },
                    { id: 'plot_lease', label: 'Lease' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set({ listing_type: t.id })}
                      className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold ${
                        form.listing_type === t.id
                          ? 'border-gold bg-gold/15 text-navy'
                          : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-navy">Preferred area</label>
                <div className={`${inputClass} !p-0`}>
                  <LocationSearchCombobox
                    value={form.location}
                    onChange={(v) => set({ location: v })}
                    options={areaOptions}
                    triggerClassName="w-full px-3 py-2.5 text-left text-sm"
                    tone="light"
                    dropUp
                    emptyLabel="Select area"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">City</label>
                <select
                  className={inputClass}
                  value={form.city}
                  onChange={(e) => set({ city: e.target.value })}
                >
                  {LISTING_CITIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {isHomeLike && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy">BHK *</label>
                  <div className="flex flex-wrap gap-1.5">
                    {BHK_OPTS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set({ bhk: n })}
                        className={`rounded-lg border-2 px-2.5 py-1.5 text-sm font-semibold ${
                          form.bhk === n
                            ? 'border-gold bg-gold/15 text-navy'
                            : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isHomeLike && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy">Floor preference</label>
                  <select
                    className={inputClass}
                    value={form.floor_pref}
                    onChange={(e) => set({ floor_pref: e.target.value })}
                  >
                    {FLOOR_OPTS.map((o) => (
                      <option key={o.value || 'any'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isHomeLike && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy">Furnishing</label>
                  <select
                    className={inputClass}
                    value={form.furnishing}
                    onChange={(e) => set({ furnishing: e.target.value })}
                  >
                    {FURNISHING_OPTIONS.map((o) => (
                      <option key={o.value || 'none'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(isHomeLike || isPlot) && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy">Facing</label>
                  <select
                    className={inputClass}
                    value={form.facing}
                    onChange={(e) => set({ facing: e.target.value })}
                  >
                    {FACING_OPTIONS.map((o) => (
                      <option key={o.value || 'none'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isShop && (
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-navy">Shop size</label>
                  <select
                    className={inputClass}
                    value={form.shop_sqft_range}
                    onChange={(e) => set({ shop_sqft_range: e.target.value })}
                  >
                    <option value="">Any size</option>
                    {SHOP_SQFT_RANGES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isPlot && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy">Katha</label>
                  <input
                    className={inputClass}
                    value={form.katha}
                    onChange={(e) => set({ katha: e.target.value })}
                    placeholder="e.g. 2"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Budget min (₹)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputClass}
                  value={form.budget_min}
                  onChange={(e) => set({ budget_min: digitsOnly(e.target.value, 12) })}
                  onKeyDown={blockNonDigitKeyDown}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Budget max (₹)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputClass}
                  value={form.budget_max}
                  onChange={(e) => set({ budget_max: digitsOnly(e.target.value, 12) })}
                  onKeyDown={blockNonDigitKeyDown}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Your name</label>
                <input
                  className={inputClass}
                  value={form.contact_name}
                  onChange={(e) => set({ contact_name: e.target.value })}
                  placeholder="Optional"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Contact number *</label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  className={inputClass}
                  value={form.contact_phone}
                  onChange={(e) => set({ contact_phone: digitsOnly(e.target.value, 10) })}
                  onKeyDown={blockNonDigitKeyDown}
                  placeholder="10-digit mobile"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100 px-4 py-3 sm:px-5">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-gold py-3 text-sm font-bold text-navy hover:bg-gold/90 disabled:opacity-60"
            >
              {saving ? 'Sending…' : 'Send my demand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
