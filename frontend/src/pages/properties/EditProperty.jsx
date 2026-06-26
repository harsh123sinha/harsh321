import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import BrandLoader from '../../components/ui/BrandLoader';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put(`/properties/${id}`, formData);
      if (response.data?.pendingReview) {
        toast.success(response.data.message || 'Listing submitted for admin review.');
      } else {
        toast.success('Property updated!');
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
        <h1 className="text-3xl font-bold text-navy mb-8">Edit Property</h1>
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
          <button type="submit" disabled={loading}
            className="w-full bg-gold text-navy py-3 rounded-lg font-bold hover:bg-gold/90 disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
