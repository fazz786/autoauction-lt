import { useState, useRef, useEffect } from 'react';
import { S } from '../styles/theme';
import { NOTIFICATIONS } from '../data/mockData';

/* ─────────────────────────────────────────────────────────────────────────────
   Nav.jsx
   Sticky top navigation bar.
   Shows notification dropdown, user info, login/logout buttons.
───────────────────────────────────────────────────────────────────────────── */
export default function Nav({ page, setPage, user, setUser }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const ref = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav style={S.nav}>
      {/* Logo */}
      <div style={S.logo} onClick={() => setPage('home')}>
        AutoAuction
        <span style={{ color: '#64748b', fontSize: 11, marginLeft: 4, fontFamily: 'system-ui' }}>LT</span>
      </div>

      {/* Navigation links */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {[['home', 'Home'], ['auctions', 'Auctions']].map(([p, label]) => (
          <span
            key={p}
            onClick={() => setPage(p)}
            style={{ ...S.navLink, ...(page === p ? S.navLinkActive : {}) }}
          >
            {label}
          </span>
        ))}
        {user && (
          <span
            onClick={() => setPage('dashboard')}
            style={{ ...S.navLink, ...((page === 'dashboard' || page === 'admin') ? S.navLinkActive : {}) }}
          >
            {user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
          </span>
        )}
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {user ? (
          <>
            {/* Notification bell */}
            <div ref={ref} style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                style={{ ...S.btn, ...S.btnGhost, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <span>🔔</span>
                <span style={{
                  background: '#ef4444', color: '#fff', borderRadius: '50%',
                  width: 18, height: 18, fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {NOTIFICATIONS.length}
                </span>
              </button>

              {notifOpen && (
                <div style={{
                  position:     'absolute',
                  right:        0,
                  top:          52,
                  background:   '#0d1117',
                  border:       '1px solid #1e293b',
                  borderRadius: 14,
                  width:        340,
                  zIndex:       300,
                  padding:      16,
                  animation:    'slideDown 0.2s ease',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, fontFamily: 'system-ui', letterSpacing: 1 }}>
                    NOTIFICATIONS
                  </div>
                  {NOTIFICATIONS.map((n) => (
                    <div key={n.id} style={{
                      padding:      '12px 14px',
                      borderRadius: 9,
                      marginBottom: 8,
                      background:   n.type === 'warning' ? '#f59e0b10' : n.type === 'success' ? '#22c55e10' : '#3b82f610',
                      borderLeft:   `3px solid ${n.type === 'warning' ? '#f59e0b' : n.type === 'success' ? '#22c55e' : '#3b82f6'}`,
                    }}>
                      <div style={{ fontSize: 13, fontFamily: 'system-ui', lineHeight: 1.5 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontFamily: 'system-ui' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setPage('dashboard')} style={{ ...S.btn, ...S.btnGhost }}>
              👤 {user.name}
            </button>
            <button
              onClick={() => { setUser(null); setPage('home'); }}
              style={{ ...S.btn, ...S.btnOutline }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setPage('login')} style={{ ...S.btn, ...S.btnGhost }}>Login</button>
            <button onClick={() => setPage('signup')} style={{ ...S.btn, ...S.btnPrimary }}>Sign Up Free</button>
          </>
        )}
      </div>
    </nav>
  );
}
