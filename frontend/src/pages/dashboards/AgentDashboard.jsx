import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PROPERTY_OWNER_QUICK_LINKS } from '../../constants/dashboardQuickLinks';

const AgentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-2">Agent Dashboard</h1>
          <p className="text-gray">Welcome back, {user?.name}!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROPERTY_OWNER_QUICK_LINKS.map((link) => (
            <Link
              key={link.title}
              to={link.to}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gold/10 p-4 rounded-full">
                  <link.icon className="h-8 w-8 text-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy">{link.title}</h3>
                  <p className="text-sm text-gray">{link.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
