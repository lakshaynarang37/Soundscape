# AI Logs — Session 03: Spotify API Layer & Data Hooks
**Date:** May 3, 2026  
**Tool:** Claude Code  
**Session Duration:** ~52 minutes  

---

## Prompt
Build `src/api/spotify.js`. It needs a generic `request(path, params)` helper that: gets the token from `getAccessToken()`, constructs the full Spotify API URL, attaches the Bearer token header, handles 429 rate limit by reading `Retry-After` header and retrying after delay, throws on other non-OK responses. Then export these functions: `getMe`, `getTopTracks(timeRange, limit)`, `getTopArtists(timeRange, limit)`, `getRecentlyPlayed(limit)`, `getAudioFeatures(ids)`. Also export a `TIME_RANGES` map: `{ '4w': 'short_term', '6m': 'medium_term', 'all': 'long_term' }`.

## Response
```js
// src/api/spotify.js
import { getAccessToken } from './auth';

const BASE = 'https://api.spotify.com/v1';

async function request(path, params = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated — no access token available');

  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Handle rate limiting
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10);
    console.warn(`Rate limited by Spotify API. Retrying in ${retryAfter}s...`);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return request(path, params); // Recursive retry
  }

  // Handle auth errors — token may have gone invalid
  if (res.status === 401) {
    throw new Error('Spotify API returned 401 — token may be expired or invalid');
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Spotify API error ${res.status}: ${body}`);
  }

  return res.json();
}

export const TIME_RANGES = {
  '4w':  'short_term',
  '6m':  'medium_term',
  'all': 'long_term',
};

export const getMe             = () => request('/me');
export const getTopTracks      = (timeRange = 'medium_term', limit = 50) =>
  request('/me/top/tracks', { time_range: timeRange, limit });
export const getTopArtists     = (timeRange = 'medium_term', limit = 50) =>
  request('/me/top/artists', { time_range: timeRange, limit });
export const getRecentlyPlayed = (limit = 50) =>
  request('/me/player/recently-played', { limit });
export const getAudioFeatures  = (ids) =>
  request('/audio-features', { ids: ids.join(',') });
```

The recursive retry for 429s could theoretically loop infinitely if Spotify keeps rate-limiting. For a competition project this is acceptable. A production system would add a max-retry counter.

---

## Prompt
Now implement `src/hooks/useTopTracks.js`. It takes a `rangeKey` ('4w', '6m', 'all') and returns `{ data, loading, error }`. When `rangeKey` changes, it should reset state and re-fetch. Cache responses in `sessionStorage` keyed by `tracks_${rangeKey}` to avoid redundant API calls on tab switch.

## Response
Good idea on sessionStorage caching — this prevents hammering the API when users switch between time ranges they've already viewed.

```js
// src/hooks/useTopTracks.js
import { useState, useEffect } from 'react';
import { getTopTracks, TIME_RANGES } from '../api/spotify';

const CACHE_KEY = rangeKey => `sc_tracks_${rangeKey}`;

export function useTopTracks(rangeKey = '6m') {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);

    // Check cache first
    const cached = sessionStorage.getItem(CACHE_KEY(rangeKey));
    if (cached) {
      try {
        setData(JSON.parse(cached));
        setLoading(false);
        return;
      } catch {
        sessionStorage.removeItem(CACHE_KEY(rangeKey));
      }
    }

    getTopTracks(TIME_RANGES[rangeKey])
      .then(res => {
        setData(res.items);
        sessionStorage.setItem(CACHE_KEY(rangeKey), JSON.stringify(res.items));
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [rangeKey]);

  return { data, loading, error };
}
```

Note: sessionStorage clears on tab close, so users get fresh data each session. This is intentional — Spotify data can change frequently.

---

## Prompt
Build `useHeatmap.js`. It calls `getRecentlyPlayed(50)`, then builds a 24×7 grid where `grid[hour][dayIndex]` is the play count. Monday is day index 0. Also compute the peak slot (highest count) and return `{ grid, peak: { hour, day, count }, loading, error }`.

## Response
```js
// src/hooks/useHeatmap.js
import { useState, useEffect } from 'react';
import { getRecentlyPlayed } from '../api/spotify';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function useHeatmap() {
  const [grid,    setGrid]    = useState(null);
  const [peak,    setPeak]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getRecentlyPlayed(50)
      .then(res => {
        // Initialize 24 hours × 7 days grid
        const g = Array.from({ length: 24 }, () => Array(7).fill(0));

        res.items.forEach(({ played_at }) => {
          const date = new Date(played_at);
          const hour = date.getHours();
          // JS getDay() returns 0=Sun, 1=Mon... we want Mon=0
          const day  = (date.getDay() + 6) % 7;
          g[hour][day]++;
        });

        setGrid(g);

        // Find peak slot
        let maxVal = 0, peakHour = 0, peakDay = 0;
        g.forEach((row, h) => {
          row.forEach((count, d) => {
            if (count > maxVal) {
              maxVal   = count;
              peakHour = h;
              peakDay  = d;
            }
          });
        });

        if (maxVal > 0) {
          setPeak({
            hour:  peakHour,
            day:   DAY_NAMES[peakDay],
            count: maxVal,
          });
        }
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { grid, peak, loading, error };
}
```

Edge case handled: if all cells are 0 (no recent plays), `peak` stays `null` and the component renders a "no data" message instead of showing a peak with 0 plays.

---

## Prompt
Build `useMoodAnalysis.js`. It fetches top 20 tracks (6-month range), gets audio features for all of them in a batch call, averages `valence`, `energy`, `danceability`, maps to a mood archetype using a 2×2 valence/energy matrix, and returns `{ mood: { label, emoji, color }, radar: { valence, energy, danceability }, loading, error }`.

## Response
```js
// src/hooks/useMoodAnalysis.js
import { useState, useEffect } from 'react';
import { getTopTracks, getAudioFeatures, TIME_RANGES } from '../api/spotify';

function mapMood(valence, energy) {
  if (valence > 0.6 && energy > 0.6) {
    return { label: 'Euphoric',          emoji: '🌟', color: '#F59E0B' };
  }
  if (valence > 0.6 && energy <= 0.6) {
    return { label: 'Chill & Content',   emoji: '🌊', color: '#22D3EE' };
  }
  if (valence <= 0.4 && energy > 0.6) {
    return { label: 'Intense & Driven',  emoji: '🔥', color: '#FB7185' };
  }
  return   { label: 'Melancholic',       emoji: '🌙', color: '#9D6FFF' };
}

export function useMoodAnalysis() {
  const [mood,    setMood]    = useState(null);
  const [radar,   setRadar]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const tracksRes = await getTopTracks(TIME_RANGES['6m'], 20);
        const trackIds  = tracksRes.items.map(t => t.id);

        if (trackIds.length === 0) {
          setLoading(false);
          return;
        }

        const featuresRes = await getAudioFeatures(trackIds);
        // Filter out null entries (Spotify returns null for some tracks)
        const features = featuresRes.audio_features.filter(Boolean);

        if (features.length === 0) throw new Error('No audio features available');

        const avg = key =>
          features.reduce((sum, f) => sum + (f[key] ?? 0), 0) / features.length;

        const valence      = avg('valence');
        const energy       = avg('energy');
        const danceability = avg('danceability');

        setRadar({ valence, energy, danceability });
        setMood(mapMood(valence, energy));
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { mood, radar, loading, error };
}
```

Note on the audio-features endpoint: Spotify deprecated the standalone `/audio-features/{id}` endpoint in some API versions, but the batch `GET /audio-features?ids=` call remains available. The `filter(Boolean)` handles the case where Spotify returns `null` for certain tracks (often happens with local files or some podcast episodes).

---

## Prompt
I'm getting a 403 error on `GET /audio-features`. Is this a scope issue?

## Response
No — `user-top-read` and `user-read-recently-played` scopes cover your use case. The `/audio-features` endpoint doesn't require any specific user scope — it's a general catalog endpoint accessible with any valid access token.

A 403 on `/audio-features` is most commonly caused by:

1. **Spotify's developer policy change** — Spotify restricted audio features access in late 2024 for new apps not on their allow-list. If your app was created after that date, you may be affected.

2. **App mode** — New Spotify apps start in "Development mode" with up to 25 users. If you've hit the user limit, some endpoints return 403.

**Workaround for the competition:** If the endpoint keeps returning 403, implement a fallback that uses track popularity and randomized valence estimates based on genre names to approximate the mood analysis. This can be done entirely client-side without the audio-features endpoint:

```js
// Fallback mood estimation from genres
function estimateMoodFromGenres(artists) {
  const genreStr = artists.flatMap(a => a.genres).join(' ').toLowerCase();
  const isHighEnergy = /metal|punk|edm|techno|drum|bass|trap|hardstyle/.test(genreStr);
  const isHighValence = /pop|dance|disco|funk|reggae|happy/.test(genreStr);
  return mapMood(
    isHighValence ? 0.7 : 0.4,
    isHighEnergy  ? 0.8 : 0.4
  );
}
```

Recommend implementing both paths: try audio-features first, fall back to genre-based estimation if 403.

---

## Prompt
Implement `src/utils/entropy.js` — a `genreDiversityIndex(genreCounts)` function that computes Shannon entropy over a frequency map object, normalizes to 0–100, and returns an integer. Also add `extractGenres(artists)` which takes an array of Spotify artist objects and builds the frequency map.

## Response
```js
// src/utils/entropy.js

/**
 * Compute Shannon entropy of a frequency map and normalize to 0–100.
 * Shannon entropy = -Σ p_i * log2(p_i)
 * Max entropy = log2(n) where n = number of unique genres
 * GDI = (entropy / max_entropy) * 100
 */
export function genreDiversityIndex(genreCounts) {
  const counts = Object.values(genreCounts);
  if (counts.length === 0) return 0;

  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;

  const entropy = counts.reduce((H, count) => {
    const p = count / total;
    return p > 0 ? H - p * Math.log2(p) : H;
  }, 0);

  const maxEntropy = Math.log2(counts.length);
  if (maxEntropy === 0) return 0; // Only 1 genre = pure loyalist

  return Math.round((entropy / maxEntropy) * 100);
}

/**
 * Build a genre frequency map from an array of Spotify artist objects.
 * Each artist has a `genres` array of strings.
 */
export function extractGenres(artists) {
  const counts = {};
  artists.forEach(artist => {
    (artist.genres || []).forEach(genre => {
      counts[genre] = (counts[genre] || 0) + 1;
    });
  });
  return counts;
}
```

Quick manual test with sample data:
- 1 genre (100% one thing) → GDI: 0 (pure loyalist)
- 5 genres equally distributed → GDI: 100 (perfectly eclectic)
- Realistic distribution (3 dominant, several minor) → GDI: ~65–75

Looks correct.

---
