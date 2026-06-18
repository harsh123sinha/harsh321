import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isValidIndianMobile } from '../../utils/helpers';
import toast from 'react-hot-toast';
import ScrollableLegalModal from '../../components/legal/ScrollableLegalModal';
import TermsContent from '../../components/legal/TermsContent';
import PrivacyContent from '../../components/legal/PrivacyContent';

/** Non-sensitive fields only — never store passwords in localStorage */
const SIGNUP_DRAFT_KEY = 'harshToLet_signup_draft_v1';

function loadSignupDraft() {
  try {
    const raw = localStorage.getItem(SIGNUP_DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    return {
      name: typeof data.name === 'string' ? data.name : '',
      email: typeof data.email === 'string' ? data.email : '',
      phone_number: typeof data.phone_number === 'string' ? data.phone_number : '',
      role: ['buyer', 'owner', 'agent'].includes(data.role) ? data.role : 'buyer',
      accept_terms: Boolean(data.accept_terms),
    };
  } catch {
    return null;
  }
}

function buildDraftPayload(formData) {
  return {
    name: formData.name,
    email: formData.email,
    phone_number: formData.phone_number,
    role: formData.role,
    accept_terms: formData.accept_terms,
  };
}

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'buyer',
    phone_number: '',
    accept_terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const draftHydrated = useRef(false);

  useEffect(() => {
    const draft = loadSignupDraft();
    if (draft) {
      setFormData((prev) => ({
        ...prev,
        ...draft,
      }));
    }
    draftHydrated.current = true;
  }, []);

  const persistDraft = useCallback((data) => {
    try {
      localStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(buildDraftPayload(data)));
    } catch {
      /* quota / private mode */
    }
  }, []);

  useEffect(() => {
    if (!draftHydrated.current) return;
    const t = setTimeout(() => persistDraft(formData), 400);
    return () => clearTimeout(t);
  }, [formData, persistDraft]);

  const openTermsModal = () => {
    persistDraft(formData);
    setTermsModalOpen(true);
  };

  const openPrivacyModal = () => {
    persistDraft(formData);
    setPrivacyModalOpen(true);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (!isValidIndianMobile(formData.phone_number)) {
      toast.error('Invalid Indian mobile number');
      return;
    }

    if (!formData.accept_terms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    const result = await signup(formData);

    if (result.success) {
      try {
        localStorage.removeItem(SIGNUP_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      toast.success('Account created successfully!');
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
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
              <UserPlus className="h-8 w-8 text-gold" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Create Account</h2>
            <p className="text-gray">Join us to start your property journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none text-navy touch-target"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
              <label className="block text-sm font-medium text-navy mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  pattern="[6-9][0-9]{9}"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none text-navy touch-target"
                  placeholder="9876543210"
                />
              </div>
              <p className="text-xs text-gray mt-1">10-digit Indian mobile number</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">I am a</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none text-navy appearance-none bg-white touch-target"
              >
                <option value="buyer">Buyer</option>
                <option value="owner">Owner</option>
                <option value="agent">Agent</option>
              </select>
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
                  minLength={6}
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

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-light rounded-lg focus:border-gold focus:outline-none text-navy touch-target"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                name="accept_terms"
                checked={formData.accept_terms}
                onChange={handleChange}
                required
                className="mt-1 h-5 w-5 text-gold border-gray-light rounded focus:ring-gold"
              />
              <label className="text-sm text-gray">
                I accept the{' '}
                <button
                  type="button"
                  onClick={openTermsModal}
                  className="text-gold font-semibold hover:underline"
                >
                  Terms & Conditions
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={openPrivacyModal}
                  className="text-gold font-semibold hover:underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-navy py-3 rounded-lg font-bold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray">
              Already have an account?{' '}
              <Link to="/login" className="text-gold font-semibold hover:underline">
                Login
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-gray hover:text-navy">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <ScrollableLegalModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title="Terms & Conditions"
      >
        <TermsContent />
      </ScrollableLegalModal>

      <ScrollableLegalModal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title="Privacy Policy"
      >
        <PrivacyContent />
      </ScrollableLegalModal>
    </div>
  );
};

export default Signup;
