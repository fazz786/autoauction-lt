/* ─────────────────────────────────────────────────────────────────────────────
   theme.js
   Shared design tokens and reusable inline-style objects.
   All components import from here to keep styling consistent.
───────────────────────────────────────────────────────────────────────────── */

export const colors = {
  bg:         '#080a10',
  surface:    '#0d1117',
  border:     '#1e293b',
  borderDim:  '#334155',
  textPrimary:'#f1f5f9',
  textBody:   '#e2e8f0',
  textMuted:  '#94a3b8',
  textDim:    '#64748b',
  amber:      '#f59e0b',
  green:      '#22c55e',
  blue:       '#3b82f6',
  red:        '#ef4444',
  purple:     '#a855f7',
};

/* ─── Reusable inline style objects ──────────────────────────────────────── */
export const S = {
  /* Layout */
  page: {
    padding: '44px 60px',
  },

  /* Nav */
  nav: {
    background:    colors.surface,
    borderBottom:  `1px solid ${colors.border}`,
    padding:       '0 48px',
    display:       'flex',
    alignItems:    'center',
    justifyContent:'space-between',
    height:        66,
    position:      'sticky',
    top:           0,
    zIndex:        200,
  },
  logo: {
    fontFamily:  'Georgia, serif',
    fontSize:    22,
    fontWeight:  700,
    color:       colors.amber,
    letterSpacing: 2,
    cursor:      'pointer',
    userSelect:  'none',
  },
  navLink: {
    color:       colors.textMuted,
    fontSize:    14,
    cursor:      'pointer',
    fontFamily:  'system-ui',
    letterSpacing: 0.5,
    padding:     '4px 0',
    borderBottom:'2px solid transparent',
    transition:  'all 0.2s',
  },
  navLinkActive: {
    color:       colors.amber,
    borderBottom:`2px solid ${colors.amber}`,
  },

  /* Buttons */
  btn: {
    padding:     '10px 22px',
    borderRadius: 7,
    fontWeight:  700,
    cursor:      'pointer',
    fontSize:    14,
    border:      'none',
    transition:  'all 0.18s',
    fontFamily:  'system-ui',
    letterSpacing: 0.3,
  },
  btnPrimary: {
    background: colors.amber,
    color:      '#000',
  },
  btnOutline: {
    background: 'transparent',
    color:      colors.amber,
    border:     `1px solid ${colors.amber}`,
  },
  btnGhost: {
    background: colors.border,
    color:      colors.textMuted,
    border:     `1px solid ${colors.borderDim}`,
  },
  btnDanger: {
    background: colors.red,
    color:      '#fff',
  },
  btnSuccess: {
    background: colors.green,
    color:      '#fff',
  },

  /* Cards */
  card: {
    background:  colors.surface,
    border:      `1px solid ${colors.border}`,
    borderRadius: 14,
    overflow:    'hidden',
    cursor:      'pointer',
    transition:  'all 0.22s',
  },
  cardHovered: {
    border:     `1px solid ${colors.amber}44`,
    transform:  'translateY(-5px)',
    boxShadow:  '0 24px 50px rgba(0,0,0,0.45)',
  },

  /* Form */
  input: {
    background:  colors.border,
    border:      `1px solid ${colors.borderDim}`,
    borderRadius: 8,
    padding:     '11px 15px',
    color:       colors.textBody,
    fontSize:    14,
    width:       '100%',
    fontFamily:  'system-ui',
  },
  label: {
    color:       colors.textMuted,
    fontSize:    13,
    fontWeight:  600,
    marginBottom: 6,
    display:     'block',
    fontFamily:  'system-ui',
    letterSpacing: 0.3,
  },

  /* Typography */
  sectionTitle: {
    fontSize:    34,
    fontWeight:  700,
    color:       colors.textPrimary,
    letterSpacing: '-0.5px',
    marginBottom: 8,
  },
  sectionTag: {
    color:       colors.amber,
    fontSize:    12,
    fontWeight:  700,
    letterSpacing: 3,
    marginBottom: 8,
    fontFamily:  'system-ui',
  },

  /* Chips */
  chip: {
    padding:     '4px 13px',
    borderRadius: 20,
    fontSize:    12,
    fontWeight:  600,
    cursor:      'pointer',
    fontFamily:  'system-ui',
    border:      '1px solid transparent',
    transition:  'all 0.18s',
    userSelect:  'none',
  },

  /* Tables */
  table: {
    width:           '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding:       '12px 16px',
    textAlign:     'left',
    color:         colors.textDim,
    fontSize:      11,
    fontWeight:    700,
    letterSpacing: 1.2,
    borderBottom:  `1px solid ${colors.border}`,
    fontFamily:    'system-ui',
    textTransform: 'uppercase',
  },
  td: {
    padding:      '14px 16px',
    borderBottom: `1px solid rgba(30,41,59,0.5)`,
    fontSize:     14,
    fontFamily:   'system-ui',
    verticalAlign:'middle',
  },
};
