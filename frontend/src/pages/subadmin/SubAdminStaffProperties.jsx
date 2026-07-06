import StaffNav from '../../components/staff/StaffNav';
import ManageProperties from '../../components/staff/ManageProperties';

const SubAdminStaffProperties = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="subadmin" />
    <ManageProperties variant="subadmin" staffFilter="subadmin" />
  </div>
);

export default SubAdminStaffProperties;
