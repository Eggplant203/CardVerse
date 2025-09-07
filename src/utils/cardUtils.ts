import { 
  Element, 
  CardType, 
  Rarity, 
  STAT_RANGES,
  EffectType,
  EffectCategory, 
  TargetType 
} from '@/types/card';

/**
 * Card-related utility functions
 */

// Get array of element values from Element enum
export function getElementValues(): string[] {
  return Object.values(Element);
}

// Get array of card type values from CardType enum
export function getCardTypeValues(): string[] {
  return Object.values(CardType);
}

// Get array of rarity values from Rarity enum
export function getRarityValues(): string[] {
  return Object.values(Rarity);
}

// Get a formatted string of elements for AI prompts
export function getElementsString(): string {
  return getElementValues().join(', ');
}

// Get a formatted string of card types for AI prompts
export function getCardTypesString(): string {
  return getCardTypeValues().join(', ');
}

// Get a formatted string of rarities for AI prompts
export function getRaritiesString(): string {
  return getRarityValues().join(', ');
}

// Get a formatted string of stat ranges for AI prompts
export function getStatRangesString(): string {
  return `health: ${STAT_RANGES.HEALTH.min}-${STAT_RANGES.HEALTH.max}, ` +
         `stamina: ${STAT_RANGES.STAMINA.min}-${STAT_RANGES.STAMINA.max}, ` +
         `attack: ${STAT_RANGES.ATTACK.min}-${STAT_RANGES.ATTACK.max}, ` +
         `defense: ${STAT_RANGES.DEFENSE.min}-${STAT_RANGES.DEFENSE.max}, ` +
         `speed: ${STAT_RANGES.SPEED.min}-${STAT_RANGES.SPEED.max}, ` +
         `manaCost: ${STAT_RANGES.MANA_COST.min}-${STAT_RANGES.MANA_COST.max}`;
}

// Get effect types string for AI prompts
export function getEffectTypesString(): string {
  return Object.values(EffectType).join(', ');
}

// Get effect categories string for AI prompts
export function getEffectCategoriesString(): string {
  return Object.values(EffectCategory).join(', ');
}

// Get target types string for AI prompts
export function getTargetTypesString(): string {
  return Object.values(TargetType).join(', ');
}
