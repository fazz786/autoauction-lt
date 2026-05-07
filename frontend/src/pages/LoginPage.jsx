import { useState } from 'react';
import { S } from '../styles/theme';
import { login } from '../api/auth';

export default function LoginPage({ setPage, setUser, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!username || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const result = await login(username, password);
      setUser(result.user);
      showToast('Welcome back, ' + (result.user.first_name || result.user.username) + '!', 'success');
      setPage(result.user.role === 'admin' ? 'admin' : 'home');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }} className="fade-in">
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 38, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Welcome Back</div>
          <div style={{ color: '#64748b', fontFamily: 'system-ui', fontSize: 15 }}>Sign in to your AutoAuction account</div>
        </div>
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 18, padding: 36 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={S.label}>Username</label>
            <input style={S.input} type="text" placeholder="your_username"
              value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
          </div>
          {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 16, fontFamily: 'system-ui',
            background: '#ef444410', border: '1px solid #ef444430', borderRadius: 8, padding: '10px 14px' }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading}
            style={{ ...S.btn, ...S.btnPrimary, width: '100%', fontSize: 15, padding: 14, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 22, color: '#64748b', fontSize: 14, fontFamily: 'system-ui' }}>
            Don't have an account?{' '}
            <span onClick={() => setPage('signup')} style={{ color: '#f59e0b', cursor: 'pointer' }}>Sign up free</span>
          </div>
        </div>
      </div>
    </div>
  );
}
