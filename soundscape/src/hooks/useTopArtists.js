import { useEffect, useReducer } from "react";
import { getTopArtists, TIME_RANGES } from "../api/spotify";

const CACHE_KEY = (rangeKey) => `sc_artists_${rangeKey}`;

function readCache(rangeKey) {
  const cached = sessionStorage.getItem(CACHE_KEY(rangeKey));
  if (!cached) return null;
  try {
    return JSON.parse(cached);
  } catch {
    sessionStorage.removeItem(CACHE_KEY(rangeKey));
    return null;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "reset":
      return { data: action.data, loading: true, error: null };
    case "loaded":
      return { data: action.data, loading: false, error: null };
    case "error":
      return { data: null, loading: false, error: action.error };
    default:
      return state;
  }
}

export function useTopArtists(rangeKey = "6m") {
  const [state, dispatch] = useReducer(reducer, rangeKey, (key) => ({
    data: readCache(key),
    loading: !readCache(key),
    error: null,
  }));

  useEffect(() => {
    const cached = readCache(rangeKey);
    if (cached) {
      dispatch({ type: "loaded", data: cached });
      return;
    }

    let cancelled = false;
    dispatch({ type: "reset", data: null });

    getTopArtists(TIME_RANGES[rangeKey])
      .then((res) => {
        if (cancelled) return;
        dispatch({ type: "loaded", data: res.items });
        sessionStorage.setItem(CACHE_KEY(rangeKey), JSON.stringify(res.items));
      })
      .catch((error) => {
        if (cancelled) return;
        dispatch({ type: "error", error });
      });

    return () => {
      cancelled = true;
    };
  }, [rangeKey]);

  return state;
}
