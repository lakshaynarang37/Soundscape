export default function TrackRow({ track, index }) {
  return (
    <div className="group flex items-center gap-4 py-3 px-4 -mx-2 rounded-2xl border border-white/0 hover:border-white/8 hover:bg-white/[0.045] transition-all duration-200">
      <span className="w-7 text-right text-text-muted font-mono text-sm group-hover:text-text-secondary">
        {index + 1}
      </span>
      <img
        src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
        alt={track.name}
        crossOrigin="anonymous"
        className="w-12 h-12 rounded-xl object-cover shadow-[0_14px_35px_rgba(0,0,0,0.35)] ring-1 ring-white/8"
        width={48}
        height={48}
      />
      <div className="flex-1 min-w-0">
        <p className="text-text-primary font-medium truncate group-hover:text-white">
          {track.name}
        </p>
        <p className="text-text-secondary text-sm truncate">
          {track.artists?.map((a) => a.name).join(", ")}
        </p>
      </div>
      <span className="text-text-muted text-xs font-mono hidden sm:block">
        {Math.floor(track.duration_ms / 60000)}:
        {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, "0")}
      </span>
    </div>
  );
}
