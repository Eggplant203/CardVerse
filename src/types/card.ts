// Types for card-related interfaces

// Card stat ranges
export const STAT_RANGES = {
  HEALTH: { min: 1, max: 12 },      // HP of units/cards, max ~12 to avoid 'immortal tanks'
  ATTACK: { min: 0, max: 12 },      // Damage, 0 for defensive/support units
  MANA_COST: { min: 0, max: 10 }    // Mana cost following 0-10 standard, higher values can unbalance the game
};

export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
  UNIQUE = 'unique',
}

export enum CardType {
  CREATURE = 'creature',        // Monster, creature, character
  SPELL = 'spell',              // Pure spell
  ARTIFACT = 'artifact',        // Legendary item, artifact
  EQUIPMENT = 'equipment',      // Weapon/armor equipment
  LOCATION = 'location',        // Location (forest, mountain, fortress) - suitable for landscape photos
  TOTEM = 'totem',              // Symbol/totem - suitable for logo, symbol photos
  SUMMON = 'summon',            // Entity summoned by other spells
  ENTITY = 'entity',            // Abstract entity (light, darkness, soul)
  VEHICLE = 'vehicle',          // Machine, aircraft, chariot - suitable for technology/car photos
  HIDDEN = 'hidden',            // Hidden cards for dev and easter eggs - not included in AI prompts
  ERROR = 'error',              // Error cards - not included in AI prompts
}

export enum Element {
  AURORA = 'aurora',      // Aurora - mystical, rare effects
  VOID = 'void',          // Void - mysterious dark energy, weakening effects
  CRYSTAL = 'crystal',    // Crystal - durable power, reflection
  BLOOD = 'blood',        // Blood - sacrifice for power
  STORM = 'storm',        // Storm - speed, chaos, explosive effects
  FLORA = 'flora',        // Flora - nature, healing, vitality
  AETHER = 'aether',      // Aether - ancient mystical energy, pure magic
}

export interface CardStats {
  health: number;
  attack: number;
  manaCost: number;
}

export enum EffectType {
  BUFF = 'buff',              // Increase power/strength
  DEBUFF = 'debuff',          // Weaken enemies
  TRIGGER = 'trigger',        // Conditional activation
  PERSISTENT = 'persistent',  // Long-lasting effects
  PASSIVE = 'passive',        // Hidden effects
  SUMMON = 'summon',          // Summon creatures
  TRANSFORM = 'transform',    // Transform/Change form
  REVIVE = 'revive',          // Revive/Restore life
}

export enum EffectCategory {
  STAT_MODIFICATION = 'stat_modification',
  DAMAGE = 'damage',
  HEALING = 'healing',
  CONTROL = 'control',
  UTILITY = 'utility',
  SHIELD = 'shield',
  SUMMONING = 'summoning',
  REVIVAL = 'revival',
  TRANSFORMATION = 'transformation',
  ENVIRONMENT = 'environment',
}

export enum TargetType {
  SELF = 'self',
  ALLY = 'ally',
  ALLY_ALL = 'ally_all',
  ENEMY = 'enemy',
  ENEMY_ALL = 'enemy_all',
  ANY = 'any',
}

export interface Effect {
  id: string;
  name: string;
  type: EffectType;
  category: EffectCategory;
  duration: number;
  magnitude: number;
  target: TargetType;
  condition: string;
  description: string;
}

export interface Card {
  id: string;
  name: string;
  imageUrl: string;
  rarity: Rarity;
  type: CardType;
  element: Element;
  stats: CardStats;
  effects: Effect[];
  description: string;
  lore: string;
  createdAt: Date;
  createdBy: string;
  mood?: string;
  complexity?: number;
  dominantColors?: string[];
}
