import { Effect, EffectCategory, EffectType, TargetType } from '@/types/card';

export const PERSISTENT_EFFECTS: Record<string, Effect> = {
  AURA_OF_MIGHT: {
    id: 'aura_of_might',
    name: 'Aura of Might',
    type: EffectType.PERSISTENT,
    category: EffectCategory.STAT_MODIFICATION,
    duration: -1, // Permanent
    magnitude: 1,
    target: TargetType.ALLY_ALL,
    condition: 'always',
    description: 'All allied cards have +1 attack'
  },
  AURA_OF_PROTECTION: {
    id: 'aura_of_protection',
    name: 'Aura of Protection',
    type: EffectType.PERSISTENT,
    category: EffectCategory.STAT_MODIFICATION,
    duration: -1,
    magnitude: 1,
    target: TargetType.ALLY_ALL,
    condition: 'always',
    description: 'All allied cards have +1 defense'
  },
  AURA_OF_SWIFTNESS: {
    id: 'aura_of_swiftness',
    name: 'Aura of Swiftness',
    type: EffectType.PERSISTENT,
    category: EffectCategory.STAT_MODIFICATION,
    duration: -1,
    magnitude: 1,
    target: TargetType.ALLY_ALL,
    condition: 'always',
    description: 'All allied cards have +1 speed'
  },
  AURA_OF_WEAKNESS: {
    id: 'aura_of_weakness',
    name: 'Aura of Weakness',
    type: EffectType.PERSISTENT,
    category: EffectCategory.STAT_MODIFICATION,
    duration: -1,
    magnitude: 1,
    target: TargetType.ENEMY_ALL,
    condition: 'always',
    description: 'All enemy cards have -1 attack'
  },
  REGENERATION: {
    id: 'regeneration',
    name: 'Regeneration',
    type: EffectType.PERSISTENT,
    category: EffectCategory.HEALING,
    duration: -1,
    magnitude: 1,
    target: TargetType.SELF,
    condition: 'turn_start',
    description: 'At the start of your turn, heal 1 health'
  },
  MANA_LINK: {
    id: 'mana_link',
    name: 'Mana Link',
    type: EffectType.PERSISTENT,
    category: EffectCategory.UTILITY,
    duration: -1,
    magnitude: 1,
    target: TargetType.SELF,
    condition: 'turn_start',
    description: 'At the start of your turn, gain 1 additional mana'
  },
};
