import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import VerificationOverlay from '../../components/properties/VerificationOverlay';
import {
  ADD_PROPERTY_CATEGORIES,
  mapAddPropertyToApiType,
} from '../../utils/propertyListingMap';
import { SHOP_SQFT_RANGES, FURNISHING_OPTIONS } from '../../constants/propertyForm';

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
    city: '',
    balconies: '',
    bathrooms: '',
    garden: false,
    car_parking: false,
    bike_parking: false,
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
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState({
    open: false,
    files: [],
    moderation: null,
    loading: false,
    error: null,
  });
  const [verificationPendingSuccess, setVerificationPendingSuccess] = useState(null);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const v = type === 'checkbox' ? checked : value;
    setFormData((prev) => {
      const next = { ...prev, [name]: v };
      if (name === 'category') {
        if (v === 'plot') {
          next.bhk = '';
          next.balconies = '';
          next.bathrooms = '';
          next.garden = false;
          next.car_parking = false;
          next.bike_parking = false;
          next.floor_no = '';
          next.shopSqftRange = '';
          next.shopRoadDistance = '';
          next.shopTokenAmount = '';
          next.furnishing = '';
        } else if (v === 'other') {
          next.bhk = '';
          next.shopSqftRange = '';
          next.shopRoadDistance = '';
          next.shopTokenAmount = '';
          next.furnishing = '';
          next.balconies = '';
          next.bathrooms = '';
          next.garden = false;
          next.car_parking = false;
          next.bike_parking = false;
          next.floor_no = '';
        } else if (v === 'shop') {
          next.bhk = '';
          next.balconies = '';
          next.bathrooms = '';
          next.garden = false;
          next.floor_no = '';
          next.furnishing = '';
        } else {
          next.otherDescription = '';
          next.shopSqftRange = '';
          next.shopRoadDistance = '';
          next.shopTokenAmount = '';
        }
      }
      return next;
    });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isOther && !String(formData.otherDescription || '').trim()) {
      toast.error('Please describe the property type for “Other”');
      setLoading(false);
      return;
    }

    if (formData.category === 'shop' && !String(formData.shopSqftRange || '').trim()) {
      toast.error('Select a shop size (sq ft range)');
      setLoading(false);
      return;
    }

    let kathaVal = '';
    if (isPlot) {
      kathaVal = (kathaPreset === 'custom' ? kathaDecimal : kathaPreset).trim();
      if (!kathaVal) {
        toast.error('Select katha size or enter a decimal value');
        setLoading(false);
        return;
      }
    }

    const { type, other_type } = mapAddPropertyToApiType({
      category: formData.category,
      transaction: formData.transaction,
      plotTransaction: formData.plotTransaction,
      otherDescription: formData.otherDescription,
    });

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('type', type);
    data.append('bhk', isPlot || isOther || isShop ? '' : formData.bhk || '');
    data.append('katha', isPlot ? kathaVal : '');
    data.append('location', formData.location);
    data.append('city', formData.city);
    data.append('other_type', other_type);
    data.append('shop_sqft_range', isShop ? formData.shopSqftRange : '');
    data.append('featured', formData.featured ? 'true' : 'false');

    if (showBhkAndAmenities && isShop) {
      data.append('balconies', '');
      data.append('bathrooms', '');
      data.append('garden', 'false');
      data.append('floor_no', '');
      data.append('car_parking', formData.car_parking ? 'true' : 'false');
      data.append('bike_parking', formData.bike_parking ? 'true' : 'false');
      data.append('shop_road_distance', formData.shopRoadDistance || '');
      data.append('shop_token_amount', formData.shopTokenAmount || '');
    } else if (showBhkAndAmenities) {
      data.append('balconies', formData.balconies || '');
      data.append('bathrooms', formData.bathrooms || '');
      data.append('garden', formData.garden ? 'true' : 'false');
      data.append('car_parking', formData.car_parking ? 'true' : 'false');
      data.append('bike_parking', formData.bike_parking ? 'true' : 'false');
      data.append('floor_no', formData.floor_no || '');
    } else {
      data.append('balconies', '');
      data.append('bathrooms', '');
      data.append('garden', 'false');
      data.append('car_parking', 'false');
      data.append('bike_parking', 'false');
      data.append('floor_no', '');
    }

    data.append('furnishing_status', showFurnishing ? formData.furnishing || '' : '');

    images.forEach((img) => data.append('images', img));

    const verifyingImages = images.length > 0;
    if (verifyingImages) {
      setVerification({
        open: true,
        files: images,
        moderation: null,
        loading: true,
        error: null,
      });
    }

    try {
      const response = await api.post('/properties', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { imageModeration, message } = response.data;

      if (verifyingImages) {
        setVerification((v) => ({
          ...v,
          loading: false,
          moderation: imageModeration || {
            totalUploaded: images.length,
            accepted: images.length,
            rejected: 0,
            results: images.map((file, index) => ({
              index,
              filename: file.name,
              status: 'accepted',
            })),
          },
        }));
        setVerificationPendingSuccess({ message, imageModeration });
      } else {
        await finishAddSuccess(message);
      }
    } catch (error) {
      const data = error.response?.data;
      if (verifyingImages && data?.imageModeration) {
        setVerification((v) => ({
          ...v,
          loading: false,
          moderation: data.imageModeration,
        }));
        if (data.error) {
          toast.error(data.error, { duration: 8000 });
        }
        setLoading(false);
        return;
      }
      if (verifyingImages) {
        setVerification((v) => ({
          ...v,
          loading: false,
          error: data?.error || 'Failed to add property',
        }));
      } else {
        toast.error(data?.error || 'Failed to add property');
      }
      setLoading(false);
    }
  };

  const finishAddSuccess = async (message) => {
    await queryClient.invalidateQueries({ queryKey: ['properties'] });
    await queryClient.invalidateQueries({ queryKey: ['search'] });
    await queryClient.invalidateQueries({ queryKey: ['homeData'] });
    await queryClient.invalidateQueries({ queryKey: ['myProperties'] });
    toast.success(message || 'Property added successfully!');
    setVerification({ open: false, files: [], moderation: null, loading: false, error: null });
    setVerificationPendingSuccess(null);
    setLoading(false);
    navigate('/my-properties');
  };

  const handleVerificationComplete = () => {
    if (verificationPendingSuccess) {
      finishAddSuccess(verificationPendingSuccess.message);
    }
  };

  const handleVerificationRejections = async ({ rejectedFilenames }) => {
    setImages((prev) => prev.filter((file) => !rejectedFilenames.includes(file.name)));
    const mod = verificationPendingSuccess?.imageModeration || verification.moderation;
    const msg = mod?.userMessage || mod?.rejectionMessage;
    if (msg) {
      toast.error(msg, { duration: 8000 });
    }
    setVerification({ open: false, files: [], moderation: null, loading: false, error: null });
    setVerificationPendingSuccess(null);
    setLoading(false);
  };

  const handleVerificationErrorDismiss = () => {
    setVerification({ open: false, files: [], moderation: null, loading: false, error: null });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy mb-8">Add New Property</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-2">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
              />
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
                className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
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
                  className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
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
                  className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
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
                  className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
                />
              </div>
            )}

            {showBhkAndAmenities && !isShop && (
              <div>
                <label className="block text-sm font-medium text-navy mb-2">BHK</label>
                <input
                  type="number"
                  name="bhk"
                  min="0"
                  step="1"
                  value={formData.bhk}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
                  placeholder="e.g. 2"
                />
              </div>
            )}

            {showFurnishing && (
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Furnishing</label>
                <select
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
                >
                  {FURNISHING_OPTIONS.map((o) => (
                    <option key={o.value || 'none'} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
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
                  className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
                >
                  <option value="">Select range</option>
                  {SHOP_SQFT_RANGES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isPlot && (
              <div className="md:col-span-2 space-y-3 rounded-lg border-2 border-purple-100 bg-purple-50/50 p-4">
                <label className="block text-sm font-medium text-navy">Katha *</label>
                <select
                  value={kathaPreset}
                  onChange={(e) => setKathaPreset(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none md:max-w-xs"
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
                    onChange={(e) => setKathaDecimal(e.target.value)}
                    placeholder="Decimal katha, e.g. 1.5"
                    className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none md:max-w-md"
                  />
                )}
              </div>
            )}

            {showBhkAndAmenities && !isShop && (
              <div className="md:col-span-2 rounded-lg border-2 border-gray-light bg-gray-50/80 p-4 space-y-4">
                <p className="text-sm font-semibold text-navy">Property details (optional)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-navy mb-1">Balconies (count)</label>
                    <input
                      type="number"
                      name="balconies"
                      min="0"
                      step="1"
                      value={formData.balconies}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-navy mb-1">Bathrooms (count)</label>
                    <input
                      type="number"
                      name="bathrooms"
                      min="0"
                      step="1"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-navy mb-1">Floor no.</label>
                    <input
                      type="text"
                      name="floor_no"
                      value={formData.floor_no}
                      onChange={handleChange}
                      placeholder="e.g. 2, G, 5th"
                      className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
                    />
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
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="car_parking"
                        checked={formData.car_parking}
                        onChange={handleChange}
                        className="rounded border-gray-light"
                      />
                      <span className="text-sm text-navy">Car parking</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="bike_parking"
                        checked={formData.bike_parking}
                        onChange={handleChange}
                        className="rounded border-gray-light"
                      />
                      <span className="text-sm text-navy">Bike parking</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {showBhkAndAmenities && isShop && (
              <div className="md:col-span-2 rounded-lg border-2 border-amber-100 bg-amber-50/40 p-4 space-y-4">
                <p className="text-sm font-semibold text-navy">Shop details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-navy mb-1">Road dist</label>
                    <input
                      type="text"
                      name="shopRoadDistance"
                      value={formData.shopRoadDistance}
                      onChange={handleChange}
                      placeholder="e.g. 50 m, on main road, 0.5 km"
                      className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <p className="block text-sm font-medium text-navy mb-2">Parking</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="car_parking"
                          checked={formData.car_parking}
                          onChange={handleChange}
                          className="rounded border-gray-light"
                        />
                        <span className="text-sm text-navy">Car parking</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="bike_parking"
                          checked={formData.bike_parking}
                          onChange={handleChange}
                          className="rounded border-gray-light"
                        />
                        <span className="text-sm text-navy">Bike parking</span>
                      </label>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-navy mb-1">Token amount (₹)</label>
                    <input
                      type="number"
                      name="shopTokenAmount"
                      min="0"
                      step="1"
                      value={formData.shopTokenAmount}
                      onChange={handleChange}
                      placeholder="Advance / token if applicable"
                      className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none sm:max-w-md"
                    />
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
                className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
              />
              <p className="text-xs text-gray mt-1">
                District and state are set automatically from city for maps and search.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy mb-2">Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
              />
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
                Request featured listing (subject to admin approval)
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || verification.open}
            className="w-full bg-gold text-navy py-3 rounded-lg font-bold hover:bg-gold/90 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Property'}
          </button>
        </form>
      </div>

      <VerificationOverlay
        open={verification.open}
        imageFiles={verification.files}
        imageModeration={verification.moderation}
        loading={verification.loading}
        error={verification.error}
        onAllVerified={handleVerificationComplete}
        onAcknowledgeRejections={handleVerificationRejections}
        onErrorDismiss={handleVerificationErrorDismiss}
      />
    </div>
  );
};

export default AddProperty;
