import { Users, Settings, LogOut, Play, UserX, Crown } from 'lucide-react';

export default function Lobby({ gameState, isHost, onStart, onUpdateSettings, onKick, onLeave }) {
  const { players, settings, roomId } = gameState;

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-in zoom-in-95 duration-700 px-4">
      {/* Left Column: Players */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1">
             <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em] leading-none">Command Center</div>
             <h2 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-3">
                LOBBY <span className="text-highlight">[{players.length}]</span>
             </h2>
          </div>
          <div className="flex flex-col items-end">
             <div className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Access Key</div>
             <div className="bg-secondary/5 border border-secondary/10 px-4 py-2 rounded-xl font-mono text-xl md:text-2xl font-black tracking-widest text-highlight">
                {roomId}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="group flex items-center gap-4 p-4 md:p-5 bg-secondary/5 border border-secondary/10 rounded-2xl md:rounded-3xl hover:border-highlight/30 transition-all relative overflow-hidden"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-secondary/10 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xl">
                 {player.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-lg md:text-xl truncate flex items-center gap-2">
                  {player.name}
                  {player.isHost && <Crown size={14} className="text-highlight" />}
                </div>
                <div className="text-[10px] font-black opacity-20 uppercase tracking-widest">
                  {player.isHost ? 'System Admin' : 'Active Signal'}
                </div>
              </div>
              {isHost && !player.isHost && (
                <button
                  onClick={() => onKick(player.id)}
                  className="p-2 text-red-500/30 hover:text-red-500 transition-colors"
                >
                  <UserX size={20} />
                </button>
              )}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
             <div key={i} className="border border-dashed border-secondary/10 rounded-2xl md:rounded-3xl p-4 md:p-5 flex items-center justify-center opacity-10">
                <Users size={24} />
             </div>
          ))}
        </div>
      </div>

      {/* Right Column: Settings */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-secondary/5 border border-secondary/10 rounded-[32px] md:rounded-[40px] p-6 md:p-8 space-y-8">
           <div className="flex items-center gap-4 opacity-30">
              <Settings size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Protocol Config</span>
           </div>

           <div className="space-y-6">
              <div className="space-y-4">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
                    <span>Imposter Density</span>
                    <span className="text-highlight">{settings.imposterCount} Unit</span>
                 </div>
                 <input
                  type="range"
                  min="1"
                  max={Math.max(1, players.length - 1)}
                  value={settings.imposterCount}
                  disabled={!isHost}
                  onChange={(e) => onUpdateSettings({ imposterCount: parseInt(e.target.value) })}
                  className="w-full accent-highlight bg-secondary/10 h-1.5 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
                    <span>Operation Cycles</span>
                    <span className="text-highlight">{settings.maxRounds} Rounds</span>
                 </div>
                 <div className="flex gap-2">
                    {[1, 3, 5, 10].map(r => (
                       <button
                        key={r}
                        disabled={!isHost}
                        onClick={() => onUpdateSettings({ maxRounds: r })}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${settings.maxRounds === r ? 'bg-highlight text-white shadow-lg shadow-highlight/20' : 'bg-secondary/5 border border-secondary/10 opacity-40 hover:opacity-100'}`}
                       >
                          {r}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
                    <span>Temporal Limit</span>
                    <span className="text-highlight">{settings.timeLimit}s</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    {[30, 60, 90].map(t => (
                       <button
                        key={t}
                        disabled={!isHost}
                        onClick={() => onUpdateSettings({ timeLimit: t })}
                        className={`py-3 rounded-xl font-black text-xs transition-all ${settings.timeLimit === t ? 'bg-highlight text-white' : 'bg-secondary/5 border border-secondary/10 opacity-40 hover:opacity-100'}`}
                       >
                          {t}s
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           <div className="pt-4 flex flex-col gap-4">
              {isHost ? (
                <button
                  onClick={onStart}
                  disabled={players.length < 3}
                  className="group w-full bg-highlight text-white font-black py-5 md:py-6 rounded-2xl md:rounded-3xl text-xl md:text-2xl shadow-2xl shadow-highlight/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:scale-100 disabled:grayscale"
                >
                  <div className="flex items-center justify-center gap-3">
                     <Play size={24} fill="currentColor" />
                     <span>INITIATE MISSION</span>
                  </div>
                </button>
              ) : (
                <div className="bg-secondary/5 border border-secondary/10 p-5 rounded-2xl md:rounded-3xl text-center">
                   <div className="flex justify-center gap-1 mb-2">
                      {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-highlight rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
                   </div>
                   <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Awaiting Admin Signal</p>
                </div>
              )}

              <button
                onClick={onLeave}
                className="flex items-center justify-center gap-2 w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-30 hover:opacity-100 hover:text-red-500 transition-all"
              >
                <LogOut size={14} /> ABORT CONNECTION
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
