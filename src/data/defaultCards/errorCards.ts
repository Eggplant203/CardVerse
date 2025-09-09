import { Card, CardType, Element, Rarity, EffectType, EffectCategory, TargetType } from '@/types/card';
import { AIAnalysisResult } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

/**
 * Error card used when card generation fails - appears as a corrupted void creature
 */
export const CARD_GENERATION_ERROR: Card = {
  id: uuidv4(),
  name: 'Void Glitch',
  imageUrl: '/error_card.png',
  rarity: Rarity.COMMON,
  type: CardType.ERROR,
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
    name: "Reality Fracture",
    type: EffectType.DEBUFF,
    category: EffectCategory.DAMAGE,
    duration: 1,
    magnitude: 1,
    target: TargetType.ENEMY,
    condition: "When played",
    description: "Deals 1 damage to enemy. This card was corrupted during creation."
  }],
  description: 'A corrupted entity that emerged from a failed summoning ritual.',
  lore: 'When the ancient runes fail to bind properly, these glitch entities slip through the veil between worlds.',
  createdAt: new Date(),
  createdBy: 'system',
  mood: 'Corrupted',
  complexity: 1,
  dominantColors: ['#8B0000', '#000000']
};

/**
 * Analysis result used when chatbot API is overloaded (503)
 */
export const CHATBOT_OVERLOAD_ANALYSIS: AIAnalysisResult = {
  objectsDetected: ["Overcharged Oracle"],
  dominantColors: ["#FFD700", "#FF4500"],
  mood: "frenzied",
  complexity: 1,
  suggestedElement: "storm",
  suggestedType: "error",
  suggestedRarity: "common",
  generatedDescription: "An oracle overwhelmed by too many visions, its mind crackling with lightning.",
  generatedLore: "When the threads of fate pull too strongly, even the wisest oracles can be consumed by the storm of possibilities.",
  suggestedStats: {
    health: 1,
    stamina: 1,
    attack: 1,
    defense: 1,
    speed: 1,
    manaCost: 1
  },
  suggestedEffects: [{
    id: "overload-effect",
    name: "Storm Surge",
    description: "The oracle's mind is overloaded with visions. Wait for the storm to pass.",
    effectType: "trigger",
    effectCategory: "utility",
    targetType: "self"
  }]
};

/**
 * Card used for API connection failures - appears as a severed magical link
 */
export const API_ERROR_CARD: Card = {
  id: uuidv4(),
  name: 'Severed Astral Link',
  imageUrl: '/error_card.png',
  rarity: Rarity.COMMON,
  type: CardType.ERROR,
  element: Element.VOID,
  stats: {
    health: 1,
    stamina: 1,
    attack: 1,
    defense: 1,
    speed: 1,
    manaCost: 2
  },
  effects: [{
    id: uuidv4(),
    name: "Reweave Connection",
    type: EffectType.TRIGGER,
    category: EffectCategory.UTILITY,
    duration: 1,
    magnitude: 1,
    target: TargetType.SELF,
    condition: "When played",
    description: "Attempts to restore the broken connection to the astral plane."
  }],
  description: 'The mystical connection to the server realm has been severed by chaotic energies.',
  lore: 'In the vast network of ley lines connecting all realms, some threads occasionally snap, leaving wizards stranded.',
  createdAt: new Date(),
  createdBy: 'system',
  mood: 'Disconnected',
  complexity: 2,
  dominantColors: ['#4B0082', '#696969']
};

/**
 * Card used for chatbot API overload errors (503)
 */
export const CHATBOT_OVERLOAD_ERROR: Card = {
  id: uuidv4(),
  name: 'Overcharged Oracle',
  imageUrl: '/error_card.png',
  rarity: Rarity.COMMON,
  type: CardType.ERROR,
  element: Element.STORM,
  stats: {
    health: 1,
    stamina: 1,
    attack: 1,
    defense: 1,
    speed: 1,
    manaCost: 2
  },
  effects: [{
    id: uuidv4(),
    name: "Storm Surge",
    type: EffectType.TRIGGER,
    category: EffectCategory.UTILITY,
    duration: 1,
    magnitude: 1,
    target: TargetType.SELF,
    condition: "When played",
    description: "The oracle's mind crackles with lightning. The storm will pass soon."
  }],
  description: 'An oracle overwhelmed by visions, its mind sparking with uncontrollable energy.',
  lore: 'When too many futures converge at once, even the most gifted seers can be consumed by the tempest of possibilities.',
  createdAt: new Date(),
  createdBy: 'system',
  mood: 'Frenzied',
  complexity: 1,
  dominantColors: ['#FFD700', '#FF4500']
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
  return {
    objectsDetected: ["Mystic Vision Error"],
    dominantColors: ["#8B0000"],
    mood: "bewildered",
    complexity: 1,
    suggestedElement: "void",
    suggestedType: "error",
    suggestedRarity: "common",
    generatedDescription: "A corrupted vision that emerged from a failed scrying ritual.",
    generatedLore: "When crystal balls crack and scrying pools turn murky, these error visions manifest in the ether.",
    suggestedStats: {
      health: 1,
      stamina: 1,
      attack: 1,
      defense: 1,
      speed: 1,
      manaCost: 1
    },
    suggestedEffects: [{
      id: "vision-error-effect",
      name: "Crystal Fracture",
      description: "Deals 1 damage to enemy. This vision was corrupted during the scrying process.",
      effectType: "debuff",
      effectCategory: "damage",
      targetType: "enemy"
    }]
  };
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

/**
 * Returns a fresh copy of the chatbot overload error card (to avoid shared references)
 */
export function getChatbotOverloadError(): Card {
  return {
    ...CHATBOT_OVERLOAD_ERROR,
    id: uuidv4(),
    effects: CHATBOT_OVERLOAD_ERROR.effects.map(effect => ({...effect, id: uuidv4()})),
    createdAt: new Date()
  };
}

/**
 * Returns a fresh copy of the chatbot overload analysis result (to avoid shared references)
 */
export function getChatbotOverloadAnalysis(): AIAnalysisResult {
  return {...CHATBOT_OVERLOAD_ANALYSIS};
}
