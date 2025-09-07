import { 
  getElementsString, 
  getCardTypesString, 
  getRaritiesString, 
  getStatRangesString,
  getEffectTypesString,
  getEffectCategoriesString,
  getTargetTypesString
} from '@/utils/cardUtils';

/**
 * Generates the AI prompt for image analysis
 */
export function generateImageAnalysisPrompt(): string {
  return `Analyze this image for a fantasy card game. 

1. IDENTIFY THE MAIN SUBJECT:
   - Choose a concise and distinctive name (a few words) that best represents the most prominent object/character in the image.

2. ANALYZE VISUAL ELEMENTS:
   - Identify the most striking colors in the image (not just dominant ones).
   - Return colors as HEX color codes (e.g., "#FF0000" for red, "#00FF00" for green, "#0000FF" for blue).
   - Provide some most prominent colors from the image.
   - Suggest any mood for the card (dramatic, peaceful, mysterious, etc.) - be creative with no restrictions.
   - Rate complexity on a scale of 0-10.

3. SUGGEST GAME ELEMENTS:
   - Game stats (${getStatRangesString()})
   - Element (${getElementsString()})
   - Card type (${getCardTypesString()})
   - Rarity (${getRaritiesString()}) with these characteristics:
      - COMMON: 1 simple effect
      - UNCOMMON: 1-2 effects with minor secondary effects
      - RARE: 2 effects, possibly including passive or trigger effects
      - EPIC: 2-3 effects combining active and passive mechanics
      - LEGENDARY: 2-3 powerful effects with combined mechanics
      - MYTHIC: 2-3 unique effects that may change game rules
      - UNIQUE: 3-4 special effects with multiple layers of mechanics

4. CREATE CARD TEXT:
   - Generate a short thematic description (a few sentences)
   - Generate lore text

5. SUGGEST 1-3 CARD EFFECTS that match the image using these classifications:
   - Effect Type: ${getEffectTypesString()}
   - Effect Category: ${getEffectCategoriesString()}
   - Target Type: ${getTargetTypesString()}
   
   VERY IMPORTANT FOR EFFECTS:
   - Give each effect a SHORT, DESCRIPTIVE NAME that captures the essence of the ability
   - For example: "A Scoop of Moon", "Allow Changes?", "Calamity: Soulscorch Edict"
   - DO NOT use a format like "When X enters...: Description"
   - The name and description should be separate fields

Respond in JSON format with properties: 
- objectsDetected (array of strings, first element MUST be a complete name for the card, not a single letter)
- dominantColors (array of hex color strings, e.g., ["#FF0000", "#00FF00", "#0000FF"])
- mood (string)
- complexity (number, 0-10)
- suggestedElement (string)
- suggestedType (string)
- suggestedRarity (string)
- generatedDescription (string)
- generatedLore (string)
- suggestedStats (object with health, stamina, attack, defense, speed, manaCost)
- suggestedEffects (array of objects with effectType, effectCategory, targetType, name and description)

VERY IMPORTANT: Make sure the first item in objectsDetected is a COMPLETE NAME with at least 1 words, NOT a single letter or abbreviation. This will be used directly as the card's title!`;
}

/**
 * Generates custom description for a card
 */
export function generateDescriptionPrompt(cardName: string, cardElement: string, cardType: string): string {
  return `Create a short, compelling description for a fantasy card game card with the following details:
  - Card Name: ${cardName}
  - Card Element: ${cardElement}
  - Card Type: ${cardType}
  
  The description should be 1-2 sentences that capture the essence of the card, its powers, and its role in the game.
  Focus on making it thematic, evocative, and suitable for a fantasy card game.
  
  Respond with only the description text, no additional formatting or explanation.`;
}

/**
 * Generates lore for a card
 */
export function generateLorePrompt(cardName: string, cardElement: string, cardType: string): string {
  return `Create mysterious, intriguing lore text for a fantasy card game card with these details:
  - Card Name: ${cardName}
  - Card Element: ${cardElement}
  - Card Type: ${cardType}
  
  The lore should be 2-3 sentences that hint at the card's origin, history, or significance in the game world.
  Make it feel like an excerpt from an ancient text or a whispered legend.
  
  Respond with only the lore text, no additional formatting or explanation.`;
}
