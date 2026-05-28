export const searchSongs = async (term) => {
  if (!term || term.length < 2) return [];
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=15`);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    return data.results.map(track => ({
      id: track.trackId,
      title: track.trackName,
      artist: track.artistName,
      previewUrl: track.previewUrl,
      artwork: track.artworkUrl100,
      durationMillis: track.trackTimeMillis || 30000,
    }));
  } catch (err) {
    console.error('iTunes search error:', err);
    return [];
  }
};
