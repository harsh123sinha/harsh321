import StaffNav from '../../components/staff/StaffNav';
import ManageProperties from '../../components/staff/ManageProperties';

const SubAdminProperties = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="subadmin" />
    <ManageProperties variant="subadmin" />
  </div>
);

export default SubAdminProperties;
