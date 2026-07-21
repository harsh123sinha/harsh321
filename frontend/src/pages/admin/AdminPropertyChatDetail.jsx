import StaffNav from '../../components/staff/StaffNav';
import StaffPropertyChatThread from '../../components/staff/StaffPropertyChatThread';

export default function AdminPropertyChatDetail() {
  return (
  <>
    <StaffNav variant="admin" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StaffPropertyChatThread variant="admin" />
    </div>
  </>
  );
}
