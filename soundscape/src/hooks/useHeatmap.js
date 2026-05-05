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
        const g = Array.from({ length: 24 }, () => Array(7).fill(0));

        res.items.forEach(({ played_at }) => {
          const date = new Date(played_at);
          const hour = date.getHours();
          const day  = (date.getDay() + 6) % 7;
          g[hour][day]++;
        });

        setGrid(g);

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
