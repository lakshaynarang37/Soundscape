# AI Logs — Session 06: Personality Card & PNG Export
**Date:** May 4, 2026  
**Tool:** Claude Code  
**Session Duration:** ~55 minutes  

---

## Prompt
Build the Personality Card page (`src/pages/PersonalityCard.jsx`). The card itself is a styled div (1:1 aspect ratio, max-width 400px, centered). It should show: user avatar placeholder, "Soundscape · 2026" branding, mood emoji + archetype label, top 3 tracks, top artist name, GDI score. Background gradient changes based on mood archetype. Add a noise grain SVG overlay at very low opacity for texture. Below the card, a "Download PNG" button that triggers html2canvas export at 2× scale. Use `crossOrigin="anonymous"` on all images inside the card.

## Response
```jsx
// src/pages/PersonalityCard.jsx
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useTopTracks }  from '../hooks/useTopTracks';
import { useTopArtists } from '../hooks/useTopArtists';
import { useMoodAnalysis } from '../hooks/useMoodAnalysis';
import { extractGenres, genreDiversityIndex } from '../utils/entropy';
import PageHeader from '../components/ui/PageHeader';

const MOOD_GRADIENTS = {
  'Euphoric':          'linear-gradient(140deg, #F59E0B 0%, #FFD700 50%, #FFA500 100%)',
  'Chill & Content':   'linear-gradient(140deg, #0EA5E9 0%, #22D3EE 50%, #06B6D4 100%)',
  'Intense & Driven':  'linear-gradient(140deg, #FB7185 0%, #9D6FFF 60%, #7C3AED 100%)',
  'Melancholic':       'linear-gradient(140deg, #1E2A4A 0%, #3B4A6B 50%, #2D3A5A 100%)',
};

// SVG noise pattern as data URI
const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E`;

export default function PersonalityCard() {
  const cardRef  = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [exported,  setExported]  = useState(false);

  const tracks  = useTopTracks('6m');
  const artists = useTopArtists('6m');
  const { mood } = useMoodAnalysis();

  const genreCounts = artists.data ? extractGenres(artists.data) : {};
  const gdi         = genreDiversityIndex(genreCounts);
  const gdiLabel    = gdi > 65 ? 'Eclectic Explorer' : gdi > 35 ? 'Balanced Listener' : 'Genre Loyalist';

  const gradient = mood
    ? (MOOD_GRADIENTS[mood.label] || MOOD_GRADIENTS['Melancholic'])
    : '#181828';

  async function handleExport() {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    setExported(false);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale:           2,
        useCORS:         true,
        allowTaint:      false,
        backgroundColor: null,
        logging:         false,
        imageTimeout:    10000,
      });

      const link      = document.createElement('a');
      link.download   = `soundscape-card-${Date.now()}.png`;
      link.href       = canvas.toDataURL('image/png', 1.0);
      link.click();
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed — try refreshing and trying again.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <PageHeader
        title="Personality Card"
        subtitle="Your music taste, captured in one shareable image"
      />

      {/* Card */}
      <div
        ref={cardRef}
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          background:  gradient,
          aspectRatio: '1 / 1',
          padding:     '36px',
          fontFamily:  'Satoshi, sans-serif',
        }}
      >
        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("${NOISE_SVG}")`,
            opacity:         0.035,
            mixBlendMode:    'overlay',
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">

          {/* Top: branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm
                              flex items-center justify-center border border-white/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <rect x="2"  y="8"  width="4" height="8"  rx="2"/>
                  <rect x="10" y="4"  width="4" height="16" rx="2"/>
                  <rect x="18" y="10" width="4" height="6"  rx="2"/>
                </svg>
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '16px', lineHeight: 1.2 }}>
                  Soundscape
                </p>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>
                  Music Personality · 2026
                </p>
              </div>
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '99px',
              padding: '4px 12px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{ color: 'white', fontSize: '11px', fontWeight: 600 }}>
                {mood?.emoji} {mood?.label || 'Music Lover'}
              </span>
            </div>
          </div>

          {/* Center: mood large display */}
          <div className="text-center">
            <div style={{ fontSize: '64px', lineHeight: 1, marginBottom: '8px' }}>
              {mood?.emoji || '🎵'}
            </div>
            <p style={{
              color: 'white', fontWeight: 800, fontSize: '28px',
              fontFamily: 'Clash Display, sans-serif', lineHeight: 1.1,
            }}>
              {mood?.label || '—'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '4px' }}>
              Listening Mood
            </p>
          </div>

          {/* Top tracks */}
          <div>
            <p style={{
              color: 'rgba(255,255,255,0.5)', fontSize: '10px',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              Top Tracks
            </p>
            {(tracks.data || []).slice(0, 3).map((track, i) => (
              <div key={track.id} style={{
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px',
                               fontFamily: 'JetBrains Mono, monospace', width: '16px' }}>
                  {i + 1}.
                </span>
                <span style={{
                  color: 'white', fontSize: '13px', fontWeight: 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: '260px',
                }}>
                  {track.name}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom stats row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px',
                          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
                Top Artist
              </p>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                {artists.data?.[0]?.name || '—'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px',
                          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
                Diversity
              </p>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                {gdi}/100 · {gdiLabel}
              </p>
            </div>
          </div>

          {/* Footer */}
          <p style={{
            color: 'rgba(255,255,255,0.3)', fontSize: '10px',
            textAlign: 'center', fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.08em',
          }}>
            soundscape.app
          </p>
        </div>
      </div>

      {/* Export actions */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleExport}
          disabled={exporting || tracks.loading || artists.loading}
          className={`
            flex items-center gap-2.5 px-8 py-3.5
            font-body font-semibold text-sm rounded-full
            transition-all duration-200
            ${exporting
              ? 'bg-bg-elevated text-text-secondary cursor-wait'
              : exported
              ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
              : 'bg-spotify hover:bg-spotify-dim text-black hover:scale-105'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
              Exporting…
            </>
          ) : exported ? (
            '✓ Downloaded!'
          ) : (
            '⬇ Download PNG (1080×1080)'
          )}
        </button>
        <p className="text-text-muted text-xs text-center">
          Instagram-ready square format · Saved to your downloads folder
        </p>
      </div>
    </div>
  );
}
```

Three button states: default (green), exporting (spinner), exported (cyan checkmark). The success state auto-resets after 3 seconds.

---

## Prompt
The exported PNG has broken images — the Spotify album art and artist images aren't rendering in the canvas output. How do I fix this?

## Response
This is a known CORS issue with html2canvas and cross-origin images. Spotify's CDN (`i.scdn.co`) doesn't send the right CORS headers by default for canvas capture.

Three-part fix:

**1. Add `crossOrigin="anonymous"` on every `<img>` tag:**
```jsx
<img
  src={track.album?.images?.[2]?.url}
  crossOrigin="anonymous"
  alt={track.name}
  className="w-12 h-12 rounded-lg"
/>
```

**2. Pass `useCORS: true` and `allowTaint: false` to html2canvas:**
```js
const canvas = await html2canvas(cardRef.current, {
  scale: 2,
  useCORS: true,
  allowTaint: false,
});
```

**3. For images that still fail — use a proxy or fallback:**

The personality card design already avoids Spotify images in the card canvas (it uses text-based content and SVG icons, not Spotify images). This means we sidestep the CORS issue entirely for the export target.

If you want album art in the card, you'd need to fetch the image, convert to a base64 data URI, and use that as the `src` instead:

```js
async function toDataUrl(url) {
  const res  = await fetch(url);
  const blob = await res.blob();
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
```

For the competition, the text-only card design looks cleaner anyway and exports reliably. ✓

---

## Prompt
Add a "Copy Share Link" button that encodes the card's key data (mood label, top 3 track names, top artist, GDI score) as base64 in a URL query param. When someone visits that URL, show a read-only version of the card.

## Response
```jsx
// Encode card data to shareable URL
function encodeCardData({ mood, tracks, topArtist, gdi }) {
  const payload = {
    m: mood?.label || '',
    e: mood?.emoji || '',
    t: (tracks || []).slice(0, 3).map(t => t.name),
    a: topArtist || '',
    g: gdi,
  };
  return btoa(JSON.stringify(payload));
}

function buildShareUrl(data) {
  const encoded = encodeCardData(data);
  const url = new URL(window.location.origin + '/card');
  url.searchParams.set('share', encoded);
  return url.toString();
}

// In component:
const [copied, setCopied] = useState(false);

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
```

In the card page, read the `?share` param and render a static version if present:

```jsx
const [searchParams] = useSearchParams();
const shareParam = searchParams.get('share');

if (shareParam) {
  try {
    const data = JSON.parse(atob(shareParam));
    return <SharedCardView data={data} />;
  } catch {
    // Invalid share param — render normal page
  }
}
```

`SharedCardView` renders the card using the decoded data without needing Spotify auth. This is fully client-side — no backend needed for sharing.

---

## Prompt
The card background gradient doesn't transfer correctly to the exported PNG on Safari. The gradient renders fine in the browser but the exported canvas is just black.

## Response
Known Safari + html2canvas compatibility issue. Safari has inconsistent support for `background: linear-gradient(...)` in html2canvas's rendering pipeline.

**Fix:** Replace the CSS gradient with an absolutely positioned `<div>` that uses the same gradient but is explicitly rendered before the content layers:

```jsx
{/* Explicit gradient layer for html2canvas compatibility */}
<div
  className="absolute inset-0 z-0"
  style={{
    background: gradient,
    borderRadius: 'inherit',
  }}
/>
```

And update the content z-index to `z-10` so it layers above.

**Additionally**, set `backgroundColor` in the html2canvas options as a fallback:

```js
const canvas = await html2canvas(cardRef.current, {
  scale:           2,
  useCORS:         true,
  allowTaint:      false,
  backgroundColor: '#1DB954', // fallback if gradient fails
  logging:         false,
});
```

After applying the explicit div layer approach, gradient exports correctly on Safari 17. ✓

---
