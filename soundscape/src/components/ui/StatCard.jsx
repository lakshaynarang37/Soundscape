import { useState, useEffect, useRef } from "react";

export default function StatCard({ label, value, isText = false }) {
  const [display, setDisplay] = useState(isText ? value : 0);
  const prevValue = useRef(0);

  useEffect(() => {
    if (isText || value === prevValue.current) {
      setDisplay(value);
      return;
    }

    const from = prevValue.current;
    const to = Number(value);
    const duration = 800;
    const start = performance.now();

    prevValue.current = to;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value, isText]);

  return (
    <div className="depth-card relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-spotify/10 blur-2xl" />
      <p className="text-text-muted text-[11px] font-mono uppercase tracking-[0.22em] mb-3 relative z-10">
        {label}
      </p>
      <p className="text-4xl font-display font-bold text-text-primary leading-none relative z-10 text-glow">
        {display}
      </p>
    </div>
  );
}
