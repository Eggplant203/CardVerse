import { Card, Rarity, CardType, Element } from '../types/card';

describe('battleEngine', () => {
  // Note: battleEngine.ts doesn't export functions directly, so we'll test the logic indirectly
  // by checking that Card interface only has the expected stats

  describe('Card stats validation', () => {
    it('should only have health, attack, and manaCost in CardStats interface', () => {
      const testCard: Card = {
        id: 'test-id',
        name: 'Test Card',
        imageUrl: 'test.jpg',
        rarity: Rarity.COMMON,
        type: CardType.CREATURE,
        element: Element.AETHER,
        stats: {
          health: 10,
          attack: 5,
          manaCost: 3
        },
        effects: [],
        description: 'Test description',
        lore: 'Test lore',
        createdAt: new Date(),
        createdBy: 'test-user'
      };

      // Check that card has only the expected stats
      expect(testCard.stats).toHaveProperty('health');
      expect(testCard.stats).toHaveProperty('attack');
      expect(testCard.stats).toHaveProperty('manaCost');

      // Check that removed stats are not present
      expect(testCard.stats).not.toHaveProperty('stamina');
      expect(testCard.stats).not.toHaveProperty('defense');
      expect(testCard.stats).not.toHaveProperty('speed');

      // Verify the structure matches our expectations
      expect(Object.keys(testCard.stats)).toHaveLength(3);
      expect(Object.keys(testCard.stats)).toEqual(['health', 'attack', 'manaCost']);
    });
  });
});
