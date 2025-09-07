import { Card, CardType, Element, Rarity, EffectType, EffectCategory, TargetType } from '@/types/card';
import { AIAnalysisResult } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

/**
 * Error card used when card generation fails
 */
export const CARD_GENERATION_ERROR: Card = {
  id: uuidv4(),
  name: 'Error Card',
  imageUrl: '',
  rarity: Rarity.COMMON,
  type: CardType.CREATURE,
  element: Element.VOID,
  stats: {
    health: 50,
    stamina: 25,
    attack: 25,
    defense: 10,
    speed: 10,
    manaCost: 5
  },
  effects: [{
    id: uuidv4(),
    name: "Error Handler",
    type: EffectType.TRIGGER,
    category: EffectCategory.UTILITY,
    duration: 1,
    magnitude: 1,
    target: TargetType.SELF,
    condition: "When played",
    description: "This effect appeared due to an error in card generation."
  }],
  description: 'An error occurred while generating this card.',
  lore: 'This card emerged from the void when an error occurred during card generation.',
  createdAt: new Date(),
  createdBy: 'system',
  mood: 'Error',
  complexity: 1,
  dominantColors: ['#FF0000', '#000000']
};

/**
 * Analysis result used when image analysis fails
 */
export const IMAGE_ANALYSIS_ERROR: AIAnalysisResult = {
  objectsDetected: ["error occurred"],
  dominantColors: ["#FF0000"],
  mood: "error",
  complexity: 1,
  suggestedElement: "neutral",
  suggestedType: "error", // Changed to "error" as requested
  suggestedRarity: "common",
  generatedDescription: "An error occurred during image analysis.",
  generatedLore: "This card appeared when an unexpected error happened during the analysis process.",
  suggestedStats: {
    health: 50,
    stamina: 25,
    attack: 25,
    defense: 10,
    speed: 10,
    manaCost: 5
  },
  suggestedEffects: [{
    id: "error-effect-1",
    name: "Error Handler",
    description: "This effect appeared due to an error in image processing."
  }]
};

/**
 * Card used for API connection failures
 */
export const API_ERROR_CARD: Card = {
  id: uuidv4(),
  name: 'Connection Error',
  imageUrl: '',
  rarity: Rarity.COMMON,
  type: CardType.SPELL,
  element: Element.VOID,
  stats: {
    health: 1,
    stamina: 1,
    attack: 1,
    defense: 1,
    speed: 1,
    manaCost: 1
  },
  effects: [{
    id: uuidv4(),
    name: "Network Retry",
    type: EffectType.TRIGGER,
    category: EffectCategory.UTILITY,
    duration: 1,
    magnitude: 1,
    target: TargetType.SELF,
    condition: "When played",
    description: "Attempt to reconnect to the server."
  }],
  description: 'A connection error occurred when communicating with the server.',
  lore: 'Even in the digital realm, connections can be severed by unseen forces.',
  createdAt: new Date(),
  createdBy: 'system',
  mood: 'Disconnected',
  complexity: 2,
  dominantColors: ['#808080', '#000000']
};

/**
 * Returns a fresh copy of the error card (to avoid shared references)
 */
export function getCardGenerationError(): Card {
  return {
    ...CARD_GENERATION_ERROR,
    id: uuidv4(),
    effects: CARD_GENERATION_ERROR.effects.map(effect => ({...effect, id: uuidv4()})),
    createdAt: new Date()
  };
}

/**
 * Returns a fresh copy of the image analysis error (to avoid shared references)
 */
export function getImageAnalysisError(): AIAnalysisResult {
  return {...IMAGE_ANALYSIS_ERROR};
}

/**
 * Returns a fresh copy of the API error card (to avoid shared references)
 */
export function getApiErrorCard(): Card {
  return {
    ...API_ERROR_CARD,
    id: uuidv4(),
    effects: API_ERROR_CARD.effects.map(effect => ({...effect, id: uuidv4()})),
    createdAt: new Date()
  };
}
