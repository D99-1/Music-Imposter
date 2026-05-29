import React, { useState } from 'react';
import { Plus, LogIn, Music } from 'lucide-react';

export default function RoomJoin({ onCreate, onJoin }) {
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="w-full max-w-sm space-y-8 md:space-y-12 animate-in slide-in-from-bottom-8 duration-700 px-4">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-[20px] md:rounded-3xl bg-highlight/10 text-highlight mb-2 md:mb-4">
           <Music size={28} md:size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-secondary leading-none">
          MUSIC<br/>IMPOSTER
        </h1>
        <p className="opacity-40 font-bold uppercase tracking-[0.2em] text-[10px] italic">Find the imposter through the vibe.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Your Identity</label>
           <input
            type="text"
            placeholder="NICKNAME"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-secondary/5 border border-secondary/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-highlight/50 transition-all text-lg font-bold placeholder:opacity-20"
          />
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onCreate(name)}
            disabled={!name}
            className="group flex items-center justify-center gap-3 w-full bg-secondary text-primary font-black py-4 md:py-5 rounded-2xl hover:bg-white transition-all disabled:opacity-30 transform active:scale-95 shadow-lg"
          >
            <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> CREATE NEW SESSION
          </button>

          <div className="relative py-2 flex items-center gap-4">
            <div className="h-px bg-secondary/10 flex-1"></div>
            <div className="text-[10px] uppercase font-black opacity-20 tracking-widest">or</div>
            <div className="h-px bg-secondary/10 flex-1"></div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="ROOM CODE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-secondary/5 border border-secondary/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-highlight/50 transition-all text-lg text-center tracking-[0.2em] font-mono placeholder:opacity-10"
            />
            <button
              onClick={() => onJoin(roomCode, name)}
              disabled={!name || roomCode.length < 4}
              className="flex items-center justify-center gap-3 w-full bg-highlight text-white font-black py-4 md:py-5 rounded-2xl hover:brightness-110 transition-all disabled:opacity-30 transform active:scale-95 shadow-lg shadow-highlight/20"
            >
              <LogIn size={20} strokeWidth={3} /> JOIN SESSION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
