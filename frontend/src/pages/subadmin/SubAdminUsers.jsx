import StaffNav from '../../components/staff/StaffNav';
import ManageUsers from '../../components/staff/ManageUsers';

const SubAdminUsers = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="subadmin" />
    <ManageUsers variant="subadmin" />
  </div>
);

export default SubAdminUsers;
