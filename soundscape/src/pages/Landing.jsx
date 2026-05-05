import { useSearchParams } from "react-router-dom";
import { loginWithSpotify } from "../api/auth";

function SpotifyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function WaveformLogo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="8" width="4" height="8" rx="2" fill="#1DB954" />
      <rect x="10" y="4" width="4" height="16" rx="2" fill="#1DB954" />
      <rect x="18" y="10" width="4" height="6" rx="2" fill="#1DB954" />
    </svg>
  );
}

const FEATURES = [
  "Top Tracks & Artists",
  "Listening Heatmap",
  "Mood Analysis",
  "Genre Breakdown",
  "Personality Card",
];

const ERROR_MESSAGES = {
  access_denied: "Spotify access was denied. Please try again.",
  token_failed: "Authentication failed. Please try again.",
  no_code: "No authorization code received. Try connecting again.",
};

export default function Landing() {
  const [params] = useSearchParams();
  const errorKey = params.get("error");
  const errorMsg = errorKey
    ? ERROR_MESSAGES[errorKey] || "An error occurred. Please try again."
    : null;

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      <div className="orbs-layer">
        <div className="orb top-[-180px] left-[-120px] w-[520px] h-[520px] bg-spotify/18" />
        <div className="orb top-[12%] right-[-100px] w-[420px] h-[420px] bg-accent-purple/14" />
        <div className="orb bottom-[-140px] left-[20%] w-[360px] h-[360px] bg-accent-cyan/10" />
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_52%)]" />

      <header className="relative z-10 flex justify-between items-center px-5 md:px-10 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-spotify to-emerald-300 flex items-center justify-center shadow-[0_16px_34px_rgba(29,185,84,0.24)]">
            <WaveformLogo />
          </div>
          <div>
            <span className="block font-display text-xl font-semibold text-text-primary tracking-tight text-glow">
              Soundscape
            </span>
            <span className="block text-[11px] uppercase tracking-[0.2em] text-text-muted">
              Music intelligence
            </span>
          </div>
        </div>
        <button
          onClick={loginWithSpotify}
          className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-text-secondary text-sm hover:text-text-primary hover:bg-white/[0.06] transition-all duration-200"
        >
          Sign in →
        </button>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-5 md:px-10 py-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-[1.08fr_0.92fr] gap-6 lg:gap-10 items-center">
          <section className="glass-panel-strong rounded-[36px] p-6 md:p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,185,84,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(157,111,255,0.14),transparent_30%)]" />
            <div className="relative z-10 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-spotify/25 bg-spotify/[0.08] shadow-[0_12px_30px_rgba(29,185,84,0.12)]">
                <span className="w-2 h-2 rounded-full bg-spotify animate-pulse" />
                <span className="text-spotify text-xs font-mono tracking-[0.15em] uppercase">
                  Spotify Analytics · Always On
                </span>
              </div>

              <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-text-primary text-glow">
                Your Music,
                <br />
                <span className="bg-gradient-to-r from-spotify via-accent-cyan to-white bg-clip-text text-transparent">
                  Deep Mapped.
                </span>
              </h1>

              <p className="mt-6 text-text-secondary text-lg sm:text-xl max-w-xl leading-relaxed mx-auto lg:mx-0">
                Immersive Spotify analytics with depth, motion, and shareable
                personality visuals - designed to feel premium without feeling
                heavy.
              </p>

              {errorMsg && (
                <div className="mt-6 px-5 py-4 rounded-2xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm max-w-lg mx-auto lg:mx-0">
                  {errorMsg}
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={loginWithSpotify}
                  className="flex items-center gap-3 px-8 py-4 bg-spotify hover:bg-spotify-dim text-black font-body font-semibold text-base rounded-full transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_30px_rgba(29,185,84,0.25)] hover:shadow-[0_0_50px_rgba(29,185,84,0.45)]"
                >
                  <SpotifyIcon />
                  Connect with Spotify
                </button>
                <div className="text-text-muted text-sm">
                  No heavy canvas layers. Just layered gradients and glass.
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-2.5 max-w-2xl mx-auto lg:mx-0">
                {FEATURES.map((feature) => (
                  <span
                    key={feature}
                    className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] text-text-secondary text-sm font-body backdrop-blur-md"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <aside className="grid gap-4 lg:gap-5">
            <div className="depth-card p-5 md:p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,185,84,0.15),transparent_40%)]" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted">
                    Live status
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    Seamless and responsive
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-spotify/30 to-accent-cyan/20 border border-white/10 backdrop-blur-md shadow-[0_14px_40px_rgba(0,0,0,0.28)]" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {[
                ["3D depth", "Layered shadows and glass"],
                ["Fast UI", "No heavy animation loops"],
                ["Share ready", "Exported cards with glow"],
              ].map(([title, description]) => (
                <div key={title} className="depth-card p-5">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm text-text-secondary">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      <footer className="relative z-10 text-center py-5 text-text-muted text-xs font-body">
        Not affiliated with Spotify AB · Built for music nerds
      </footer>
    </div>
  );
}
