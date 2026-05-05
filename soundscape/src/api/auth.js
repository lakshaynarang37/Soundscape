const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim();
const CONFIGURED_REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI?.trim();
const SCOPES = [
  "user-top-read",
  "user-read-recently-played",
  "user-read-private",
  "user-read-email",
].join(" ");

function isLocalRedirectUri(uri) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/callback\/?$/i.test(uri);
}

function getRedirectUri() {
  const runtimeRedirectUri = `${window.location.origin}/callback`;

  if (!CONFIGURED_REDIRECT_URI) {
    return runtimeRedirectUri;
  }

  if (
    isLocalRedirectUri(CONFIGURED_REDIRECT_URI) &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return runtimeRedirectUri;
  }

  return CONFIGURED_REDIRECT_URI;
}

function requireSpotifyClientId() {
  if (!CLIENT_ID) {
    throw new Error(
      "Missing VITE_SPOTIFY_CLIENT_ID. Add your Spotify app Client ID to .env or .env.local and restart Vite.",
    );
  }

  return CLIENT_ID;
}

function generateRandomString(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => chars[v % chars.length]).join("");
}

async function sha256(plain) {
  const data = new TextEncoder().encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function base64urlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function loginWithSpotify() {
  const clientId = requireSpotifyClientId();
  const redirectUri = getRedirectUri();
  const verifier = generateRandomString(64);
  const challenge = base64urlEncode(await sha256(verifier));
  const state = generateRandomString(16);

  localStorage.setItem("pkce_verifier", verifier);
  localStorage.setItem("pkce_state", state);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCodeForToken(code, state) {
  const clientId = requireSpotifyClientId();
  const redirectUri = getRedirectUri();
  const storedState = localStorage.getItem("pkce_state");
  const verifier = localStorage.getItem("pkce_verifier");

  if (!storedState || state !== storedState) {
    throw new Error(
      "State mismatch — possible CSRF attack. Aborting token exchange.",
    );
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  const expiresAt = Date.now() + data.expires_in * 1000;

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("token_expires", expiresAt.toString());

  localStorage.removeItem("pkce_verifier");
  localStorage.removeItem("pkce_state");

  return data.access_token;
}

export async function getAccessToken() {
  const clientId = requireSpotifyClientId();
  const token = localStorage.getItem("access_token");
  const expires = localStorage.getItem("token_expires");
  const refresh = localStorage.getItem("refresh_token");

  if (!token) return null;

  if (Date.now() > parseInt(expires) - 60000) {
    if (!refresh) {
      logout();
      return null;
    }
    try {
      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refresh,
          client_id: clientId,
        }),
      });

      if (!res.ok) throw new Error("Failed to refresh token");

      const data = await res.json();
      const expiresAt = Date.now() + data.expires_in * 1000;

      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      localStorage.setItem("token_expires", expiresAt.toString());
      return data.access_token;
    } catch {
      logout();
      return null;
    }
  }

  return token;
}

export function logout() {
  localStorage.clear();
}

export function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}
