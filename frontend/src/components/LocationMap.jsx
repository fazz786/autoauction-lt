/* ─────────────────────────────────────────────────────────────────────────────
   LocationMap.jsx
   Free OpenStreetMap embed — no API key, no account required.
   Shows AutoAuction LT's location in Kaunas, Lithuania.
───────────────────────────────────────────────────────────────────────────── */

const LOCATION = {
  name:    'AutoAuction LT',
  address: 'K. Donelaičio g. 58',
  city:    'Kaunas 44248',
  country: 'Lithuania',
  phone:   '+370 600 00000',
  email:   'admin@autoauction.lt',
  hours:   'Mon – Fri: 9:00 – 18:00',
  lat:     54.8985,
  lon:     23.9201,
};

// OpenStreetMap embed: bbox is [west,south,east,north] around the pin
const OSM_EMBED = `https://www.openstreetmap.org/export/embed.html?bbox=${
  LOCATION.lon - 0.015},${LOCATION.lat - 0.008},${LOCATION.lon + 0.015},${LOCATION.lat + 0.008
}&layer=mapnik&marker=${LOCATION.lat},${LOCATION.lon}`;

const OSM_LINK = `https://www.openstreetmap.org/?mlat=${LOCATION.lat}&mlon=${LOCATION.lon}#map=16/${LOCATION.lat}/${LOCATION.lon}`;

export default function LocationMap() {
  return (
    <section style={{ marginTop: 72 }}>
      {/* Section header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700, letterSpacing: 3, fontFamily: 'system-ui', marginBottom: 10 }}>
          FIND US
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
          Our Location
        </h2>
        <p style={{ color: '#64748b', fontFamily: 'system-ui', fontSize: 15 }}>
          Visit our office in Kaunas or reach us online — we're always available.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'stretch' }}>

        {/* Map iframe */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #1e293b', position: 'relative', minHeight: 360 }}>
          <iframe
            title="AutoAuction LT location"
            src={OSM_EMBED}
            width="100%"
            height="100%"
            style={{ display: 'block', border: 0, minHeight: 360 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* "Open in OSM" link overlay */}
          <a
            href={OSM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute', bottom: 10, right: 10,
              background: '#0d1117cc', color: '#94a3b8',
              fontSize: 11, fontFamily: 'system-ui', padding: '4px 10px',
              borderRadius: 6, textDecoration: 'none', backdropFilter: 'blur(4px)',
              border: '1px solid #1e293b',
            }}
          >
            Open in OpenStreetMap ↗
          </a>
        </div>

        {/* Info card */}
        <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Address */}
          <div>
            <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, fontFamily: 'system-ui', marginBottom: 10 }}>ADDRESS</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{LOCATION.name}</div>
            <div style={{ color: '#94a3b8', fontFamily: 'system-ui', fontSize: 14, lineHeight: 1.7 }}>
              {LOCATION.address}<br />
              {LOCATION.city}<br />
              {LOCATION.country}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b' }} />

          {/* Contact */}
          <div>
            <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, fontFamily: 'system-ui', marginBottom: 10 }}>CONTACT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href={`tel:${LOCATION.phone}`}
                style={{ color: '#94a3b8', fontFamily: 'system-ui', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>📞</span> {LOCATION.phone}
              </a>
              <a href={`mailto:${LOCATION.email}`}
                style={{ color: '#3b82f6', fontFamily: 'system-ui', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>✉</span> {LOCATION.email}
              </a>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b' }} />

          {/* Hours */}
          <div>
            <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, fontFamily: 'system-ui', marginBottom: 10 }}>OFFICE HOURS</div>
            <div style={{ color: '#94a3b8', fontFamily: 'system-ui', fontSize: 14, lineHeight: 1.7 }}>
              {LOCATION.hours}<br />
              <span style={{ color: '#475569' }}>Sat – Sun: Closed</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b' }} />

          {/* Directions link */}
          <a
            href={OSM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#1e293b', color: '#f1f5f9',
              border: '1px solid #334155', borderRadius: 10,
              padding: '11px 20px', fontFamily: 'system-ui', fontSize: 14, fontWeight: 600,
              textDecoration: 'none', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#334155'}
            onMouseLeave={e => e.currentTarget.style.background = '#1e293b'}
          >
            🗺 Get Directions
          </a>
        </div>
      </div>
    </section>
  );
}
