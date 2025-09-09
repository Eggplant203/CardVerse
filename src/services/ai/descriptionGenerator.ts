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
   - Rate complexity of image on a scale of 0-10.

3. SUGGEST GAME ELEMENTS:
   - Game stats (${getStatRangesString()})
   - Element (${getElementsString()})
   - Card type (${getCardTypesString()})
   - Rarity (${getRaritiesString()}) with these characteristics:
      - COMMON: 1 simple effect
      - UNCOMMON: 1-2 effects with minor secondary effects
      - RARE: 2 effects, possibly including passive or trigger effects
      - EPIC: 2-3 effects combining active and passive mechanics
      - LEGENDARY: 3 powerful effects with combined mechanics
      - MYTHIC: 3-4 unique effects that may change game rules
      - UNIQUE: 4 special effects with multiple layers of mechanics

4. CREATE CARD TEXT:
   - Generate a thematic description (a few short sentences)
   - Generate lore text

5. SUGGEST 1-3 CARD EFFECTS that match the image using these classifications:
   - Effect Type: ${getEffectTypesString()}
   - Effect Category: ${getEffectCategoriesString()}
   - Target Type: ${getTargetTypesString()}
   
   VERY IMPORTANT FOR EFFECTS:
   - Give each effect a SHORT, DESCRIPTIVE NAME that captures the essence of the ability
   - For example: "A Scoop of Moon", "Allow Changes?", "Calamity: Soulscorch Edict"
   - The name and description should be separate fields
   - USE SPECIAL FORMATTING for important keywords in the description:
     - Wrap stat names (health, stamina, attack, defense, speed) in **bold** and color tags like: "<span style='color:#FF0000;font-weight:bold;'>health</span>"
     - Format Effect Types (buff, debuff, etc.) as: "<span style='color:#4287f5;font-style:italic;'>buff</span>"
     - Format Effect Categories as: "<span style='color:#9c27b0;font-weight:bold;'>damage</span>"
     - Format Target Types as: "<span style='color:#009688;'>enemy</span>"
     - Use appropriate colors for each category (red for health/damage, green for healing, blue for buffs, purple for special effects, etc.)
     - Format element names with their thematic colors

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
- suggestedEffects (array of objects with effectType, effectCategory, targetType, name and description with formatted HTML for keywords)
`;
}