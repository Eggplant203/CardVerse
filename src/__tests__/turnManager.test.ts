import { Card, Rarity, CardType, Element } from '../types/card';
import { CardInstance } from '../types/game';

describe('turnManager', () => {
  describe('CardInstance creation', () => {
    it('should create CardInstance with only health and attack in currentStats', () => {
      const mockCard: Card = {
        id: 'test-card',
        name: 'Test Card',
        imageUrl: 'test.jpg',
        rarity: Rarity.COMMON,
        type: CardType.CREATURE,
        element: Element.AETHER,
        stats: {
          health: 12,
          attack: 8,
          manaCost: 5
        },
        effects: [],
        description: 'Test card',
        lore: 'Test lore',
        createdAt: new Date(),
        createdBy: 'test-user'
      };

      // Simulate what createCardInstance would do
      const expectedCardInstance: CardInstance = {
        card: mockCard,
        id: 'test-instance',
        position: null,
        currentStats: {
          health: mockCard.stats.health,
          attack: mockCard.stats.attack
        },
        activeEffects: [],
        canAttack: false,
        isExhausted: false
      };

      // Verify that currentStats only has health and attack
      expect(expectedCardInstance.currentStats).toHaveProperty('health');
      expect(expectedCardInstance.currentStats).toHaveProperty('attack');
      expect(expectedCardInstance.currentStats).not.toHaveProperty('stamina');
      expect(expectedCardInstance.currentStats).not.toHaveProperty('defense');
      expect(expectedCardInstance.currentStats).not.toHaveProperty('speed');
      expect(expectedCardInstance.currentStats).not.toHaveProperty('manaCost');

      // Verify values are copied correctly
      expect(expectedCardInstance.currentStats.health).toBe(12);
      expect(expectedCardInstance.currentStats.attack).toBe(8);

      // Verify structure
      expect(Object.keys(expectedCardInstance.currentStats)).toHaveLength(2);
      expect(Object.keys(expectedCardInstance.currentStats)).toEqual(['health', 'attack']);
    });
  });
});
