import { useState } from 'react';
import { createPortal } from 'react-dom';
import { S } from '../styles/theme';
import { submitSellerInquiry } from '../api/messages';

const FIELDS = [
  { key: 'name',         label: 'Full Name',         type: 'text',  placeholder: 'John Smith',           required: true  },
  { key: 'email',        label: 'Email Address',      type: 'email', placeholder: 'john@example.com',     required: true  },
  { key: 'phone',        label: 'Phone Number',       type: 'tel',   placeholder: '+370 600 12345',       required: false },
  { key: 'vehicle_info', label: 'Vehicle (optional)', type: 'text',  placeholder: 'e.g. 2018 BMW X5 SUV', required: false },
];

export default function SellerInquiryModal({ onClose, showToast }) {
  const [form,    setForm]    = useState({ name:'', email:'', phone:'', vehicle_info:'', message:'' });
  const [errors,  setErrors]  = useState({});
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.message.trim()) e.message = 'Please describe what you want to sell';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSending(true);
    try {
      await submitSellerInquiry(form);
      setSent(true);
      showToast('Inquiry sent! We\'ll be in touch within 24 hours.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not send inquiry. Try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  const overlay = (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding: 24,
      }}
    >
      <div style={{
        background:'#0d1117', border:'1px solid #1e293b', borderRadius:18,
        width:'100%', maxWidth:520, padding:'36px 40px', position:'relative',
        maxHeight:'90vh', overflowY:'auto',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position:'absolute', top:18, right:20, background:'none', border:'none', color:'#64748b', fontSize:22, cursor:'pointer', lineHeight:1 }}
        >✕</button>

        {sent ? (
          /* ── Success state ── */
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
            <h2 style={{ fontSize:22, fontWeight:700, marginBottom:12, color:'#f1f5f9' }}>Inquiry Sent!</h2>
            <p style={{ color:'#94a3b8', fontFamily:'system-ui', lineHeight:1.7, marginBottom:28 }}>
              Our admin team will review your details and contact you within <strong style={{color:'#f59e0b'}}>24 hours</strong>.
            </p>
            <button onClick={onClose} style={{...S.btn,...S.btnPrimary, fontSize:15, padding:'12px 32px'}}>
              Close
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <div style={{ marginBottom:28 }}>
              <div style={{ color:'#f59e0b', fontSize:12, fontWeight:700, letterSpacing:3, fontFamily:'system-ui', marginBottom:8 }}>
                SELL YOUR VEHICLE
              </div>
              <h2 style={{ fontSize:22, fontWeight:700, color:'#f1f5f9', marginBottom:8 }}>Contact Our Team</h2>
              <p style={{ color:'#64748b', fontFamily:'system-ui', fontSize:14, lineHeight:1.6 }}>
                Fill in your details and we'll get back to you within 24 hours to list your vehicle.
              </p>
            </div>

            <div style={{ display:'grid', gap:16 }}>
              {FIELDS.map(({ key, label, type, placeholder, required }) => (
                <div key={key}>
                  <label style={S.label}>
                    {label}{required && <span style={{color:'#ef4444',marginLeft:3}}>*</span>}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => { setForm(f => ({...f, [key]: e.target.value})); setErrors(er => ({...er, [key]: ''})); }}
                    style={{
                      ...S.input,
                      ...(errors[key] ? { border:'1px solid #ef4444' } : {}),
                    }}
                  />
                  {errors[key] && <div style={{ color:'#ef4444', fontSize:12, marginTop:4, fontFamily:'system-ui' }}>{errors[key]}</div>}
                </div>
              ))}

              <div>
                <label style={S.label}>
                  Message<span style={{color:'#ef4444',marginLeft:3}}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the vehicle you want to sell — make, model, year, condition, asking price, etc."
                  value={form.message}
                  onChange={e => { setForm(f => ({...f, message: e.target.value})); setErrors(er => ({...er, message:''})); }}
                  style={{
                    ...S.input, minHeight:100, resize:'vertical',
                    ...(errors.message ? { border:'1px solid #ef4444' } : {}),
                  }}
                />
                {errors.message && <div style={{ color:'#ef4444', fontSize:12, marginTop:4, fontFamily:'system-ui' }}>{errors.message}</div>}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={sending}
              style={{...S.btn,...S.btnPrimary, width:'100%', fontSize:15, padding:'14px', marginTop:24, opacity: sending ? 0.7 : 1}}
            >
              {sending ? 'Sending…' : 'Send Inquiry →'}
            </button>

            <p style={{ color:'#475569', fontSize:12, fontFamily:'system-ui', textAlign:'center', marginTop:14 }}>
              We'll contact you at the email address provided.
            </p>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
