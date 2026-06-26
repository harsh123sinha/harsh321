import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  ADD_PROPERTY_CATEGORIES,
  mapAddPropertyToApiType,
} from '../../utils/propertyListingMap';
import { SHOP_SQFT_RANGES, FURNISHING_OPTIONS, ROAD_NO_SUGGESTIONS } from '../../constants/propertyForm';
import {
  CONTACT_VALIDATED_FIELDS,
  getContactFieldError,
  fieldErrorClass,
} from '../../utils/contactValidation';
import {
  NO_NUMBERS_FIELDS,
  NO_NUMBERS_MESSAGE,
  containsDigit,
  stripDigits,
  isDigitKey,
} from '../../utils/noNumbersValidation';
import FieldHint from '../../components/common/FieldHint';
import { validateAddPropertyForm } from '../../utils/validateAddPropertyForm';
import {
  sanitizeRoadNoInput,
  getRoadNoFieldError,
  isDigitKey as isRoadNoDigitKey,
} from '../../utils/roadNoValidation';
import ListingVerificationOverlay from '../../components/properties/ListingVerificationOverlay';

const inputClass = (err) =>
  `w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${fieldErrorClass(err)}`;

const AddProperty = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'homes',
    transaction: 'rent',
    plotTransaction: 'lease',
    otherDescription: '',
    bhk: '',
    katha: '',
    location: '',
    road_no: '',
    city: '',
    balconies: '',
    bathrooms: '',
    garden: false,
    car_parking: false,
    bike_parking: false,
    no_parking: false,
    floor_no: '',
    shopSqftRange: '',
    shopRoadDistance: '',
    shopTokenAmount: '',
    furnishing: '',
    featured: false,
  });
  const [kathaPreset, setKathaPreset] = useState('1');
  const [kathaDecimal, setKathaDecimal] = useState('');
  const [images, setImages] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitPhase, setSubmitPhase] = useState(null);
  const [pendingReviewResult, setPendingReviewResult] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isPlot = formData.category === 'plot';
  const isOther = formData.category === 'other';
  const isShop = formData.category === 'shop';
  const showBhkAndAmenities = !isPlot && !isOther;
  const showFurnishing =
    showBhkAndAmenities &&
    !isShop &&
    (formData.category === 'homes' || formData.category === 'flat' || formData.category === 'apartment');

  const handleRoadNoChange = (e) => {
    const cleaned = sanitizeRoadNoInput(e.target.value);
    setFormData((prev) => ({ ...prev, road_no: cleaned }));
    setFieldErrors((prev) => ({
      ...prev,
      road_no: cleaned ? getRoadNoFieldError(cleaned) : getRoadNoFieldError(''),
    }));
  };

  const handleRoadNoKeyDown = (e) => {
    if (isRoadNoDigitKey(e.key)) {
      if (formData.road_no.length >= 3) {
        e.preventDefault();
        setFieldErrors((prev) => ({
          ...prev,
          road_no: 'Maximum 3 digits allowed (1–999).',
        }));
      }
      return;
    }
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (e.key.length === 1) {
      e.preventDefault();
      setFieldErrors((prev) => ({
        ...prev,
        road_no: 'Only numbers are allowed (max 3 digits, 1–999).',
      }));
    }
  };

  const handleNoNumbersKeyDown = (e) => {
    const { name } = e.target;
    if (!NO_NUMBERS_FIELDS.has(name)) return;
    if (isDigitKey(e.key)) {
      e.preventDefault();
      setFieldErrors((prev) => ({ ...prev, [name]: NO_NUMBERS_MESSAGE }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === 'checkbox' ? checked : value;

    if (NO_NUMBERS_FIELDS.has(name) && type !== 'checkbox') {
      if (containsDigit(v)) {
        v = stripDigits(v);
        setFieldErrors((prev) => ({ ...prev, [name]: NO_NUMBERS_MESSAGE }));
      } else {
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: v };

      if (name === 'no_parking' && checked) {
        next.car_parking = false;
        next.bike_parking = false;
      }
      if ((name === 'car_parking' || name === 'bike_parking') && checked) {
        next.no_parking = false;
      }

      if (name === 'category') {
        if (v === 'plot') {
          Object.assign(next, {
            bhk: '',
            balconies: '',
            bathrooms: '',
            garden: false,
            car_parking: false,
            bike_parking: false,
            no_parking: false,
            floor_no: '',
            shopSqftRange: '',
            shopRoadDistance: '',
            shopTokenAmount: '',
            furnishing: '',
          });
        } else if (v === 'other') {
          Object.assign(next, {
            bhk: '',
            shopSqftRange: '',
            shopRoadDistance: '',
            shopTokenAmount: '',
            furnishing: '',
            balconies: '',
            bathrooms: '',
            garden: false,
            car_parking: false,
            bike_parking: false,
            no_parking: false,
            floor_no: '',
          });
        } else if (v === 'shop') {
          Object.assign(next, {
            bhk: '',
            balconies: '',
            bathrooms: '',
            garden: false,
            floor_no: '',
            furnishing: '',
          });
        } else {
          next.otherDescription = '';
          next.shopSqftRange = '';
          next.shopRoadDistance = '';
          next.shopTokenAmount = '';
        }
      }

      return next;
    });

    if (type !== 'checkbox') {
      if (CONTACT_VALIDATED_FIELDS.has(name)) {
        setFieldErrors((prev) => ({
          ...prev,
          [name]: v ? getContactFieldError(v) : '',
        }));
      } else {
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }
    if (name === 'no_parking' || name === 'car_parking' || name === 'bike_parking') {
      setFieldErrors((prev) => ({ ...prev, parking: '' }));
    }
  };

  const handleKathaDecimalChange = (e) => {
    const val = e.target.value;
    setKathaDecimal(val);
    setFieldErrors((prev) => ({
      ...prev,
      katha: val ? getContactFieldError(val) : '',
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setFieldErrors((prev) => ({
      ...prev,
      images: files.length ? '' : 'At least one property image is required.',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateAddPropertyForm({
      formData,
      kathaPreset,
      kathaDecimal,
      images,
      isPlot,
      isOther,
      isShop,
      showBhkAndAmenities,
      showFurnishing,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      const first = Object.values(errors)[0];
      toast.error(first);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSubmitPhase('verifying');

    const kathaVal = isPlot
      ? (kathaPreset === 'custom' ? kathaDecimal : kathaPreset).trim()
      : '';

    const { type, other_type } = mapAddPropertyToApiType({
      category: formData.category,
      transaction: formData.transaction,
      plotTransaction: formData.plotTransaction,
      otherDescription: formData.otherDescription,
    });

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('price', formData.price);
    data.append('type', type);
    data.append('bhk', isPlot || isOther || isShop ? '' : formData.bhk);
    data.append('katha', isPlot ? kathaVal : '');
    data.append('location', formData.location.trim());
    data.append('road_no', formData.road_no);
    data.append('city', formData.city.trim());
    data.append('other_type', other_type);
    data.append('shop_sqft_range', isShop ? formData.shopSqftRange : '');
    data.append('featured', formData.featured ? 'true' : 'false');

    if (showBhkAndAmenities && isShop) {
      data.append('balconies', '');
      data.append('bathrooms', '');
      data.append('garden', 'false');
      data.append('floor_no', '');
      data.append('car_parking', formData.no_parking ? 'false' : String(formData.car_parking));
      data.append('bike_parking', formData.no_parking ? 'false' : String(formData.bike_parking));
      data.append('shop_road_distance', formData.shopRoadDistance.trim());
      data.append('shop_token_amount', formData.shopTokenAmount);
    } else if (showBhkAndAmenities) {
      data.append('balconies', formData.balconies);
      data.append('bathrooms', formData.bathrooms);
      data.append('garden', formData.garden ? 'true' : 'false');
      data.append('car_parking', formData.no_parking ? 'false' : String(formData.car_parking));
      data.append('bike_parking', formData.no_parking ? 'false' : String(formData.bike_parking));
      data.append('floor_no', formData.floor_no.trim());
    } else {
      data.append('balconies', '');
      data.append('bathrooms', '');
      data.append('garden', 'false');
      data.append('car_parking', 'false');
      data.append('bike_parking', 'false');
      data.append('floor_no', '');
    }

    data.append('furnishing_status', showFurnishing ? formData.furnishing : '');
    images.forEach((img) => data.append('images', img));

    try {
      const response = await api.post('/properties', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await queryClient.invalidateQueries({ queryKey: ['properties'] });
      await queryClient.invalidateQueries({ queryKey: ['search'] });
      await queryClient.invalidateQueries({ queryKey: ['homeData'] });
      await queryClient.invalidateQueries({ queryKey: ['myProperties'] });

      const isPending = Boolean(response.data?.pendingReview);
      setPendingReviewResult(isPending);
      setSubmitPhase('verified');
      await new Promise((r) => setTimeout(r, 2000));

      if (isPending) {
        toast.success(response.data.message || 'Listing submitted for admin review.');
      } else {
        toast.success('Property verified and added successfully!');
      }
      navigate('/my-properties');
    } catch (error) {
      setSubmitPhase(null);
      const resData = error.response?.data;
      toast.error(
        resData?.error ||
          resData?.imageModeration?.userMessage ||
          'Failed to add property'
      );
    }
    setLoading(false);
  };

  const ParkingOptions = () => (
    <div className="sm:col-span-2">
      <p className="block text-sm font-medium text-navy mb-2">Parking *</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="no_parking"
            checked={formData.no_parking}
            onChange={handleChange}
            className="rounded border-gray-light"
          />
          <span className="text-sm text-navy font-medium">No parking</span>
        </label>
        <label
          className={`inline-flex items-center gap-2 ${formData.no_parking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            type="checkbox"
            name="car_parking"
            checked={formData.car_parking}
            onChange={handleChange}
            disabled={formData.no_parking}
            className="rounded border-gray-light"
          />
          <span className="text-sm text-navy">Car parking</span>
        </label>
        <label
          className={`inline-flex items-center gap-2 ${formData.no_parking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            type="checkbox"
            name="bike_parking"
            checked={formData.bike_parking}
            onChange={handleChange}
            disabled={formData.no_parking}
            className="rounded border-gray-light"
          />
          <span className="text-sm text-navy">Bike parking</span>
        </label>
      </div>
      <FieldHint error={fieldErrors.parking} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ListingVerificationOverlay phase={submitPhase} pendingReview={pendingReviewResult} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Add New Property</h1>
        <p className="text-sm text-gray mb-8">
          All fields marked * are required. Title and description must not contain any numbers (0–9).
          Phone numbers, emails, and external links are not allowed in other text fields.
        </p>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onKeyDown={handleNoNumbersKeyDown}
                required
                className={inputClass(fieldErrors.title)}
              />
              <FieldHint error={fieldErrors.title} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                onKeyDown={handleNoNumbersKeyDown}
                required
                rows={4}
                className={inputClass(fieldErrors.description)}
              />
              <FieldHint error={fieldErrors.description} />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-2">Price (₹) *</label>
              <input
                type="number"
                name="price"
                min="1"
                value={formData.price}
                onChange={handleChange}
                required
                className={inputClass(fieldErrors.price)}
              />
              <FieldHint error={fieldErrors.price} />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-2 uppercase text-xs tracking-wide">
                Type *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={inputClass('')}
              >
                {ADD_PROPERTY_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {isPlot && (
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Plot listing *</label>
                <select
                  name="plotTransaction"
                  value={formData.plotTransaction}
                  onChange={handleChange}
                  required
                  className={inputClass('')}
                >
                  <option value="lease">Lease</option>
                  <option value="buy">Buy</option>
                </select>
              </div>
            )}

            {!isPlot && !isOther && (
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Rent or sell *</label>
                <select
                  name="transaction"
                  value={formData.transaction}
                  onChange={handleChange}
                  required
                  className={inputClass('')}
                >
                  <option value="rent">Rent</option>
                  <option value="buy">Sell / Buy</option>
                </select>
              </div>
            )}

            {isOther && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy mb-2">Describe type *</label>
                <input
                  type="text"
                  name="otherDescription"
                  value={formData.otherDescription}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Farmhouse, godown…"
                  className={inputClass(fieldErrors.otherDescription)}
                />
                <FieldHint error={fieldErrors.otherDescription} />
              </div>
            )}

            {showBhkAndAmenities && !isShop && (
              <div>
                <label className="block text-sm font-medium text-navy mb-2">BHK *</label>
                <input
                  type="number"
                  name="bhk"
                  min="1"
                  step="1"
                  value={formData.bhk}
                  onChange={handleChange}
                  required
                  className={inputClass(fieldErrors.bhk)}
                  placeholder="e.g. 2"
                />
                <FieldHint error={fieldErrors.bhk} />
              </div>
            )}

            {showFurnishing && (
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Furnishing *</label>
                <select
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleChange}
                  required
                  className={inputClass(fieldErrors.furnishing)}
                >
                  <option value="">Select furnishing</option>
                  {FURNISHING_OPTIONS.filter((o) => o.value).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <FieldHint error={fieldErrors.furnishing} />
              </div>
            )}

            {showBhkAndAmenities && isShop && (
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Shop size (sq ft) *</label>
                <select
                  name="shopSqftRange"
                  value={formData.shopSqftRange}
                  onChange={handleChange}
                  required
                  className={inputClass(fieldErrors.shopSqftRange)}
                >
                  <option value="">Select range</option>
                  {SHOP_SQFT_RANGES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <FieldHint error={fieldErrors.shopSqftRange} />
              </div>
            )}

            {isPlot && (
              <div className="md:col-span-2 space-y-3 rounded-lg border-2 border-purple-100 bg-purple-50/50 p-4">
                <label className="block text-sm font-medium text-navy">Katha *</label>
                <select
                  value={kathaPreset}
                  onChange={(e) => setKathaPreset(e.target.value)}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none md:max-w-xs ${fieldErrorClass(fieldErrors.katha)}`}
                >
                  <option value="1">1 Katha</option>
                  <option value="2">2 Katha</option>
                  <option value="3">3 Katha</option>
                  <option value="custom">Enter decimal (e.g. 1.25)</option>
                </select>
                {kathaPreset === 'custom' && (
                  <input
                    type="text"
                    inputMode="decimal"
                    value={kathaDecimal}
                    onChange={handleKathaDecimalChange}
                    required
                    placeholder="Decimal katha, e.g. 1.5"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none md:max-w-md ${fieldErrorClass(fieldErrors.katha)}`}
                  />
                )}
                <FieldHint error={fieldErrors.katha} />
              </div>
            )}

            {showBhkAndAmenities && !isShop && (
              <div className="md:col-span-2 rounded-lg border-2 border-gray-light bg-gray-50/80 p-4 space-y-4">
                <p className="text-sm font-semibold text-navy">Property details *</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-navy mb-1">Balconies (count) *</label>
                    <input
                      type="number"
                      name="balconies"
                      min="0"
                      step="1"
                      value={formData.balconies}
                      onChange={handleChange}
                      required
                      className={inputClass(fieldErrors.balconies)}
                    />
                    <FieldHint error={fieldErrors.balconies} />
                  </div>
                  <div>
                    <label className="block text-sm text-navy mb-1">Bathrooms (count) *</label>
                    <input
                      type="number"
                      name="bathrooms"
                      min="0"
                      step="1"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      required
                      className={inputClass(fieldErrors.bathrooms)}
                    />
                    <FieldHint error={fieldErrors.bathrooms} />
                  </div>
                  <div>
                    <label className="block text-sm text-navy mb-1">Floor no. *</label>
                    <input
                      type="text"
                      name="floor_no"
                      value={formData.floor_no}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 2, G, 5th"
                      className={inputClass(fieldErrors.floor_no)}
                    />
                    <FieldHint error={fieldErrors.floor_no} />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="garden"
                        checked={formData.garden}
                        onChange={handleChange}
                        className="rounded border-gray-light"
                      />
                      <span className="text-sm text-navy">Garden / lawn</span>
                    </label>
                  </div>
                  <ParkingOptions />
                </div>
              </div>
            )}

            {showBhkAndAmenities && isShop && (
              <div className="md:col-span-2 rounded-lg border-2 border-amber-100 bg-amber-50/40 p-4 space-y-4">
                <p className="text-sm font-semibold text-navy">Shop details *</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-navy mb-1">Road distance *</label>
                    <input
                      type="text"
                      name="shopRoadDistance"
                      value={formData.shopRoadDistance}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 50 m, on main road, 0.5 km"
                      className={inputClass(fieldErrors.shopRoadDistance)}
                    />
                    <FieldHint error={fieldErrors.shopRoadDistance} />
                  </div>
                  <ParkingOptions />
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-navy mb-1">Token amount (₹) *</label>
                    <input
                      type="number"
                      name="shopTokenAmount"
                      min="0"
                      step="1"
                      value={formData.shopTokenAmount}
                      onChange={handleChange}
                      required
                      placeholder="Use 0 if not applicable"
                      className={inputClass(fieldErrors.shopTokenAmount)}
                    />
                    <FieldHint error={fieldErrors.shopTokenAmount} />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Location / area *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className={inputClass(fieldErrors.location)}
              />
              <FieldHint error={fieldErrors.location} />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-2">Road no. *</label>
              <input
                type="text"
                name="road_no"
                list="road-no-suggestions"
                inputMode="numeric"
                autoComplete="off"
                value={formData.road_no}
                onChange={handleRoadNoChange}
                onKeyDown={handleRoadNoKeyDown}
                required
                placeholder="Select or type 1–999"
                maxLength={3}
                className={inputClass(fieldErrors.road_no)}
              />
              <datalist id="road-no-suggestions">
                {ROAD_NO_SUGGESTIONS.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
              <FieldHint error={fieldErrors.road_no} />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className={inputClass(fieldErrors.city)}
              />
              <FieldHint error={fieldErrors.city} />
              <p className="text-xs text-gray mt-1">
                District and state are set automatically from city for maps and search.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy mb-2">Images *</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                required
                className={inputClass(fieldErrors.images)}
              />
              <FieldHint error={fieldErrors.images} />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                id="featured-add"
                className="rounded border-gray-light"
              />
              <label htmlFor="featured-add" className="text-sm font-medium text-navy">
                Request featured listing (optional — subject to admin approval)
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || submitPhase === 'verifying' || submitPhase === 'verified'}
            className="w-full bg-gold text-navy py-3 rounded-lg font-bold hover:bg-gold/90 disabled:opacity-50"
          >
            {submitPhase === 'verifying'
              ? 'Verifying…'
              : loading
                ? 'Adding...'
                : 'Add Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
