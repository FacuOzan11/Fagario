
import React from 'react';
import { Player } from '../types';

interface LeaderboardProps {
  players: Player[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <div className="fixed top-4 right-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 w-64 shadow-2xl pointer-events-none">
      <h2 className="text-xl font-bold mb-3 border-b border-slate-700 pb-2 text-blue-400">Leaderboard</h2>
      <ul className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <li key={player.id} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-500 w-4">{index + 1}.</span>
              <span className="truncate max-w-[120px]" style={{ color: player.color }}>
                {player.name || 'Unnamed Blob'}
              </span>
            </div>
            <span className="font-mono text-slate-300">{Math.floor(player.score)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
