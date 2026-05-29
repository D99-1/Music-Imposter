import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export default function AudioPreview({ song, startTime = 0, onStartTimeChange, isEditable = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [song]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (e) => {
    const time = parseFloat(e.target.value);
    onStartTimeChange?.(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  return (
    <div className="bg-primary/40 backdrop-blur-xl p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-white/5 w-full shadow-2xl">
      <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-6">
        <div className="relative group overflow-hidden rounded-xl md:rounded-2xl w-14 h-14 md:w-20 md:h-20 shadow-xl flex-shrink-0">
          <img src={song.artwork} alt={song.title} className="w-full h-full object-cover" />
          <button
            onClick={togglePlay}
            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white md:opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isPlaying ? <Pause fill="white" size={20} md:size={24} /> : <Play fill="white" size={20} md:size={24} />}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-black truncate text-base md:text-xl tracking-tight leading-tight">{song.title}</h4>
          <p className="text-[10px] md:text-sm font-bold opacity-40 truncate uppercase tracking-widest">{song.artist}</p>
        </div>

        <button
          onClick={togglePlay}
          className="p-4 md:p-5 bg-highlight text-white rounded-xl md:rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-highlight/40"
        >
          {isPlaying ? <Pause fill="white" size={20} md:size={24} /> : <Play fill="white" size={20} md:size={24} />}
        </button>
      </div>

      {isEditable && (
        <div className="space-y-3 md:space-y-4">
          <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black opacity-30 uppercase tracking-widest">
            <span className="flex items-center gap-1"><Volume2 size={10} md:size={12} /> Start Offset</span>
            <span className="text-highlight">{startTime.toFixed(1)}s</span>
          </div>
          <div className="relative h-8 flex items-center">
            <input
              type="range"
              min="0"
              max="25"
              step="0.1"
              value={startTime}
              onChange={handleTimeChange}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-highlight"
            />
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src={song.previewUrl}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
