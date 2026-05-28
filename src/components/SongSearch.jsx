import React, { useState } from 'react';
import { Search, Music, X } from 'lucide-react';
import { searchSongs } from '../services/itunes';
import AudioPreview from './AudioPreview';

export default function SongSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [startTime, setStartTime] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    const songs = await searchSongs(query);
    setResults(songs);
    setLoading(false);
  };

  const handleSelect = (song) => {
    setSelectedSong(song);
    setStartTime(0);
  };

  return (
    <div className="w-full max-w-2xl space-y-8">
      {!selectedSong ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH FOR A VIBE..."
              className="w-full bg-secondary/5 border border-secondary/10 rounded-[24px] py-6 pl-14 pr-32 focus:outline-none focus:border-highlight/50 transition-all text-xl font-black placeholder:opacity-10 tracking-tight"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={24} />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-highlight px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-highlight/20 hover:scale-105 active:scale-95 transition-all"
            >
              {loading ? '...' : 'Search'}
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {results.map(song => (
              <button
                key={song.id}
                onClick={() => handleSelect(song)}
                className="flex items-center gap-4 p-4 bg-secondary/5 hover:bg-secondary/10 rounded-2xl border border-transparent hover:border-highlight/30 transition-all text-left group"
              >
                <div className="relative overflow-hidden rounded-xl w-14 h-14 flex-shrink-0">
                   <img src={song.artwork} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black truncate text-base tracking-tight leading-tight">{song.title}</div>
                  <div className="text-[10px] font-black opacity-30 uppercase tracking-widest truncate">{song.artist}</div>
                </div>
              </button>
            ))}
            {!loading && results.length === 0 && query && (
              <div className="col-span-full text-center py-20 opacity-20 font-black uppercase tracking-[0.3em]">No frequency found</div>
            )}
            {!query && results.length === 0 && (
              <div className="col-span-full text-center py-20 opacity-10 font-black uppercase tracking-[0.3em] flex flex-col items-center gap-4">
                 <Music size={40} />
                 <span>Enter target name</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8 animate-in zoom-in duration-500">
          <AudioPreview
            song={selectedSong}
            startTime={startTime}
            onStartTimeChange={setStartTime}
          />
          <div className="flex gap-4 w-full max-w-md">
            <button
              onClick={() => setSelectedSong(null)}
              className="flex-1 py-5 rounded-2xl border border-secondary/10 font-black text-xs uppercase tracking-widest hover:bg-secondary/5 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={() => onSelect({ ...selectedSong, startTime })}
              className="flex-[2] py-5 rounded-2xl bg-highlight font-black text-xs uppercase tracking-widest text-white shadow-2xl shadow-highlight/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              LOCK IN SELECTION
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
