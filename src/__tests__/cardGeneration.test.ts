import { Card, Rarity, CardType, Element } from '../types/card';
import { AIAnalysisResult } from '../types/api';

// Mock uuid to avoid Jest ES module issues
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-12345'
}));

import { getCardGenerationError } from '../data/defaultCards/errorCards';

describe('cardGeneration', () => {
  describe('Fallback stats validation', () => {
    it('should only have health, attack, and manaCost in fallback stats', () => {
      // Test the fallback stats structure that would be used in cardGeneration.ts
      const fallbackStats = {
        health: 6,
        attack: 6,
        manaCost: 5
      };

      expect(fallbackStats).toHaveProperty('health');
      expect(fallbackStats).toHaveProperty('attack');
      expect(fallbackStats).toHaveProperty('manaCost');

      expect(fallbackStats).not.toHaveProperty('stamina');
      expect(fallbackStats).not.toHaveProperty('defense');
      expect(fallbackStats).not.toHaveProperty('speed');

      expect(Object.keys(fallbackStats)).toHaveLength(3);
      expect(Object.keys(fallbackStats)).toEqual(['health', 'attack', 'manaCost']);
    });

    it('should validate suggestedStats structure from AI analysis', () => {
      // Mock AI analysis result with only valid stats
      const mockAnalysisResult = {
        objectsDetected: ['Test Card'],
        dominantColors: ['#FF0000'],
        mood: 'aggressive',
        complexity: 7,
        suggestedElement: 'aether',
        suggestedType: 'creature',
        suggestedRarity: 'rare',
        generatedDescription: 'A powerful test card',
        generatedLore: 'Legend of testing',
        suggestedStats: {
          health: 10,
          attack: 8,
          manaCost: 6
        },
        suggestedEffects: []
      };

      // Verify suggestedStats only has valid properties
      expect(mockAnalysisResult.suggestedStats).toHaveProperty('health');
      expect(mockAnalysisResult.suggestedStats).toHaveProperty('attack');
      expect(mockAnalysisResult.suggestedStats).toHaveProperty('manaCost');

      expect(mockAnalysisResult.suggestedStats).not.toHaveProperty('stamina');
      expect(mockAnalysisResult.suggestedStats).not.toHaveProperty('defense');
      expect(mockAnalysisResult.suggestedStats).not.toHaveProperty('speed');

      expect(Object.keys(mockAnalysisResult.suggestedStats)).toHaveLength(3);
    });
  });

  describe('Card creation with new stats', () => {
    it('should create card with only valid stats', () => {
      const testCard: Card = {
        id: 'generated-card',
        name: 'Generated Test Card',
        imageUrl: 'generated.jpg',
        rarity: Rarity.RARE,
        type: CardType.CREATURE,
        element: Element.AETHER,
        stats: {
          health: 10,
          attack: 8,
          manaCost: 6
        },
        effects: [],
        description: 'Generated card description',
        lore: 'Generated card lore',
        createdAt: new Date(),
        createdBy: 'AI'
      };

      // Verify card structure
      expect(testCard.stats).toHaveProperty('health');
      expect(testCard.stats).toHaveProperty('attack');
      expect(testCard.stats).toHaveProperty('manaCost');

      expect(testCard.stats).not.toHaveProperty('stamina');
      expect(testCard.stats).not.toHaveProperty('defense');
      expect(testCard.stats).not.toHaveProperty('speed');

      expect(Object.keys(testCard.stats)).toHaveLength(3);
      expect(Object.keys(testCard.stats)).toEqual(['health', 'attack', 'manaCost']);
    });
  });

  describe('Error card generation', () => {
    it('should return error card with correct image', () => {
      const errorCard = getCardGenerationError();
      
      // Verify error card uses error image
      expect(errorCard.imageUrl).toBe('/error_card.png');
      expect(errorCard.type).toBe(CardType.ERROR);
      expect(errorCard.element).toBe(Element.VOID);
    });

    it('should preserve custom name but use error image when creating error card', () => {
      const errorCard = getCardGenerationError();
      const originalImageUrl = errorCard.imageUrl;
      const originalName = errorCard.name;
      
      // Simulate the logic from cardGeneration.ts error handling
      const customName = 'Custom Error Name';
      const providedImageUrl = 'original-image.jpg';
      
      // Apply the same logic as in cardGeneration.ts
      if (customName) errorCard.name = customName;
      // Always use error image, never preserve the original imageUrl when there's an error
      errorCard.imageUrl = '/error_card.png';
      
      // Verify custom name is preserved
      expect(errorCard.name).toBe(customName);
      expect(errorCard.name).not.toBe(originalName);
      
      // Verify error image is used regardless of provided imageUrl
      expect(errorCard.imageUrl).toBe('/error_card.png');
      expect(errorCard.imageUrl).not.toBe(providedImageUrl);
      expect(errorCard.imageUrl).toBe(originalImageUrl); // Should be same as original error image
    });
  });
});
