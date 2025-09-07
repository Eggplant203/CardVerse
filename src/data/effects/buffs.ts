import { Effect, EffectCategory, EffectType, TargetType } from '@/types/card';

export const BUFF_EFFECTS: Record<string, Effect> = {
  STRENGTH_BOOST: {
    id: 'strength_boost',
    name: 'Strength Boost',
    type: EffectType.BUFF,
    category: EffectCategory.STAT_MODIFICATION,
    duration: 3,
    magnitude: 5,
    target: TargetType.SELF,
    condition: 'none',
    description: 'Increases attack power by 5 for 3 turns'
  },
  ARMOR_UP: {
    id: 'armor_up',
    name: 'Armor Up',
    type: EffectType.BUFF,
    category: EffectCategory.STAT_MODIFICATION,
    duration: 2,
    magnitude: 3,
    target: TargetType.SELF,
    condition: 'none',
    description: 'Increases defense by 3 for 2 turns'
  },
  SWIFT_MOVEMENT: {
    id: 'swift_movement',
    name: 'Swift Movement',
    type: EffectType.BUFF,
    category: EffectCategory.STAT_MODIFICATION,
    duration: 2,
    magnitude: 2,
    target: TargetType.SELF,
    condition: 'none',
    description: 'Increases speed by 2 for 2 turns'
  },
  REJUVENATION: {
    id: 'rejuvenation',
    name: 'Rejuvenation',
    type: EffectType.BUFF,
    category: EffectCategory.HEALING,
    duration: 3,
    magnitude: 2,
    target: TargetType.SELF,
    condition: 'none',
    description: 'Restore 2 health at the start of each turn for 3 turns'
  },
  INSPIRATION: {
    id: 'inspiration',
    name: 'Inspiration',
    type: EffectType.BUFF,
    category: EffectCategory.UTILITY,
    duration: 3,
    magnitude: 1,
    target: TargetType.ALLY_ALL,
    condition: 'none',
    description: 'All allies gain +1 to all stats for 3 turns'
  },
  SHIELD_OF_LIGHT: {
    id: 'shield_of_light',
    name: 'Shield of Light',
    type: EffectType.BUFF,
    category: EffectCategory.UTILITY,
    duration: 2,
    magnitude: 0,
    target: TargetType.ALLY,
    condition: 'none',
    description: 'Target ally cannot be targeted by enemy effects for 2 turns'
  },
  MANA_SURGE: {
    id: 'mana_surge',
    name: 'Mana Surge',
    type: EffectType.BUFF,
    category: EffectCategory.UTILITY,
    duration: 1,
    magnitude: 2,
    target: TargetType.SELF,
    condition: 'none',
    description: 'Gain 2 additional mana next turn'
  },
  BATTLE_FURY: {
    id: 'battle_fury',
    name: 'Battle Fury',
    type: EffectType.BUFF,
    category: EffectCategory.UTILITY,
    duration: 1,
    magnitude: 0,
    target: TargetType.SELF,
    condition: 'none',
    description: 'Can attack twice during your next combat phase'
  },
};
