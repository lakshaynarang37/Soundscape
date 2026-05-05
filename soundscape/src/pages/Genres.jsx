import { useState, useEffect } from "react";
import { useTopArtists } from "../hooks/useTopArtists";
import { extractGenres, genreDiversityIndex } from "../utils/entropy";
import PageHeader from "../components/ui/PageHeader";
import SkeletonList from "../components/ui/SkeletonList";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";

function GenreBar({ genre, count, total, rank, index }) {
  const [animated, setAnimated] = useState(false);
  const pct = Math.round((count / total) * 100);
  const COLORS = ["#1DB954", "#9D6FFF", "#22D3EE", "#F59E0B", "#FB7185"];
  const color = COLORS[index % COLORS.length];

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50 + index * 40);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className="flex items-center gap-4"
      style={{
        opacity: 0,
        animation: `pageEnter 300ms ease-out ${index * 40}ms both`,
      }}
    >
      <span className="w-6 text-right text-xs font-mono text-text-muted shrink-0">
        {rank}
      </span>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-text-primary capitalize font-body">
            {genre}
          </span>
          <span className="text-text-secondary font-mono text-xs">{pct}%</span>
        </div>
        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: animated ? `${pct}%` : "0%",
              backgroundColor: color,
              transitionDelay: `${index * 40}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Genres() {
  const artists = useTopArtists("6m");

  const genreCounts = artists.data ? extractGenres(artists.data) : {};
  const sorted = Object.entries(genreCounts).sort(([, a], [, b]) => b - a);
  const total = sorted.reduce((s, [, v]) => s + v, 0);
  const gdi = genreDiversityIndex(genreCounts);

  const gdiLabel =
    gdi > 65
      ? { title: "Eclectic Explorer", desc: "Your taste spans the whole map." }
      : gdi > 35
        ? {
            title: "Balanced Listener",
            desc: "A healthy mix of old favorites and new territory.",
          }
        : {
            title: "Genre Loyalist",
            desc: "You know what you like, and you stick to it.",
          };

  return (
    <div className="space-y-8 max-w-3xl">
      <section className="depth-card p-5 md:p-6 lg:p-8">
        <PageHeader
          title="Genre Breakdown"
          subtitle="The musical DNA of your listening history"
        />

        {artists.loading && <SkeletonList count={10} />}
        {artists.error && (
          <ErrorState
            message={`Could not load genre data. ${artists.error?.message || String(artists.error)}`}
          />
        )}
        {!artists.loading && !artists.error && sorted.length === 0 && (
          <EmptyState message="No genre data available. Try listening to more music." />
        )}

        {sorted.length > 0 && (
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-[28px] bg-white/[0.04] border border-white/8 p-6 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(29,185,84,0.12),transparent_35%)]" />
              <div className="relative z-10">
                <p className="text-text-muted text-xs font-mono uppercase tracking-[0.22em] mb-2">
                  Diversity Score
                </p>
                <p className="text-5xl font-display font-bold text-spotify mb-2 text-glow">
                  {gdi}
                  <span className="text-xl text-text-secondary">/100</span>
                </p>
                <p className="text-text-primary font-medium">
                  {gdiLabel.title}
                </p>
                <p className="text-text-secondary text-sm mt-1">
                  {gdiLabel.desc}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {sorted.slice(0, 20).map(([genre, count], i) => (
                <GenreBar
                  key={genre}
                  genre={genre}
                  count={count}
                  total={total}
                  rank={i + 1}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
