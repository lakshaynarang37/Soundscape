import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTopTracks } from "../hooks/useTopTracks";
import { useTopArtists } from "../hooks/useTopArtists";
import { useMoodAnalysis } from "../hooks/useMoodAnalysis";
import { extractGenres, genreDiversityIndex } from "../utils/entropy";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";

const MOOD_GRADIENTS = {
  Euphoric: "linear-gradient(140deg, #F59E0B 0%, #FFD700 50%, #FFA500 100%)",
  "Chill & Content":
    "linear-gradient(140deg, #0EA5E9 0%, #22D3EE 50%, #06B6D4 100%)",
  "Intense & Driven":
    "linear-gradient(140deg, #FB7185 0%, #9D6FFF 60%, #7C3AED 100%)",
  Melancholic: "linear-gradient(140deg, #1E2A4A 0%, #3B4A6B 50%, #2D3A5A 100%)",
};

const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E`;

function encodeCardData({ mood, tracks, topArtist, gdi }) {
  const payload = {
    m: mood?.label || "",
    e: mood?.emoji || "",
    t: (tracks || []).slice(0, 3).map((t) => t.name),
    a: topArtist || "",
    g: gdi,
  };
  return btoa(JSON.stringify(payload));
}

function buildShareUrl(data) {
  const encoded = encodeCardData(data);
  const url = new URL(window.location.origin + "/card");
  url.searchParams.set("share", encoded);
  return url.toString();
}

function SharedCardView({ data }) {
  const gradient = MOOD_GRADIENTS[data.m] || MOOD_GRADIENTS["Melancholic"];
  const gdiLabel =
    data.g > 65
      ? "Eclectic Explorer"
      : data.g > 35
        ? "Balanced Listener"
        : "Genre Loyalist";

  return (
    <div className="space-y-8 max-w-lg mx-auto py-12">
      <div
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          background: gradient,
          aspectRatio: "1 / 1",
          padding: "36px",
          fontFamily: "Satoshi, sans-serif",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("${NOISE_SVG}")`,
            opacity: 0.035,
            mixBlendMode: "overlay",
          }}
        />

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <rect x="2" y="8" width="4" height="8" rx="2" />
                  <rect x="10" y="4" width="4" height="16" rx="2" />
                  <rect x="18" y="10" width="4" height="6" rx="2" />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "16px",
                    lineHeight: 1.2,
                  }}
                >
                  Soundscape
                </p>
                <p
                  style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px" }}
                >
                  Music Personality · 2026
                </p>
              </div>
            </div>

            <div
              style={{
                background: "rgba(0,0,0,0.2)",
                borderRadius: "99px",
                padding: "4px 12px",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span
                style={{ color: "white", fontSize: "11px", fontWeight: 600 }}
              >
                {data.e} {data.m || "Music Lover"}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div
              style={{ fontSize: "64px", lineHeight: 1, marginBottom: "8px" }}
            >
              {data.e || "🎵"}
            </div>
            <p
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: "28px",
                fontFamily: "Clash Display, sans-serif",
                lineHeight: 1.1,
              }}
            >
              {data.m || "—"}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              Listening Mood
            </p>
          </div>

          <div>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Top Tracks
            </p>
            {(data.t || []).map((name, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "11px",
                    fontFamily: "JetBrains Mono, monospace",
                    width: "16px",
                  }}
                >
                  {i + 1}.
                </span>
                <span
                  style={{
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "260px",
                  }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                }}
              >
                Top Artist
              </p>
              <p style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>
                {data.a || "—"}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                }}
              >
                Diversity
              </p>
              <p style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>
                {data.g}/100 · {gdiLabel}
              </p>
            </div>
          </div>

          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "10px",
              textAlign: "center",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.08em",
            }}
          >
            soundscape.app
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PersonalityCard() {
  const [searchParams] = useSearchParams();
  const shareParam = searchParams.get("share");

  const sharedData = shareParam ? parseSharedCard(shareParam) : null;

  if (sharedData) {
    return <SharedCardView data={sharedData} />;
  }

  return <PersonalityCardContent />;
}

function PersonalityCardContent() {
  const cardRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sizeOption, setSizeOption] = useState("square-2048");

  const tracks = useTopTracks("6m");
  const artists = useTopArtists("6m");
  const { mood } = useMoodAnalysis(artists.data || []);

  const genreCounts = artists.data ? extractGenres(artists.data) : {};
  const gdi = genreDiversityIndex(genreCounts);
  const gdiLabel =
    gdi > 65
      ? "Eclectic Explorer"
      : gdi > 35
        ? "Balanced Listener"
        : "Genre Loyalist";

  const gradient = mood
    ? MOOD_GRADIENTS[mood.label] || MOOD_GRADIENTS["Melancholic"]
    : "#181828";

  async function handleExport() {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    setExported(false);

    const SIZE_MAP = {
      "square-2048": { w: 2048, h: 2048 },
      "square-4096": { w: 4096, h: 4096 },
      "poster-2480-3508": { w: 2480, h: 3508 },
    };

    const { w, h } = SIZE_MAP[sizeOption] || SIZE_MAP["square-2048"];

    let clone = null;

    try {
      const node = cardRef.current;

      // Clone node to avoid layout shifts and allow large offscreen sizing
      clone = node.cloneNode(true);
      clone.style.width = `${w}px`;
      clone.style.height = `${h}px`;
      clone.style.transform = "scale(1)";
      clone.style.position = "fixed";
      clone.style.left = "-10000px";
      clone.style.top = "0";
      clone.classList.add("exporting", "export-poster");
      if (sizeOption === "poster-2480-3508") {
        clone.classList.add("export-poster-portrait");
      }
      document.body.appendChild(clone);

      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(clone, {
        scale: 1,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        imageTimeout: 20000,
      });

      const link = document.createElement("a");
      link.download = `soundscape-card-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed — try refreshing and trying again.");
    } finally {
      if (clone && clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
      setExporting(false);
    }
  }

  async function handleCopyLink() {
    const url = buildShareUrl({
      mood,
      tracks: tracks.data,
      topArtist: artists.data?.[0]?.name,
      gdi,
    });
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSavePdf() {
    window.print();
  }

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <PageHeader
        title="Personality Card"
        subtitle="Your music taste, captured in one shareable image"
      />

      <Card
        ref={cardRef}
        className="poster-canvas print-card relative w-full overflow-hidden"
        style={{
          aspectRatio: "1 / 1",
          padding: "36px",
          fontFamily: "Satoshi, sans-serif",
          background: gradient,
        }}
      >
        <div
          className="absolute inset-0 z-0"
          aria-hidden
          style={{
            backgroundImage: `url("${NOISE_SVG}")`,
            opacity: 0.035,
            mixBlendMode: "overlay",
          }}
        />

        <div className="orbs-layer z-0 pointer-events-none" aria-hidden>
          <div
            className="orb"
            style={{
              width: 160,
              height: 160,
              left: "8%",
              top: "6%",
              background:
                "radial-gradient(circle,#ffffff22,#00ffd066 40%,transparent 60%)",
              animation: "float1 14s linear infinite",
            }}
          />
          <div
            className="orb"
            style={{
              width: 220,
              height: 220,
              right: "6%",
              top: "20%",
              background:
                "radial-gradient(circle,#ffcc8822,#ff77aa66 30%,transparent 60%)",
              animation: "float2 18s linear infinite",
            }}
          />
          <div
            className="orb"
            style={{
              width: 120,
              height: 120,
              left: "40%",
              bottom: "6%",
              background:
                "radial-gradient(circle,#66ddff22,#0066ff66 30%,transparent 60%)",
              animation: "float3 16s linear infinite",
            }}
          />
        </div>

        <div className="poster-content relative z-10 h-full flex flex-col justify-between">
          <div className="poster-header flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-black/18 backdrop-blur-sm flex items-center justify-center border border-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <rect x="2" y="8" width="4" height="8" rx="2" />
                  <rect x="10" y="4" width="4" height="16" rx="2" />
                  <rect x="18" y="10" width="4" height="6" rx="2" />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "15px",
                    lineHeight: 1.1,
                  }}
                >
                  Soundscape
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.52)",
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Music Personality · 2026
                </p>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.07)",
                borderRadius: "999px",
                padding: "5px 12px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{ color: "white", fontSize: "11px", fontWeight: 600 }}
              >
                {mood?.emoji} {mood?.label || "Music Lover"}
              </span>
            </div>
          </div>

          <div className="poster-hero text-center" style={{ marginTop: "4px" }}>
            <div
              style={{ fontSize: "68px", lineHeight: 1, marginBottom: "10px" }}
            >
              {mood?.emoji || "🎵"}
            </div>
            <p className="poster-title" style={{ color: "white" }}>
              {mood?.label || "—"}
            </p>
            <p className="poster-sub" style={{ marginTop: "6px" }}>
              Listening Mood
            </p>
          </div>

          <div className="poster-tracks rounded-[24px] border border-white/5 bg-black/12 backdrop-blur-md p-4">
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Top Tracks
            </p>
            <div className="space-y-2">
              {(tracks.data || []).slice(0, 3).map((track, i) => (
                <div
                  key={track.id || i}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    style={{
                      color: "rgba(255,255,255,0.38)",
                      fontSize: "11px",
                      fontFamily: "JetBrains Mono, monospace",
                      width: "18px",
                    }}
                  >
                    {i + 1}.
                  </span>
                  <span
                    className="poster-track"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "280px",
                    }}
                  >
                    {track.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="poster-metrics grid grid-cols-2 gap-3">
            <div className="rounded-[20px] border border-white/5 bg-white/[0.04] backdrop-blur-sm p-4">
              <p
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                Top Artist
              </p>
              <p
                style={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: "15px",
                  lineHeight: 1.2,
                }}
              >
                {artists.data?.[0]?.name || "—"}
              </p>
            </div>
            <div className="rounded-[20px] border border-white/5 bg-white/[0.04] backdrop-blur-sm p-4 text-right">
              <p
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                Diversity
              </p>
              <p
                style={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: "15px",
                  lineHeight: 1.2,
                }}
              >
                {gdi}/100
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "11px",
                  marginTop: "2px",
                }}
              >
                {gdiLabel}
              </p>
            </div>
          </div>

          <div
            className="poster-footer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.08em",
              }}
            >
              soundscape.app
            </p>
            <div
              style={{
                height: "1px",
                flex: 1,
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0))",
              }}
            />
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.08em",
              }}
            >
              POSTER
            </p>
          </div>
        </div>
      </Card>

      <div className="no-print flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-text-muted text-xs">Export size</label>
          <select
            value={sizeOption}
            onChange={(e) => setSizeOption(e.target.value)}
            className="bg-white/6 text-sm rounded-full px-3 py-2 border border-white/8"
          >
            <option value="square-2048">Square — 2048px</option>
            <option value="square-4096">Large Square — 4096px</option>
            <option value="poster-2480-3508">Poster — 2480×3508</option>
          </select>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || tracks.loading || artists.loading}
          className={`flex items-center gap-2.5 px-8 py-3.5 font-body font-semibold text-sm rounded-full transition-all duration-200 w-full sm:w-auto justify-center ${exporting ? "bg-bg-elevated text-text-secondary cursor-wait" : exported ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30" : "bg-spotify hover:bg-spotify-dim text-black hover:scale-105"} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
              Exporting…
            </>
          ) : exported ? (
            "✓ Downloaded!"
          ) : (
            "⬇ Download PNG"
          )}
        </button>

        <button
          onClick={handleCopyLink}
          disabled={tracks.loading || artists.loading}
          className={`flex items-center gap-2.5 px-8 py-3.5 font-body font-semibold text-sm rounded-full transition-all duration-200 border w-full sm:w-auto justify-center ${copied ? "bg-white/10 text-white border-white/20" : "bg-transparent text-text-secondary border-white/10 hover:text-white hover:border-white/20 hover:bg-white/5"}`}
        >
          {copied ? "✓ Copied" : "🔗 Copy Share Link"}
        </button>

        <button
          onClick={handleSavePdf}
          className="flex items-center gap-2.5 px-8 py-3.5 font-body font-semibold text-sm rounded-full transition-all duration-200 border w-full sm:w-auto justify-center bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/15"
        >
          Save as PDF
        </button>
      </div>

      <p className="text-text-muted text-xs text-center">
        Instagram-ready square format · Saved to your downloads folder
      </p>
    </div>
  );
}

function parseSharedCard(shareParam) {
  try {
    return JSON.parse(atob(shareParam));
  } catch {
    return null;
  }
}
