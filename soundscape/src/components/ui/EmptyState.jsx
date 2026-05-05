export default function EmptyState({ message, suggestion }) {
  return (
    <div className="depth-card flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center ring-1 ring-white/8 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <span className="text-text-muted text-xl">♪</span>
      </div>
      <div>
        <p className="text-text-primary font-body font-medium">{message}</p>
        {suggestion && (
          <p className="text-text-muted text-sm mt-1">{suggestion}</p>
        )}
      </div>
    </div>
  );
}
