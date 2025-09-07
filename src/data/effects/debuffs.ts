import { Effect, EffectCategory, EffectType, TargetType } from '@/types/card';

export const DEBUFF_EFFECTS: Record<string, Effect> = {
  WEAKENING: {
    id: 'weakening',
    name: 'Weakening',
    type: EffectType.DEBUFF,
    category: EffectCategory.STAT_MODIFICATION,
    duration: 2,
    magnitude: 3,
    target: TargetType.ENEMY,
    condition: 'none',
    description: 'Reduces target enemy attack by 3 for 2 turns'
  },
  VULNERABILITY: {
    id: 'vulnerability',
    name: 'Vulnerability',
    type: EffectType.DEBUFF,
    category: EffectCategory.STAT_MODIFICATION,
    duration: 2,
    magnitude: 2,
    target: TargetType.ENEMY,
    condition: 'none',
    description: 'Reduces target enemy defense by 2 for 2 turns'
  },
  SLOW: {
    id: 'slow',
    name: 'Slow',
    type: EffectType.DEBUFF,
    category: EffectCategory.STAT_MODIFICATION,
    duration: 2,
    magnitude: 1,
    target: TargetType.ENEMY,
    condition: 'none',
    description: 'Reduces target enemy speed by 1 for 2 turns'
  },
  POISON: {
    id: 'poison',
    name: 'Poison',
    type: EffectType.DEBUFF,
    category: EffectCategory.DAMAGE,
    duration: 3,
    magnitude: 2,
    target: TargetType.ENEMY,
    condition: 'none',
    description: 'Deals 2 damage to target at the start of each turn for 3 turns'
  },
  SILENCE: {
    id: 'silence',
    name: 'Silence',
    type: EffectType.DEBUFF,
    category: EffectCategory.CONTROL,
    duration: 1,
    magnitude: 0,
    target: TargetType.ENEMY,
    condition: 'none',
    description: 'Target cannot use abilities for 1 turn'
  },
  STUN: {
    id: 'stun',
    name: 'Stun',
    type: EffectType.DEBUFF,
    category: EffectCategory.CONTROL,
    duration: 1,
    magnitude: 0,
    target: TargetType.ENEMY,
    condition: 'none',
    description: 'Target cannot attack or use abilities for 1 turn'
  },
  CURSE_OF_EXHAUSTION: {
    id: 'curse_of_exhaustion',
    name: 'Curse of Exhaustion',
    type: EffectType.DEBUFF,
    category: EffectCategory.UTILITY,
    duration: 2,
    magnitude: 2,
    target: TargetType.ENEMY,
    condition: 'none',
    description: 'Target loses 2 stamina at the start of their turn for 2 turns'
  },
  MANA_BURN: {
    id: 'mana_burn',
    name: 'Mana Burn',
    type: EffectType.DEBUFF,
    category: EffectCategory.UTILITY,
    duration: 1,
    magnitude: 1,
    target: TargetType.ENEMY,
    condition: 'none',
    description: 'Target loses 1 mana during their next turn'
  },
};
