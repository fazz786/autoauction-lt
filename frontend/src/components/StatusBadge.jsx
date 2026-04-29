/* ─────────────────────────────────────────────────────────────────────────────
   StatusBadge.jsx
   Displays auction status: LIVE / UPCOMING / ENDED
───────────────────────────────────────────────────────────────────────────── */
export default function StatusBadge({ status }) {
  const map = {
    live:     ['#22c55e', '● LIVE'],
    upcoming: ['#3b82f6', 'UPCOMING'],
    ended:    ['#6b7280', 'ENDED'],
    listed:   ['#a855f7', 'LISTED'],
  };
  const [color, label] = map[status] || ['#6b7280', 'UNKNOWN'];

  return (
    <span style={{
      background:    color + '22',
      color,
      border:        `1px solid ${color}44`,
      borderRadius:  5,
      padding:       '2px 10px',
      fontSize:      11,
      fontWeight:    700,
      letterSpacing: 1.5,
      fontFamily:    'system-ui',
    }}>
      {label}
    </span>
  );
}
