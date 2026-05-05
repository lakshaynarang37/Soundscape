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
