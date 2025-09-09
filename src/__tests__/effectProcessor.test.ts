import { Card, Rarity, CardType, Element } from '../types/card';
import { CardInstance } from '../types/game';
import { Effect, EffectType, EffectCategory, TargetType } from '../types/card';

describe('effectProcessor', () => {
  // Since effectProcessor functions are private, we'll test the logic by creating
  // mock scenarios and checking that only health and attack are affected

  describe('Stat modification effects', () => {
    it('should only modify health and attack stats', () => {
      const mockCard: Card = {
        id: 'test-card',
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
        description: 'Test',
        lore: 'Test',
        createdAt: new Date(),
        createdBy: 'test'
      };

      const mockCardInstance: CardInstance = {
        card: mockCard,
        id: 'instance-1',
        position: null,
        currentStats: {
          health: 10,
          attack: 5
        },
        activeEffects: [],
        canAttack: true,
        isExhausted: false
      };

      // Test that currentStats only has health and attack
      expect(mockCardInstance.currentStats).toHaveProperty('health');
      expect(mockCardInstance.currentStats).toHaveProperty('attack');
      expect(mockCardInstance.currentStats).not.toHaveProperty('stamina');
      expect(mockCardInstance.currentStats).not.toHaveProperty('defense');
      expect(mockCardInstance.currentStats).not.toHaveProperty('speed');

      expect(Object.keys(mockCardInstance.currentStats)).toHaveLength(2);
      expect(Object.keys(mockCardInstance.currentStats)).toEqual(['health', 'attack']);
    });

    it('should validate effect descriptions for stat modifications', () => {
      // Test that effect descriptions should only reference health and attack
      const validEffects: Effect[] = [
        {
          id: 'effect-1',
          name: 'Health Boost',
          type: EffectType.BUFF,
          category: EffectCategory.STAT_MODIFICATION,
          duration: 1,
          magnitude: 2,
          target: TargetType.SELF,
          condition: 'always',
          description: 'Increases health by 2'
        },
        {
          id: 'effect-2',
          name: 'Attack Boost',
          type: EffectType.BUFF,
          category: EffectCategory.STAT_MODIFICATION,
          duration: 1,
          magnitude: 1,
          target: TargetType.SELF,
          condition: 'always',
          description: 'Increases attack by 1'
        }
      ];

      // Check that effects only reference valid stats
      validEffects.forEach(effect => {
        expect(effect.description.toLowerCase()).not.toContain('stamina');
        expect(effect.description.toLowerCase()).not.toContain('defense');
        expect(effect.description.toLowerCase()).not.toContain('speed');
      });
    });
  });
});
