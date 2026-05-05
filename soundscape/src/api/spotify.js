import { getAccessToken } from "./auth";

const BASE = "https://api.spotify.com/v1";

const DEMO_TRACKS = [
  {
    id: "demo-track-1",
    name: "Midnight Signals",
    duration_ms: 214000,
    artists: [{ name: "Neon Atlas" }],
    album: {
      images: [
        { url: "https://picsum.photos/seed/soundscape-track-1/300/300" },
      ],
    },
  },
  {
    id: "demo-track-2",
    name: "Echo Drift",
    duration_ms: 187000,
    artists: [{ name: "Luna Harbor" }],
    album: {
      images: [
        { url: "https://picsum.photos/seed/soundscape-track-2/300/300" },
      ],
    },
  },
  {
    id: "demo-track-3",
    name: "Velvet Orbit",
    duration_ms: 201000,
    artists: [{ name: "Static Bloom" }],
    album: {
      images: [
        { url: "https://picsum.photos/seed/soundscape-track-3/300/300" },
      ],
    },
  },
  {
    id: "demo-track-4",
    name: "Afterglow Drive",
    duration_ms: 229000,
    artists: [{ name: "Solar Vein" }],
    album: {
      images: [
        { url: "https://picsum.photos/seed/soundscape-track-4/300/300" },
      ],
    },
  },
  {
    id: "demo-track-5",
    name: "Low Light Ritual",
    duration_ms: 193000,
    artists: [{ name: "Echo District" }],
    album: {
      images: [
        { url: "https://picsum.photos/seed/soundscape-track-5/300/300" },
      ],
    },
  },
];

const DEMO_ARTISTS = [
  {
    id: "demo-artist-1",
    name: "Neon Atlas",
    genres: ["indie electronica"],
    images: [{ url: "https://picsum.photos/seed/soundscape-artist-1/400/400" }],
  },
  {
    id: "demo-artist-2",
    name: "Luna Harbor",
    genres: ["dream pop"],
    images: [{ url: "https://picsum.photos/seed/soundscape-artist-2/400/400" }],
  },
  {
    id: "demo-artist-3",
    name: "Static Bloom",
    genres: ["synthwave"],
    images: [{ url: "https://picsum.photos/seed/soundscape-artist-3/400/400" }],
  },
  {
    id: "demo-artist-4",
    name: "Solar Vein",
    genres: ["alt pop"],
    images: [{ url: "https://picsum.photos/seed/soundscape-artist-4/400/400" }],
  },
  {
    id: "demo-artist-5",
    name: "Echo District",
    genres: ["indie rock"],
    images: [{ url: "https://picsum.photos/seed/soundscape-artist-5/400/400" }],
  },
];

function makeRecentlyPlayedItems(limit = 50) {
  const now = Date.now();
  return Array.from({ length: limit }, (_, index) => {
    const track = DEMO_TRACKS[index % DEMO_TRACKS.length];
    const playedAt = new Date(now - index * 3_600_000 - (index % 7) * 900_000);

    return {
      played_at: playedAt.toISOString(),
      track,
    };
  });
}

function demoAudioFeatures(ids = []) {
  return ids.map((id, index) => ({
    id,
    valence: 0.35 + (index % 5) * 0.12,
    energy: 0.45 + (index % 4) * 0.13,
    danceability: 0.4 + (index % 3) * 0.16,
  }));
}

function premiumFallback(path, params = {}) {
  if (path === "/me/top/tracks") {
    return Promise.resolve({ items: DEMO_TRACKS });
  }

  if (path === "/me/top/artists") {
    return Promise.resolve({ items: DEMO_ARTISTS });
  }

  if (path === "/me/player/recently-played") {
    return Promise.resolve({
      items: makeRecentlyPlayedItems(Number(params.limit || 50)),
    });
  }

  if (path === "/audio-features") {
    const ids = String(params.ids || "")
      .split(",")
      .filter(Boolean);
    return Promise.resolve({ audio_features: demoAudioFeatures(ids) });
  }

  return null;
}

function isPremiumRestriction(status, body) {
  return status === 403 && /premium subscription required/i.test(body);
}

async function request(path, params = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated — no access token available");

  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "1", 10);
    console.warn(`Rate limited by Spotify API. Retrying in ${retryAfter}s...`);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return request(path, params);
  }

  if (res.status === 401) {
    throw new Error(
      "Spotify API returned 401 — token may be expired or invalid",
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const demoResponse = isPremiumRestriction(res.status, body)
      ? premiumFallback(path, params)
      : null;

    if (demoResponse) {
      console.warn(
        `Spotify blocked ${path} with a Premium-only 403. Using demo data instead.`,
      );
      return demoResponse;
    }

    throw new Error(`Spotify API error ${res.status}: ${body}`);
  }

  return res.json();
}

export const TIME_RANGES = {
  "4w": "short_term",
  "6m": "medium_term",
  all: "long_term",
};

export const getMe = () => request("/me");
export const getTopTracks = (timeRange = "medium_term", limit = 50) =>
  request("/me/top/tracks", { time_range: timeRange, limit });
export const getTopArtists = (timeRange = "medium_term", limit = 50) =>
  request("/me/top/artists", { time_range: timeRange, limit });
export const getRecentlyPlayed = (limit = 50) =>
  request("/me/player/recently-played", { limit });
export const getAudioFeatures = (ids) =>
  request("/audio-features", { ids: ids.join(",") });
