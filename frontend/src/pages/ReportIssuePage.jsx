import { useState } from 'react';
import { S } from '../styles/theme';
import { submitSellerInquiry } from '../api/messages';

const CATEGORIES = [
  'Technical problem (bug / error)',
  'Bid dispute or auction issue',
  'Account access problem',
  'Inappropriate content or user',
  'GDPR / data deletion request',
  'Accessibility issue',
  'Other',
];

export default function ReportIssuePage({ setPage, showToast, user }) {
  const [form, setForm] = useState({
    name:         user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    email:        user?.email || '',
    phone:        '',
    vehicle_info: '',   // reused for issue category
    message:      '',
  });
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [errors,   setErrors]   = useState({});
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.message.trim()) e.message = 'Please describe the issue';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSending(true);
    try {
      await submitSellerInquiry({ ...form, vehicle_info: `[REPORT] ${category}` });
      setSent(true);
      showToast('Issue reported — we will review it shortly.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not submit. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: '' })); };

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '48px 60px 80px' }} className="fade-in">
      {/* Back */}
      <div onClick={() => setPage('home')} style={{ color: '#64748b', fontSize: 14, cursor: 'pointer', fontFamily: 'system-ui', marginBottom: 32 }}>
        ← Back to Home
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, letterSpacing: 3, fontFamily: 'system-ui', marginBottom: 10 }}>SUPPORT</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Report an Issue</h1>
        <p style={{ color: '#64748b', fontFamily: 'system-ui', fontSize: 15, lineHeight: 1.7 }}>
          Report a technical problem, dispute, or GDPR request. Our admin team reviews all submissions and responds within 2 business days.
        </p>
      </div>

      <div style={{ borderTop: '1px solid #1e293b', marginBottom: 32 }} />

      {sent ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Issue Reported</h2>
          <p style={{ color: '#94a3b8', fontFamily: 'system-ui', lineHeight: 1.7, marginBottom: 28 }}>
            We'll review your report and respond at <strong style={{color:'#f59e0b'}}>{form.email}</strong> within 2 business days.
          </p>
          <button onClick={() => setPage('home')} style={{ ...S.btn, ...S.btnPrimary, fontSize: 15, padding: '12px 32px' }}>
            Back to Home
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {/* Category */}
          <div>
            <label style={S.label}>Issue Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={S.input}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Name */}
          <div>
            <label style={S.label}>Full Name <span style={{color:'#ef4444'}}>*</span></label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              style={{ ...S.input, ...(errors.name ? { border: '1px solid #ef4444' } : {}) }} placeholder="Your full name" />
            {errors.name && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontFamily: 'system-ui' }}>{errors.name}</div>}
          </div>

          {/* Email */}
          <div>
            <label style={S.label}>Email Address <span style={{color:'#ef4444'}}>*</span></label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              style={{ ...S.input, ...(errors.email ? { border: '1px solid #ef4444' } : {}) }} placeholder="you@example.com" />
            {errors.email && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontFamily: 'system-ui' }}>{errors.email}</div>}
          </div>

          {/* Message */}
          <div>
            <label style={S.label}>Describe the Issue <span style={{color:'#ef4444'}}>*</span></label>
            <textarea rows={5} value={form.message} onChange={e => set('message', e.target.value)}
              style={{ ...S.input, minHeight: 120, resize: 'vertical', ...(errors.message ? { border: '1px solid #ef4444' } : {}) }}
              placeholder="Please describe the problem in as much detail as possible — include steps to reproduce if it's a technical bug." />
            {errors.message && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontFamily: 'system-ui' }}>{errors.message}</div>}
          </div>

          <button onClick={handleSubmit} disabled={sending}
            style={{ ...S.btn, ...S.btnPrimary, fontSize: 15, padding: '14px', opacity: sending ? 0.7 : 1 }}>
            {sending ? 'Submitting…' : 'Submit Report →'}
          </button>

          <p style={{ color: '#475569', fontSize: 12, fontFamily: 'system-ui', textAlign: 'center' }}>
            For urgent issues, email <strong style={{color:'#64748b'}}>admin@autoauction.lt</strong> directly.
          </p>
        </div>
      )}
    </div>
  );
}
