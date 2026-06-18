import StaffNav from '../../components/staff/StaffNav';
import ManageSubAdmins from '../../components/staff/ManageSubAdmins';

const AdminSubAdmins = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="admin" />
    <ManageSubAdmins />
  </div>
);

export default AdminSubAdmins;
