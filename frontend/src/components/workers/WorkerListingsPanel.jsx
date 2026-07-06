import { useState } from 'react';
import { Trash2, Plus, IndianRupee, Pencil, Car, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import ImageCaptureInput from '../common/ImageCaptureInput';
import EmployeeIdBadge from '../vendors/EmployeeIdBadge';
import {
  VEHICLE_TYPES,
  RENTAL_MODES,
  DRIVER_FUEL_OPTIONS,
  LISTING_PRICE_TYPES,
  BUILDING_MATERIAL_TYPES,
  resolveBuildingMaterial,
  formatMaterialListingRate,
} from '../../constants/workerProfileTypes';

const MAX_LISTING_IMAGES = 4;

const emptyVehicleForm = {
  vehicle_type: 'car',
  rental_mode: 'self_drive',
  driver_fuel_option: 'with_fuel',
  model_year: '',
  company_name: '',
  model_name: '',
  rate_amount: '',
  price_type: 'daily',
  included_km: '',
  extra_km_rate: '',
  fuel_cost_per_km: '',
  description: '',
};

const emptyMaterialForm = {
  material_type: '',
  rate_amount: '',
  description: '',
};

function formatVehicleCostLabel(listing) {
  const amt = `₹${Number(listing.rate_amount).toLocaleString('en-IN')}`;
  if (listing.rental_mode === 'with_driver') {
    if (listing.driver_fuel_option === 'without_fuel') return `${amt} (driver + vehicle)`;
    return `${amt} (driver + vehicle + fuel)`;
  }
  return `${amt} (self drive)`;
}

function formatVehicleKmDetails(listing) {
  if (listing.rental_mode === 'with_driver' && listing.driver_fuel_option === 'without_fuel') {
    if (listing.fuel_cost_per_km == null) return null;
    return `Fuel: ₹${Number(listing.fuel_cost_per_km).toLocaleString('en-IN')}/km`;
  }
  const parts = [];
  if (listing.included_km != null) parts.push(`${listing.included_km} km included`);
  if (listing.extra_km_rate != null) {
    parts.push(`₹${Number(listing.extra_km_rate).toLocaleString('en-IN')}/km after`);
  }
  return parts.length ? parts.join(' · ') : null;
}

function VehicleListingCard({ item, onEdit, onDelete, employeeId }) {
  const photos = item.image_urls?.length ? item.image_urls : item.image_url ? [item.image_url] : [];
  return (
    <div className="rounded-xl border border-stone-200 overflow-hidden">
      <div className={`grid ${photos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-0.5 bg-stone-100`}>
        {photos.slice(0, 4).map((src, i) => (
          <img key={`${src}-${i}`} src={src} alt={item.title} className="h-32 w-full object-cover" />
        ))}
      </div>
      <div className="p-3 space-y-1.5">
        <EmployeeIdBadge employeeId={employeeId} workerId={item.worker_id} className="mb-1" />
        <p className="font-semibold text-navy">{item.title}</p>
        <p className="text-xs text-stone-600 capitalize">
          {item.vehicle_type} · {item.rental_mode?.replace('_', ' ')}
        </p>
        <p className="text-sm text-gold font-medium">{formatVehicleCostLabel(item)}</p>
        {formatVehicleKmDetails(item) && (
          <p className="text-xs text-stone-500">{formatVehicleKmDetails(item)}</p>
        )}
        {item.description && <p className="text-xs text-stone-600 line-clamp-2">{item.description}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => onEdit(item)} className="inline-flex items-center gap-1 text-xs text-navy font-medium">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button type="button" onClick={() => onDelete(item.id)} className="inline-flex items-center gap-1 text-xs text-red-600">
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function MaterialListingCard({ item, onEdit, onDelete, employeeId }) {
  return (
    <div className="rounded-xl border border-stone-200 overflow-hidden">
      <img src={item.image_url} alt={item.title} className="h-40 w-full object-cover" />
      <div className="p-3 space-y-1.5">
        <EmployeeIdBadge employeeId={employeeId} workerId={item.worker_id} className="mb-1" />
        <p className="font-semibold text-navy">{item.material_type || item.title}</p>
        <p className="text-sm text-gold font-medium">{formatMaterialListingRate(item)}</p>
        {item.description && <p className="text-xs text-stone-600 line-clamp-2">{item.description}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => onEdit(item)} className="inline-flex items-center gap-1 text-xs text-navy font-medium">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button type="button" onClick={() => onDelete(item.id)} className="inline-flex items-center gap-1 text-xs text-red-600">
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkerListingsPanel({ listings: initial = [], onChange, categoryId, employeeId }) {
  const isVehicle = categoryId === 'rental-vehicle';
  const isMaterial = categoryId === 'building-material';

  const [listings, setListings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm);
  const [materialForm, setMaterialForm] = useState(emptyMaterialForm);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [keptImageUrls, setKeptImageUrls] = useState([]);
  const [image, setImage] = useState(null);

  const refresh = async () => {
    const { data } = await api.get('/workers/me/listings');
    setListings(data.listings || []);
    onChange?.(data.listings || []);
  };

  const resetForms = () => {
    setEditId(null);
    setVehicleForm(emptyVehicleForm);
    setMaterialForm(emptyMaterialForm);
    setNewImages([]);
    setNewImagePreviews([]);
    setKeptImageUrls([]);
    setImage(null);
  };

  const totalVehicleImages = keptImageUrls.length + newImages.length;

  const handleVehicleImages = (files) => {
    const incoming = Array.from(files || []);
    if (!incoming.length) return;

    const room = MAX_LISTING_IMAGES - totalVehicleImages;
    if (room <= 0) {
      window.alert('Up to 4 images allowed');
      return;
    }

    if (incoming.length > room) {
      window.alert('Up to 4 images allowed');
    }

    const accepted = incoming.slice(0, room);
    setNewImages((prev) => [...prev, ...accepted]);
    setNewImagePreviews((prev) => [
      ...prev,
      ...accepted.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      const copy = [...prev];
      if (copy[index]) URL.revokeObjectURL(copy[index]);
      return copy.filter((_, i) => i !== index);
    });
  };

  const removeKeptImage = (index) => {
    setKeptImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setImage(null);
    setNewImages([]);
    setNewImagePreviews([]);
    setKeptImageUrls(item.image_urls?.length ? [...item.image_urls] : item.image_url ? [item.image_url] : []);
    if (item.listing_kind === 'vehicle' || isVehicle) {
      setVehicleForm({
        vehicle_type: item.vehicle_type || 'car',
        rental_mode: item.rental_mode || 'self_drive',
        driver_fuel_option: item.driver_fuel_option || 'with_fuel',
        model_year: item.model_year != null ? String(item.model_year) : '',
        company_name: item.company_name || '',
        model_name: item.model_name || '',
        rate_amount: item.rate_amount != null ? String(item.rate_amount) : '',
        price_type: item.price_type || 'daily',
        included_km: item.included_km != null ? String(item.included_km) : '',
        extra_km_rate: item.extra_km_rate != null ? String(item.extra_km_rate) : '',
        fuel_cost_per_km: item.fuel_cost_per_km != null ? String(item.fuel_cost_per_km) : '',
        description: item.description || '',
      });
    } else {
      setMaterialForm({
        material_type: resolveBuildingMaterial(item.material_type || item.title)?.value || '',
        rate_amount: item.rate_amount != null ? String(item.rate_amount) : '',
        description: item.description || '',
      });
    }
  };

  const validateVehicle = () => {
    const year = parseInt(vehicleForm.model_year, 10);
    const rate = parseFloat(vehicleForm.rate_amount);
    const isWithDriver = vehicleForm.rental_mode === 'with_driver';
    const withFuel = vehicleForm.driver_fuel_option === 'with_fuel';

    if (!vehicleForm.company_name.trim()) return 'Company name is required';
    if (!vehicleForm.model_name.trim()) return 'Model name is required';
    if (!Number.isFinite(year) || year < 1990) return 'Valid model year is required';
    if (!Number.isFinite(rate) || rate <= 0) return 'Valid cost is required';

    if (!isWithDriver || withFuel) {
      const extraKm = parseFloat(vehicleForm.extra_km_rate);
      const includedKm = vehicleForm.included_km !== '' ? parseInt(vehicleForm.included_km, 10) : NaN;
      if (!Number.isFinite(includedKm) || includedKm < 0) return 'Included km is required';
      if (!Number.isFinite(extraKm) || extraKm < 0) return 'Extra km rate after included km is required';
    }

    if (isWithDriver && !withFuel) {
      const fuelKm = parseFloat(vehicleForm.fuel_cost_per_km);
      if (!Number.isFinite(fuelKm) || fuelKm < 0) return 'Fuel cost per km is required';
    }

    if (totalVehicleImages < 1) return 'Add at least one vehicle photo';
    if (totalVehicleImages > MAX_LISTING_IMAGES) return 'Up to 4 images allowed';
    return null;
  };

  const validateMaterial = () => {
    const rate = parseFloat(materialForm.rate_amount);
    const mat = resolveBuildingMaterial(materialForm.material_type);
    if (!mat) return 'Please select a material type';
    if (!Number.isFinite(rate) || rate <= 0) return 'Valid rate is required';
    if (!editId && !image) return 'Material photo is required';
    return null;
  };

  const selectedMaterial = resolveBuildingMaterial(materialForm.material_type);
  const materialRatePlaceholder = selectedMaterial?.price_type === 'per_bag'
    ? 'Cost per bag (₹) *'
    : 'Cost per trolley (₹) *';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = isVehicle ? validateVehicle() : validateMaterial();
    if (err) return toast.error(err);

    setSaving(true);
    try {
      const fd = new FormData();
      if (isVehicle) {
        fd.append('vehicle_type', vehicleForm.vehicle_type);
        fd.append('rental_mode', vehicleForm.rental_mode);
        if (vehicleForm.rental_mode === 'with_driver') {
          fd.append('driver_fuel_option', vehicleForm.driver_fuel_option);
        }
        fd.append('model_year', vehicleForm.model_year);
        fd.append('company_name', vehicleForm.company_name.trim());
        fd.append('model_name', vehicleForm.model_name.trim());
        fd.append('rate_amount', vehicleForm.rate_amount);
        fd.append('price_type', vehicleForm.price_type);
        if (vehicleForm.rental_mode === 'self_drive' || vehicleForm.driver_fuel_option === 'with_fuel') {
          fd.append('included_km', vehicleForm.included_km);
          fd.append('extra_km_rate', vehicleForm.extra_km_rate);
        }
        if (vehicleForm.rental_mode === 'with_driver' && vehicleForm.driver_fuel_option === 'without_fuel') {
          fd.append('fuel_cost_per_km', vehicleForm.fuel_cost_per_km);
        }
        fd.append('description', vehicleForm.description.trim());
        newImages.forEach((file) => fd.append('listing_images', file));
        if (editId) fd.append('keep_image_urls', JSON.stringify(keptImageUrls));
      } else {
        const mat = resolveBuildingMaterial(materialForm.material_type);
        if (!mat) return toast.error('Please select a material type');
        fd.append('material_type', mat.label);
        fd.append('title', mat.label);
        fd.append('price_type', mat.price_type);
        fd.append('rate_amount', materialForm.rate_amount);
        fd.append('description', materialForm.description.trim());
        if (image) fd.append('listing_image', image);
      }

      if (editId) {
        await api.put(`/workers/me/listings/${editId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Updated');
      } else {
        await api.post('/workers/me/listings', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(isVehicle ? 'Vehicle added' : 'Material added');
      }
      resetForms();
      await refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/workers/me/listings/${id}`);
      toast.success('Deleted');
      if (editId === id) resetForms();
      await refresh();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (!isVehicle && !isMaterial) return null;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-md p-5 sm:p-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
          {isVehicle ? <Car className="h-5 w-5 text-gold" /> : <Package className="h-5 w-5 text-gold" />}
          {isVehicle ? 'Your vehicles' : 'Your materials'}
        </h2>
      </div>

      {listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listings.map((item) =>
            isVehicle || item.listing_kind === 'vehicle' ? (
              <VehicleListingCard key={item.id} item={item} onEdit={startEdit} onDelete={handleDelete} employeeId={employeeId} />
            ) : (
              <MaterialListingCard key={item.id} item={item} onEdit={startEdit} onDelete={handleDelete} employeeId={employeeId} />
            )
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-dashed border-gold/40 p-4 space-y-4">
        <p className="text-sm font-semibold text-navy flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {editId ? (isVehicle ? 'Edit vehicle' : 'Edit material') : isVehicle ? 'Add vehicle' : 'Add material'}
        </p>

        {isVehicle ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-navy font-medium">Vehicle type *</span>
                <select
                  value={vehicleForm.vehicle_type}
                  onChange={(e) => setVehicleForm((p) => ({ ...p, vehicle_type: e.target.value }))}
                  className="input-field mt-1"
                >
                  {VEHICLE_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-navy font-medium">Rental type *</span>
                <select
                  value={vehicleForm.rental_mode}
                  onChange={(e) => {
                    const rental_mode = e.target.value;
                    setVehicleForm((p) => ({
                      ...p,
                      rental_mode,
                      driver_fuel_option: rental_mode === 'with_driver' ? p.driver_fuel_option || 'with_fuel' : 'with_fuel',
                    }));
                  }}
                  className="input-field mt-1"
                >
                  {RENTAL_MODES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              {vehicleForm.rental_mode === 'with_driver' && (
                <label className="block text-sm sm:col-span-2">
                  <span className="text-navy font-medium">With-driver package *</span>
                  <select
                    value={vehicleForm.driver_fuel_option}
                    onChange={(e) => setVehicleForm((p) => ({ ...p, driver_fuel_option: e.target.value }))}
                    className="input-field mt-1"
                  >
                    {DRIVER_FUEL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
              )}
              <input
                placeholder="Company (e.g. Maruti Suzuki) *"
                value={vehicleForm.company_name}
                onChange={(e) => setVehicleForm((p) => ({ ...p, company_name: e.target.value }))}
                className="input-field"
                required
              />
              <input
                placeholder="Model (e.g. Zen) *"
                value={vehicleForm.model_name}
                onChange={(e) => setVehicleForm((p) => ({ ...p, model_name: e.target.value }))}
                className="input-field"
                required
              />
              <input
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                placeholder="Model year (e.g. 2010) *"
                value={vehicleForm.model_year}
                onChange={(e) => setVehicleForm((p) => ({ ...p, model_year: e.target.value }))}
                className="input-field"
                required
              />
              <select
                value={vehicleForm.price_type}
                onChange={(e) => setVehicleForm((p) => ({ ...p, price_type: e.target.value }))}
                className="input-field"
              >
                {LISTING_PRICE_TYPES.filter((o) => ['daily', 'monthly', 'per_trip'].includes(o.value)).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder={
                  vehicleForm.rental_mode === 'with_driver'
                    ? vehicleForm.driver_fuel_option === 'with_fuel'
                      ? 'Driver + vehicle + fuel cost (₹) *'
                      : 'Driver + vehicle cost (₹) *'
                    : 'Self-drive cost (₹) *'
                }
                value={vehicleForm.rate_amount}
                onChange={(e) => setVehicleForm((p) => ({ ...p, rate_amount: e.target.value }))}
                className="input-field sm:col-span-2"
                required
              />
              {(vehicleForm.rental_mode === 'self_drive' ||
                vehicleForm.driver_fuel_option === 'with_fuel') && (
                <>
                  <input
                    type="number"
                    min="0"
                    placeholder="Included km (e.g. 200) *"
                    value={vehicleForm.included_km}
                    onChange={(e) => setVehicleForm((p) => ({ ...p, included_km: e.target.value }))}
                    className="input-field"
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Extra ₹/km after included km (e.g. 12) *"
                    value={vehicleForm.extra_km_rate}
                    onChange={(e) => setVehicleForm((p) => ({ ...p, extra_km_rate: e.target.value }))}
                    className="input-field"
                    required
                  />
                </>
              )}
              {vehicleForm.rental_mode === 'with_driver' &&
                vehicleForm.driver_fuel_option === 'without_fuel' && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Fuel cost per km (₹/km) *"
                    value={vehicleForm.fuel_cost_per_km}
                    onChange={(e) => setVehicleForm((p) => ({ ...p, fuel_cost_per_km: e.target.value }))}
                    className="input-field sm:col-span-2"
                    required
                  />
                )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-sm sm:col-span-2">
              <span className="text-navy font-medium">Material type *</span>
              <select
                value={materialForm.material_type}
                onChange={(e) => setMaterialForm((p) => ({ ...p, material_type: e.target.value }))}
                className="input-field mt-1"
                required
              >
                <option value="">Select material</option>
                {BUILDING_MATERIAL_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>
            <input
              type="number"
              min="1"
              placeholder={materialRatePlaceholder}
              value={materialForm.rate_amount}
              onChange={(e) => setMaterialForm((p) => ({ ...p, rate_amount: e.target.value }))}
              className="input-field sm:col-span-2"
              required
              disabled={!materialForm.material_type}
            />
          </div>
        )}

        <textarea
          placeholder="Short description (optional)"
          value={isVehicle ? vehicleForm.description : materialForm.description}
          onChange={(e) =>
            isVehicle
              ? setVehicleForm((p) => ({ ...p, description: e.target.value }))
              : setMaterialForm((p) => ({ ...p, description: e.target.value }))
          }
          rows={2}
          className="input-field w-full resize-y"
        />
        {isVehicle ? (
          <>
            <ImageCaptureInput
              label={`Vehicle photos * (${totalVehicleImages}/${MAX_LISTING_IMAGES})`}
              required={totalVehicleImages < 1}
              multiple
              captureFacing="environment"
              onChange={handleVehicleImages}
            />
            {(keptImageUrls.length > 0 || newImagePreviews.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {keptImageUrls.map((src, i) => (
                  <div key={`keep-${src}`} className="relative">
                    <img src={src} alt="" className="h-16 w-16 rounded-lg object-cover border" />
                    <button
                      type="button"
                      onClick={() => removeKeptImage(i)}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {newImagePreviews.map((src, i) => (
                  <div key={`new-${src}`} className="relative">
                    <img src={src} alt="" className="h-16 w-16 rounded-lg object-cover border" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <ImageCaptureInput
            label={editId ? 'Replace photo (optional)' : 'Photo *'}
            required={!editId}
            captureFacing="environment"
            onChange={(files) => setImage(files[0] || null)}
          />
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-navy disabled:opacity-60"
          >
            <IndianRupee className="h-4 w-4" />
            {saving ? 'Saving…' : editId ? 'Update' : isVehicle ? 'Add vehicle' : 'Add material'}
          </button>
          {editId && (
            <button type="button" onClick={resetForms} className="px-4 py-2 text-sm font-medium text-navy border border-stone-300 rounded-lg">
              Cancel edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
