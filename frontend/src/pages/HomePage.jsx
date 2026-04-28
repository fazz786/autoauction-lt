import { useState, useEffect } from 'react';
import { S } from '../styles/theme';
import { getAuctions } from '../api/auctions';
import { apiFetch } from '../api/config';
import CarCard from '../components/CarCard';

/* ─────────────────────────────────────────────────────────────────────────────
   HomePage.jsx
   Landing page with hero section, live auctions grid,
   how-it-works steps, featured vehicles, and seller CTA.
───────────────────────────────────────────────────────────────────────────── */
export default function HomePage({ setPage, setSelectedCar }) {
  const [auctions, setAuctions] = useState([]);
  const [stats, setStats] = useState({
    active_listings: '—', registered_buyers: '—', traded_this_month: '—', satisfaction_rate: '—',
  });

  useEffect(() => {
    getAuctions().then((data) => setAuctions(data.results || [])).catch(() => {});
    apiFetch('/auctions/stats/').then(setStats).catch(() => {});
  }, []);

  const mapAuction = (a) => ({
    id:            a.id,
    auctionId:     a.id,
    make:          a.listing?.make        || '',
    model:         a.listing?.model       || '',
    year:          a.listing?.year        || '',
    mileage:       a.listing?.mileage_display || '',
    fuel:          a.listing?.fuel        || '',
    transmission:  a.listing?.transmission || '',
    category:      a.listing?.category    || '',
    condition:     a.listing?.condition   || '',
    damage:        a.listing?.damage      || '',
    description:   a.listing?.description || '',
    startingBid:   parseFloat(a.listing?.starting_bid || 0),
    status:        a.status === 'scheduled' ? 'upcoming' : a.status,
    currentBid:    a.current_bid          || 0,
    auctionEnd:    new Date(a.end_time).getTime(),
    highestBidder: a.winner?.username     || '',
    images:        a.listing?.images?.map(i => i.image) || [],
    listing:       a.listing,
    bids: [], comments: [],
  });

  const liveCars = auctions.filter((a) => a.status === 'live').map(mapAuction);

  return (
    <div className="fade-in">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#080a10 0%,#111827 55%,#1a0e00 100%)',
        padding:    '90px 60px 70px',
        position:   'relative',
        overflow:   'hidden',
      }}>
        <div style={{ position: 'absolute', top: -120, right: -80, width: 700, height: 700, background: 'radial-gradient(circle,#f59e0b14 0%,transparent 68%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 400, height: 400, background: 'radial-gradient(circle,#3b82f608 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
          <div style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, letterSpacing: 4, marginBottom: 20, fontFamily: 'system-ui' }}>
            LITHUANIA'S PREMIER VEHICLE AUCTION PLATFORM
          </div>
          <h1 style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.04, color: '#f1f5f9', marginBottom: 24, letterSpacing: '-2px' }}>
            Bid Smart.<br />
            <span style={{ color: '#f59e0b' }}>Win Fair.</span>
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.75, marginBottom: 42, maxWidth: 540, fontFamily: 'system-ui' }}>
            Connecting rural sellers and small businesses with competitive buyers across Lithuania.
            Real-time bidding. Full transparency. Fair market prices.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={() => setPage('auctions')} style={{ ...S.btn, ...S.btnPrimary, fontSize: 16, padding: '14px 36px' }}>
              Browse Auctions →
            </button>
            <button onClick={() => setPage('signup')} style={{ ...S.btn, ...S.btnOutline, fontSize: 16, padding: '14px 36px' }}>
              Join Free
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 48, marginTop: 64 }}>
          {[
            [stats.active_listings === '—' ? '—' : stats.active_listings.toLocaleString(), 'Active Listings'],
            [stats.registered_buyers === '—' ? '—' : stats.registered_buyers.toLocaleString(), 'Registered Buyers'],
            [stats.traded_this_month === '—' ? '—' : `€${(stats.traded_this_month / 1e6).toFixed(1)}M`, 'Traded This Month'],
            [stats.satisfaction_rate === '—' ? '—' : `${stats.satisfaction_rate}%`, 'Satisfaction Rate'],
          ].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 38, fontWeight: 700, color: '#f59e0b', fontFamily: 'system-ui' }}>{n}</div>
              <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'system-ui', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live Auctions ────────────────────────────────────────────────── */}
      <div style={{ padding: '60px 60px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, letterSpacing: 3, marginBottom: 8, fontFamily: 'system-ui', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="live-dot" style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
              LIVE NOW
            </div>
            <h2 style={S.sectionTitle}>Active Auctions</h2>
          </div>
          <button onClick={() => setPage('auctions')} style={{ ...S.btn, ...S.btnOutline }}>View All →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
          {liveCars.map((car) => (
            <CarCard key={car.id} car={car} onClick={() => { setSelectedCar(car); setPage('carDetail'); }} />
          ))}
        </div>
      </div>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <div style={{ padding: '60px', background: '#0a0c14', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={S.sectionTag}>SIMPLE PROCESS</div>
          <h2 style={{ ...S.sectionTitle, textAlign: 'center' }}>How It Works</h2>
          <p style={{ color: '#64748b', fontFamily: 'system-ui', fontSize: 15, maxWidth: 520, margin: '12px auto 0' }}>
            Four easy steps to your next vehicle
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, maxWidth: 960, margin: '0 auto' }}>
          {[
            ['01', 'Register',  'Create your free account in minutes. Only a name, email, and password required.'],
            ['02', 'Browse',    'Explore vehicles with full specs, high-res photos, and verified condition reports.'],
            ['03', 'Bid',       'Place your bid in real time. Live countdown timers keep the pace transparent.'],
            ['04', 'Win',       'Admin confirms the winning bid. Contact the seller and complete your purchase.'],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ textAlign: 'center' }}>
              <div style={{
                width: 68, height: 68,
                background: '#f59e0b18', border: '1px solid #f59e0b33', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 24, fontWeight: 700, color: '#f59e0b', fontFamily: 'system-ui',
              }}>
                {num}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#f1f5f9' }}>{title}</div>
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65, fontFamily: 'system-ui' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured Vehicles ────────────────────────────────────────────── */}
      <div style={{ padding: '60px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={S.sectionTag}>FEATURED VEHICLES</div>
          <h2 style={S.sectionTitle}>Recently Listed</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
          {auctions.filter((a) => a.status !== 'ended').slice(0, 4).map(mapAuction).map((car) => (
            <CarCard key={car.id} car={car} compact onClick={() => { setSelectedCar(car); setPage('carDetail'); }} />
          ))}
        </div>
      </div>

      {/* ── Seller CTA ───────────────────────────────────────────────────── */}
      <div style={{
        margin:     '0 60px 60px',
        background: 'linear-gradient(135deg,#f59e0b18,#f59e0b06)',
        border:     '1px solid #f59e0b33',
        borderRadius: 18,
        padding:    '48px 60px',
        display:    'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: '#f1f5f9' }}>
            Ready to sell your vehicle?
          </h3>
          <p style={{ color: '#94a3b8', fontFamily: 'system-ui', fontSize: 15 }}>
            Register and contact our admin team to list your vehicle within 24 hours.
          </p>
        </div>
        <button onClick={() => setPage('signup')} style={{ ...S.btn, ...S.btnPrimary, fontSize: 16, padding: '14px 40px', whiteSpace: 'nowrap' }}>
          Get Started →
        </button>
      </div>
    </div>
  );
}
