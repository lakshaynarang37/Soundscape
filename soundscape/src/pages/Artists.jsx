import { useState } from "react";
import { useTopArtists } from "../hooks/useTopArtists";
import PageHeader from "../components/ui/PageHeader";
import TimeRangeSelector from "../components/ui/TimeRangeSelector";
import ArtistCard from "../components/TopList/ArtistCard";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";

export default function Artists() {
  const [range, setRange] = useState("6m");
  const { data, loading, error } = useTopArtists(range);

  return (
    <div className="space-y-8">
      <section className="depth-card p-5 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <PageHeader
            title="Top Artists"
            subtitle="The creators dominating your rotation"
          />
          <TimeRangeSelector activeRange={range} onChange={setRange} />
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-white/[0.04] rounded-2xl animate-shimmer ring-1 ring-white/6"
              />
            ))}
          </div>
        )}
        {error && (
          <ErrorState
            message={`Could not load your top artists. ${error?.message || String(error)}`}
          />
        )}
        {!loading && !error && data?.length === 0 && (
          <EmptyState message="No artists found for this time period." />
        )}

        {data?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.map((artist, i) => (
              <ArtistCard key={artist.id} artist={artist} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
