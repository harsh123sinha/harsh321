import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import api from '../../utils/api';
import PropertyListRow from '../../components/properties/PropertyListRow';
import PropertyCard from '../../components/properties/PropertyCard';
import toast from 'react-hot-toast';

const MyProperties = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myProperties'],
    queryFn: async () => {
      const response = await api.get('/properties/user/my-properties');
      return response.data;
    },
  });

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Property deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete property');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-navy">My Properties</h1>
          <Link to="/add-property" className="bg-gold text-navy px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Property</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
          </div>
        ) : data?.properties?.length > 0 ? (
          <PropertyListRow
            properties={data.properties}
            renderCard={(property) => (
              <>
                <PropertyCard property={property} />
                <div className="absolute top-2 right-2 z-10 flex space-x-2">
                  <Link
                    to={`/edit-property/${property.id}`}
                    className="rounded-full bg-white p-2 shadow-md hover:bg-gray-50"
                  >
                    <Edit className="h-5 w-5 text-navy" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(property.id)}
                    className="rounded-full bg-white p-2 shadow-md hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </>
            )}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray mb-4">You haven't listed any properties yet.</p>
            <Link to="/add-property" className="text-gold font-semibold hover:underline">Add your first property</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProperties;
