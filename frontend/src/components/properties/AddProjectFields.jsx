import FieldHint from '../common/FieldHint';
import { getContactFieldError } from '../../utils/contactValidation';
import toast from 'react-hot-toast';

const BHK_CHOICES = [1, 2, 3, 4, 5];
const PDF_MAX_BYTES = 50 * 1024 * 1024;

export default function AddProjectFields({
  projectData,
  setProjectData,
  formData,
  handleChange,
  fieldErrors,
  inputClass,
  handleNoNumbersKeyDown,
  projectPdf,
  onProjectPdfChange,
}) {
  const toggleBhk = (n) => {
    setProjectData((prev) => {
      const set = new Set(prev.bhkSelected);
      if (set.has(n)) set.delete(n);
      else set.add(n);
      return { ...prev, bhkSelected: [...set].sort((a, b) => a - b) };
    });
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > PDF_MAX_BYTES) {
      e.target.value = '';
      onProjectPdfChange(null);
      toast.error('PDF is too large. Maximum size is 50MB (it will be compressed after upload).');
      return;
    }
    onProjectPdfChange(file);
  };

  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-medium text-navy">Project type *</label>
        <select
          name="projectType"
          value={projectData.projectType}
          onChange={handleProjectChange}
          required
          className={inputClass('')}
        >
          <option value="apartment">Apartment</option>
          <option value="enclave">Enclave</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-navy">Starting price (₹) *</label>
        <input
          type="number"
          name="price"
          min="1"
          value={formData.price}
          onChange={handleChange}
          required
          placeholder="e.g. 3500000"
          className={inputClass(fieldErrors.price)}
        />
        <FieldHint error={fieldErrors.price} />
        <p className="mt-1 text-xs text-stone-500">Shown as “₹ X onwards” on the home page</p>
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-navy">Project name *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onKeyDown={handleNoNumbersKeyDown}
          required
          placeholder="e.g. Mount Galaxy"
          className={inputClass(fieldErrors.title)}
        />
        <FieldHint error={fieldErrors.title} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-navy">Developer *</label>
        <input
          type="text"
          name="developerName"
          value={projectData.developerName}
          onChange={handleProjectChange}
          required
          placeholder="Builder / developer name"
          className={inputClass(fieldErrors.developerName)}
        />
        <FieldHint error={fieldErrors.developerName} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-navy">Marketed by</label>
        <input
          type="text"
          name="marketedBy"
          value={projectData.marketedBy}
          onChange={handleProjectChange}
          placeholder="Optional marketing partner"
          className={inputClass(fieldErrors.marketedBy)}
        />
        <FieldHint error={fieldErrors.marketedBy} />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-navy">BHK configurations *</label>
        <div className="flex flex-wrap gap-2">
          {BHK_CHOICES.map((n) => {
            const on = projectData.bhkSelected.includes(n);
            return (
              <button
                key={n}
                type="button"
                onClick={() => toggleBhk(n)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                  on
                    ? 'border-gold bg-gold/15 text-navy'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                {n} BHK
              </button>
            );
          })}
        </div>
        <FieldHint error={fieldErrors.bhkSelected} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-navy">Sq ft from</label>
        <input
          type="number"
          name="sqftFrom"
          min="1"
          value={projectData.sqftFrom}
          onChange={handleProjectChange}
          placeholder="e.g. 650"
          className={inputClass(fieldErrors.sqftFrom)}
        />
        <FieldHint error={fieldErrors.sqftFrom} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-navy">Sq ft to</label>
        <input
          type="number"
          name="sqftTo"
          min="1"
          value={projectData.sqftTo}
          onChange={handleProjectChange}
          placeholder="e.g. 1450"
          className={inputClass(fieldErrors.sqftTo)}
        />
        <FieldHint error={fieldErrors.sqftTo} />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-navy">About the project *</label>
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
        <label className="mb-2 block text-sm font-medium text-navy">Location / area *</label>
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
        <label className="mb-2 block text-sm font-medium text-navy">City *</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          className={inputClass(fieldErrors.city)}
        />
        <FieldHint error={fieldErrors.city} />
      </div>
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-navy">Project PDF (optional)</label>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={handlePdfChange}
          className={inputClass(fieldErrors.projectPdf)}
        />
        <FieldHint error={fieldErrors.projectPdf} />
        {projectPdf && (
          <p className="mt-1 text-xs text-stone-500">Selected: {projectPdf.name}</p>
        )}
        <p className="mt-1 text-xs text-stone-500">
          PDF up to 50MB. File is compressed automatically before storage. Shown as &quot;See project PDF&quot; on the project page when uploaded.
        </p>
      </div>
    </>
  );
}

export function validateAddProjectForm({ formData, projectData, images }) {
  const errors = {};
  if (!String(formData.title || '').trim()) errors.title = 'Project name is required.';
  if (!String(formData.description || '').trim()) errors.description = 'Description is required.';
  if (!String(formData.price || '').trim()) errors.price = 'Starting price is required.';
  if (!String(formData.location || '').trim()) errors.location = 'Location is required.';
  if (!String(formData.city || '').trim()) errors.city = 'City is required.';
  if (!String(projectData.developerName || '').trim()) {
    errors.developerName = 'Developer name is required.';
  }
  if (!projectData.bhkSelected?.length) {
    errors.bhkSelected = 'Select at least one BHK configuration.';
  }
  if (!images?.length) errors.images = 'At least one project image is required.';
  if (projectData.sqftFrom && projectData.sqftTo) {
    if (Number(projectData.sqftFrom) > Number(projectData.sqftTo)) {
      errors.sqftTo = 'Sq ft “to” must be greater than or equal to “from”.';
    }
  }
  const marketedErr = projectData.marketedBy
    ? getContactFieldError(projectData.marketedBy)
    : '';
  if (marketedErr) errors.marketedBy = marketedErr;
  return errors;
}
