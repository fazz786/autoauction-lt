import { useState } from 'react';
import { S } from '../styles/theme';
import { CARS, NOTIFICATIONS } from '../data/mockData';
import CarCard from '../components/CarCard';
import StatusBadge from '../components/StatusBadge';

/* ─────────────────────────────────────────────────────────────────────────────
   DashboardPage.jsx
   Logged-in user personal dashboard with:
     - Overview: recent activity + recommended auctions
     - Bids: full bid history table
     - Profile: editable personal information
     - Notifications: preference toggles
───────────────────────────────────────────────────────────────────────────── */
export default function DashboardPage({ user, setPage, setSelectedCar, showToast }) {
  const [tab, setTab] = useState('overview');

  return (
    <div style={S.page} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
        <div>
          <div style={{ color: '#64748b', fontSize: 14, fontFamily: 'system-ui', marginBottom: 4 }}>Welcome back,</div>
          <h1 style={{ ...S.sectionTitle, marginBottom: 0 }}>{user.name}</h1>
        </div>
        <button onClick={() => setPage('auctions')} style={{ ...S.btn, ...S.btnOutline }}>
          Browse Auctions →
        </button>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 36 }}>
        {[
          ['Active Bids',   '3',       '#f59e0b'],
          ['Auctions Won',  '1',       '#22c55e'],
          ['Total Spent',   '€21,800', '#3b82f6'],
          ['Watchlist',     '5',       '#a855f7'],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 13, padding: '24px 26px' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'system-ui', fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>
              {label.toUpperCase()}
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, color, fontFamily: 'system-ui' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', marginBottom: 28 }}>
        {['overview', 'bids', 'profile', 'notifications'].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            background:   'none',
            border:       'none',
            borderBottom: tab === t ? '2px solid #f59e0b' : '2px solid transparent',
            padding:      '12px 22px',
            color:        tab === t ? '#f59e0b' : '#64748b',
            fontWeight:   700,
            cursor:       'pointer',
            fontSize:     14,
            fontFamily:   'system-ui',
            letterSpacing: 0.5,
          }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Overview ───────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="fade-in">
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Recent Activity</h3>
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 10, padding: '16px 20px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.type === 'warning' ? '#f59e0b' : n.type === 'success' ? '#22c55e' : '#3b82f6', flexShrink: 0 }} />
                <span style={{ fontFamily: 'system-ui', fontSize: 14 }}>{n.text}</span>
              </div>
              <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'system-ui', flexShrink: 0, marginLeft: 16 }}>{n.time}</span>
            </div>
          ))}

          <h3 style={{ fontSize: 17, fontWeight: 700, margin: '28px 0 18px' }}>Recommended for You</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
            {CARS.filter((c) => c.status === 'live').slice(0, 3).map((car) => (
              <CarCard key={car.id} car={car} compact onClick={() => { setSelectedCar(car); setPage('carDetail'); }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Bids history ────────────────────────────────────────────────── */}
      {tab === 'bids' && (
        <div className="fade-in">
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Bid History</h3>
          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>Vehicle</th>
              <th style={S.th}>Your Bid</th>
              <th style={S.th}>Current Bid</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Auction</th>
            </tr></thead>
            <tbody>
              {CARS.slice(0, 5).map((car) => (
                <tr key={car.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedCar(car); setPage('carDetail'); }}>
                  <td style={{ ...S.td, fontWeight: 600 }}>{car.year} {car.make} {car.model}</td>
                  <td style={{ ...S.td, color: '#94a3b8', fontFamily: 'system-ui' }}>€{(car.currentBid - 300).toLocaleString()}</td>
                  <td style={{ ...S.td, color: '#f59e0b', fontWeight: 700, fontFamily: 'system-ui' }}>€{car.currentBid.toLocaleString()}</td>
                  <td style={S.td}>
                    {car.status === 'live'   && <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 700 }}>OUTBID</span>}
                    {car.status === 'ended'  && <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 700 }}>WON</span>}
                    {car.status === 'upcoming' && <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>PENDING</span>}
                  </td>
                  <td style={S.td}><StatusBadge status={car.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Profile ─────────────────────────────────────────────────────── */}
      {tab === 'profile' && (
        <div className="fade-in" style={{ maxWidth: 560 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 22 }}>Edit Profile</h3>
          <div style={{ display: 'grid', gap: 18 }}>
            {[['Full Name', user.name, 'text'], ['Email Address', user.email, 'email'], ['Phone Number', '', 'tel'], ['Country', 'Lithuania', 'text']].map(([label, val, type]) => (
              <div key={label}>
                <label style={S.label}>{label}</label>
                <input style={S.input} type={type} defaultValue={val} />
              </div>
            ))}
          </div>
          <button onClick={() => showToast('Profile updated successfully!', 'success')}
            style={{ ...S.btn, ...S.btnPrimary, marginTop: 22, fontSize: 14, padding: '12px 28px' }}>
            Save Changes
          </button>
        </div>
      )}

      {/* ── Notifications ────────────────────────────────────────────────── */}
      {tab === 'notifications' && (
        <div className="fade-in">
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Notification Preferences</h3>
          {[
            ['Outbid alerts', true],
            ['Auction ending reminders (1 hour before)', true],
            ['New listings in my categories', false],
            ['Admin messages', true],
            ['Bid approval / rejection updates', true],
            ['Weekly digest email', false],
          ].map(([label, defaultOn], i) => (
            <div key={i} style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 10, padding: '16px 20px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'system-ui', fontSize: 14 }}>{label}</span>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: defaultOn ? '#f59e0b' : '#1e293b', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: defaultOn ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
