import StaffNav from '../../components/staff/StaffNav';
import ManageWorkers from '../../components/staff/ManageWorkers';

const AdminWorkers = () => (
  <div className="min-h-screen bg-gray-50">
    <StaffNav variant="admin" />
    <ManageWorkers />
  </div>
);

export default AdminWorkers;
