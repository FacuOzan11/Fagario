
import React, { useState } from 'react';

interface LobbyProps {
  onStart: (name: string) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onStart(name.trim());
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/90 z-50">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md text-center">
        <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          NEBULA BLOBS
        </h1>
        <p className="text-slate-400 mb-8 italic">Consume to expand. Survive the void.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Enter your nickname..."
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-center text-xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={15}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
            disabled={!name.trim()}
          >
            JOIN NEBULA
          </button>
        </form>

        <div className="mt-8 grid grid-cols-2 gap-4 text-slate-500 text-sm">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <span className="block font-bold text-slate-300">Move</span>
            Mouse / Arrows
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <span className="block font-bold text-slate-300">Goal</span>
            Eat smaller blobs
          </div>
        </div>
      </div>
    </div>
  );
};
