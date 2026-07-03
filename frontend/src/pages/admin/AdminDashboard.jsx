import { Link } from 'react-router-dom';
import { Users, Building2, UserCog, Briefcase, Target } from 'lucide-react';
import StaffNav from '../../components/staff/StaffNav';
import AreaManagerCard from '../../components/staff/AreaManagerCard';

const AdminDashboard = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="admin" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-navy mb-8">Admin dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/users" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
          <Users className="h-12 w-12 text-gold mb-4" />
          <h3 className="text-xl font-bold text-navy">Manage users</h3>
          <p className="text-sm text-gray mt-2">Add, edit, or remove accounts</p>
        </Link>
        <Link to="/admin/workers" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
          <Briefcase className="h-12 w-12 text-gold mb-4" />
          <h3 className="text-xl font-bold text-navy">Workers &amp; vendors</h3>
          <p className="text-sm text-gray mt-2">Employee IDs, phones, full profiles</p>
        </Link>
        <Link to="/admin/properties" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
          <Building2 className="h-12 w-12 text-gold mb-4" />
          <h3 className="text-xl font-bold text-navy">Manage properties</h3>
          <p className="text-sm text-gray mt-2">Listings, featured flag, photos</p>
        </Link>
        <Link to="/admin/mission" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
          <Target className="h-12 w-12 text-gold mb-4" />
          <h3 className="text-xl font-bold text-navy">Mission registrations</h3>
          <p className="text-sm text-gray mt-2">1 Zameen, Char Parivar interest forms</p>
        </Link>
        <Link to="/admin/subadmins" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
          <UserCog className="h-12 w-12 text-gold mb-4" />
          <h3 className="text-xl font-bold text-navy">Manage sub-admins</h3>
          <p className="text-sm text-gray mt-2">Team access to the panel</p>
        </Link>
        <AreaManagerCard apiPrefix="/admin" />
      </div>
    </div>
  </div>
);

export default AdminDashboard;
