export default function SkeletonList({ count = 10 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl p-3 bg-white/[0.025] border border-white/[0.04]"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/8 to-white/3 animate-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/[0.05] rounded-full w-3/4 animate-shimmer" />
            <div className="h-3 bg-white/[0.04] rounded-full w-1/2 animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
