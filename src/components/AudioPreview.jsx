import { useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function AudioPreview({ song, isPlaying = false, onTogglePlay }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="bg-primary/40 backdrop-blur-xl p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-white/5 w-full shadow-2xl">
      <div className="flex items-center gap-4 md:gap-5">
        <div className="relative group overflow-hidden rounded-xl md:rounded-2xl w-14 h-14 md:w-20 md:h-20 shadow-xl flex-shrink-0">
          <img src={song.artwork} alt={song.title} className="w-full h-full object-cover" />
          <button
            onClick={onTogglePlay}
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
          onClick={onTogglePlay}
          className="p-4 md:p-5 bg-highlight text-white rounded-xl md:rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-highlight/40"
        >
          {isPlaying ? <Pause fill="white" size={20} md:size={24} /> : <Play fill="white" size={20} md:size={24} />}
        </button>
      </div>

      <audio
        ref={audioRef}
        src={song.previewUrl}
        onEnded={onTogglePlay}
      />
    </div>
  );
}
