
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Player, Food, GameStatus, Point } from './types';
import { 
  MAP_SIZE, INITIAL_RADIUS, FOOD_COUNT, FOOD_RADIUS, 
  COLORS, BASE_SPEED, SYNC_INTERVAL_MS 
} from './constants';
import { NetworkService } from './services/network';
import { Lobby } from './components/Lobby';
import { Leaderboard } from './components/Leaderboard';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.LOBBY);
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<Record<string, Player>>({});
  const [food, setFood] = useState<Food[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkRef = useRef<NetworkService | null>(null);
  const mousePos = useRef<Point>({ x: 0, y: 0 });
  const viewportPos = useRef<Point>({ x: 0, y: 0 });
  const localPlayerRef = useRef<Player | null>(null);

  // Initialize food (simulated shared state)
  useEffect(() => {
    const initialFood: Food[] = [];
    for (let i = 0; i < FOOD_COUNT; i++) {
      initialFood.push({
        id: `food-${i}`,
        pos: { x: Math.random() * MAP_SIZE, y: Math.random() * MAP_SIZE },
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }
    setFood(initialFood);
  }, []);

  const handleNetworkMessage = useCallback((msg: any) => {
    switch (msg.type) {
      case 'PLAYER_UPDATE':
        if (localPlayerRef.current && msg.player.id === localPlayerRef.current.id) return;
        setOtherPlayers(prev => ({ ...prev, [msg.player.id]: msg.player }));
        break;
      case 'PLAYER_DISCONNECT':
        setOtherPlayers(prev => {
          const next = { ...prev };
          delete next[msg.id];
          return next;
        });
        break;
      case 'PLAYER_EATEN':
        if (localPlayerRef.current?.id === msg.preyId) {
          setStatus(GameStatus.GAMEOVER);
          setLocalPlayer(null);
          localPlayerRef.current = null;
        } else if (localPlayerRef.current?.id === msg.predatorId) {
          // Handled locally usually, but sync helps
        } else {
          setOtherPlayers(prev => {
            const next = { ...prev };
            delete next[msg.preyId];
            return next;
          });
        }
        break;
    }
  }, []);

  useEffect(() => {
    networkRef.current = new NetworkService(handleNetworkMessage);
    return () => networkRef.current?.close();
  }, [handleNetworkMessage]);

  const startGame = (name: string) => {
    const newPlayer: Player = {
      id: uuidv4(),
      name,
      pos: { x: Math.random() * MAP_SIZE, y: Math.random() * MAP_SIZE },
      radius: INITIAL_RADIUS,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      score: INITIAL_RADIUS,
      lastUpdate: Date.now()
    };
    setLocalPlayer(newPlayer);
    localPlayerRef.current = newPlayer;
    setStatus(GameStatus.PLAYING);
  };

  // Input listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Main Game Loop
  useEffect(() => {
    if (status !== GameStatus.PLAYING || !localPlayerRef.current) return;

    let animationFrameId: number;
    let lastNetworkSync = 0;

    const loop = (time: number) => {
      const player = localPlayerRef.current;
      if (!player) return;

      // 1. Calculate direction based on mouse position relative to center of screen
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const dx = mousePos.current.x - centerX;
      const dy = mousePos.current.y - centerY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Speed scales inversely with radius
      const speed = (BASE_SPEED * (INITIAL_RADIUS / player.radius)) * Math.min(dist / 100, 1.5);

      // 2. Move Player
      player.pos.x = Math.max(0, Math.min(MAP_SIZE, player.pos.x + Math.cos(angle) * speed));
      player.pos.y = Math.max(0, Math.min(MAP_SIZE, player.pos.y + Math.sin(angle) * speed));

      // 3. Collision Detection (Food)
      setFood(prevFood => {
        const remainingFood = prevFood.filter(f => {
          const dist = Math.sqrt(Math.pow(player.pos.x - f.pos.x, 2) + Math.pow(player.pos.y - f.pos.y, 2));
          if (dist < player.radius) {
            player.radius += 0.5;
            player.score += 1;
            return false;
          }
          return true;
        });
        
        // Respawn food logic
        if (remainingFood.length < FOOD_COUNT) {
          remainingFood.push({
            id: uuidv4(),
            pos: { x: Math.random() * MAP_SIZE, y: Math.random() * MAP_SIZE },
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
          });
        }
        return remainingFood;
      });

      // 4. Collision Detection (Other Players)
      setOtherPlayers(others => {
        const updatedOthers = { ...others };
        Object.values(updatedOthers).forEach(other => {
          const dist = Math.sqrt(Math.pow(player.pos.x - other.pos.x, 2) + Math.pow(player.pos.y - other.pos.y, 2));
          // Requirements: A circle can eat another player if it is larger
          if (dist < player.radius && player.radius > other.radius * 1.1) {
            // We ate them
            player.radius += other.radius * 0.5;
            player.score += other.score;
            networkRef.current?.broadcastEaten(player.id, other.id);
            delete updatedOthers[other.id];
          }
        });
        return updatedOthers;
      });

      // 5. Render
      render();

      // 6. Network Sync
      if (time - lastNetworkSync > SYNC_INTERVAL_MS) {
        networkRef.current?.broadcastPlayerUpdate(player);
        lastNetworkSync = time;
        setLocalPlayer({ ...player }); // Trigger re-render for UI (Leaderboard)
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const player = localPlayerRef.current!;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Viewport follows player
      const viewX = canvas.width / 2 - player.pos.x;
      const viewY = canvas.height / 2 - player.pos.y;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(viewX, viewY);

      // Draw Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = 0; x <= MAP_SIZE; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, MAP_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= MAP_SIZE; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(MAP_SIZE, y);
        ctx.stroke();
      }

      // Draw Map Border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 5;
      ctx.strokeRect(0, 0, MAP_SIZE, MAP_SIZE);

      // Draw Food
      food.forEach(f => {
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.pos.x, f.pos.y, FOOD_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Other Players
      Object.values(otherPlayers).forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Name
        ctx.fillStyle = 'white';
        ctx.font = `bold ${Math.max(12, p.radius / 2)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(p.name, p.pos.x, p.pos.y + p.radius / 6);
      });

      // Draw Local Player
      ctx.fillStyle = player.color;
      ctx.shadowBlur = 20;
      ctx.shadowColor = player.color;
      ctx.beginPath();
      ctx.arc(player.pos.x, player.pos.y, player.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Name & Score
      ctx.fillStyle = 'white';
      ctx.font = `bold ${Math.max(14, player.radius / 2)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(player.name, player.pos.x, player.pos.y + player.radius / 6);

      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [status, food, otherPlayers]);

  const allPlayers = [
    ...(localPlayer ? [localPlayer] : []),
    ...Object.values(otherPlayers)
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {status === GameStatus.LOBBY && <Lobby onStart={startGame} />}
      
      {status === GameStatus.GAMEOVER && (
        <div className="fixed inset-0 flex items-center justify-center bg-red-950/40 backdrop-blur-sm z-50">
          <div className="bg-slate-900 p-8 rounded-2xl border border-red-500 shadow-2xl text-center">
            <h2 className="text-4xl font-black text-red-500 mb-4">YOU WERE CONSUMED</h2>
            <p className="text-slate-400 mb-6">The nebula is unforgiving.</p>
            <button 
              onClick={() => setStatus(GameStatus.LOBBY)}
              className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full h-full cursor-none" />

      {status === GameStatus.PLAYING && (
        <>
          <Leaderboard players={allPlayers} />
          <div className="fixed bottom-4 left-4 text-slate-400 font-mono text-sm bg-slate-900/50 p-2 rounded px-4">
            POS: {Math.floor(localPlayer?.pos.x || 0)}, {Math.floor(localPlayer?.pos.y || 0)} | 
            SCORE: {Math.floor(localPlayer?.score || 0)}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
