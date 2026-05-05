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
  if (maxEntropy === 0) return 0;

  return Math.round((entropy / maxEntropy) * 100);
}

export function extractGenres(artists) {
  const counts = {};
  artists.forEach(artist => {
    (artist.genres || []).forEach(genre => {
      counts[genre] = (counts[genre] || 0) + 1;
    });
  });
  return counts;
}
