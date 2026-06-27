import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getSafeInternalReturnPath } from '../../utils/helpers';
import { buildAuthSwitchUrl } from '../../utils/addListingDraft';
import toast from 'react-hot-toast';

const LOGIN_EMAIL_DRAFT_KEY = 'harshToLet_login_email_v1';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailDraftLoaded = useRef(false);
  const contactHintShown = useRef(false);
  const listingHintShown = useRef(false);

  useEffect(() => {
    if (searchParams.get('from') !== 'contact' || contactHintShown.current) return;
    contactHintShown.current = true;
    toast(
      'Please log in to view full office numbers and to use WhatsApp chat with a pre-filled message.',
      { duration: 6000, id: 'login-contact-hint' }
    );
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('from') !== 'listing' || listingHintShown.current) return;
    listingHintShown.current = true;
    toast('Log in to publish your property listing. Your form details are saved.', {
      duration: 6000,
      id: 'login-listing-hint',
    });
  }, [searchParams]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOGIN_EMAIL_DRAFT_KEY);
      if (saved && typeof saved === 'string') {
        setFormData((prev) => ({ ...prev, email: saved }));
      }
    } catch {
      /* ignore */
    }
    emailDraftLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!emailDraftLoaded.current) return;
    const t = setTimeout(() => {
      try {
        if (formData.email.trim()) localStorage.setItem(LOGIN_EMAIL_DRAFT_KEY, formData.email.trim());
        else localStorage.removeItem(LOGIN_EMAIL_DRAFT_KEY);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [formData.email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      try {
        localStorage.removeItem(LOGIN_EMAIL_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      toast.success('Login successful!');
      const next = getSafeInternalReturnPath(searchParams.get('next'));
      if (next) {
        navigate(next, { replace: true });
        setLoading(false);
        return;
      }
      const role = result.user.role;
      if (role === 'owner') navigate('/dashboard/owner');
      else if (role === 'agent') navigate('/dashboard/agent');
      else if (role === 'buyer') navigate('/dashboard/buyer');
      else navigate('/');
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
              <LogIn className="h-8 w-8 text-gold" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Welcome Back</h2>
            <p className="text-gray">Login to access your account</p>
            {searchParams.get('from') === 'contact' ? (
              <p className="mt-4 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2.5 text-left text-sm leading-snug text-navy">
                You need to be logged in to see full office numbers and to open WhatsApp with a pre-filled message about
                the listing.
              </p>
            ) : null}
            {searchParams.get('from') === 'listing' ? (
              <p className="mt-4 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2.5 text-left text-sm leading-snug text-navy">
                Log in to publish your listing. After login you&apos;ll return to the add-property form with your
                details restored.
              </p>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none text-navy touch-target"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none text-navy touch-target"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-navy touch-target"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-gold hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-navy py-3 rounded-lg font-bold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray">
              Don't have an account?{' '}
              <Link to={buildAuthSwitchUrl('/signup', searchParams)} className="text-gold font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray hover:text-navy">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
