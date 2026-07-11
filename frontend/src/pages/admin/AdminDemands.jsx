import StaffNav from '../../components/staff/StaffNav';
import ManageDemands from '../../components/staff/ManageDemands';

const AdminDemands = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="admin" />
    <ManageDemands variant="admin" />
  </div>
);

export default AdminDemands;
