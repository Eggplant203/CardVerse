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
 * Get inline style color for element text (using hex colors)
 * @param element The element to get color for
 * @returns Inline style color string
 */
export function getElementTextColorStyle(element: Element): string {
  const hexColor = getElementHexColor(element);
  return `color: ${hexColor}`;
}

/**
 * Get hex color for element (for HTML styling)
 * @param element The element to get color for
 * @returns Hex color string
 */
export function getElementHexColor(element: Element): string {
  const elementHexColors: Record<Element, string> = {
    [Element.AURORA]: '#7A52A3', // Darker purple
    [Element.VOID]: '#808080', // Darker gray
    [Element.CRYSTAL]: '#6BA8CC', // Darker light blue
    [Element.BLOOD]: '#A52A2A', // Darker red
    [Element.STORM]: '#2A7BC8', // Darker blue
    [Element.FLORA]: '#4D994D', // Darker green
    [Element.AETHER]: '#D4AA00', // Darker gold
  };

  return elementHexColors[element] || '#FFFFFF';
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
    [Element.AURORA]: '#7A52A3',    // Darker purple
    [Element.VOID]: '#808080',      // Darker gray
    [Element.CRYSTAL]: '#6BA8CC',   // Darker light blue
    [Element.BLOOD]: '#A52A2A',     // Darker red
    [Element.STORM]: '#2A7BC8',     // Darker blue
    [Element.FLORA]: '#4D994D',     // Darker green
    [Element.AETHER]: '#D4AA00',    // Darker gold
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
