import { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Countdown.jsx
   Live countdown timer that updates every second.
   Used on auction cards and the vehicle detail page.
───────────────────────────────────────────────────────────────────────────── */
function useCountdown(endTime) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const tick = () => setTimeLeft(Math.max(0, endTime - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const pad = (n) => String(n).padStart(2, '0');
  const h = Math.floor(timeLeft / 3600000);
  const m = Math.floor((timeLeft % 3600000) / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);

  return { h, m, s, done: timeLeft === 0, fmt: `${pad(h)}:${pad(m)}:${pad(s)}` };
}

export default function Countdown({ endTime, size = 'sm' }) {
  const { fmt, done, h } = useCountdown(endTime);
  const urgent = h < 2;

  if (done) {
    return (
      <span style={{ color: '#ef4444', fontWeight: 700, fontSize: size === 'lg' ? 28 : 13 }}>
        ENDED
      </span>
    );
  }

  return (
    <span style={{
      color:       urgent ? '#ef4444' : '#f59e0b',
      fontWeight:  700,
      fontFamily:  "'Courier New', monospace",
      fontSize:    size === 'lg' ? 32 : 13,
      letterSpacing: 2,
    }}>
      {fmt}
    </span>
  );
}
