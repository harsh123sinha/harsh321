import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  User,
  Mail,
  Phone,
  FileImage,
  Clock,
  Calendar,
  IndianRupee,
  Save,
  AlertCircle,
  CheckCircle2,
  Search,
  ChevronDown,
  Check,
  BadgeCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { isValidIndianMobile } from '../../utils/helpers';
import {
  WORKER_OFF_DAYS,
  findCategoryIdByProfession,
  getCategoryLabelByProfession,
  getProfessionsByCategoryId,
  WORKER_PRICE_TYPES,
  formatWorkerPrice,
  filterCategoriesBySearch,
  shouldShowSubcategoryStepForProfile,
  getCategoryById,
} from '../../constants/workerProfessions';
import { formatEmployeeId } from '../../utils/helpers';
import {
  shouldShowProfilePricing,
  shouldShowStandardIdDocs,
  shouldShowMarriageHallFields,
  canManageListings,
} from '../../constants/workerProfileTypes';
import ImageCaptureInput from '../../components/common/ImageCaptureInput';
import WorkerListingsPanel from '../../components/workers/WorkerListingsPanel';
import LocationSearchCombobox from '../../components/search/LocationSearchCombobox';
import { useAreaOptions } from '../../hooks/useAreas';

const JOB_RED = 'rgb(149, 0, 0)';

const emptyForm = {
  name: '',
  email: '',
  phone_number: '',
  profession: '',
  description: '',
  service_area: '',
  working_hours_per_day: '',
  off_day: '',
  price_type: 'daily',
  price_amount: '',
  area_sqft: '',
  outside_caterers_allowed: '',
  hall_booking_cost: '',
  veg_platter_cost: '',
  nonveg_platter_cost: '',
};

export default function WorkerDashboard() {
  const { user, setUser } = useAuth();
  const { pickOptions: areaOptions } = useAreaOptions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [worker, setWorker] = useState(null);
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [workerPhoto, setWorkerPhoto] = useState(null);
  const [aadharPhoto, setAadharPhoto] = useState(null);
  const [hallPhoto, setHallPhoto] = useState(null);
  const [workerPhotoPreview, setWorkerPhotoPreview] = useState('');
  const [aadharPreview, setAadharPreview] = useState('');
  const [hallPreview, setHallPreview] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [professionCategory, setProfessionCategory] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const filteredCategories = useMemo(() => filterCategoriesBySearch(categorySearch), [categorySearch]);
  const categoryProfessions = getProfessionsByCategoryId(professionCategory);
  const showSubcategory = professionCategory && shouldShowSubcategoryStepForProfile(professionCategory);
  const isMarriageHall = shouldShowMarriageHallFields(form.profession);
  const isListingVendor = canManageListings(form.profession, professionCategory);
  const showIdDocs = shouldShowStandardIdDocs(form.profession, professionCategory);
  const showPricing = shouldShowProfilePricing(form.profession, professionCategory);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/workers/me');
        if (cancelled) return;
        const w = data.worker;
        setWorker(w);
        setListings(data.listings || []);
        setProfileComplete(Boolean(data.profile_complete));
        setForm({
          name: w?.name || user?.name || '',
          email: w?.email || user?.email || '',
          phone_number: w?.phone_number || user?.phone_number || '',
          profession: w?.profession || '',
          description: w?.description || '',
          service_area: w?.service_area || '',
          working_hours_per_day: w?.working_hours_per_day != null ? String(w.working_hours_per_day) : '',
          off_day: w?.off_day || '',
          price_type: w?.price_type || 'daily',
          price_amount: w?.price_amount != null ? String(w.price_amount) : w?.price_per_day != null ? String(w.price_per_day) : '',
          area_sqft: w?.area_sqft != null ? String(w.area_sqft) : '',
          outside_caterers_allowed: w?.outside_caterers_allowed != null ? String(w.outside_caterers_allowed) : '',
          hall_booking_cost: w?.hall_booking_cost != null ? String(w.hall_booking_cost) : '',
          veg_platter_cost: w?.veg_platter_cost != null ? String(w.veg_platter_cost) : '',
          nonveg_platter_cost: w?.nonveg_platter_cost != null ? String(w.nonveg_platter_cost) : '',
        });
        setProfessionCategory(data.category_id || findCategoryIdByProfession(w?.profession));
        setWorkerPhotoPreview(w?.worker_image_url || '');
        setAadharPreview(w?.aadhar_image_url || '');
        setHallPreview(w?.hall_image_url || '');
        setEditMode(!data.profile_complete);
        if (!data.category_id && !findCategoryIdByProfession(w?.profession)) {
          setCategoryPickerOpen(true);
        }
      } catch {
        if (!cancelled) {
          setForm({ ...emptyForm, name: user?.name || '', email: user?.email || '', phone_number: user?.phone_number || '' });
          setEditMode(true);
          setCategoryPickerOpen(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const selectCategory = (categoryId) => {
    const professions = getProfessionsByCategoryId(categoryId);
    setProfessionCategory(categoryId);
    setForm((prev) => ({
      ...prev,
      profession: professions.length === 1 ? professions[0] : professions[0] || '',
    }));
    setCategoryPickerOpen(false);
    setCategorySearch('');
  };

  const selectProfession = (profession) => {
    setForm((prev) => ({ ...prev, profession }));
  };

  const selectedCategoryLabel = professionCategory ? getCategoryById(professionCategory)?.label : '';

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!isValidIndianMobile(form.phone_number)) return 'Valid 10-digit mobile number is required';
    if (!professionCategory) return 'Please select a service category';
    if (!form.profession) return 'Please select your profession';
    if (!form.description.trim()) return 'Description is required';
    if (!form.service_area.trim()) return 'Service area is required';

    if (isMarriageHall) {
      const area = parseFloat(form.area_sqft);
      const cost = parseFloat(form.hall_booking_cost);
      if (!Number.isFinite(area) || area <= 0) return 'Hall area in sq ft is required';
      if (form.outside_caterers_allowed === '') return 'Please specify if outside caterers are allowed';
      if (!Number.isFinite(cost) || cost <= 0) return 'Hall booking cost is required';
      const veg = parseFloat(form.veg_platter_cost);
      const nonveg = parseFloat(form.nonveg_platter_cost);
      const hasVeg = Number.isFinite(veg) && veg > 0;
      const hasNonveg = Number.isFinite(nonveg) && nonveg > 0;
      if (!hasVeg && !hasNonveg) return 'Enter veg and/or non-veg platter cost (per plate)';
      if (!hallPhoto && !worker?.hall_image_url) return 'Marriage hall / garden image is required';
      return null;
    }

    if (isListingVendor) {
      if (!workerPhoto && !worker?.worker_image_url) return 'Business / profile photo is required';
      return null;
    }

    const hours = parseFloat(form.working_hours_per_day);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) return 'Working hours must be between 0.5 and 24 per day';
    if (!form.off_day) return 'Please select your off day';

    if (showPricing) {
      if (!form.price_type) return 'Please select daily or monthly pricing';
      const price = parseFloat(form.price_amount);
      if (!Number.isFinite(price) || price <= 0) {
        return form.price_type === 'monthly' ? 'Monthly price must be greater than 0' : 'Daily price must be greater than 0';
      }
    }

    if (showIdDocs) {
      if (!workerPhoto && !worker?.worker_image_url) return 'Employee photo is required';
      if (!aadharPhoto && !worker?.aadhar_image_url) return 'Aadhar card image is required';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('email', form.email.trim());
      fd.append('phone_number', form.phone_number.trim());
      fd.append('profession', form.profession);
      fd.append('category_id', professionCategory);
      fd.append('description', form.description.trim());
      fd.append('service_area', form.service_area.trim());

      if (isMarriageHall) {
        fd.append('area_sqft', form.area_sqft);
        fd.append('outside_caterers_allowed', form.outside_caterers_allowed);
        fd.append('hall_booking_cost', form.hall_booking_cost);
        if (form.veg_platter_cost) fd.append('veg_platter_cost', form.veg_platter_cost);
        if (form.nonveg_platter_cost) fd.append('nonveg_platter_cost', form.nonveg_platter_cost);
        if (hallPhoto) fd.append('hall_photo', hallPhoto);
      } else if (isListingVendor) {
        if (workerPhoto) fd.append('worker_photo', workerPhoto);
      } else {
        fd.append('working_hours_per_day', form.working_hours_per_day);
        fd.append('off_day', form.off_day);
        if (showPricing) {
          fd.append('price_type', form.price_type);
          fd.append('price_amount', form.price_amount);
        }
        if (workerPhoto) fd.append('worker_photo', workerPhoto);
        if (aadharPhoto) fd.append('aadhar_image', aadharPhoto);
      }

      const { data } = await api.put('/workers/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setWorker(data.worker);
      setListings(data.listings || []);
      setProfileComplete(true);
      setEditMode(false);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray">Loading your profile…</p>
      </div>
    );
  }

  const showForm = editMode || !profileComplete;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="h-8 w-8" style={{ color: JOB_RED }} />
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Employee Profile</h1>
          </div>
          <p className="text-gray">Welcome, {user?.name}!</p>
        </div>

        {!profileComplete && (
          <div className="mb-6 flex gap-3 rounded-xl border p-4" style={{ borderColor: JOB_RED, backgroundColor: 'rgba(149, 0, 0, 0.06)' }}>
            <AlertCircle className="h-6 w-6 shrink-0" style={{ color: JOB_RED }} />
            <div>
              <p className="font-semibold text-navy">Complete your profile</p>
            </div>
          </div>
        )}

        {profileComplete && !showForm && worker && (
          <ProfileView worker={worker} onEdit={() => setEditMode(true)} />
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-5 sm:p-8 space-y-5">
            <h2 className="text-lg font-bold text-navy">{profileComplete ? 'Edit profile' : 'Complete your profile'}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full name *" icon={User}>
                <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
              </Field>
              <Field label="Email *" icon={Mail}>
                <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field" />
              </Field>
              <Field label="Mobile number *" icon={Phone}>
                <input name="phone_number" value={form.phone_number} onChange={handleChange} required maxLength={10} className="input-field" />
              </Field>
            </div>

            <div className="rounded-xl border border-gold/25 bg-gold/5 p-4 space-y-4">
              <p className="text-sm font-semibold text-navy">Service type *</p>

              {/* Step 1 — tap to open full category list */}
              <div>
                <p className="text-sm font-medium text-navy mb-2 flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-gold" />
                  Step 1 — Choose category
                </p>
                <button
                  type="button"
                  onClick={() => setCategoryPickerOpen((open) => !open)}
                  className={`input-field flex items-center justify-between gap-2 text-left w-full ${
                    professionCategory ? 'border-gold/50 bg-white' : ''
                  }`}
                >
                  <span className={professionCategory ? 'text-navy font-medium' : 'text-stone-500'}>
                    {selectedCategoryLabel || 'Tap to see all categories'}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${
                      categoryPickerOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {categoryPickerOpen && (
                  <div className="mt-2 rounded-lg border border-stone-200 bg-white overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-stone-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <input
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Search category…"
                          className="w-full pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filteredCategories.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-stone-500 text-center">No category found.</p>
                      ) : (
                        filteredCategories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => selectCategory(cat.id)}
                            className={`w-full text-left px-4 py-3 text-sm border-b border-stone-50 flex items-center justify-between gap-2 hover:bg-gold/5 transition-colors ${
                              professionCategory === cat.id ? 'bg-gold/10 font-semibold text-navy' : 'text-stone-700'
                            }`}
                          >
                            <span>{cat.label}</span>
                            {professionCategory === cat.id && <Check className="h-4 w-4 text-gold shrink-0" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2 — profession list (only when category has multiple options) */}
              {professionCategory && showSubcategory && (
                <div>
                  <p className="text-sm font-medium text-navy mb-2 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-gold" />
                    Step 2 — Choose profession
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categoryProfessions.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => selectProfession(p)}
                        className={`rounded-lg border-2 px-3 py-2.5 text-left text-sm transition-colors ${
                          form.profession === p
                            ? 'border-gold bg-gold/15 font-semibold text-navy'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-gold/40'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {professionCategory && !showSubcategory && form.profession && (
                <p className="text-sm text-stone-600">
                  Service: <span className="font-medium text-navy">{selectedCategoryLabel || form.profession}</span>
                </p>
              )}
            </div>

            {isMarriageHall && (
              <>
                <ImageCaptureInput
                  label="Marriage hall / garden image"
                  required
                  captureFacing="environment"
                  previewUrl={hallPreview}
                  onChange={(files) => {
                    const f = files[0];
                    if (!f) return;
                    setHallPhoto(f);
                    setHallPreview(URL.createObjectURL(f));
                  }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Area (sq ft) *" icon={Briefcase}>
                    <input name="area_sqft" type="number" min="1" value={form.area_sqft} onChange={handleChange} required className="input-field" />
                  </Field>
                  <Field label="Hall booking cost (₹) *" icon={IndianRupee}>
                    <input name="hall_booking_cost" type="number" min="1" value={form.hall_booking_cost} onChange={handleChange} required className="input-field" />
                  </Field>
                  <Field label="Outside caterers allowed? *" icon={Briefcase}>
                    <select name="outside_caterers_allowed" value={form.outside_caterers_allowed} onChange={handleChange} required className="input-field">
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </Field>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
                  <p className="text-sm font-semibold text-navy">Catering — per plate cost</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Veg platter cost (₹ / plate)" icon={IndianRupee}>
                      <input
                        name="veg_platter_cost"
                        type="number"
                        min="1"
                        value={form.veg_platter_cost}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g. 350"
                      />
                    </Field>
                    <Field label="Non-veg platter cost (₹ / plate)" icon={IndianRupee}>
                      <input
                        name="nonveg_platter_cost"
                        type="number"
                        min="1"
                        value={form.nonveg_platter_cost}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g. 450"
                      />
                    </Field>
                  </div>
                </div>
              </>
            )}

            {isListingVendor && (
              <ImageCaptureInput
                label="Business / profile photo"
                required
                captureFacing="environment"
                previewUrl={workerPhotoPreview}
                previewShape="circle"
                onChange={(files) => {
                  const f = files[0];
                  if (!f) return;
                  setWorkerPhoto(f);
                  setWorkerPhotoPreview(URL.createObjectURL(f));
                }}
              />
            )}

            {showIdDocs && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageCaptureInput label="Your photo" required captureFacing="user" previewUrl={workerPhotoPreview} previewShape="circle" onChange={(files) => { const f = files[0]; if (f) { setWorkerPhoto(f); setWorkerPhotoPreview(URL.createObjectURL(f)); } }} />
                <ImageCaptureInput label="Aadhar card image" required captureFacing="environment" previewUrl={aadharPreview} onChange={(files) => { const f = files[0]; if (f) { setAadharPhoto(f); setAadharPreview(URL.createObjectURL(f)); } }} />
              </div>
            )}

            <Field label="Short description *" icon={Briefcase}>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="input-field resize-y" />
            </Field>

            <Field label="Service area / location *" icon={Search}>
              <div className="rounded-lg border-2 border-gray-light bg-white px-2 py-1">
                <LocationSearchCombobox
                  value={form.service_area}
                  onChange={(v) => setForm((prev) => ({ ...prev, service_area: v }))}
                  options={areaOptions}
                  triggerClassName="w-full px-2 py-2 text-left text-sm"
                  tone="light"
                  dropUp
                  emptyLabel="Select service area"
                />
              </div>
            </Field>

            {!isMarriageHall && !isListingVendor && (
              <>
                {showPricing && (
                  <div className="rounded-xl border border-gold/25 bg-gold/5 p-4 space-y-4">
                    <p className="text-sm font-semibold text-navy">Your charges *</p>
                    <Field label="Payment type" icon={IndianRupee}>
                      <div className="flex flex-wrap gap-3">
                        {WORKER_PRICE_TYPES.map((opt) => (
                          <label key={opt.value} className={`inline-flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 cursor-pointer text-sm font-medium ${form.price_type === opt.value ? 'border-gold bg-gold/15 text-navy' : 'border-gray-light bg-white text-gray'}`}>
                            <input type="radio" name="price_type" value={opt.value} checked={form.price_type === opt.value} onChange={handleChange} />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </Field>
                    <Field label={form.price_type === 'monthly' ? 'Monthly charges (₹) *' : 'Daily rate (₹) *'} icon={IndianRupee}>
                      <input name="price_amount" type="number" min="1" value={form.price_amount} onChange={handleChange} required className="input-field" />
                    </Field>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Working hours/day *" icon={Clock}>
                    <input name="working_hours_per_day" type="number" min="0.5" max="24" step="0.5" value={form.working_hours_per_day} onChange={handleChange} required className="input-field" />
                  </Field>
                  <Field label="Off day *" icon={Calendar}>
                    <select name="off_day" value={form.off_day} onChange={handleChange} required className="input-field">
                      <option value="">Select off day</option>
                      {WORKER_OFF_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                </div>
              </>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium disabled:opacity-60" style={{ backgroundColor: JOB_RED }}>
                <Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save profile'}
              </button>
              {profileComplete && (
                <button type="button" onClick={() => setEditMode(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 text-navy font-medium">Cancel</button>
              )}
            </div>
          </form>
        )}

        {profileComplete && !showForm && worker?.profile_type === 'listing_vendor' && (
          <WorkerListingsPanel
            listings={listings}
            onChange={setListings}
            categoryId={professionCategory || findCategoryIdByProfession(worker?.profession)}
            employeeId={worker?.employee_id}
          />
        )}
      </div>
      <style>{`.input-field{width:100%;border:1px solid #d1d5db;border-radius:0.5rem;padding:0.625rem 0.75rem;font-size:0.875rem;outline:none}.input-field:focus{border-color:rgb(149,0,0);box-shadow:0 0 0 2px rgba(149,0,0,0.15)}`}</style>
    </div>
  );
}

function ProfileView({ worker, onEdit }) {
  const isHall = worker.profile_type === 'marriage_hall';
  const img = isHall ? worker.hall_image_url : worker.worker_image_url;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center gap-4">
        {img && <img src={img} alt={worker.name} className={`${isHall ? 'w-full max-w-xs h-32 rounded-xl' : 'w-24 h-24 rounded-full'} object-cover border-4 border-gold/30`} />}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-navy">{worker.name}</h2>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-gold font-medium">{worker.profession}</p>
          {getCategoryLabelByProfession(worker.profession) && <p className="text-sm text-gray">{getCategoryLabelByProfession(worker.profession)}</p>}
          <p className="text-sm text-gray mt-1">{worker.description}</p>
        </div>
        <button type="button" onClick={onEdit} className="px-4 py-2 rounded-lg text-white text-sm font-medium shrink-0" style={{ backgroundColor: JOB_RED }}>Edit Profile</button>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {(worker.employee_id || worker.id) && (
          <ProfileRow
            icon={BadgeCheck}
            label="Your Employee ID"
            value={worker.employee_id || formatEmployeeId(worker.id)}
          />
        )}
        <ProfileRow icon={Mail} label="Email" value={worker.email} />
        <ProfileRow icon={Phone} label="Your mobile" value={worker.phone_number} />
        {isHall ? (
          <>
            <ProfileRow icon={Briefcase} label="Area" value={`${Number(worker.area_sqft).toLocaleString('en-IN')} sq ft`} />
            <ProfileRow icon={IndianRupee} label="Hall booking" value={`₹${Number(worker.hall_booking_cost).toLocaleString('en-IN')}`} />
            {worker.veg_platter_cost != null && (
              <ProfileRow icon={IndianRupee} label="Veg platter" value={`₹${Number(worker.veg_platter_cost).toLocaleString('en-IN')} / plate`} />
            )}
            {worker.nonveg_platter_cost != null && (
              <ProfileRow icon={IndianRupee} label="Non-veg platter" value={`₹${Number(worker.nonveg_platter_cost).toLocaleString('en-IN')} / plate`} />
            )}
            <ProfileRow icon={Briefcase} label="Outside caterers" value={worker.outside_caterers_allowed ? 'Allowed' : 'Not allowed'} />
          </>
        ) : worker.profile_type !== 'listing_vendor' ? (
          <>
            {worker.working_hours_per_day && <ProfileRow icon={Clock} label="Working hours" value={`${worker.working_hours_per_day} hrs/day`} />}
            {worker.off_day && <ProfileRow icon={Calendar} label="Off day" value={worker.off_day} />}
            <ProfileRow icon={IndianRupee} label="Your charges" value={formatWorkerPrice(worker) || 'Contact for pricing'} />
          </>
        ) : null}
      </div>
      {worker.aadhar_image_url && (
        <div className="px-6 pb-6">
          <p className="text-sm font-medium text-navy mb-2 flex items-center gap-2"><FileImage className="h-4 w-4" /> Aadhar card</p>
          <img src={worker.aadhar_image_url} alt="Aadhar" className="max-h-48 rounded-lg border object-contain" />
        </div>
      )}
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-medium text-navy mb-1.5"><Icon className="h-4 w-4 text-gold" />{label}</span>
      {children}
    </label>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-gold mt-0.5 shrink-0" />
      <div><p className="text-gray text-xs">{label}</p><p className="text-navy font-medium">{value}</p></div>
    </div>
  );
}
