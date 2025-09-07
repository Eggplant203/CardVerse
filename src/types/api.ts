// API related types
import { Card } from './card';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

export interface CardGenerationRequest {
  imageData: string; // Base64 encoded image
  userId: string;
  customName?: string;
}

export interface CardGenerationResponse extends ApiResponse<Card> {}

export interface GameSessionRequest {
  playerIds: [string, string];
  deckIds: [string, string];
}

export interface GameSessionResponse extends ApiResponse<{
  gameId: string;
  sessionUrl: string;
}> {}

export interface AIAnalysisResult {
  objectsDetected: string[];
  dominantColors: string[];
  mood: string;
  complexity: number; // 0-10
  suggestedElement: string;
  suggestedType: string;
  suggestedRarity: string;
  generatedDescription: string;
  generatedLore: string;
  suggestedStats: {
    health: number;
    stamina: number;
    attack: number;
    defense: number;
    speed: number;
    manaCost: number;
  };
  suggestedEffects: {
    id: string;
    name: string;
    description: string;
    effectType?: string;  // buff, debuff, trigger, persistent
    effectCategory?: string; // stat_modification, damage, healing, control, utility
    targetType?: string; // self, ally, ally_all, enemy, enemy_all, any
  }[];
}
