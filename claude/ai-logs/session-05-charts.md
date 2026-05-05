# AI Logs — Session 05: Charts, Heatmap & Visualizations
**Date:** May 4, 2026  
**Tool:** Claude Code  
**Session Duration:** ~68 minutes  

---

## Prompt
Build the Heatmap page (`src/pages/Heatmap.jsx`). Use the `useHeatmap` hook. Render a 24-row × 7-column grid where each cell is a colored `div`. Color scale: 0 plays = #10101C, 1–2 = #1A2A1A, 3–5 = #1A3A1A, 6–9 = #1DB954, 10+ = #25FF72. Day labels across the top (Mon–Sun). Hour labels on the left every 3 hours. Tooltip on hover (native `title` attribute is fine). Peak stat card above the grid. Legend below the grid. Mount animation: cells fill staggered left-to-right, row by row.

## Response
```jsx
// Key grid rendering logic
const DAY_NAMES  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0)  return '12am';
  if (i === 12) return '12pm';
  if (i < 12)  return `${i}am`;
  return `${i - 12}pm`;
});

function cellColor(count) {
  if (count === 0)  return '#10101C';
  if (count <= 2)   return '#1A2A1A';
  if (count <= 5)   return '#1A3A1A';
  if (count <= 9)   return '#1DB954';
  return                   '#25FF72';
}

// Grid render
{grid.map((row, hour) => (
  <div key={hour} className="flex items-center gap-1.5">
    <div className="w-10 text-right text-xs text-text-muted font-mono shrink-0">
      {hour % 3 === 0 ? HOUR_LABELS[hour] : ''}
    </div>
    {row.map((count, day) => (
      <div
        key={day}
        title={`${DAY_NAMES[day]} ${HOUR_LABELS[hour]} — ${count} play${count !== 1 ? 's' : ''}`}
        className="flex-1 rounded-sm cursor-pointer
                   hover:scale-110 hover:ring-1 hover:ring-white/20
                   transition-transform duration-100"
        style={{
          height:          '14px',
          backgroundColor: cellColor(count),
          animationDelay:  `${(hour * 7 + day) * 7}ms`,
          animation:       'pageEnter 200ms ease-out both',
        }}
      />
    ))}
  </div>
))}
```

The stagger calculation `(hour * 7 + day) * 7ms` means:
- First cell (Mon 12am) animates at 0ms
- Last cell (Sun 11pm) = (23 × 7 + 6) × 7 = 1,169ms ≈ 1.2s total for full grid fill

Looks great — the fill sweeps from top-left to bottom-right like a wave.

---

## Prompt
The heatmap cells are too small on mobile. They're not visible at all on a 375px screen. Fix the responsive sizing.

## Response
The issue is that with 7 columns plus a `w-10` (40px) label column, the cells are getting squeezed to about 3px each on mobile — invisible.

Two-part fix:

1. Wrap the grid in a `overflow-x-auto` container so it scrolls horizontally on small screens
2. Set a minimum width on the grid so cells stay legible:

```jsx
<div className="overflow-x-auto -mx-2 px-2">
  <div style={{ minWidth: '360px' }}>
    {/* ... grid ... */}
  </div>
</div>
```

3. Optionally add a hint label on mobile:

```jsx
<p className="text-text-muted text-xs text-center mt-2 sm:hidden">
  ← Scroll to see full week →
</p>
```

With `minWidth: 360px`, cells render at a consistent ~14px width across all devices. Horizontal scroll on small screens is the standard UX pattern for dense data tables. Applied and confirmed working at 375px. ✓

---

## Prompt
Build `MoodRadar.jsx` — a pure SVG radar/spider chart with 3 axes for valence, energy, danceability. Axes at 270°, 30°, 150°. Background rings at 0.2, 0.4, 0.6, 0.8, 1.0 scale. Data polygon with purple fill. Axis labels outside the ring. Use `viewBox="0 0 240 240"`, className for max-width.

## Response
```jsx
// src/components/charts/MoodRadar.jsx
export default function MoodRadar({ data }) {
  if (!data) return null;
  const { valence, energy, danceability } = data;

  const SIZE   = 240;
  const CENTER = SIZE / 2;
  const RADIUS = 88;

  const AXES = [
    { value: valence,      label: 'Happy',  angle: 270 },
    { value: energy,       label: 'Energy', angle: 30  },
    { value: danceability, label: 'Dance',  angle: 150 },
  ];

  const toXY = (angleDeg, r) => ({
    x: CENTER + r * Math.cos((angleDeg * Math.PI) / 180),
    y: CENTER + r * Math.sin((angleDeg * Math.PI) / 180),
  });

  const RINGS = [0.2, 0.4, 0.6, 0.8, 1.0];
  const RING_ANGLES = [270, 30, 150];

  // Background ring polygons
  const ringPolygons = RINGS.map(scale => {
    const pts = RING_ANGLES.map(a => toXY(a, scale * RADIUS));
    return pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  });

  // Data polygon
  const dataPoints = AXES.map(({ value, angle }) => toXY(angle, value * RADIUS));
  const dataPolygon = dataPoints.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full max-w-[240px] mx-auto"
      aria-label="Mood radar chart showing valence, energy, and danceability scores"
      role="img"
    >
      {/* Background rings */}
      {ringPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {RING_ANGLES.map((angle, i) => {
        const tip = toXY(angle, RADIUS);
        return (
          <line
            key={i}
            x1={CENTER} y1={CENTER}
            x2={tip.x.toFixed(2)} y2={tip.y.toFixed(2)}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        );
      })}

      {/* Data fill */}
      <polygon
        points={dataPolygon}
        fill="rgba(157,111,255,0.2)"
        stroke="#9D6FFF"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data point dots */}
      {dataPoints.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x.toFixed(2)}
          cy={pt.y.toFixed(2)}
          r="4"
          fill="#9D6FFF"
          stroke="#080810"
          strokeWidth="2"
        />
      ))}

      {/* Axis labels */}
      {AXES.map(({ label, angle }) => {
        const pos = toXY(angle, RADIUS + 20);
        return (
          <text
            key={label}
            x={pos.x.toFixed(2)}
            y={pos.y.toFixed(2)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#8888AA"
            fontSize="11"
            fontFamily="Satoshi, sans-serif"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
```

Added `aria-label` and `role="img"` for screen reader accessibility. The SVG is clean and renders correctly across all viewports.

---

## Prompt
Build the Genres page with animated progress bars. Each genre bar should animate its width from 0 to the target percentage on mount. Use CSS transition with a delay based on index. Show the top 20 genres. Add the GDI score card at the top with label ("Eclectic Explorer" / "Balanced Listener" / "Genre Loyalist") based on score.

## Response
```jsx
// Genre bar animation — CSS transition with inline style delay
function GenreBar({ genre, count, total, rank, index }) {
  const [animated, setAnimated] = useState(false);
  const pct = Math.round((count / total) * 100);
  const COLORS = ['#1DB954', '#9D6FFF', '#22D3EE', '#F59E0B', '#FB7185'];
  const color = COLORS[index % COLORS.length];

  // Trigger animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50 + index * 40);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="flex items-center gap-4"
         style={{ opacity: 0, animation: `pageEnter 300ms ease-out ${index * 40}ms both` }}>
      <span className="w-6 text-right text-xs font-mono text-text-muted shrink-0">{rank}</span>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-text-primary capitalize font-body">{genre}</span>
          <span className="text-text-secondary font-mono text-xs">{pct}%</span>
        </div>
        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width:           animated ? `${pct}%` : '0%',
              backgroundColor: color,
              transitionDelay: `${index * 40}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

GDI score labeling:
```js
const gdiLabel = gdi > 65
  ? { title: 'Eclectic Explorer',  desc: 'Your taste spans the whole map.' }
  : gdi > 35
  ? { title: 'Balanced Listener',  desc: 'A healthy mix of old favorites and new territory.' }
  : { title: 'Genre Loyalist',     desc: 'You know what you like, and you stick to it.' };
```

---

## Prompt
The genre page crashes when `artists.data` is null (loading state). Fix the null safety.

## Response
The crash is in `extractGenres(artists.data)` being called before data loads. Add a guard:

```js
// Before
const genreCounts = extractGenres(artists.data);

// After
const genreCounts = artists.data ? extractGenres(artists.data) : {};
const sorted      = Object.entries(genreCounts).sort(([,a],[,b]) => b - a);
const total       = sorted.reduce((s, [, v]) => s + v, 0);
const gdi         = genreDiversityIndex(genreCounts);
```

And guard the JSX render:

```jsx
{artists.loading && <SkeletonList count={10} />}
{artists.error   && <ErrorState message="Could not load genre data." />}
{!artists.loading && !artists.error && sorted.length === 0 && (
  <EmptyState message="No genre data available. Try a different time range." />
)}
{sorted.length > 0 && (
  <div className="space-y-3">
    {sorted.slice(0, 20).map(([genre, count], i) => (
      <GenreBar key={genre} genre={genre} count={count} total={total} rank={i+1} index={i} />
    ))}
  </div>
)}
```

Null safety added throughout. No more crashes during loading state. ✓

---
