import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import RentProperties from './pages/RentProperties';
import BuyProperties from './pages/BuyProperties';
import OtherProperties from './pages/OtherProperties';
import PlotProperties from './pages/PlotProperties';
import ShopProperties from './pages/ShopProperties';
import PropertyDetail from './pages/PropertyDetail';
import SearchResults from './pages/SearchResults';
import Notifications from './pages/Notifications';
import SavedProperties from './pages/SavedProperties';
import BrokerSearch from './pages/broker/BrokerSearch';
import BrokerProperties from './pages/broker/BrokerProperties';
import BrokerReviews from './pages/broker/BrokerReviews';
import JobApply from './pages/JobApply';
import OurVendors from './pages/OurVendors';
import ServiceCategoryDetail from './pages/ServiceCategoryDetail';
import ServiceVendorDetail from './pages/ServiceVendorDetail';
import PatnaAreasIndex from './pages/PatnaAreasIndex';
import AreaFlatsForRent from './pages/AreaFlatsForRent';
import MissionRegister from './pages/MissionRegister';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard pages
import OwnerDashboard from './pages/dashboards/OwnerDashboard';
import AgentDashboard from './pages/dashboards/AgentDashboard';
import WorkerDashboard from './pages/dashboards/WorkerDashboard';
import BuyerDashboard from './pages/dashboards/BuyerDashboard';

// Property management
import AddProperty from './pages/properties/AddProperty';
import MyProperties from './pages/properties/MyProperties';
import EditProperty from './pages/properties/EditProperty';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminSubAdmins from './pages/admin/AdminSubAdmins';
import AdminWorkers from './pages/admin/AdminWorkers';
import AdminMission from './pages/admin/AdminMission';

// Sub-admin pages
import SubAdminLogin from './pages/subadmin/SubAdminLogin';
import SubAdminDashboard from './pages/subadmin/SubAdminDashboard';
import SubAdminUsers from './pages/subadmin/SubAdminUsers';
import SubAdminProperties from './pages/subadmin/SubAdminProperties';
import SubAdminMission from './pages/subadmin/SubAdminMission';

// Static pages
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import OurPricing from './pages/OurPricing';
import ChatWidget from './chatbot/ChatWidget';
import FcmBootstrap from './components/notifications/FcmBootstrap';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes with layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/rent" element={<RentProperties />} />
              <Route path="/buy" element={<BuyProperties />} />
              <Route path="/other" element={<OtherProperties />} />
              <Route path="/plots" element={<PlotProperties />} />
              <Route path="/shop" element={<ShopProperties />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/broker" element={<BrokerSearch />} />
              <Route path="/broker/:brokerId/properties" element={<BrokerProperties />} />
              <Route path="/broker/:brokerId/reviews" element={<BrokerReviews />} />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <SavedProperties />
                  </ProtectedRoute>
                }
              />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/our-pricing" element={<OurPricing />} />
              <Route path="/add-property" element={<AddProperty />} />
              <Route path="/job-apply" element={<JobApply />} />
              <Route path="/our-vendors" element={<OurVendors />} />
              <Route path="/our-vendors/category/:categoryId" element={<ServiceCategoryDetail />} />
              <Route path="/our-vendors/vendor/:id" element={<ServiceVendorDetail />} />
              <Route path="/patna" element={<PatnaAreasIndex />} />
              <Route path="/patna/:areaSlug/flats-for-rent" element={<AreaFlatsForRent />} />
              <Route path="/mission/register" element={<MissionRegister />} />
            </Route>

            {/* Auth routes (no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected dashboard routes with layout */}
            <Route element={<Layout />}>
              <Route
                path="/dashboard/owner"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/agent"
                element={
                  <ProtectedRoute allowedRoles={['agent']}>
                    <AgentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/worker"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/buyer"
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/my-properties"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'agent']}>
                    <MyProperties />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-property/:id"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'agent']}>
                    <EditProperty />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Admin routes (no layout) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/workers" element={<AdminWorkers />} />
            <Route path="/admin/mission" element={<AdminMission />} />
            <Route path="/admin/subadmins" element={<AdminSubAdmins />} />

            {/* Sub-admin routes (no layout) */}
            <Route path="/subadmin/login" element={<SubAdminLogin />} />
            <Route path="/subadmin/dashboard" element={<SubAdminDashboard />} />
            <Route path="/subadmin/users" element={<SubAdminUsers />} />
            <Route path="/subadmin/properties" element={<SubAdminProperties />} />
            <Route path="/subadmin/mission" element={<SubAdminMission />} />
          </Routes>
          <ChatWidget />
          <FcmBootstrap />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0F172A',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#D4AF37',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
