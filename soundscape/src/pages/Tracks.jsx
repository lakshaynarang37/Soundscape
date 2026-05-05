import { useState } from "react";
import { useTopTracks } from "../hooks/useTopTracks";
import PageHeader from "../components/ui/PageHeader";
import TimeRangeSelector from "../components/ui/TimeRangeSelector";
import TrackRow from "../components/TopList/TrackRow";
import SkeletonList from "../components/ui/SkeletonList";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";

export default function Tracks() {
  const [range, setRange] = useState("6m");
  const { data, loading, error } = useTopTracks(range);

  return (
    <div className="space-y-8 max-w-5xl">
      <section className="depth-card p-5 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <PageHeader
            title="Top Tracks"
            subtitle="The songs you have on repeat"
          />
          <TimeRangeSelector activeRange={range} onChange={setRange} />
        </div>

        {loading && <SkeletonList count={10} />}
        {error && (
          <ErrorState
            message={`Could not load your top tracks. ${error?.message || String(error)}`}
          />
        )}
        {!loading && !error && data?.length === 0 && (
          <EmptyState
            message="No tracks found for this time period."
            suggestion="Try listening to more music!"
          />
        )}

        {data?.length > 0 && (
          <div className="space-y-2">
            {data.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
