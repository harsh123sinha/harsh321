import StaffNav from '../../components/staff/StaffNav';
import ManageMission from '../../components/staff/ManageMission';

const AdminMission = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="admin" />
    <ManageMission variant="admin" />
  </div>
);

export default AdminMission;
