import { useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Toast.jsx
   Temporary notification popup.
   Auto-dismisses after 4 seconds.
───────────────────────────────────────────────────────────────────────────── */
export default function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: '#22c55e',
    error:   '#ef4444',
    info:    '#3b82f6',
    warning: '#f59e0b',
  };

  return (
    <div style={{
      position:   'fixed',
      bottom:     32,
      right:      32,
      zIndex:     9999,
      background: '#0d1117',
      border:     `1px solid ${colors[type] || '#334155'}`,
      borderRadius: 12,
      padding:    '16px 22px',
      maxWidth:   360,
      boxShadow:  '0 20px 60px rgba(0,0,0,0.5)',
      animation:  'slideDown 0.3s ease',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: colors[type] || '#334155',
          flexShrink: 0,
        }} />
        <span style={{ fontFamily: 'system-ui', fontSize: 14, color: '#e2e8f0' }}>
          {msg}
        </span>
        <span
          onClick={onClose}
          style={{ marginLeft: 'auto', cursor: 'pointer', color: '#64748b', fontSize: 18 }}>
          ×
        </span>
      </div>
    </div>
  );
}
