import { useState, useEffect } from "react";
import { getMe } from "../api/spotify";
import { useTopTracks } from "../hooks/useTopTracks";
import { useTopArtists } from "../hooks/useTopArtists";
import { useMoodAnalysis } from "../hooks/useMoodAnalysis";
import { extractGenres, genreDiversityIndex } from "../utils/entropy";
import StatCard from "../components/ui/StatCard";
import TrackRow from "../components/TopList/TrackRow";
import ArtistCard from "../components/TopList/ArtistCard";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function useProfile() {
  const [profile, setProfile] = useState(() => {
    const cached = sessionStorage.getItem("sc_profile");
    return cached ? JSON.parse(cached) : null;
  });
  useEffect(() => {
    if (profile) {
      return;
    }
    getMe()
      .then((data) => {
        setProfile(data);
        sessionStorage.setItem("sc_profile", JSON.stringify(data));
      })
      .catch(console.error);
  }, [profile]);
  return profile;
}

export default function Dashboard() {
  const profile = useProfile();
  const tracks = useTopTracks("6m");
  const artists = useTopArtists("6m");
  const { mood } = useMoodAnalysis(artists.data || []);

  const genreCounts = artists.data ? extractGenres(artists.data) : {};
  const gdi = genreDiversityIndex(genreCounts);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[32px] glass-panel-strong p-6 md:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,185,84,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(157,111,255,0.12),transparent_32%)]" />
        <div className="relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
          <div>
            <p className="text-text-muted text-[11px] font-mono uppercase tracking-[0.25em] mb-2">
              {getGreeting()}
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary text-glow">
              {profile?.display_name || "Listener"}
            </h1>
            <p className="text-text-secondary text-sm md:text-[15px] mt-3 max-w-2xl leading-6">
              A cinematic read on your listening habits, with enough depth and
              motion to feel premium without slowing the page down.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="depth-card p-4 bg-white/[0.05]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">
                Current mood
              </p>
              <p className="mt-2 font-display text-2xl font-bold">
                {mood?.label || "—"}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {mood?.emoji || "🎵"} Listening profile
              </p>
            </div>
            <div className="depth-card p-4 bg-white/[0.05]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">
                Genre diversity
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-spotify">
                {gdi}/100
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                A quick measure of range
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Top Tracks" value={tracks.data?.length || 0} />
        <StatCard label="Top Artists" value={artists.data?.length || 0} />
        <StatCard label="Mood" value={mood?.label || "—"} isText={true} />
        <StatCard label="Genre Diversity" value={gdi} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="depth-card p-5 md:p-6">
          <h2 className="text-xl font-display font-bold mb-5 text-glow">
            Top Tracks
          </h2>
          <div className="space-y-2">
            {(tracks.data || []).slice(0, 5).map((t, i) => (
              <TrackRow key={t.id} track={t} index={i} />
            ))}
          </div>
        </section>

        <section className="depth-card p-5 md:p-6">
          <h2 className="text-xl font-display font-bold mb-5 text-glow">
            Top Artists
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(artists.data || []).slice(0, 6).map((a, i) => (
              <ArtistCard key={a.id} artist={a} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
