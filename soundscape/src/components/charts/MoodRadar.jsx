export default function MoodRadar({ data }) {
  if (!data) return null;
  const { valence, energy, danceability } = data;

  const SIZE = 240;
  const CENTER = SIZE / 2;
  const RADIUS = 88;

  const AXES = [
    { value: valence, label: "Happy", angle: 270 },
    { value: energy, label: "Energy", angle: 30 },
    { value: danceability, label: "Dance", angle: 150 },
  ];

  const toXY = (angleDeg, r) => ({
    x: CENTER + r * Math.cos((angleDeg * Math.PI) / 180),
    y: CENTER + r * Math.sin((angleDeg * Math.PI) / 180),
  });

  const RINGS = [0.2, 0.4, 0.6, 0.8, 1.0];
  const RING_ANGLES = [270, 30, 150];

  const ringPolygons = RINGS.map((scale) => {
    const pts = RING_ANGLES.map((a) => toXY(a, scale * RADIUS));
    return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  });

  const dataPoints = AXES.map(({ value, angle }) =>
    toXY(angle, value * RADIUS),
  );
  const dataPolygon = dataPoints
    .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full max-w-[260px] mx-auto drop-shadow-[0_20px_50px_rgba(157,111,255,0.18)]"
      aria-label="Mood radar chart showing valence, energy, and danceability scores"
      role="img"
    >
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9D6FFF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9D6FFF" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>

      {ringPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {RING_ANGLES.map((angle, i) => {
        const tip = toXY(angle, RADIUS);
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={tip.x.toFixed(2)}
            y2={tip.y.toFixed(2)}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        );
      })}

      <polygon
        points={dataPolygon}
        fill="url(#radarFill)"
        stroke="url(#radarStroke)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {dataPoints.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x.toFixed(2)}
          cy={pt.y.toFixed(2)}
          r="4"
          fill="#EDE9FE"
          stroke="#080810"
          strokeWidth="2"
        />
      ))}

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
