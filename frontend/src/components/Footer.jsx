/* ─────────────────────────────────────────────────────────────────────────────
   Footer.jsx
   Site-wide footer with navigation links and project credits.
───────────────────────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer style={{
      background:   '#0d1117',
      borderTop:    '1px solid #1e293b',
      padding:      '48px 60px 32px',
      marginTop:    60,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
        {/* Brand */}
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b', marginBottom: 14 }}>
            AutoAuction LT
          </div>
          <p style={{ color: '#64748b', fontFamily: 'system-ui', fontSize: 14, lineHeight: 1.75, maxWidth: 290 }}>
            Lithuania's transparent online automobile auction platform.
            Connecting rural sellers with competitive buyers across the Baltic region.
          </p>
        </div>

        {/* Link columns */}
        {[
          ['Platform', ['Browse Auctions', 'How It Works', 'Register', 'Contact Admin']],
          ['Support',  ['Help Center', 'FAQ', 'Report Issue', 'GDPR Info']],
          ['Legal',    ['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'Accessibility']],
        ].map(([title, links]) => (
          <div key={title}>
            <div style={{
              fontWeight:    700,
              marginBottom:  16,
              letterSpacing: 1.5,
              fontSize:      11,
              color:         '#94a3b8',
              fontFamily:    'system-ui',
            }}>
              {title}
            </div>
            {links.map((l) => (
              <div key={l} style={{
                color:       '#64748b',
                fontSize:    14,
                fontFamily:  'system-ui',
                marginBottom: 10,
                cursor:      'pointer',
                transition:  'color 0.2s',
              }}
                onMouseEnter={(e) => { e.target.style.color = '#f59e0b'; }}
                onMouseLeave={(e) => { e.target.style.color = '#64748b'; }}
              >
                {l}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop:      '1px solid #1e293b',
        paddingTop:     24,
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        flexWrap:       'wrap',
        gap:            12,
      }}>
        <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'system-ui' }}>
          © 2025 AutoAuction LT · Vytautas Magnus University · Term Paper by Fazle Rabbi Mahim
        </span>
        <span style={{ color: '#334155', fontSize: 13, fontFamily: 'system-ui' }}>
          Built with ReactJS · Django · WebSockets
        </span>
      </div>
    </footer>
  );
}
