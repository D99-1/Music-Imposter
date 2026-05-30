import { useGamePeer } from './hooks/useGamePeer';
import RoomJoin from './components/RoomJoin';
import Lobby from './components/Lobby';
import GameScreen from './components/GameScreen';
import { Trophy, Home, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { peerId, gameState, isHost, error, createRoom, joinRoom, leaveRoom, sendAction } = useGamePeer();

  if (error) {
    return (
      <div className="min-h-screen bg-primary text-secondary flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md w-full"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500/10 text-red-500 rounded-2xl md:rounded-[32px] flex items-center justify-center mx-auto mb-4">
             <AlertTriangle size={32} md:size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Notice</h1>
            <p className="opacity-50 text-xs md:text-sm leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-8 py-4 bg-secondary text-primary font-black rounded-2xl hover:bg-white transition-all active:scale-95 shadow-xl"
          >
            DISMISS
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-secondary font-sans selection:bg-highlight selection:text-white overflow-x-hidden">
      {/* Dynamic Background Element */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-highlight/20 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]"></div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto min-h-screen flex flex-col items-center justify-center p-4 sm:p-12">

        <AnimatePresence mode="wait">
          {!gameState.roomId && (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex justify-center"
            >
              <RoomJoin
                onCreate={createRoom}
                onJoin={joinRoom}
              />
            </motion.div>
          )}

          {gameState.roomId && gameState.status === 'LOBBY' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full flex justify-center"
            >
              <Lobby
                gameState={gameState}
                isHost={isHost}
                onStart={() => sendAction({ type: 'START_GAME' })}
                onUpdateSettings={(settings) => sendAction({ type: 'UPDATE_SETTINGS', settings })}
                onKick={(targetId) => sendAction({ type: 'KICK_PLAYER', targetId })}
                onLeave={leaveRoom}
              />
            </motion.div>
          )}

          {gameState.roomId && gameState.status !== 'LOBBY' && gameState.status !== 'GAME_OVER' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex justify-center"
            >
              <GameScreen
                gameState={gameState}
                peerId={peerId}
                isHost={isHost}
                sendAction={sendAction}
              />
            </motion.div>
          )}

          {gameState.status === 'GAME_OVER' && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center space-y-8 md:space-y-12 text-center max-w-3xl px-4"
            >
              <div className="space-y-6">
                <div className="inline-flex p-6 md:p-8 bg-highlight/10 rounded-[32px] md:rounded-[48px] text-highlight mb-2 md:mb-4">
                  <Trophy size={64} md:size={80} strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
                    {gameState.winner === 'CREW' ? 'CREW' : 'IMPOSTER'} <br/>
                    <span className="text-highlight text-4xl md:text-8xl">VICTORY</span>
                  </h1>
                  <p className="text-sm md:text-xl opacity-40 font-bold uppercase tracking-widest max-w-xs md:max-w-md mx-auto">
                    {gameState.winner === 'CREW' ? 'The deception has been neutralized.' : 'The crew failed to detect the anomaly.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                 {isHost && (
                   <button
                     onClick={() => sendAction({ type: 'RESET' })}
                     className="flex-1 flex items-center justify-center gap-3 px-8 py-5 md:py-6 bg-highlight text-white font-black rounded-2xl md:rounded-3xl text-lg md:text-xl shadow-2xl shadow-highlight/30 hover:scale-[1.02] active:scale-95 transition-all"
                   >
                     <RotateCcw size={20} md:size={24} /> PLAY AGAIN
                   </button>
                 )}
                 <button
                   onClick={() => window.location.reload()}
                   className="flex-1 flex items-center justify-center gap-3 px-8 py-5 md:py-6 bg-secondary text-primary font-black rounded-2xl md:rounded-3xl text-lg md:text-xl shadow-2xl hover:bg-white transition-all active:scale-95"
                 >
                   <Home size={20} md:size={24} /> EXIT
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer Info Overlay */}
      <AnimatePresence>
        {gameState.roomId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 flex justify-between items-end pointer-events-none z-50"
          >
             <div className="space-y-1">
                <div className="text-[8px] md:text-[10px] font-black opacity-20 uppercase tracking-[0.4em] leading-none">Status Monitor</div>
                <div className="text-[10px] md:text-xs font-black tracking-widest flex items-center gap-2 uppercase">
                   <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-accent rounded-full animate-pulse"></div>
                   {gameState.status}
                </div>
             </div>

             <div className="flex flex-col items-end space-y-1">
                <div className="text-[8px] md:text-[10px] font-black opacity-20 uppercase tracking-[0.4em] leading-none">Protocol</div>
                <div className="text-[10px] md:text-xs font-black tracking-widest uppercase">
                  Round {gameState.round} <span className="opacity-20 mx-1">/</span> {gameState.settings.maxRounds}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
