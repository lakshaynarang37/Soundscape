import { useState, useEffect } from 'react';
import { getTopTracks, getAudioFeatures, TIME_RANGES } from '../api/spotify';

export function mapMood(valence, energy) {
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

function estimateMoodFromGenres(artists) {
  const genreStr = artists.flatMap(a => a.genres || []).join(' ').toLowerCase();
  const isHighEnergy = /metal|punk|edm|techno|drum|bass|trap|hardstyle/.test(genreStr);
  const isHighValence = /pop|dance|disco|funk|reggae|happy/.test(genreStr);
  return mapMood(
    isHighValence ? 0.7 : 0.4,
    isHighEnergy  ? 0.8 : 0.4
  );
}

export function useMoodAnalysis(topArtists = []) {
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

        try {
          const featuresRes = await getAudioFeatures(trackIds);
          const features = featuresRes.audio_features.filter(Boolean);

          if (features.length === 0) throw new Error('No audio features available');

          const avg = key =>
            features.reduce((sum, f) => sum + (f[key] ?? 0), 0) / features.length;

          const valence      = avg('valence');
          const energy       = avg('energy');
          const danceability = avg('danceability');

          setRadar({ valence, energy, danceability });
          setMood(mapMood(valence, energy));
        } catch (featErr) {
          console.warn('Audio features failed, falling back to genre estimation:', featErr);
          setMood(estimateMoodFromGenres(topArtists));
          setRadar({ valence: 0.5, energy: 0.5, danceability: 0.5 });
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [topArtists]);

  return { mood, radar, loading, error };
}
