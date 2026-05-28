import React, { useState } from 'react';
import { Users, Settings, Play, Copy, Check, ShieldAlert, Clock, ListMusic, Plus, X } from 'lucide-react';

export default function Lobby({ gameState, isHost, onStart, onUpdateSettings }) {
  const [copied, setCopied] = useState(false);
  const [newWord, setNewWord] = useState('');

  const copyCode = () => {
    navigator.clipboard.writeText(gameState.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addWord = (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    onUpdateSettings({
      customWords: [...gameState.settings.customWords, newWord.trim()]
    });
    setNewWord('');
  };

  const removeWord = (index) => {
    const newList = [...gameState.settings.customWords];
    newList.splice(index, 1);
    onUpdateSettings({ customWords: newList });
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8 items-stretch">

        {/* Left Column: Players */}
        <div className="flex-1 bg-secondary/5 border border-secondary/10 rounded-[32px] p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                <Users className="text-highlight" size={28} /> ROSTER
              </h2>
              <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">{gameState.players.length} Players Connected</p>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-2 text-[10px] font-black bg-secondary/10 hover:bg-secondary/20 px-4 py-2 rounded-xl transition-all active:scale-95"
            >
              {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
              {copied ? 'COPIED' : 'COPY CODE'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gameState.players.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 bg-primary border border-secondary/5 rounded-2xl group hover:border-highlight/30 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl ${p.isHost ? 'bg-highlight text-white' : 'bg-secondary/10'}`}>
                  {p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold block truncate">{p.name}</span>
                  {p.isHost && <span className="text-[8px] font-black text-highlight uppercase tracking-widest">Host</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Settings & Start */}
        <div className="w-full md:w-80 flex flex-col gap-6">
          <div className="bg-secondary/5 border border-secondary/10 rounded-[32px] p-8 space-y-8 flex-1">
            <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-tight">
              <Settings className="opacity-30" size={20} /> Rules
            </h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black opacity-30 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><ShieldAlert size={12} /> Imposters</span>
                  <span>{gameState.settings.imposterCount}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={Math.max(1, gameState.players.length - 1)}
                  disabled={!isHost}
                  value={gameState.settings.imposterCount}
                  onChange={(e) => onUpdateSettings({ imposterCount: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black opacity-30 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock size={12} /> Rounds</span>
                  <span>{gameState.settings.maxRounds}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[3, 5, 7].map(r => (
                    <button
                      key={r}
                      disabled={!isHost}
                      onClick={() => onUpdateSettings({ maxRounds: r })}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${gameState.settings.maxRounds === r ? 'bg-highlight border-highlight text-white' : 'bg-transparent border-secondary/10 opacity-40'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Word List */}
              <div className="space-y-3">
                 <div className="text-[10px] font-black opacity-30 uppercase tracking-widest flex items-center gap-1">
                   <ListMusic size={12} /> Custom Word List
                 </div>
                 {isHost && (
                   <form onSubmit={addWord} className="flex gap-2">
                     <input
                       type="text"
                       value={newWord}
                       onChange={(e) => setNewWord(e.target.value)}
                       placeholder="Add word..."
                       className="flex-1 bg-primary border border-secondary/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-highlight"
                     />
                     <button type="submit" className="bg-secondary text-primary p-1.5 rounded-lg hover:bg-white transition-all">
                       <Plus size={14} />
                     </button>
                   </form>
                 )}
                 <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                    {gameState.settings.customWords.map((word, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/10 rounded-md text-[10px] font-bold">
                        {word}
                        {isHost && <button onClick={() => removeWord(i)} className="hover:text-red-500"><X size={10}/></button>}
                      </span>
                    ))}
                    {gameState.settings.customWords.length === 0 && <span className="text-[10px] opacity-20 italic">Using default list</span>}
                 </div>
              </div>
            </div>
          </div>

          {isHost ? (
            <button
              onClick={onStart}
              disabled={gameState.players.length < 3}
              className="w-full bg-highlight text-white font-black py-8 rounded-[32px] text-2xl shadow-2xl shadow-highlight/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 disabled:shadow-none"
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-3">
                  <Play fill="currentColor" size={28} /> START
                </div>
                {gameState.players.length < 3 && <p className="text-[10px] font-black opacity-60 uppercase">Min. 3 Players Required</p>}
              </div>
            </button>
          ) : (
            <div className="bg-secondary/5 border border-secondary/10 rounded-[32px] p-8 text-center flex items-center justify-center min-h-[120px]">
              <div className="space-y-2">
                <div className="flex justify-center gap-1">
                  {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-highlight rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
                </div>
                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Waiting for host...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
