import StaffNav from '../../components/staff/StaffNav';
import ManageDemands from '../../components/staff/ManageDemands';

const SubAdminDemands = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="subadmin" />
    <ManageDemands variant="subadmin" />
  </div>
);

export default SubAdminDemands;
