
export interface Point {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  pos: Point;
  radius: number;
  color: string;
  score: number;
  lastUpdate: number;
}

export interface Food {
  id: string;
  pos: Point;
  color: string;
}

export interface GameState {
  players: Record<string, Player>;
  food: Food[];
}

export enum GameStatus {
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}
