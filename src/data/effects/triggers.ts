import { Effect, EffectCategory, EffectType, TargetType } from '@/types/card';

export const TRIGGER_EFFECTS: Record<string, Effect> = {
  COUNTER_ATTACK: {
    id: 'counter_attack',
    name: 'Counter Attack',
    type: EffectType.TRIGGER,
    category: EffectCategory.DAMAGE,
    duration: 0, // One-time effect
    magnitude: 2,
    target: TargetType.ENEMY,
    condition: 'when_attacked',
    description: 'When attacked, deal 2 damage to attacker'
  },
  DEATH_RATTLE: {
    id: 'death_rattle',
    name: 'Death Rattle',
    type: EffectType.TRIGGER,
    category: EffectCategory.DAMAGE,
    duration: 0,
    magnitude: 3,
    target: TargetType.ENEMY_ALL,
    condition: 'on_death',
    description: 'When this card dies, deal 3 damage to all enemies'
  },
  LIFE_LINK: {
    id: 'life_link',
    name: 'Life Link',
    type: EffectType.TRIGGER,
    category: EffectCategory.HEALING,
    duration: 0,
    magnitude: 0, // Based on damage dealt
    target: TargetType.SELF,
    condition: 'on_attack',
    description: 'When attacking, heal for half the damage dealt'
  },
  GUARDIAN: {
    id: 'guardian',
    name: 'Guardian',
    type: EffectType.TRIGGER,
    category: EffectCategory.UTILITY,
    duration: 0,
    magnitude: 0,
    target: TargetType.SELF,
    condition: 'ally_attacked',
    description: 'When an ally is attacked, redirect the attack to this card'
  },
  ENRAGE: {
    id: 'enrage',
    name: 'Enrage',
    type: EffectType.TRIGGER,
    category: EffectCategory.STAT_MODIFICATION,
    duration: 0, // Permanent until healed
    magnitude: 2,
    target: TargetType.SELF,
    condition: 'when_damaged',
    description: 'When damaged, gain +2 attack'
  },
  LAST_STAND: {
    id: 'last_stand',
    name: 'Last Stand',
    type: EffectType.TRIGGER,
    category: EffectCategory.UTILITY,
    duration: 0,
    magnitude: 0,
    target: TargetType.SELF,
    condition: 'on_fatal_damage',
    description: 'The first time this card would die, it survives with 1 health'
  },
};
