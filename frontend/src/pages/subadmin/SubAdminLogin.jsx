import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog, Mail, Lock } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SubAdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/subadmin/login', formData);
      localStorage.setItem('subAdminToken', response.data.token);
      toast.success('Sub-admin login successful');
      navigate('/subadmin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
            <UserCog className="h-8 w-8 text-gold" />
          </div>
          <h2 className="text-3xl font-bold text-navy mb-2">Sub-Admin Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-navy mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gold text-navy py-3 rounded-lg font-bold hover:bg-gold/90 disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login as Sub-Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubAdminLogin;
