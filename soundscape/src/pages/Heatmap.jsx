import { useHeatmap } from "../hooks/useHeatmap";
import PageHeader from "../components/ui/PageHeader";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return "12am";
  if (i === 12) return "12pm";
  if (i < 12) return `${i}am`;
  return `${i - 12}pm`;
});

function cellColor(count) {
  if (count === 0) return "#10101C";
  if (count <= 2) return "#1A2A1A";
  if (count <= 5) return "#1A3A1A";
  if (count <= 9) return "#1DB954";
  return "#25FF72";
}

export default function Heatmap() {
  const { grid, peak, loading, error } = useHeatmap();

  return (
    <div className="space-y-8 max-w-5xl">
      <PageHeader
        title="Listening Heatmap"
        subtitle="When you listen to the most music"
      />

      {loading && <div className="h-64 depth-card animate-pulse" />}

      {error && (
        <ErrorState
          message={`Could not load your recent play history. ${error?.message || String(error)}`}
        />
      )}

      {!loading && !error && !peak && (
        <EmptyState
          message="No recent play history available."
          suggestion="Listen to some tracks on Spotify first!"
        />
      )}

      {!loading && !error && grid && peak && (
        <div className="space-y-8">
          <div className="depth-card p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,185,84,0.10),transparent_40%)]" />
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-spotify/20 to-accent-cyan/10 border border-white/8 flex items-center justify-center shrink-0 shadow-[0_16px_40px_rgba(29,185,84,0.15)]">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="relative z-10 text-center sm:text-left">
              <p className="text-text-muted text-xs font-mono uppercase tracking-widest mb-1">
                Peak Listening Time
              </p>
              <p className="text-2xl font-display font-bold text-text-primary text-glow">
                {peak.day} at {HOUR_LABELS[peak.hour]}
              </p>
              <p className="text-text-secondary text-sm mt-1">
                You listened to {peak.count} tracks during this hour recently.
              </p>
            </div>
          </div>

          <div className="depth-card p-6 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="flex pl-10 mb-2">
              {DAY_NAMES.map((day) => (
                <div
                  key={day}
                  className="flex-1 text-center text-xs text-text-muted font-mono"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="overflow-x-auto -mx-2 px-2">
              <div style={{ minWidth: "360px" }} className="space-y-1.5">
                {grid.map((row, hour) => (
                  <div key={hour} className="flex items-center gap-1.5">
                    <div className="w-10 text-right text-xs text-text-muted font-mono shrink-0">
                      {hour % 3 === 0 ? HOUR_LABELS[hour] : ""}
                    </div>
                    {row.map((count, day) => (
                      <div
                        key={day}
                        title={`${DAY_NAMES[day]} ${HOUR_LABELS[hour]} — ${count} play${count !== 1 ? "s" : ""}`}
                        className="flex-1 rounded-sm cursor-pointer hover:scale-110 hover:ring-1 hover:ring-white/20 transition-transform duration-100 shadow-[0_0_0_1px_rgba(0,0,0,0.16)]"
                        style={{
                          height: "14px",
                          backgroundColor: cellColor(count),
                          animationDelay: `${(hour * 7 + day) * 7}ms`,
                          animation: "pageEnter 200ms ease-out both",
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-text-muted text-xs text-center mt-4 sm:hidden">
              ← Scroll to see full week →
            </p>

            <div className="flex items-center justify-end gap-2 mt-6 text-xs text-text-muted font-mono">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 2, 5, 9, 15].map((v) => (
                  <div
                    key={v}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: cellColor(v) }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
