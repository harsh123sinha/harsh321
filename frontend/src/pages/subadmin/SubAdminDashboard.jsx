import { Link } from 'react-router-dom';
import { Users, Building2 } from 'lucide-react';
import StaffNav from '../../components/staff/StaffNav';
import AreaManagerCard from '../../components/staff/AreaManagerCard';

const SubAdminDashboard = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="subadmin" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-navy mb-8">Sub-admin dashboard</h1>
      <p className="text-gray mb-6 max-w-2xl">
        You can manage users and properties like an admin. Sub-admin accounts cannot create or remove other sub-admins.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
        <Link to="/subadmin/users" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
          <Users className="h-12 w-12 text-gold mb-4" />
          <h3 className="text-xl font-bold text-navy">Manage users</h3>
          <p className="text-sm text-gray mt-2">Add, edit, or remove user accounts</p>
        </Link>
        <Link to="/subadmin/properties" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
          <Building2 className="h-12 w-12 text-gold mb-4" />
          <h3 className="text-xl font-bold text-navy">Manage properties</h3>
          <p className="text-sm text-gray mt-2">Create and edit listings on behalf of owners</p>
        </Link>
        <AreaManagerCard apiPrefix="/subadmin" />
      </div>
    </div>
  </div>
);

export default SubAdminDashboard;
