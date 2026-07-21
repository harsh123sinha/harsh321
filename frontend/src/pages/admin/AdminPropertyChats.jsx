import StaffNav from '../../components/staff/StaffNav';
import ManagePropertyChats from '../../components/staff/ManagePropertyChats';

export default function AdminPropertyChats() {
  return (
  <>
    <StaffNav variant="admin" />
    <ManagePropertyChats variant="admin" />
  </>
  );
}
