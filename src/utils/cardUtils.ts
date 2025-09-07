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

/**
 * Parse an effect description and apply HTML formatting to keywords
 * This ensures consistency between AI generated formatted text and application rendering
 * @param description The description text that may or may not already contain formatting
 * @returns Formatted description with proper HTML styling for keywords
 */
export function formatEffectDescription(description: string): string {
  if (!description) return '';
  
  // Element colors
  const elementColors: Record<string, string> = {
    [Element.AURORA]: '#9966CC',    // Purple-ish
    [Element.VOID]: '#463366',      // Dark purple
    [Element.CRYSTAL]: '#88CCEE',   // Light blue
    [Element.BLOOD]: '#CC3333',     // Dark red
    [Element.STORM]: '#3399FF',     // Blue
    [Element.FLORA]: '#66CC66',     // Green
    [Element.AETHER]: '#FFCC00',    // Gold
  };

  // Stat colors
  const statColor = '#FF0000'; // Red for stats
  
  // Format stats (health, stamina, etc.)
  let formattedDesc = description;
  Object.keys(STAT_RANGES).forEach(stat => {
    const statName = stat.toLowerCase();
    // Only replace the word if it's not already in a span tag
    const regex = new RegExp(`(?<!<span[^>]*>)\\b${statName}\\b(?![^<]*<\\/span>)`, 'gi');
    formattedDesc = formattedDesc.replace(regex, 
      `<span style='color:${statColor};font-weight:bold;'>${statName}</span>`);
  });
  
  // Format effect types
  Object.values(EffectType).forEach(effectType => {
    const regex = new RegExp(`(?<!<span[^>]*>)\\b${effectType}\\b(?![^<]*<\\/span>)`, 'gi');
    formattedDesc = formattedDesc.replace(regex,
      `<span style='color:#4287f5;font-style:italic;'>${effectType}</span>`);
  });
  
  // Format effect categories
  Object.values(EffectCategory).forEach(category => {
    const readable = category.replace('_', ' ');
    const regex = new RegExp(`(?<!<span[^>]*>)\\b${readable}\\b(?![^<]*<\\/span>)`, 'gi');
    formattedDesc = formattedDesc.replace(regex,
      `<span style='color:#9c27b0;font-weight:bold;'>${readable}</span>`);
  });
  
  // Format target types
  Object.values(TargetType).forEach(targetType => {
    const regex = new RegExp(`(?<!<span[^>]*>)\\b${targetType}\\b(?![^<]*<\\/span>)`, 'gi');
    formattedDesc = formattedDesc.replace(regex,
      `<span style='color:#009688;'>${targetType}</span>`);
  });
  
  // Format element names
  Object.values(Element).forEach(element => {
    const color = elementColors[element] || '#000000';
    const regex = new RegExp(`(?<!<span[^>]*>)\\b${element}\\b(?![^<]*<\\/span>)`, 'gi');
    formattedDesc = formattedDesc.replace(regex,
      `<span style='color:${color};font-weight:bold;'>${element}</span>`);
  });
  
  return formattedDesc;
}
