import { Card, CardType, Rarity, Element, EffectType, EffectCategory, TargetType } from '@/types/card';

// Hidden card for easter egg - triggered by entering "EGGPLANT STUDIO" as card name
export const EGGPLANT_STUDIO_CARD: Card = {
  id: 'eggplant-studio-hidden',
  name: 'Eggplant Overlord',
  imageUrl: '/eggplant_card.png',
  rarity: Rarity.UNIQUE,
  type: CardType.HIDDEN,
  element: Element.FLORA,
  stats: {
    health: 12,
    attack: 8,
    manaCost: 10, // tăng thành 10 mana
  },
  effects: [
    {
      id: 'eggplant-domination',
      name: 'Eggplant Domination',
      type: EffectType.BUFF,
      category: EffectCategory.STAT_MODIFICATION,
      duration: 2,
      magnitude: 3,
      target: TargetType.SELF,
      condition: 'When this card is played',
      description: 'Gains +3 attack and +2 health for 2 turns.'
    },
    {
      id: 'mystical-harvest',
      name: 'Mystical Harvest',
      type: EffectType.TRIGGER,
      category: EffectCategory.HEALING,
      duration: 3,
      magnitude: 2,
      target: TargetType.ALLY_ALL,
      condition: 'At the start of your turn',
      description: 'Heals all allies by 2 health for 3 turns.'
    },
    {
      id: 'vegetable-blessing',
      name: 'Vegetable Blessing',
      type: EffectType.BUFF,
      category: EffectCategory.STAT_MODIFICATION,
      duration: 2,
      magnitude: 1,
      target: TargetType.ALLY_ALL,
      condition: 'When this card is played',
      description: 'All your creatures gain +1 attack for 2 turns.'
    },
    {
      id: 'eggplant-rebirth',
      name: 'Eggplant Rebirth',
      type: EffectType.REVIVE,
      category: EffectCategory.REVIVAL,
      duration: 1,
      magnitude: 1,
      target: TargetType.SELF,
      condition: 'When this card dies',
      description: 'Revives once with 6 health. Can only trigger one time.'
    }
  ],
  description: 'The ultimate form of Eggplant Overlord, demanding 10 mana to summon. Its powers combine healing, blessing, domination, and even resurrection.',
  lore: 'Legends say that in Eggplant Studio\'s secret garden, the Overlord never truly dies—it sprouts anew, stronger and brighter.',
  createdAt: new Date(),
  createdBy: 'Eggplant Studio',
  mood: 'mystical, powerful, eternal',
  complexity: 120,
  dominantColors: ['#8B4513', '#9370DB', '#228B22']
};

// Hidden card triggered by "???" - Mystery damage dealer
export const MYSTERY_CARD: Card = {
  id: 'mystery-hidden',
  name: '???',
  imageUrl: '/question_mark_card.jpg', // Using question mark card image for mystery theme
  rarity: Rarity.UNIQUE,
  type: CardType.HIDDEN,
  element: Element.VOID,
  stats: {
    health: 8,
    attack: 10,
    manaCost: 8
  },
  effects: [
    {
      id: 'mystery-damage',
      name: 'Mystery Strike',
      type: EffectType.DEBUFF,
      category: EffectCategory.DAMAGE,
      duration: 1,
      magnitude: 0, // Will be randomized
      target: TargetType.ENEMY,
      condition: 'When this card attacks',
      description: 'Deals random damage between 4-12 to the target. The damage amount is revealed only when the attack lands.'
    },
    {
      id: 'question-mark-shield',
      name: '??? Shield',
      type: EffectType.BUFF,
      category: EffectCategory.STAT_MODIFICATION,
      duration: 2, // Changed from 3 to 2 turns
      magnitude: 40, // Changed from 50% to 40%
      target: TargetType.SELF,
      condition: 'When this card takes damage',
      description: 'Has a 40% chance to completely negate any damage taken for 2 turns.'
    },
    {
      id: 'enigma-trigger',
      name: 'Enigma Effect',
      type: EffectType.TRIGGER,
      category: EffectCategory.STAT_MODIFICATION,
      duration: 1,
      magnitude: -2, // Changed from -3 to -2
      target: TargetType.ENEMY_ALL,
      condition: 'At the end of enemy turn',
      description: 'Reduces enemy attack by 2 for 1 turn. The effect is invisible until it triggers.'
    }
  ],
  description: 'A mysterious entity shrouded in question marks. Its true power is unknown, its intentions unclear. One thing is certain - it brings chaos and unpredictability to the battlefield.',
  lore: 'From the void between realities comes ???, a being that defies comprehension. Its power is as mysterious as its origins, leaving only question marks in its wake.',
  createdAt: new Date,
  createdBy: 'The Unknown',
  mood: 'mysterious, chaotic, unpredictable',
  complexity: 15,
  dominantColors: ['#000000', '#808080', '#FFFFFF']
};

// Hidden card triggered by "NULL" - Void manipulator
export const NULL_CARD: Card = {
  id: 'null-hidden',
  name: 'Null',
  imageUrl: '/null_card.png', // Using null card image for void theme
  rarity: Rarity.UNIQUE,
  type: CardType.HIDDEN,
  element: Element.VOID,
  stats: {
    health: 15,
    attack: 5,
    manaCost: 8
  },
  effects: [
    {
      id: 'nullify-effects',
      name: 'Nullify',
      type: EffectType.DEBUFF,
      category: EffectCategory.CONTROL,
      duration: 1, // Changed from 2 to 1 turn
      magnitude: 1,
      target: TargetType.ENEMY,
      condition: 'When this card is played',
      description: 'Removes all positive effects from target enemy card and prevents new effects for 1 turn.'
    },
    {
      id: 'void-absorb',
      name: 'Void Absorption',
      type: EffectType.TRIGGER,
      category: EffectCategory.STAT_MODIFICATION,
      duration: -1,
      magnitude: 1, // Changed from +2 to +1
      target: TargetType.SELF,
      condition: 'When enemy card dies',
      description: 'Gains +1 attack permanently whenever an enemy card dies on the battlefield.'
    },
    {
      id: 'null-barrier',
      name: 'Null Barrier',
      type: EffectType.BUFF,
      category: EffectCategory.STAT_MODIFICATION,
      duration: 5,
      magnitude: 8, // Changed from 10 to 8
      target: TargetType.SELF,
      condition: 'When health drops below 50%',
      description: 'Creates a barrier that absorbs the next 8 damage. The barrier nullifies all effects on the absorbed damage.'
    }
  ],
  description: 'The embodiment of nothingness. Null consumes effects, absorbs power, and leaves only emptiness in its wake. It is the ultimate counter to magical abilities.',
  lore: 'Born from the absence of code, Null wanders the digital realms seeking to return all things to their original state - pure, unadulterated nothingness.',
  createdAt: new Date,
  createdBy: 'The Void',
  mood: 'empty, consuming, absolute',
  complexity: 12,
  dominantColors: ['#000000', '#2F2F2F', '#696969']
};

// Export all hidden cards
export const HIDDEN_CARDS = {
  EGGPLANT_STUDIO: EGGPLANT_STUDIO_CARD,
  MYSTERY: MYSTERY_CARD,
  NULL: NULL_CARD
};
