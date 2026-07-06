import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, Mail, Phone, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { isValidIndianMobile } from '../utils/helpers';

const JOB_RED = 'rgb(149, 0, 0)';
const JOB_RED_HOVER = 'rgb(120, 0, 0)';

const fieldAnim = (n) => `htls-hero-fade-up htls-hero-fade-up-${n}`;

export default function JobApply() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!isValidIndianMobile(form.phone_number)) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    const result = await signup(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
        role: 'worker',
        accept_terms: true,
      },
      null
    );

    if (result.success) {
      toast.success('Registration successful! Please complete your employee profile.');
      navigate('/dashboard/worker', { replace: true });
    } else {
      toast.error(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  const inputClass =
    'w-full rounded-lg border-2 border-stone-200 bg-white px-3 py-2.5 pl-9 text-sm text-navy transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 sm:px-4 sm:py-3 sm:pl-11 sm:text-base';

  const fieldIconClass =
    'pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 sm:left-3 sm:h-5 sm:w-5';

  const labelClass = 'mb-1 block text-xs font-medium text-navy sm:mb-1.5 sm:text-sm';

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-stone-100 via-white to-stone-50 py-4 sm:py-12">
      <div
        className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full opacity-20 blur-3xl"
        style={{ background: JOB_RED }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-20 h-48 w-48 rounded-full bg-gold/20 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-lg px-3 sm:px-6">
        <div className={`mb-4 text-center sm:mb-8 ${fieldAnim(1)}`}>
          <div
            className="htls-job-apply-btn mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full shadow-lg sm:mb-4 sm:h-14 sm:w-14"
            style={{ backgroundColor: JOB_RED }}
          >
            <Briefcase className="h-5 w-5 text-white sm:h-7 sm:w-7" />
          </div>
          <div className="mb-1.5 inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy sm:mb-2 sm:gap-1.5 sm:px-3 sm:py-1 sm:text-[11px]">
            <Sparkles className="h-3 w-3 text-gold sm:h-3.5 sm:w-3.5" />
            Career opportunity
          </div>
          <h1 className="htls-shimmer-text text-balance text-lg font-extrabold leading-snug sm:text-2xl md:text-[1.65rem]">
            Register with Harsh To Let Services
          </h1>
          <p className="mt-1.5 text-xs font-medium leading-snug text-stone-600 sm:mt-3 sm:text-base sm:leading-relaxed">
            Earn more money by getting job instantly
          </p>
          <div className="htls-hero-glow-line mx-auto mt-2 h-px w-12 bg-gradient-to-r from-transparent via-gold to-transparent sm:mt-4 sm:w-16" />
        </div>

        <form
          onSubmit={handleSubmit}
          className={`space-y-3 rounded-xl border border-stone-200/90 bg-white/95 p-3.5 shadow-lg shadow-navy/5 backdrop-blur-sm sm:space-y-4 sm:rounded-2xl sm:p-7 sm:shadow-xl ${fieldAnim(2)}`}
        >
          <div className={fieldAnim(3)}>
            <label className={labelClass}>Name *</label>
            <div className="relative">
              <User className={fieldIconClass} />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
                className={inputClass}
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className={fieldAnim(3)}>
            <label className={labelClass}>Email *</label>
            <div className="relative">
              <Mail className={fieldIconClass} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className={inputClass}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className={fieldAnim(4)}>
            <label className={labelClass}>Mobile number *</label>
            <div className="relative">
              <Phone className={fieldIconClass} />
              <input
                type="tel"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                required
                autoComplete="tel"
                className={inputClass}
                placeholder="10-digit mobile"
              />
            </div>
          </div>

          <div className={fieldAnim(4)}>
            <label className={labelClass}>Password *</label>
            <div className="relative">
              <Lock className={fieldIconClass} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className={`${inputClass} pr-10 sm:pr-12`}
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-navy sm:right-3"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
          </div>

          <div className={fieldAnim(5)}>
            <label className={labelClass}>Confirm password *</label>
            <div className="relative">
              <Lock className={fieldIconClass} />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className={`${inputClass} pr-10 sm:pr-12`}
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-navy sm:right-3"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
          </div>

          <label className={`flex items-start gap-2 pt-0.5 sm:gap-2.5 sm:pt-1 ${fieldAnim(5)}`}>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-stone-300 text-gold focus:ring-gold sm:mt-1 sm:h-4 sm:w-4"
            />
            <span className="text-[10px] leading-snug text-stone-600 sm:text-sm sm:leading-relaxed">
              I agree to the{' '}
              <Link to="/terms" className="font-semibold text-gold hover:underline">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-semibold text-gold hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="htls-job-apply-btn htls-hero-fade-up htls-hero-fade-up-5 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-white shadow-lg transition disabled:opacity-60 sm:rounded-xl sm:px-4 sm:py-3.5 sm:text-sm"
            style={{ backgroundColor: JOB_RED }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = JOB_RED_HOVER;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = JOB_RED;
            }}
          >
            {loading ? 'Registering…' : 'Register & get started'}
          </button>
        </form>

        <p className={`mt-4 text-center text-xs text-stone-600 sm:mt-6 sm:text-sm ${fieldAnim(5)}`}>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-gold hover:underline">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}
