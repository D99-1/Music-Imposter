import React, { useState } from 'react';
import { Music, Play, ChevronRight, Vote, CheckCircle2, Skull, Music2, Timer } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import SongSearch from './SongSearch';
import AudioPreview from './AudioPreview';

export default function GameScreen({ gameState, peerId, isHost, sendAction }) {
  const me = gameState.players.find(p => p.id === peerId);
  const isEliminated = me?.eliminated;
  const [isPlaying, setIsPlaying] = useState(false);

  if (gameState.status === 'REVEAL') {
    const y = useMotionValue(0);
    const opacity = useTransform(y, [-200, 0], [0, 1]);
    const revealOpacity = useTransform(y, [-200, 0], [1, 0]);

    return (
      <div className="flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-1000 text-center max-w-lg w-full px-4 relative">
        <div className="space-y-4">
          <h2 className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em]">Identity Transmission</h2>
          <p className="text-[10px] font-black text-highlight animate-pulse uppercase tracking-[0.2em]">Hold & Drag Card Up to Reveal</p>
        </div>

        <div className="w-full h-80 relative flex items-center justify-center">
          {/* Hidden Content */}
          <motion.div
            style={{ opacity: revealOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center space-y-4"
          >
             <div className={`text-6xl md:text-8xl font-black tracking-tighter leading-none ${me?.isImposter ? 'text-red-500' : 'text-accent'}`}>
                {me?.isImposter ? 'IMPOSTER' : 'CREW'}
              </div>
              {!me?.isImposter && (
                <div className="space-y-1">
                  <p className="text-[10px] opacity-30 uppercase font-black tracking-[0.2em]">Target Frequency</p>
                  <p className="text-4xl md:text-5xl font-black text-highlight uppercase">{gameState.currentWord}</p>
                </div>
              )}
              {me?.isImposter && <Skull className="text-red-500/50" size={64} />}
          </motion.div>

          {/* Draggable Card */}
          <motion.div
            drag="y"
            dragConstraints={{ top: -300, bottom: 0 }}
            style={{ y }}
            onDragEnd={() => y.set(0)}
            className="absolute inset-0 bg-secondary text-primary rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-8 cursor-grab active:cursor-grabbing z-20"
          >
             <div className="w-12 h-1.5 bg-primary/20 rounded-full mb-8"></div>
             <Music size={64} strokeWidth={2.5} />
             <div className="mt-8 text-center">
                <p className="font-black text-2xl tracking-tighter uppercase leading-tight">Secret<br/>Transmission</p>
                <p className="text-[10px] font-bold opacity-30 mt-4 uppercase tracking-widest">Confidential</p>
             </div>
          </motion.div>
        </div>

        <div className="w-full">
          {isHost ? (
            <button
              onClick={() => sendAction({ type: 'START_SEARCH' })}
              className="w-full px-8 py-5 md:py-6 bg-secondary text-primary font-black rounded-2xl md:rounded-3xl text-lg md:text-xl shadow-2xl hover:bg-white transition-all transform active:scale-95"
            >
              COMMENCE SEARCH
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-highlight rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
              </div>
              <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.4em]">Waiting for Host Authorization</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameState.status === 'SEARCH') {
    if (isEliminated) return <div className="text-2xl md:text-3xl font-black opacity-10 uppercase tracking-widest animate-pulse flex flex-col items-center gap-6"><Skull size={48} md:size={64}/> Spectating...</div>;
    if (me?.isReady) return (
      <div className="flex flex-col items-center space-y-6 md:space-y-8 animate-in zoom-in duration-500 px-4">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-accent/10 rounded-[32px] md:rounded-[40px] border border-accent/20 flex items-center justify-center text-accent shadow-2xl shadow-accent/20">
           <CheckCircle2 size={48} md:size={64} strokeWidth={2.5} />
        </div>
        <div className="text-center space-y-2">
           <div className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Signal Locked</div>
           <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Waiting for other frequencies</p>
        </div>
      </div>
    );

    return (
      <div className="flex flex-col items-center w-full space-y-8 md:space-y-12 animate-in slide-in-from-bottom-12 duration-700 px-4">
        <div className="text-center space-y-2 w-full flex flex-col items-center">
           <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-red-500/10 rounded-full text-red-500 font-black text-sm">
              <Timer size={16} /> {gameState.timeLeft}s
           </div>
           <h2 className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em] mb-2 md:mb-4">Transmission Phase</h2>
           {!me?.isImposter && <p className="text-highlight font-black text-4xl md:text-6xl tracking-tighter uppercase leading-none">{gameState.currentWord}</p>}
           {me?.isImposter && <p className="text-red-500 font-black text-4xl md:text-6xl tracking-tighter uppercase leading-none">Imposter</p>}
        </div>
        <SongSearch onSelect={(song) => sendAction({ type: 'SUBMIT_SONG', song })} />
      </div>
    );
  }

  if (gameState.status === 'PLAYBACK') {
    const playersWithSongs = gameState.players.filter(p => !p.eliminated && p.song);
    const currentPlayer = playersWithSongs[gameState.currentPlayingPlayerIndex];

    return (
      <div className="flex flex-col items-center space-y-8 md:space-y-12 w-full max-w-xl animate-in fade-in duration-700 px-4 pb-20">
        <div className="text-center space-y-2 md:space-y-4">
           <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em]">Deciphering Signal</div>
           <div className="text-5xl md:text-7xl font-black text-highlight tracking-tighter leading-none truncate max-w-[90vw]">{currentPlayer?.name}</div>
        </div>

        <div className="w-full bg-secondary/5 aspect-square max-w-[320px] md:max-w-md rounded-[40px] md:rounded-[60px] border border-secondary/10 flex items-center justify-center relative overflow-hidden shadow-2xl">
          <img src={currentPlayer?.song?.artwork} className="absolute inset-0 w-full h-full object-cover opacity-10 blur-3xl scale-150" alt="" />
          <div className="relative z-10 p-6 md:p-10 flex flex-col items-center text-center w-full space-y-6 md:space-y-10">
            <div className="relative group">
               <img src={currentPlayer?.song?.artwork} className="w-48 h-48 md:w-64 md:h-64 rounded-[32px] md:rounded-[40px] shadow-2xl border border-white/5" alt="" />
               <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 w-12 h-12 md:w-16 md:h-16 bg-highlight rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Music2 size={24} md:size={32} />
               </div>
            </div>

            <div className="w-full">
              {isHost ? (
                <AudioPreview
                  song={currentPlayer.song}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                />
              ) : (
                <div className="p-6 md:p-8 bg-white/5 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] border border-white/10 space-y-1">
                  <h4 className="font-black text-xl md:text-2xl tracking-tight leading-tight truncate">{currentPlayer?.song?.title}</h4>
                  <p className="text-[10px] font-black opacity-30 uppercase tracking-widest truncate">{currentPlayer?.song?.artist}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full max-w-md fixed bottom-8 px-6 left-1/2 -translate-x-1/2 z-30 md:relative md:bottom-auto md:px-0">
          {isHost ? (
            <button
              onClick={() => {
                setIsPlaying(false);
                sendAction({ type: 'NEXT_SONG' });
              }}
              className="group w-full flex items-center justify-center gap-3 py-5 md:py-8 bg-secondary text-primary font-black rounded-2xl md:rounded-[32px] text-lg md:text-2xl shadow-2xl transform active:scale-95"
            >
              {gameState.currentPlayingPlayerIndex === playersWithSongs.length - 1 ? 'INITIATE VOTING' : 'NEXT SIGNAL'}
              <ChevronRight size={24} md:size={32} className="group-active:translate-x-1 transition-transform" />
            </button>
          ) : (
             <div className="flex flex-col items-center gap-3">
                <div className="flex justify-center gap-1">
                  {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-highlight rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
                </div>
                <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.4em]">Audio Analysis in Progress</p>
             </div>
          )}
        </div>
      </div>
    );
  }

  if (gameState.status === 'VOTING') {
    const votingPlayers = gameState.players.filter(p => !p.eliminated);

    if (isEliminated || me?.isReady) {
      return (
        <div className="flex flex-col items-center space-y-10 md:space-y-12 animate-in fade-in duration-500 px-4">
           <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em]">Awaiting Deliberation</div>
           <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {gameState.players.filter(p => !p.eliminated).map(p => (
                 <div key={p.id} className="flex flex-col items-center gap-3 md:gap-4">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] border-2 flex items-center justify-center transition-all duration-700 ${p.isReady ? 'bg-accent/10 border-accent text-accent shadow-[0_0_20px_rgba(0,255,65,0.2)]' : 'bg-secondary/5 border-secondary/10 opacity-30'}`}>
                       {p.isReady ? <CheckCircle2 size={24} md:size={32} /> : <div className="text-lg font-black">{p.name[0]}</div>}
                    </div>
                    <span className="text-[8px] md:text-[10px] font-black opacity-40 uppercase tracking-widest">{p.name}</span>
                 </div>
              ))}
           </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center w-full space-y-8 md:space-y-12 animate-in slide-in-from-bottom-12 duration-700 px-4">
        <div className="text-center space-y-2">
           <h2 className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em] mb-2 md:mb-4">Interrogation Phase</h2>
           <p className="text-red-500 font-black text-4xl md:text-6xl tracking-tighter uppercase leading-none">Identify Imposter</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-4xl">
          {votingPlayers.filter(p => p.id !== peerId).map(p => (
            <button
              key={p.id}
              onClick={() => sendAction({ type: 'VOTE', targetId: p.id })}
              className="group flex items-center gap-4 md:gap-6 p-5 md:p-8 bg-secondary/5 border border-secondary/10 rounded-2xl md:rounded-[40px] hover:border-red-500/50 hover:bg-red-500/5 transition-all text-left relative overflow-hidden active:scale-[0.98]"
            >
              <div className="w-14 h-14 md:w-20 md:h-20 bg-secondary/10 rounded-2xl md:rounded-[28px] flex items-center justify-center font-black text-2xl md:text-3xl group-hover:bg-red-500 group-hover:text-white transition-all transform group-active:scale-110">
                 {p.name[0]}
              </div>
              <div className="flex-1 min-w-0 z-10">
                <div className="font-black text-2xl md:text-4xl tracking-tight leading-none mb-1 truncate">{p.name}</div>
                <div className="text-[10px] font-black opacity-20 uppercase tracking-widest truncate">SIGNAL: {p.song?.title}</div>
              </div>
              <Vote className="opacity-40 group-hover:opacity-100 text-red-500 transition-opacity z-10" size={24} md:size={32} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState.status === 'RESULTS') {
     const { lastEliminated } = gameState;
     return (
       <div className="flex flex-col items-center space-y-10 md:space-y-12 animate-in zoom-in duration-700 text-center max-w-2xl px-4">
         <h2 className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em]">The Final Verdict</h2>

         <div className="space-y-6 md:space-y-8 bg-secondary/5 p-10 md:p-16 rounded-[40px] md:rounded-[60px] border border-secondary/10 w-full relative">
            <div className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 bg-primary border border-secondary/10 rounded-2xl md:rounded-[32px] flex items-center justify-center">
               <Skull size={32} md:size={40} className={lastEliminated?.isImposter ? "text-accent" : "text-red-500"} />
            </div>
            <div className="space-y-4">
              <div className="text-3xl md:text-5xl font-black tracking-tighter opacity-40">
                {lastEliminated?.name} <span className="text-xl italic lowercase">was</span>
              </div>
              <div className={`text-6xl md:text-8xl font-black tracking-tighter leading-none ${lastEliminated?.isImposter ? 'text-accent' : 'text-red-500'}`}>
                {lastEliminated?.isImposter ? 'IMPOSTER' : 'INNOCENT'}
              </div>
            </div>
         </div>

         <div className="w-full max-w-md">
            {isHost ? (
              <button
                onClick={() => sendAction({ type: 'NEXT_ROUND' })}
                className="w-full px-8 py-5 md:py-8 bg-highlight text-white font-black rounded-2xl md:rounded-[32px] text-lg md:text-2xl shadow-2xl shadow-highlight/40 hover:brightness-110 transition-all transform active:scale-95"
              >
                PROCEED TO NEXT CYCLE
              </button>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex justify-center gap-1">
                  {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-highlight rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
                </div>
                <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.4em]">Awaiting Host Progression</p>
              </div>
            )}
         </div>
       </div>
     );
  }

  return null;
}
