import { useMoodAnalysis } from "../hooks/useMoodAnalysis";
import { useTopArtists } from "../hooks/useTopArtists";
import PageHeader from "../components/ui/PageHeader";
import MoodRadar from "../components/charts/MoodRadar";
import ErrorState from "../components/ui/ErrorState";

export default function Mood() {
  const artists = useTopArtists("6m");
  const { mood, radar, loading, error } = useMoodAnalysis(artists.data || []);

  return (
    <div className="space-y-8 max-w-5xl">
      <section className="depth-card p-5 md:p-6 lg:p-8">
        <PageHeader
          title="Mood Analysis"
          subtitle="The sonic signature of your recent favorites"
        />

        {loading && <div className="h-96 depth-card animate-pulse" />}

        {error && (
          <ErrorState
            message={`Could not analyze your listening mood. ${error?.message || String(error)}`}
          />
        )}

        {!loading && !error && mood && radar && (
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative overflow-hidden rounded-[28px] bg-white/[0.04] border border-white/8 p-8 flex flex-col items-center justify-center text-center aspect-square">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(157,111,255,0.16),transparent_40%)]" />
              <div className="relative z-10">
                <div className="text-7xl mb-4 drop-shadow-[0_12px_24px_rgba(0,0,0,0.3)]">
                  {mood.emoji}
                </div>
                <h2
                  className="text-3xl font-display font-bold mb-2 text-glow"
                  style={{ color: mood.color }}
                >
                  {mood.label}
                </h2>
                <p className="text-text-secondary">
                  Based on the audio features of your top tracks from the last 6
                  months.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] bg-white/[0.04] border border-white/8 p-8 flex flex-col items-center justify-center aspect-square">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(34,211,238,0.12),transparent_35%)]" />
              <div className="relative z-10 w-full">
                <MoodRadar data={radar} />
                <div className="mt-6 flex justify-center gap-6 w-full">
                  <div className="text-center">
                    <p className="text-text-muted text-xs font-mono uppercase">
                      Valence
                    </p>
                    <p className="font-medium">
                      {(radar.valence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-text-muted text-xs font-mono uppercase">
                      Energy
                    </p>
                    <p className="font-medium">
                      {(radar.energy * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-text-muted text-xs font-mono uppercase">
                      Dance
                    </p>
                    <p className="font-medium">
                      {(radar.danceability * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
