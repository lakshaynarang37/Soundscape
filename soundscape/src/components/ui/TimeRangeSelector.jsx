export default function TimeRangeSelector({ activeRange, onChange }) {
  const options = [
    { value: "4w", label: "Last 4 Weeks" },
    { value: "6m", label: "Last 6 Months" },
    { value: "all", label: "All Time" },
  ];

  return (
    <div className="inline-flex items-center gap-2 rounded-full glass-panel p-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-full text-sm font-body transition-all duration-200 whitespace-nowrap
            ${
              activeRange === opt.value
                ? "bg-gradient-to-r from-white to-white/90 text-black font-semibold shadow-[0_12px_28px_rgba(255,255,255,0.14)]"
                : "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
