// Game state and related types
import { Card } from './card';

export enum GamePhase {
  SETUP = 'setup',
  DRAW = 'draw',
  UPKEEP = 'upkeep',
  MAIN = 'main',
  COMBAT = 'combat',
  END = 'end',
  OPPONENT = 'opponent'
}

export interface CardPosition {
  row: 'front' | 'back';
  index: number; // 0, 1, 2 (position in row)
}

export interface CardInstance {
  card: Card;
  id: string; // Unique instance ID for this specific card placement
  position: CardPosition | null; // null if in hand
  currentStats: {
    health: number;
    attack: number;
  };
  activeEffects: {
    effectId: string;
    turnsRemaining: number;
    magnitude: number;
  }[];
  canAttack: boolean;
  isExhausted: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  health: number;
  maxHealth: number;
  mana: {
    current: number;
    max: number;
  };
  deck: Card[];
  hand: CardInstance[];
  battlefield: {
    front: (CardInstance | null)[];
    back: (CardInstance | null)[];
  };
  graveyard: CardInstance[];
}

export interface Battlefield {
  player: {
    front: (CardInstance | null)[];
    back: (CardInstance | null)[];
  };
  opponent: {
    front: (CardInstance | null)[];
    back: (CardInstance | null)[];
  };
}

export interface GameState {
  id: string;
  players: [Player, Player];
  currentPlayerIndex: number;
  currentPhase: GamePhase;
  turnNumber: number;
  battlefield: {
    playerSlots: (CardInstance | null)[];
    opponentSlots: (CardInstance | null)[];
    player?: {
      front: (CardInstance | null)[];
      back: (CardInstance | null)[];
    };
    opponent?: {
      front: (CardInstance | null)[];
      back: (CardInstance | null)[];
    };
  };
  log: string[];
  isGameOver?: boolean;
  winner?: string | null;
}

export interface GameAction {
  type: string;
  payload: unknown;
}

export interface GameActionResult {
  type: string;
  description: string;
}

export type GameDispatch = (action: GameAction) => void;
