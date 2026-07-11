import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api, { getImageUrl } from '../../utils/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, X, Star } from 'lucide-react';
import { ADD_PROPERTY_CATEGORIES, mapAddPropertyToApiType, mapPropertyRowToCategoryForm } from '../../utils/propertyListingMap';
import { SHOP_SQFT_RANGES, FURNISHING_OPTIONS, LISTING_CITIES } from '../../constants/propertyForm';
import { digitsOnly, blockNonDigitKeyDown } from '../../utils/numericInput';
import BrokerDoneModal from '../brokers/BrokerDoneModal';
import BrandLoader from '../ui/BrandLoader';
import PropertyImagePicker, {
  filesFromImageItems,
  hasCheckingImageItems,
  hasRejectedImageItems,
} from '../common/PropertyImagePicker';
import LocationSearchCombobox from '../search/LocationSearchCombobox';
import { useAreaOptions } from '../../hooks/useAreas';
import AddListingModeToggle from '../properties/AddListingModeToggle';
import AddProjectFields, { validateAddProjectForm } from '../properties/AddProjectFields';

const staffInputClass = (err) =>
  `w-full border-2 rounded-lg px-3 py-2 ${err ? 'border-red-400' : 'border-gray-light'}`;

function emptyProjectData() {
  return {
    projectType: 'apartment',
    developerName: '',
    marketedBy: '',
    bhkSelected: [],
    sqftFrom: '',
    sqftTo: '',
  };
}

function parseBhkOptions(raw) {
  if (!raw) return [];
  return String(raw)
    .split(/[,/]/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function parseImages(imageUrl) {
  if (!imageUrl) return [];
  try {
    const p = typeof imageUrl === 'string' ? JSON.parse(imageUrl) : imageUrl;
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function emptyForm() {
  return {
    title: '',
    description: '',
    price: '',
    category: 'homes',
    transaction: 'rent',
    plotTransaction: 'lease',
    otherDescription: '',
    bhk: '',
    kathaPreset: '1',
    kathaCustom: '',
    location: '',
    city: 'Patna',
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
    belongs_to_phone: ''
  };
}

export default function ManageProperties({ variant, staffFilter = null }) {
  const queryClient = useQueryClient();
  const { pickOptions: areaOptions } = useAreaOptions();
  const prefix = variant === 'admin' ? '/admin' : '/subadmin';
  const isStaffView = staffFilter === 'admin' || staffFilter === 'subadmin';
  const pageTitle =
    staffFilter === 'admin'
      ? 'Admin properties'
      : staffFilter === 'subadmin'
        ? 'Sub-admin properties'
        : 'Manage properties';
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newImageItems, setNewImageItems] = useState([]);
  const [removeFilenames, setRemoveFilenames] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [doneProperty, setDoneProperty] = useState(null);
  const [listingMode, setListingMode] = useState('property');
  const [projectData, setProjectData] = useState(emptyProjectData);
  const [projectPdf, setProjectPdf] = useState(null);
  const [projectFieldErrors, setProjectFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isProject = listingMode === 'project';

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (isStaffView) params.listed_by_staff = staffFilter;
      const { data } = await api.get(`${prefix}/properties`, { params });
      setProperties(data.properties || []);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load properties');
    }
    setLoading(false);
  }, [prefix, search, isStaffView, staffFilter]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await api.get(`${prefix}/users`);
        setUsers(data.users || []);
      } catch {
        setUsers([]);
      }
    };
    loadUsers();
  }, [prefix]);

  useEffect(() => {
    const t = setTimeout(() => loadProperties(), 300);
    return () => clearTimeout(t);
  }, [loadProperties]);

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
    setForm(emptyForm());
    setNewImageItems([]);
    setRemoveFilenames([]);
    setExistingImages([]);
    setListingMode('property');
    setProjectData(emptyProjectData());
    setProjectPdf(null);
    setProjectFieldErrors({});
    setSaving(false);
  };

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setNewImageItems([]);
    setRemoveFilenames([]);
    setExistingImages([]);
    setListingMode('property');
    setProjectData(emptyProjectData());
    setProjectPdf(null);
    setProjectFieldErrors({});
    setModal('add');
  };

  const openEdit = (p) => {
    const isProjectRow = p.listing_kind === 'project';
    setListingMode(isProjectRow ? 'project' : 'property');
    if (isProjectRow) {
      setProjectData({
        projectType: p.project_type || 'apartment',
        developerName: p.developer_name || '',
        marketedBy: p.marketed_by || '',
        bhkSelected: parseBhkOptions(p.bhk_options),
        sqftFrom: p.sqft_from != null ? String(p.sqft_from) : '',
        sqftTo: p.sqft_to != null ? String(p.sqft_to) : '',
      });
      setProjectPdf(null);
    } else {
      setProjectData(emptyProjectData());
      setProjectPdf(null);
    }

    const rawType = p.type || 'rent';
    const cat = mapPropertyRowToCategoryForm(p);

    let kathaPreset = '1';
    let kathaCustom = '';
    if (rawType === 'plot' || rawType === 'plot_lease' || rawType === 'plot_buy' || (String(rawType).trim() === '' && p.katha)) {
      const k = String(p.katha || '').trim();
      if (['1', '2', '3'].includes(k)) kathaPreset = k;
      else if (k) {
        kathaPreset = 'custom';
        kathaCustom = k;
      }
    }

    setForm({
      title: p.title || '',
      description: p.description || '',
      price: String(p.price ?? ''),
      category: cat.category,
      transaction: cat.transaction,
      plotTransaction: cat.plotTransaction,
      otherDescription: cat.otherDescription,
      bhk: p.bhk != null ? String(p.bhk) : '',
      kathaPreset,
      kathaCustom,
      location: p.location || '',
      city: p.city || '',
      balconies: p.balconies != null ? String(p.balconies) : '',
      bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
      garden: !!p.garden,
      car_parking: !!p.car_parking,
      bike_parking: !!p.bike_parking,
      floor_no: p.floor_no != null ? String(p.floor_no) : '',
      shopSqftRange: p.shop_sqft_range != null ? String(p.shop_sqft_range) : '',
      shopRoadDistance: p.shop_road_distance != null ? String(p.shop_road_distance) : '',
      shopTokenAmount:
        p.shop_token_amount != null && p.shop_token_amount !== '' ? String(p.shop_token_amount) : '',
      furnishing: p.furnishing_status != null && String(p.furnishing_status).trim() !== '' ? String(p.furnishing_status) : '',
      featured: !!p.featured,
      belongs_to_phone: p.belongs_to_phone || p.owner_phone || ''
    });
    setEditingId(p.id);
    setExistingImages(parseImages(p.image_url));
    setNewImageItems([]);
    setRemoveFilenames([]);
    setModal('edit');
  };

  const appendForm = (fd) => {
    const isPlot = form.category === 'plot';
    const isOther = form.category === 'other';
    const isShop = form.category === 'shop';
    const showAmenities = !isPlot && !isOther;
    const showFurnishing =
      showAmenities &&
      !isShop &&
      (form.category === 'homes' || form.category === 'flat' || form.category === 'apartment');

    const { type, other_type } = mapAddPropertyToApiType({
      category: form.category,
      transaction: form.transaction,
      plotTransaction: form.plotTransaction,
      otherDescription: form.otherDescription
    });

    const kathaFinal =
      isPlot && form.kathaPreset === 'custom'
        ? (form.kathaCustom || '').trim()
        : isPlot
          ? String(form.kathaPreset || '').trim()
          : '';

    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('type', type);
    fd.append('bhk', isPlot || isOther || isShop ? '' : form.bhk || '');
    fd.append('katha', isPlot ? kathaFinal : '');
    fd.append('location', form.location);
    fd.append('city', form.city);
    fd.append('other_type', other_type);
    fd.append('shop_sqft_range', isShop ? form.shopSqftRange || '' : '');
    fd.append('featured', form.featured ? 'true' : 'false');
    fd.append('belongs_to_phone', form.belongs_to_phone);

    if (showAmenities && isShop) {
      fd.append('balconies', '');
      fd.append('bathrooms', '');
      fd.append('garden', 'false');
      fd.append('floor_no', '');
      fd.append('car_parking', form.car_parking ? 'true' : 'false');
      fd.append('bike_parking', form.bike_parking ? 'true' : 'false');
      fd.append('shop_road_distance', form.shopRoadDistance || '');
      fd.append('shop_token_amount', form.shopTokenAmount || '');
    } else if (showAmenities) {
      fd.append('balconies', form.balconies || '');
      fd.append('bathrooms', form.bathrooms || '');
      fd.append('garden', form.garden ? 'true' : 'false');
      fd.append('car_parking', form.car_parking ? 'true' : 'false');
      fd.append('bike_parking', form.bike_parking ? 'true' : 'false');
      fd.append('floor_no', form.floor_no || '');
    } else {
      fd.append('balconies', '');
      fd.append('bathrooms', '');
      fd.append('garden', 'false');
      fd.append('car_parking', 'false');
      fd.append('bike_parking', 'false');
      fd.append('floor_no', '');
    }

    fd.append('furnishing_status', showFurnishing ? form.furnishing || '' : '');

    const newFiles = filesFromImageItems(newImageItems);
    newFiles.forEach((f) => fd.append('images', f));
  };

  const appendProjectForm = (fd) => {
    fd.append('listing_kind', 'project');
    fd.append('project_type', projectData.projectType);
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('developer_name', projectData.developerName.trim());
    fd.append('marketed_by', projectData.marketedBy.trim());
    fd.append('bhk_options', projectData.bhkSelected.join(','));
    fd.append('sqft_from', projectData.sqftFrom || '');
    fd.append('sqft_to', projectData.sqftTo || '');
    fd.append('location', form.location);
    fd.append('city', form.city);
    fd.append('featured', form.featured ? 'true' : 'false');
    fd.append('belongs_to_phone', form.belongs_to_phone);
    if (projectPdf) fd.append('project_pdf', projectPdf);
    const newFiles = filesFromImageItems(newImageItems);
    newFiles.forEach((f) => fd.append('images', f));
  };

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    if (hasCheckingImageItems(newImageItems)) {
      toast.error('Please wait — new images are still being checked.');
      return;
    }
    if (hasRejectedImageItems(newImageItems)) {
      toast.error('Remove flagged images (×) before saving.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(String(form.belongs_to_phone || '').replace(/\D/g, '').slice(-10))) {
      toast.error('Enter a valid 10-digit owner number');
      return;
    }
    if (!isProject) {
      if (form.category === 'other' && !String(form.otherDescription || '').trim()) {
        toast.error('Enter a description for “Other” type');
        return;
      }
      if (form.category === 'shop' && !String(form.shopSqftRange || '').trim()) {
        toast.error('Select a shop size (sq ft range)');
        return;
      }
      const isPlot = form.category === 'plot';
      if (isPlot) {
        const kf = form.kathaPreset === 'custom' ? form.kathaCustom.trim() : form.kathaPreset;
        if (!kf) {
          toast.error('Select katha or enter a decimal value for plot listings');
          return;
        }
      }
    }

    if (isProject && modal === 'add') {
      const uploadImages = filesFromImageItems(newImageItems);
      const projErrors = validateAddProjectForm({
        formData: form,
        projectData,
        images: uploadImages,
      });
      if (Object.keys(projErrors).length > 0) {
        setProjectFieldErrors(projErrors);
        toast.error(Object.values(projErrors)[0]);
        return;
      }
      setProjectFieldErrors({});
    }

    try {
      setSaving(true);
      if (modal === 'add') {
        const fd = new FormData();
        if (isProject) {
          appendProjectForm(fd);
        } else {
          appendForm(fd);
        }
        const res = await api.post(`${prefix}/properties`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(
          res.data?.pendingReview
            ? res.data.message || 'Listing submitted for admin review.'
            : isProject
              ? 'Project created'
              : 'Property created'
        );
      } else {
        if (isProject) {
          toast.error('Project edit from this panel is coming soon. Delete and re-add if urgent.');
          return;
        }
        const fd = new FormData();
        appendForm(fd);
        if (removeFilenames.length > 0) {
          fd.append('removeImages', JSON.stringify(removeFilenames));
        }
        const res = await api.put(`${prefix}/properties/${editingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(
          res.data?.pendingReview
            ? res.data.message || 'Listing submitted for admin review.'
            : 'Property updated'
        );
      }
      await queryClient.invalidateQueries({ queryKey: ['properties'] });
      await queryClient.invalidateQueries({ queryKey: ['search'] });
      await queryClient.invalidateQueries({ queryKey: ['homeData'] });
      closeModal();
      loadProperties();
    } catch (err) {
      const data = err.response?.data;
      toast.error(data?.imageModeration?.userMessage || data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const approveListing = async (p) => {
    try {
      await api.post(`${prefix}/properties/${p.id}/approve`);
      toast.success('Listing approved and published');
      loadProperties();
      await queryClient.invalidateQueries({ queryKey: ['properties'] });
      await queryClient.invalidateQueries({ queryKey: ['search'] });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Approve failed');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`${prefix}/properties/${deleteId}`);
      toast.success('Property deleted');
      setDeleteId(null);
      await queryClient.invalidateQueries({ queryKey: ['properties'] });
      await queryClient.invalidateQueries({ queryKey: ['search'] });
      await queryClient.invalidateQueries({ queryKey: ['homeData'] });
      loadProperties();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const toggleFeatured = async (p) => {
    try {
      await api.post(`${prefix}/properties/${p.id}/toggle-featured`, {
        featured: !p.featured
      });
      toast.success(p.featured ? 'Removed from featured' : 'Marked featured');
      loadProperties();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const toggleRemoveImage = (name) => {
    setRemoveFilenames((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const fmtPrice = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      Number(n) || 0
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-navy">{pageTitle}</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="search"
            placeholder="Search title, description, location…"
            className="border-2 border-gray-light rounded-lg px-3 py-2 min-w-[220px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 bg-gold text-navy px-4 py-2 rounded-lg font-semibold hover:bg-gold/90"
          >
            <Plus className="h-5 w-5" />
            Add listing
          </button>
        </div>
      </div>

      {loading ? (
        <BrandLoader size="sm" />
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-navy text-white text-left">
              <tr>
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Title</th>
                {isStaffView ? <th className="px-3 py-3 min-w-[160px]">Description</th> : null}
                <th className="px-3 py-3">Type</th>
                {isStaffView ? <th className="px-3 py-3">Location</th> : null}
                <th className="px-3 py-3">City</th>
                {isStaffView ? <th className="px-3 py-3">BHK</th> : null}
                <th className="px-3 py-3">Owner number</th>
                {!isStaffView ? <th className="px-3 py-3">Broker ID</th> : null}
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Featured</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Review note</th>
                <th className="px-3 py-3 w-36">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className={`border-t border-gray-light hover:bg-gray-50 ${p.listing_status === 'pending_review' ? 'bg-amber-50/60' : ''}`}>
                  <td className="px-3 py-2">{p.id}</td>
                  <td className="px-3 py-2 font-medium text-navy max-w-[200px] whitespace-normal break-words">
                    <div>{p.title}</div>
                    {p.listed_by_staff && !isStaffView && (
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gold/20 text-navy border border-gold/40">
                        Added by Harsh To Let Services
                      </span>
                    )}
                  </td>
                  {isStaffView ? (
                    <td className="px-3 py-2 max-w-[220px] whitespace-normal break-words text-xs text-stone-600">
                      {p.description || '—'}
                    </td>
                  ) : null}
                  <td className="px-3 py-2 capitalize">{p.type}</td>
                  {isStaffView ? (
                    <td className="px-3 py-2 max-w-[140px] whitespace-normal break-words text-xs text-stone-600">
                      {p.location || '—'}
                    </td>
                  ) : null}
                  <td className="px-3 py-2">{p.city}</td>
                  {isStaffView ? <td className="px-3 py-2">{p.bhk ?? '—'}</td> : null}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {p.belongs_to_phone || p.owner_phone ? (
                      <a
                        href={`tel:${p.belongs_to_phone || p.owner_phone}`}
                        className="font-semibold text-navy hover:underline"
                      >
                        {p.belongs_to_phone || p.owner_phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  {!isStaffView ? (
                    <td className="px-3 py-2 font-mono text-xs">{p.broker_public_id || '—'}</td>
                  ) : null}
                  <td className="px-3 py-2 whitespace-nowrap">{fmtPrice(p.price)}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(p)}
                      className={`p-2 rounded ${p.featured ? 'text-gold bg-gold/15' : 'text-gray hover:bg-gray-100'}`}
                      title="Toggle featured"
                    >
                      <Star className={`h-4 w-4 ${p.featured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  <td className="px-3 py-2 capitalize text-xs">
                    {p.listing_status === 'pending_review' ? (
                      <span className="text-amber-700 font-semibold">Pending review</span>
                    ) : (
                      p.listing_status || 'active'
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-amber-900 max-w-[180px] whitespace-normal break-words">
                    {p.listing_review_reason ? (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5">{p.listing_review_reason}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 flex-wrap">
                      {p.listing_status === 'pending_review' && (
                        <button
                          type="button"
                          onClick={() => approveListing(p)}
                          className="px-2 py-1 text-xs font-semibold rounded bg-gold text-navy hover:bg-gold/90"
                        >
                          Approve
                        </button>
                      )}
                      {(p.listing_status === 'active' || !p.listing_status) && (
                        <button
                          type="button"
                          onClick={() => setDoneProperty(p)}
                          className="px-2 py-1 text-xs font-semibold rounded bg-navy text-white hover:bg-navy/90"
                        >
                          Done
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="p-2 text-navy hover:bg-gold/20 rounded"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(p.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {properties.length === 0 && <p className="p-6 text-gray text-center">No properties found.</p>}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-navy">
                {modal === 'add' ? 'Add listing' : isProject ? 'Edit project' : 'Edit property'}
              </h2>
              <button type="button" onClick={closeModal} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Owner number *</label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                  value={form.belongs_to_phone}
                  onChange={(e) =>
                    setForm({ ...form, belongs_to_phone: digitsOnly(e.target.value, 10) })
                  }
                  onKeyDown={blockNonDigitKeyDown}
                />
              </div>

              {modal === 'add' && (
                <AddListingModeToggle mode={listingMode} onChange={setListingMode} />
              )}

              {isProject ? (
                <>
                <div className="grid md:grid-cols-2 gap-4">
                  <AddProjectFields
                    projectData={projectData}
                    setProjectData={setProjectData}
                    formData={form}
                    handleChange={handleProjectFormChange}
                    fieldErrors={projectFieldErrors}
                    inputClass={staffInputClass}
                    projectPdf={projectPdf}
                    onProjectPdfChange={setProjectPdf}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured-project-staff"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  <label htmlFor="featured-project-staff" className="text-sm font-medium text-navy">
                    Feature on home page
                  </label>
                </div>
                </>
              ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-navy mb-1">Title *</label>
                  <input
                    required
                    className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-navy mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Price (₹) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: digitsOnly(e.target.value, 12) })}
                    onKeyDown={blockNonDigitKeyDown}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1 uppercase text-xs tracking-wide">Type *</label>
                  <select
                    className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                    value={form.category}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((prev) => {
                        const next = { ...prev, category: v };
                        if (v === 'plot' || v === 'other') {
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
                        return next;
                      });
                    }}
                  >
                    {ADD_PROPERTY_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                {form.category === 'plot' && (
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Plot listing *</label>
                    <select
                      className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                      value={form.plotTransaction}
                      onChange={(e) => setForm({ ...form, plotTransaction: e.target.value })}
                    >
                      <option value="lease">Lease</option>
                      <option value="buy">Buy</option>
                    </select>
                  </div>
                )}
                {form.category !== 'plot' && form.category !== 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Rent or sell *</label>
                    <select
                      className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                      value={form.transaction}
                      onChange={(e) => setForm({ ...form, transaction: e.target.value })}
                    >
                      <option value="rent">Rent</option>
                      <option value="buy">Sell / Buy</option>
                    </select>
                  </div>
                )}
                {(form.category === 'homes' || form.category === 'flat' || form.category === 'apartment') && (
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">BHK</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                      value={form.bhk}
                      onChange={(e) => setForm({ ...form, bhk: e.target.value })}
                    />
                  </div>
                )}
                {(form.category === 'homes' || form.category === 'flat' || form.category === 'apartment') && (
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Furnishing</label>
                    <select
                      className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                      value={form.furnishing}
                      onChange={(e) => setForm({ ...form, furnishing: e.target.value })}
                    >
                      {FURNISHING_OPTIONS.map((o) => (
                        <option key={o.value || 'none'} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {form.category === 'shop' && (
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Shop size (sq ft) *</label>
                    <select
                      required
                      className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                      value={form.shopSqftRange}
                      onChange={(e) => setForm({ ...form, shopSqftRange: e.target.value })}
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
                {(form.category === 'homes' || form.category === 'flat' || form.category === 'apartment') && (
                  <div className="md:col-span-2 rounded-lg border border-gray-light bg-gray-50/80 p-3 space-y-3">
                    <p className="text-sm font-semibold text-navy">Property details (optional)</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-navy mb-1">Balconies</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                          value={form.balconies}
                          onChange={(e) => setForm({ ...form, balconies: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-navy mb-1">Bathrooms</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                          value={form.bathrooms}
                          onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-navy mb-1">Floor no.</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                          value={form.floor_no}
                          onChange={(e) => setForm({ ...form, floor_no: digitsOnly(e.target.value, 3) })}
                          onKeyDown={blockNonDigitKeyDown}
                          placeholder="0–999"
                        />
                      </div>
                      <div className="flex flex-wrap gap-4 items-center pt-1">
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.garden}
                            onChange={(e) => setForm({ ...form, garden: e.target.checked })}
                          />
                          Garden
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.car_parking}
                            onChange={(e) => setForm({ ...form, car_parking: e.target.checked })}
                          />
                          Car parking
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.bike_parking}
                            onChange={(e) => setForm({ ...form, bike_parking: e.target.checked })}
                          />
                          Bike parking
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                {form.category === 'shop' && (
                  <div className="md:col-span-2 rounded-lg border border-amber-100 bg-amber-50/40 p-3 space-y-3">
                    <p className="text-sm font-semibold text-navy">Shop details (optional)</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-navy mb-1">Road dist</label>
                        <input
                          type="text"
                          className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                          value={form.shopRoadDistance}
                          onChange={(e) => setForm({ ...form, shopRoadDistance: e.target.value })}
                          placeholder="e.g. 50 m, on main road"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <p className="block text-xs font-medium text-navy mb-1">Parking</p>
                        <div className="flex flex-wrap gap-4 items-center">
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={form.car_parking}
                              onChange={(e) => setForm({ ...form, car_parking: e.target.checked })}
                            />
                            Car parking
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={form.bike_parking}
                              onChange={(e) => setForm({ ...form, bike_parking: e.target.checked })}
                            />
                            Bike parking
                          </label>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-navy mb-1">Token amount (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-full border-2 border-gray-light rounded-lg px-3 py-2 max-w-md"
                          value={form.shopTokenAmount}
                          onChange={(e) => setForm({ ...form, shopTokenAmount: e.target.value })}
                          placeholder="Advance / token if applicable"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {(form.category === 'plot') && (
                  <div className="md:col-span-2 space-y-2 rounded-lg border border-purple-100 bg-purple-50/40 p-3">
                    <label className="block text-sm font-medium text-navy">Katha *</label>
                    <select
                      className="w-full border-2 border-gray-light rounded-lg px-3 py-2 max-w-xs"
                      value={form.kathaPreset}
                      onChange={(e) => setForm({ ...form, kathaPreset: e.target.value })}
                    >
                      <option value="1">1 Katha</option>
                      <option value="2">2 Katha</option>
                      <option value="3">3 Katha</option>
                      <option value="custom">Decimal value…</option>
                    </select>
                    {form.kathaPreset === 'custom' && (
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 1.25"
                        className="w-full border-2 border-gray-light rounded-lg px-3 py-2 max-w-md"
                        value={form.kathaCustom}
                        onChange={(e) => setForm({ ...form, kathaCustom: e.target.value })}
                      />
                    )}
                  </div>
                )}
                {form.category === 'other' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-navy mb-1">Other type *</label>
                    <input
                      required
                      className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                      value={form.otherDescription}
                      onChange={(e) => setForm({ ...form, otherDescription: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Location *</label>
                  <div className="rounded-lg border-2 border-gray-light bg-white !p-0">
                    <LocationSearchCombobox
                      value={form.location}
                      onChange={(v) => setForm({ ...form, location: v })}
                      options={areaOptions}
                      triggerClassName="w-full px-3 py-2 text-left text-sm"
                      tone="light"
                      dropUp
                      emptyLabel="Select location / area"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">City *</label>
                  <select
                    required
                    className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                    value={form.city || 'Patna'}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  >
                    {LISTING_CITIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                    {form.city &&
                      !LISTING_CITIES.some((c) => c.value === form.city) && (
                        <option value={form.city}>{form.city}</option>
                      )}
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-navy">
                    Featured listing
                  </label>
                </div>
              </div>
              )}

              {!isProject && modal === 'edit' && existingImages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-navy mb-2">Remove existing photos (checked = delete on save)</p>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((name) => (
                      <label key={name} className="flex flex-col items-center gap-1 text-xs border rounded p-2">
                        <img src={getImageUrl(name)} alt="" className="h-16 w-20 object-cover rounded" />
                        <input
                          type="checkbox"
                          checked={removeFilenames.includes(name)}
                          onChange={() => toggleRemoveImage(name)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <PropertyImagePicker
                label={
                  modal === 'add'
                    ? isProject
                      ? 'Project images'
                      : 'Photos'
                    : 'Add more photos'
                }
                required={modal === 'add'}
                multiple
                items={newImageItems}
                onChange={setNewImageItems}
                moderatePath={`${prefix}/moderate-images`}
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gold text-navy py-2 rounded-lg font-bold disabled:opacity-60"
                >
                  {saving
                    ? modal === 'add'
                      ? 'Adding...'
                      : 'Updating...'
                    : modal === 'add'
                      ? isProject
                        ? 'Add project'
                        : 'Add property'
                      : isProject
                        ? 'Update project'
                        : 'Update property'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 border-2 border-gray-light py-2 rounded-lg disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <p className="text-navy mb-4">Delete this property? Images will be removed from the server.</p>
            <div className="flex gap-2">
              <button type="button" onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold">
                Delete
              </button>
              <button type="button" onClick={() => setDeleteId(null)} className="flex-1 border-2 border-gray-light py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BrokerDoneModal
        open={Boolean(doneProperty)}
        property={doneProperty}
        apiPrefix={prefix}
        users={users}
        onClose={() => setDoneProperty(null)}
      />
    </div>
  );
}
