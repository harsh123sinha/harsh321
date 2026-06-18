import StaffNav from '../../components/staff/StaffNav';
import ManageUsers from '../../components/staff/ManageUsers';

const AdminUsers = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="admin" />
    <ManageUsers variant="admin" />
  </div>
);

export default AdminUsers;
