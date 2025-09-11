import { Card, CardType, Element, Rarity, EffectType, EffectCategory, TargetType } from '@/types/card';
import { AIAnalysisResult } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';
import { BUFF_EFFECTS } from '@/data/effects/buffs';
import { DEBUFF_EFFECTS } from '@/data/effects/debuffs';
import { TRIGGER_EFFECTS } from '@/data/effects/triggers';
import { PERSISTENT_EFFECTS } from '@/data/effects/persistent';
import { getCardGenerationError, getChatbotOverloadError } from '@/data/defaultCards/errorCards';
import { filterAndClampStats } from '@/utils/cardUtils';

/**
 * Generates a card from AI image analysis results
 */
export async function generateCardFromAnalysis(analysis: AIAnalysisResult): Promise<Card> {
  try {
    // Validate the analysis result
    if (!analysis) {
      console.error('Analysis result is null or undefined');
      throw new Error('Invalid analysis result');
    }
    // Use existing card generation logic with the analysis result
    return generateCard(
      analysis,
      '', // imageUrl - would be set after storage
      'user', // userId
      undefined // Let the system generate a name from the analysis
    );
  } catch (error) {
    console.error('Error in generateCardFromAnalysis:', error);
    
    // Return a fallback card from centralized error cards
    return getCardGenerationError();
  }
}

/**
 * Generates a new card based on AI analysis results
 */
export function generateCard(
  analysisResult: AIAnalysisResult, 
  imageUrl: string,
  userId: string,
  customName?: string
): Card {
  try {
    // Check if analysisResult is null or undefined
    if (!analysisResult) {
      console.error('analysisResult is null or undefined');
      throw new Error('Invalid analysis result');
    }
    
    // Generate a unique ID for the card
    const cardId = uuidv4();
  
  // Get the current date
  const creationDate = new Date();
  
  // Get the element, type and rarity with fallbacks
  // Use direct comparison with enum values instead of maps
  const elementStr = analysisResult.suggestedElement?.toLowerCase();
  const element = Object.values(Element).includes(elementStr as Element) ? 
    elementStr as Element : Element.CRYSTAL;

  // Check if the suggested type is "error" and return an error card if it is
  if (analysisResult.suggestedType?.toLowerCase() === "error") {
    return getCardGenerationError();
  }
  
  // Check if the suggested type is "chatbot_overload" and return the overload error card
  if (analysisResult.suggestedType?.toLowerCase() === "chatbot_overload") {
    return getChatbotOverloadError();
  }
  
  // Use direct comparison with enum values instead of maps
  const typeStr = analysisResult.suggestedType?.toLowerCase();
  const cardType = Object.values(CardType).includes(typeStr as CardType) ? 
    typeStr as CardType : CardType.CREATURE;
    
  const rarityStr = analysisResult.suggestedRarity?.toLowerCase();
  const rarity = Object.values(Rarity).includes(rarityStr as Rarity) ? 
    rarityStr as Rarity : Rarity.COMMON;

  // Map the suggested effects to actual effect objects
  const allEffects = {
    ...BUFF_EFFECTS,
    ...DEBUFF_EFFECTS,
    ...TRIGGER_EFFECTS,
    ...PERSISTENT_EFFECTS
  };

  // Choose effects based on AI suggestions with their provided types and categories
  const effects = (analysisResult.suggestedEffects || []).map(suggestion => {
    // Handle case where suggestion is a string (from fallback data)
    if (typeof suggestion === 'string') {
      
      // Try to find a matching effect by description
      const matchingEffect = Object.values(allEffects).find(effect => 
        effect.description.toLowerCase().includes((suggestion as string).toLowerCase())
      );
      
      return matchingEffect || Object.values(allEffects)[Math.floor(Math.random() * Object.values(allEffects).length)];
    }
    
    // Make sure suggestion is defined and has a name property
    if (!suggestion || !suggestion.name) {
      console.warn('Missing or invalid suggestion in analysisResult.suggestedEffects:', suggestion);
      return Object.values(allEffects)[Math.floor(Math.random() * Object.values(allEffects).length)];
    }
    
    // If we have effectType, effectCategory and targetType provided by AI, use them
    if (suggestion.effectType && suggestion.effectCategory && suggestion.targetType) {
      // Extract proper name from description, or generate a fitting name
      let effectName = suggestion.name;
      
      // If name is part of the description (like "When X enters...: description")
      // or if it's too long, create a better name
      if (suggestion.description.includes(':') && 
          suggestion.description.startsWith(effectName) ||
          effectName.length > 25) {
        
        // Try to extract a meaningful name from description
        const keyTerms = ['damage', 'heal', 'buff', 'debuff', 'boost', 'stun', 'freeze', 
                         'attack', 'defend', 'protect', 'shield', 'summon', 'banish'];
                         
        // Find a key term in the description to use as part of the name
        const keyTerm = keyTerms.find(term => suggestion.description.toLowerCase().includes(term));
        
        // Create a more appropriate name
        if (keyTerm) {
          effectName = keyTerm.charAt(0).toUpperCase() + keyTerm.slice(1) + " Mastery";
        } else {
          // Fallback to a more generic but appropriate name
          effectName = "Special Ability";
        }
      }
      
      // Create a custom effect based on the AI suggestion
      const customEffect = {
        id: suggestion.id || uuidv4(),
        name: effectName,
        type: suggestion.effectType.toUpperCase() as EffectType,
        category: suggestion.effectCategory.toUpperCase() as EffectCategory,
        duration: Math.floor(Math.random() * 3) + 1,  // Random duration between 1-3
        magnitude: Math.floor(Math.random() * 5) + 1, // Random magnitude between 1-5
        target: suggestion.targetType.toUpperCase() as TargetType,
        condition: "none",
        description: suggestion.description
      };
      
      return customEffect;
    }
    
    // Otherwise find a matching effect from predefined ones
    const matchingEffect = Object.values(allEffects).find(effect => 
      effect.name.toLowerCase().includes(suggestion.name.toLowerCase()) ||
      suggestion.name.toLowerCase().includes(effect.name.toLowerCase())
    );
    
    return matchingEffect || Object.values(allEffects)[Math.floor(Math.random() * Object.values(allEffects).length)];
  });

  // Create fallback stats in case suggestedStats is missing or incomplete
  const fallbackStats = {
    health: 6,
    attack: 6,
    manaCost: 5
  };
  
  // Filter and clamp stats to ensure they are within allowed ranges
  const stats = filterAndClampStats(analysisResult.suggestedStats);
  
  // Create the card object with fallbacks for all properties
  const newCard: Card = {
    id: cardId,
    // Make sure we use a complete name from objectsDetected or fallback
    name: (() => {
      // If custom name is provided, use it
      if (customName) return customName;
      
      // Check if we have valid objectsDetected data
      if (analysisResult.objectsDetected && 
          Array.isArray(analysisResult.objectsDetected) && 
          analysisResult.objectsDetected.length > 0) {
        
        const mainSubject = analysisResult.objectsDetected[0];
        
        // Check if the name is suspiciously short (likely an error)
        if (typeof mainSubject === 'string' && mainSubject.length <= 1) {
          console.warn(`Card name too short: "${mainSubject}", using fallback`);
          return 'Mysterious Card';
        }
        
        return mainSubject;
      }
      
      // Fallback
      return 'Mysterious Card';
    })(),
    imageUrl: imageUrl,
    rarity: rarity,
    type: cardType,
    element: element,
    stats: stats,
    effects: effects,
    description: analysisResult.generatedDescription || 'A mysterious card with unknown properties.',
    lore: analysisResult.generatedLore || 'The origins of this card are shrouded in mystery.',
    createdAt: creationDate,
    createdBy: userId,
    // Use mood as is without restrictions (AI will be creative)
    mood: analysisResult.mood || 'Neutral',
    complexity: analysisResult.complexity,
    // Ensure we use the most striking colors from the image
    dominantColors: analysisResult.dominantColors
  };

  return newCard;
  } catch (error) {
    console.error('Error generating card from analysis:', error);
    
    // Return a fallback card from centralized error cards
    const errorCard = getCardGenerationError();
    
    // Preserve the custom name if provided, but ALWAYS use error image
    if (customName) errorCard.name = customName;
    // Always use error image, never preserve the original imageUrl when there's an error
    errorCard.imageUrl = '/error_card.png';
    
    // Set the user ID
    errorCard.createdBy = userId;
    
    return errorCard;
  }
}
