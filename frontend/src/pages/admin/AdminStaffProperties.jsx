import StaffNav from '../../components/staff/StaffNav';
import ManageProperties from '../../components/staff/ManageProperties';

const AdminStaffProperties = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="admin" />
    <ManageProperties variant="admin" staffFilter="admin" />
  </div>
);

export default AdminStaffProperties;
