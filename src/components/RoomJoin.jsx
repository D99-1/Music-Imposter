import React, { useState } from 'react';
import { Plus, LogIn, Music, User } from 'lucide-react';

export default function RoomJoin({ onCreate, onJoin }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    if (name && roomCode.length === 6) {
      onJoin(roomCode, name);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (name) {
      onCreate(name);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8 md:space-y-12 animate-in slide-in-from-bottom-8 duration-700 px-4">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-[20px] md:rounded-3xl bg-highlight/10 text-highlight mb-2 md:mb-4">
           <Music size={28} md:size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-secondary leading-none">
          MUSIC<br/>IMPOSTER
        </h1>
      </div>

      <div className="space-y-8">
        {/* Name Input - Always first */}
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Identity</label>
           <div className="relative group">
             <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={20} />
             <input
              type="text"
              placeholder="YOUR NICKNAME"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className="w-full bg-secondary/5 border border-secondary/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-highlight/50 transition-all text-lg font-bold placeholder:opacity-20 uppercase"
            />
           </div>
        </div>

        {/* Join Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px bg-secondary/10 flex-1"></div>
            <div className="text-[10px] uppercase font-black opacity-20 tracking-widest whitespace-nowrap">Join Existing Room</div>
            <div className="h-px bg-secondary/10 flex-1"></div>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="6-DIGIT CODE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-secondary/5 border border-secondary/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-highlight/50 transition-all text-2xl text-center tracking-[0.5em] font-mono placeholder:opacity-10 placeholder:text-sm placeholder:tracking-widest"
            />
            <button
              type="submit"
              disabled={!name || roomCode.length < 6}
              className="flex items-center justify-center gap-3 w-full bg-highlight text-white font-black py-4 md:py-5 rounded-2xl hover:brightness-110 transition-all disabled:opacity-30 transform active:scale-95 shadow-lg shadow-highlight/20"
            >
              <LogIn size={20} strokeWidth={3} /> JOIN ROOM
            </button>
          </form>
        </div>

        {/* Create Section - Separated */}
        <div className="pt-4">
          <div className="relative py-2 flex items-center gap-4 mb-4">
            <div className="h-px bg-secondary/10 flex-1"></div>
            <div className="text-[10px] uppercase font-black opacity-20 tracking-widest whitespace-nowrap">Host a Session</div>
            <div className="h-px bg-secondary/10 flex-1"></div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!name}
            className="group flex items-center justify-center gap-3 w-full bg-secondary text-primary font-black py-4 md:py-5 rounded-2xl hover:bg-white transition-all disabled:opacity-30 transform active:scale-95 shadow-lg"
          >
            <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> START NEW GAME
          </button>
        </div>
      </div>
    </div>
  );
}
