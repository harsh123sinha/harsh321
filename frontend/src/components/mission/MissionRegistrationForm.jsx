import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const FUNDS_RANGES = [
  'Below 10 Lakh',
  '10-15 Lakh',
  '15-20 Lakh',
  '20-25 Lakh',
  '25 Lakh+',
];

const TIMELINES = ['Immediate', '1-2 months', '3-6 months', '6+ months'];
const FLOOR_OPTS = ['No preference', 'Ground', '1st', '2nd', '3rd'];
const FAMILY_OPTS = ['1-2 members', '3-4 members', '5+ members'];
const BHK_OPTS = ['1BHK', '2BHK', '3BHK'];

function digitsOnly(value, maxLen) {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, maxLen);
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="htls-mission-reg__error">{message}</p>;
}

export default function MissionRegistrationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    groupMode: 'match',
    groupCode: '',
    area: '',
    pincode: '',
    bhk: '2BHK',
    floor: 'No preference',
    familySize: '3-4 members',
    fundsRange: '',
    timeline: 'Immediate',
    consent: false,
  });

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    const name = form.name.trim();
    const mobile = digitsOnly(form.mobile, 10);
    const pincode = digitsOnly(form.pincode, 6);

    if (!name) next.name = 'Full name is required.';
    if (mobile.length !== 10) next.mobile = 'Enter a valid 10-digit mobile number.';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (pincode && pincode.length !== 6) next.pincode = 'Pincode must be exactly 6 digits.';
    if (!form.fundsRange) next.fundsRange = 'Select your money-in-hand range.';
    if (!form.consent) next.consent = 'You must accept the consent statement.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      mobile: digitsOnly(form.mobile, 10),
      email: form.email.trim() || undefined,
      groupMode: form.groupMode,
      groupCode: form.groupMode === 'group' ? form.groupCode.trim() || undefined : undefined,
      area: form.area.trim() || undefined,
      pincode: digitsOnly(form.pincode, 6) || undefined,
      bhk: form.bhk,
      floor: form.floor,
      familySize: form.familySize,
      fundsRange: form.fundsRange,
      timeline: form.timeline,
      consent: form.consent,
    };

    setSubmitting(true);
    try {
      // POST /api/register — backend also available at /api/mission/register
      const { data } = await api.post('/register', payload);
      toast.success(data.message || 'Registration submitted successfully!');
      if (data.groupCode && form.groupMode === 'group' && !form.groupCode.trim()) {
        toast(`Your group code: ${data.groupCode}`, { duration: 8000 });
      }
      setForm({
        name: '',
        mobile: '',
        email: '',
        groupMode: 'match',
        groupCode: '',
        area: '',
        pincode: '',
        bhk: '2BHK',
        floor: 'No preference',
        familySize: '3-4 members',
        fundsRange: '',
        timeline: 'Immediate',
        consent: false,
      });
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="htls-mission-reg">
      <header className="htls-mission-reg__hero">
        <p className="htls-mission-reg__hero-label">Our Mission</p>
        <h1 className="htls-mission-reg__hero-title">1 Zameen, Char Parivar, 4 Floor</h1>
        <p className="htls-mission-reg__hero-sub">Register your interest — Patna co-ownership scheme</p>
      </header>

      <form className="htls-mission-reg__card" onSubmit={handleSubmit} noValidate>
        {/* 1. Your Details */}
        <section className="htls-mission-reg__section">
          <h2 className="htls-mission-reg__section-title">Your Details</h2>
          <div className="htls-mission-reg__grid">
            <div className="htls-mission-reg__field htls-mission-reg__field--full">
              <label htmlFor="mr-name">Full Name *</label>
              <input
                id="mr-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className={errors.name ? 'is-invalid' : ''}
              />
              <FieldError message={errors.name} />
            </div>
            <div className="htls-mission-reg__field">
              <label htmlFor="mr-mobile">Mobile Number *</label>
              <input
                id="mr-mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10-digit mobile"
                value={form.mobile}
                onChange={(e) => setField('mobile', digitsOnly(e.target.value, 10))}
                className={errors.mobile ? 'is-invalid' : ''}
              />
              <FieldError message={errors.mobile} />
            </div>
            <div className="htls-mission-reg__field">
              <label htmlFor="mr-email">Email (optional)</label>
              <input
                id="mr-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                className={errors.email ? 'is-invalid' : ''}
              />
              <FieldError message={errors.email} />
            </div>
          </div>
        </section>

        {/* 2. Group Preference — backend group-matching will use groupMode + groupCode */}
        <section className="htls-mission-reg__section">
          <h2 className="htls-mission-reg__section-title">Group Preference</h2>
          <div className="htls-mission-reg__choice-row">
            <button
              type="button"
              className={`htls-mission-reg__choice-card ${form.groupMode === 'match' ? 'is-selected' : ''}`}
              onClick={() => setField('groupMode', 'match')}
            >
              <strong>Match Me</strong>
              <span>No group yet — we&apos;ll match you with 3 others by area, budget &amp; BHK.</span>
            </button>
            <button
              type="button"
              className={`htls-mission-reg__choice-card ${form.groupMode === 'group' ? 'is-selected' : ''}`}
              onClick={() => setField('groupMode', 'group')}
            >
              <strong>I Have My Own Group</strong>
              <span>Already have 3 members — register together with a shared group code.</span>
            </button>
          </div>
          {form.groupMode === 'group' && (
            <div className="htls-mission-reg__field htls-mission-reg__field--full mt-4">
              <label htmlFor="mr-group-code">Group Code (optional)</label>
              <input
                id="mr-group-code"
                type="text"
                placeholder="Enter existing code or leave blank for a new one"
                value={form.groupCode}
                onChange={(e) => setField('groupCode', e.target.value)}
              />
              <p className="htls-mission-reg__hint">
                {/* Group-matching service will link members sharing the same code on the backend. */}
                Leave blank to receive a new code after submission.
              </p>
            </div>
          )}
        </section>

        {/* 3. Location */}
        <section className="htls-mission-reg__section">
          <h2 className="htls-mission-reg__section-title">Location Preference</h2>
          <div className="htls-mission-reg__grid">
            <div className="htls-mission-reg__field">
              <label htmlFor="mr-area">Preferred Area / Locality</label>
              <input
                id="mr-area"
                type="text"
                value={form.area}
                onChange={(e) => setField('area', e.target.value)}
              />
            </div>
            <div className="htls-mission-reg__field">
              <label htmlFor="mr-pincode">Pincode</label>
              <input
                id="mr-pincode"
                type="text"
                inputMode="numeric"
                placeholder="6 digits"
                value={form.pincode}
                onChange={(e) => setField('pincode', digitsOnly(e.target.value, 6))}
                className={errors.pincode ? 'is-invalid' : ''}
              />
              <FieldError message={errors.pincode} />
            </div>
          </div>
        </section>

        {/* 4. Flat Preference */}
        <section className="htls-mission-reg__section">
          <h2 className="htls-mission-reg__section-title">Flat Preference</h2>
          <p className="htls-mission-reg__label-inline">BHK Type</p>
          <div className="htls-mission-reg__bhk-row">
            {BHK_OPTS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`htls-mission-reg__bhk-card ${form.bhk === opt ? 'is-selected' : ''}`}
                onClick={() => setField('bhk', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="htls-mission-reg__grid mt-4">
            <div className="htls-mission-reg__field">
              <label htmlFor="mr-floor">Floor Preference</label>
              <select
                id="mr-floor"
                value={form.floor}
                onChange={(e) => setField('floor', e.target.value)}
              >
                {FLOOR_OPTS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="htls-mission-reg__field">
              <label htmlFor="mr-family">Family Size</label>
              <select
                id="mr-family"
                value={form.familySize}
                onChange={(e) => setField('familySize', e.target.value)}
              >
                {FAMILY_OPTS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 5. Financial */}
        <section className="htls-mission-reg__section">
          <h2 className="htls-mission-reg__section-title">Financial Details</h2>
          <div className="htls-mission-reg__grid">
            <div className="htls-mission-reg__field">
              <label htmlFor="mr-funds">Money in Hand *</label>
              <select
                id="mr-funds"
                value={form.fundsRange}
                onChange={(e) => setField('fundsRange', e.target.value)}
                className={errors.fundsRange ? 'is-invalid' : ''}
              >
                <option value="">Select range</option>
                {FUNDS_RANGES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <FieldError message={errors.fundsRange} />
            </div>
            <div className="htls-mission-reg__field">
              <label htmlFor="mr-timeline">Remaining Amount Timeline</label>
              <select
                id="mr-timeline"
                value={form.timeline}
                onChange={(e) => setField('timeline', e.target.value)}
              >
                {TIMELINES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 6. Consent */}
        <section className="htls-mission-reg__section">
          <label className={`htls-mission-reg__consent ${errors.consent ? 'is-invalid' : ''}`}>
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setField('consent', e.target.checked)}
            />
            <span>
              I understand this form only registers my interest in the mission. It is not a booking or
              payment commitment. I agree to be contacted by the team for further discussion. *
            </span>
          </label>
          <FieldError message={errors.consent} />
        </section>

        <div className="htls-mission-reg__submit-wrap">
          <button type="submit" className="htls-mission-reg__submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Register Interest'}
            {!submitting && <ArrowRight className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </form>
    </div>
  );
}
