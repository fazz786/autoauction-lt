import { useState } from 'react';
import { S } from '../styles/theme';
import { register } from '../api/auth';

export default function SignupPage({ setPage, setUser, showToast }) {
  const [form,  setForm]  = useState({ name: '', email: '', phone: '', country: 'Lithuania', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [step,  setStep]  = useState(1);
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const goToStep2 = () => {
    if (!form.name.trim()) { setError('Full name is required.'); return; }
    setError(''); setStep(2);
  };

  const submit = async () => {
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const result = await register(form);
      setUser(result.user);
      showToast('Account created! Welcome to AutoAuction LT!', 'success');
      setPage('home');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }} className="fade-in">
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 38, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Create Account</div>
          <div style={{ color: '#64748b', fontFamily: 'system-ui', fontSize: 15 }}>Join thousands of buyers and sellers</div>
        </div>
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 18, padding: 36 }}>
          <div style={{ display: 'flex', marginBottom: 32 }}>
            {[1, 2].map((s) => (
              <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                {s === 2 && <div style={{ position: 'absolute', top: 15, right: '50%', width: '100%', height: 2, background: step > 1 ? '#f59e0b' : '#1e293b', zIndex: 0 }} />}
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s ? '#f59e0b' : '#1e293b',
                  color: step >= s ? '#000' : '#64748b', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, fontFamily: 'system-ui', position: 'relative', zIndex: 1 }}>{s}</div>
                <div style={{ fontSize: 12, color: step >= s ? '#f59e0b' : '#64748b', fontFamily: 'system-ui' }}>
                  {s === 1 ? 'Personal Info' : 'Account Setup'}
                </div>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="fade-in">
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Full Name *</label>
                <input style={S.input} placeholder="Jonas Jonaitis" value={form.name} onChange={(e) => update('name', e.target.value)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Phone Number</label>
                <input style={S.input} placeholder="+370 600 00000" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={S.label}>Country</label>
                <select style={S.input} value={form.country} onChange={(e) => update('country', e.target.value)}>
                  {['Lithuania', 'Latvia', 'Estonia', 'Poland', 'Germany', 'Other'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 14, fontFamily: 'system-ui' }}>{error}</div>}
              <button onClick={goToStep2} style={{ ...S.btn, ...S.btnPrimary, width: '100%', fontSize: 15, padding: 14 }}>Continue →</button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Email Address *</label>
                <input style={S.input} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Password *</label>
                <input style={S.input} type="password" placeholder="Min. 6 characters" value={form.password} onChange={(e) => update('password', e.target.value)} />
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={S.label}>Confirm Password *</label>
                <input style={S.input} type="password" placeholder="Repeat password" value={form.confirm}
                  onChange={(e) => update('confirm', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
              </div>
              {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 14, fontFamily: 'system-ui',
                background: '#ef444410', border: '1px solid #ef444430', borderRadius: 8, padding: '10px 14px' }}>{error}</div>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(1)} style={{ ...S.btn, ...S.btnGhost, flex: 1 }}>← Back</button>
                <button onClick={submit} disabled={loading} style={{ ...S.btn, ...S.btnPrimary, flex: 2, fontSize: 15, padding: 14, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating…' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 22, color: '#64748b', fontSize: 14, fontFamily: 'system-ui' }}>
            Already have an account?{' '}
            <span onClick={() => setPage('login')} style={{ color: '#f59e0b', cursor: 'pointer' }}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
