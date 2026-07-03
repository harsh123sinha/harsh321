import StaffNav from '../../components/staff/StaffNav';
import ManageMission from '../../components/staff/ManageMission';

const SubAdminMission = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="subadmin" />
    <ManageMission variant="subadmin" />
  </div>
);

export default SubAdminMission;
