import { Link } from 'react-router-dom';
import { Users, Building2, UserCog } from 'lucide-react';
import StaffNav from '../../components/staff/StaffNav';

const AdminDashboard = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="admin" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-navy mb-8">Admin dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link to="/admin/users" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
          <Users className="h-12 w-12 text-gold mb-4" />
          <h3 className="text-xl font-bold text-navy">Manage users</h3>
          <p className="text-sm text-gray mt-2">Add, edit, or remove accounts</p>
        </Link>
        <Link to="/admin/properties" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
          <Building2 className="h-12 w-12 text-gold mb-4" />
          <h3 className="text-xl font-bold text-navy">Manage properties</h3>
          <p className="text-sm text-gray mt-2">Listings, featured flag, photos</p>
        </Link>
        <Link to="/admin/subadmins" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
          <UserCog className="h-12 w-12 text-gold mb-4" />
          <h3 className="text-xl font-bold text-navy">Manage sub-admins</h3>
          <p className="text-sm text-gray mt-2">Team access to the panel</p>
        </Link>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
