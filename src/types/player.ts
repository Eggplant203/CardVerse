// Player types and interfaces
import { Card } from './card';
import { CardInstance } from './game';

export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  rank: number;
  experience: number;
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  coverCard: Card | null;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  joinDate: Date;
  stats: PlayerStats;
  decks: Deck[];
  collection: Card[];
  currency: {
    gold: number;
    gems: number;
  };
  preferences: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    animationsEnabled: boolean;
    autoPassTurn: boolean;
  };
}
