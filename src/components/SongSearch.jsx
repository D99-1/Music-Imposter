import { useState, useRef } from 'react';
import { Search, Music, Play, Pause } from 'lucide-react';
import { searchSongs } from '../services/itunes';

export default function SongSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(new Audio());

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const songs = await searchSongs(query);
      setResults(songs);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePreview = (e, song) => {
    e.preventDefault();
    e.stopPropagation();
    if (playingId === song.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = song.previewUrl;
      audioRef.current.play().catch(err => console.error("Audio play failed", err));
      setPlayingId(song.id);
      audioRef.current.onended = () => setPlayingId(null);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6 md:space-y-8 px-2 md:px-0">
      <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH FOR A VIBE..."
            className="w-full bg-secondary/5 border border-secondary/10 rounded-[20px] md:rounded-[24px] py-4 md:py-6 pl-12 md:pl-14 pr-24 md:pr-32 focus:outline-none focus:border-highlight/50 transition-all text-base md:text-xl font-black placeholder:opacity-10 tracking-tight"
          />
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={20} md:size={24} />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-highlight px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-highlight/20 active:scale-95 transition-all"
          >
            {loading ? '...' : 'Search'}
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar no-scrollbar">
          {results.map(song => (
            <div
              key={song.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                audioRef.current.pause();
                onSelect(song);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  audioRef.current.pause();
                  onSelect(song);
                }
              }}
              className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-secondary/5 hover:bg-secondary/10 rounded-2xl border border-transparent hover:border-highlight/30 transition-all text-left group cursor-pointer active:scale-[0.98] select-none"
            >
              <div className="relative overflow-hidden rounded-xl w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
                 <img src={song.artwork} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black truncate text-sm md:text-base tracking-tight leading-tight">{song.title}</div>
                <div className="text-[9px] md:text-[10px] font-black opacity-30 uppercase tracking-widest truncate">{song.artist}</div>
              </div>
              <button
                type="button"
                onClick={(e) => togglePreview(e, song)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-highlight z-10"
              >
                {playingId === song.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>
            </div>
          ))}
          {!loading && results.length === 0 && query && (
            <div className="col-span-full text-center py-10 md:py-20 opacity-20 font-black uppercase tracking-[0.3em] text-xs">No frequency found</div>
          )}
          {!query && results.length === 0 && (
            <div className="col-span-full text-center py-10 md:py-20 opacity-10 font-black uppercase tracking-[0.3em] flex flex-col items-center gap-4 text-xs">
               <Music size={32} md:size={40} />
               <span>Search target track</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
