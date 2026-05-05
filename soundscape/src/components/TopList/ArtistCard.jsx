export default function ArtistCard({ artist, index }) {
  return (
    <div className="depth-card flex flex-col items-center p-4 overflow-hidden bg-gradient-to-b from-white/[0.05] to-white/[0.02]">
      <div className="relative w-full aspect-square mb-4">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-spotify/20 via-transparent to-accent-purple/20 blur-2xl scale-90" />
        <img
          src={artist.images?.[1]?.url || artist.images?.[0]?.url}
          alt={artist.name}
          crossOrigin="anonymous"
          className="relative z-10 w-full h-full object-cover rounded-full shadow-[0_18px_50px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
          width={160}
          height={160}
        />
        <div className="absolute -top-2 -left-2 z-20 w-8 h-8 rounded-full bg-bg-base/90 backdrop-blur-md border border-white/10 flex items-center justify-center font-mono text-xs text-text-secondary shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
          {index + 1}
        </div>
      </div>
      <p className="text-text-primary font-medium text-center truncate w-full">
        {artist.name}
      </p>
      <p className="text-text-muted text-xs mt-1 text-center truncate w-full capitalize">
        {artist.genres?.[0] || "Artist"}
      </p>
    </div>
  );
}
