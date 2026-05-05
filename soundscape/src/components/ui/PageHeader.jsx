export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8 space-y-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-text-muted">
        Live Insights
      </div>
      <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary text-glow">
        {title}
      </h1>
      {subtitle && (
        <p className="max-w-2xl text-text-secondary text-sm md:text-[15px] leading-6">
          {subtitle}
        </p>
      )}
    </div>
  );
}
