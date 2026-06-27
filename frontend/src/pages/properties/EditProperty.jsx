import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import BrandLoader from '../../components/ui/BrandLoader';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [projectPdf, setProjectPdf] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    },
  });

  useEffect(() => {
    if (data?.property) {
      setFormData(data.property);
    }
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isProject = formData.listing_kind === 'project';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (isProject) {
        const data = new FormData();
        data.append('title', formData.title || '');
        data.append('description', formData.description || '');
        data.append('price', String(formData.price ?? ''));
        if (projectPdf) data.append('project_pdf', projectPdf);
        response = await api.put(`/properties/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.put(`/properties/${id}`, formData);
      }
      if (response.data?.pendingReview) {
        toast.success(response.data.message || 'Listing submitted for admin review.');
      } else {
        toast.success(isProject ? 'Project updated!' : 'Property updated!');
      }
      navigate('/my-properties');
    } catch (error) {
      const data = error.response?.data;
      toast.error(data?.imageModeration?.userMessage || data?.error || 'Failed to update');
    }
    setLoading(false);
  };

  if (!formData.title) return <BrandLoader fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy mb-8">
          {isProject ? 'Edit Project' : 'Edit Property'}
        </h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* Similar fields as AddProperty */}
          <div>
            <label className="block text-sm font-medium text-navy mb-2">Title</label>
            <input type="text" name="title" value={formData.title || ''} onChange={handleChange} required
              className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-2">Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} required rows={4}
              className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-2">Price</label>
            <input type="number" name="price" value={formData.price || ''} onChange={handleChange} required
              className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none" />
          </div>
          {isProject && (
            <div>
              <label className="block text-sm font-medium text-navy mb-2">Project PDF (optional)</label>
              {formData.enclave_pdf_url && !projectPdf && (
                <a
                  href={formData.enclave_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-2 inline-flex items-center gap-1.5 text-sm text-gold hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  Current PDF
                </a>
              )}
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 50 * 1024 * 1024) {
                    e.target.value = '';
                    setProjectPdf(null);
                    toast.error('PDF is too large. Maximum size is 50MB.');
                    return;
                  }
                  setProjectPdf(file);
                }}
                className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none"
              />
              {projectPdf && (
                <p className="mt-1 text-xs text-stone-500">New file: {projectPdf.name}</p>
              )}
              <p className="mt-1 text-xs text-stone-500">
                PDF up to 50MB (compressed automatically). Upload a new PDF to replace the existing one.
              </p>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-gold text-navy py-3 rounded-lg font-bold hover:bg-gold/90 disabled:opacity-50">
            {loading ? 'Updating...' : isProject ? 'Update Project' : 'Update Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
