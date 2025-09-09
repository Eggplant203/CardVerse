import { CardAPI } from '@/services/api/cardAPI';
import { CardType, Element, Rarity } from '@/types/card';

// Mock uuid to avoid ES module issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid')
}));

// Mock cardStorage functions individually
jest.mock('@/services/storage/cardStorage', () => ({
  saveCard: jest.fn(),
  deleteCard: jest.fn(),
  getAllCards: jest.fn()
}));

import { getAllCards } from '@/services/storage/cardStorage';

describe('Hidden Card Duplicate Prevention Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully check for existing hidden cards', async () => {
    // Mock existing cards with a hidden card
    (getAllCards as jest.Mock).mockReturnValue([
      {
        id: 'existing-mystery',
        name: '???',
        type: CardType.HIDDEN,
        element: Element.VOID,
        rarity: Rarity.MYTHIC,
        stats: { health: 7, attack: 12, manaCost: 8 },
        effects: [],
        description: 'Mystery card',
        lore: 'Mysterious',
        createdAt: new Date(),
        createdBy: 'user',
        mood: 'mysterious',
        complexity: 15,
        dominantColors: ['#000000', '#808080', '#FFFFFF'],
        imageUrl: '/error_card.png'
      },
      {
        id: 'normal-card',
        name: 'Normal Card',
        type: CardType.CREATURE,
        element: Element.FLORA,
        rarity: Rarity.COMMON,
        stats: { health: 5, attack: 3, manaCost: 2 },
        effects: [],
        description: 'Normal card',
        lore: 'Normal',
        createdAt: new Date(),
        createdBy: 'user',
        mood: 'normal',
        complexity: 1,
        dominantColors: ['#00FF00'],
        imageUrl: '/card.jpg'
      }
    ]);

    // Test checking for existing mystery card
    const result = await CardAPI.hasHiddenCard('user-id', '???', true);

    expect(result.success).toBe(true);
    expect(result.data).toBe(true); // Should find the existing ??? card
  });

  it('should return false when hidden card does not exist', async () => {
    // Mock existing cards without the hidden card
    (getAllCards as jest.Mock).mockReturnValue([
      {
        id: 'normal-card-1',
        name: 'Normal Card 1',
        type: CardType.CREATURE,
        element: Element.FLORA,
        rarity: Rarity.COMMON,
        stats: { health: 5, attack: 3, manaCost: 2 },
        effects: [],
        description: 'Normal card',
        lore: 'Normal',
        createdAt: new Date(),
        createdBy: 'user',
        mood: 'normal',
        complexity: 1,
        dominantColors: ['#00FF00'],
        imageUrl: '/card.jpg'
      },
      {
        id: 'normal-card-2',
        name: 'Normal Card 2',
        type: CardType.CREATURE,
        element: Element.STORM,
        rarity: Rarity.UNCOMMON,
        stats: { health: 6, attack: 4, manaCost: 3 },
        effects: [],
        description: 'Another normal card',
        lore: 'Normal',
        createdAt: new Date(),
        createdBy: 'user',
        mood: 'normal',
        complexity: 1,
        dominantColors: ['#FFFF00'],
        imageUrl: '/card2.jpg'
      }
    ]);

    // Test checking for non-existing mystery card
    const result = await CardAPI.hasHiddenCard('user-id', '???', true);

    expect(result.success).toBe(true);
    expect(result.data).toBe(false); // Should not find the ??? card
  });

  it('should handle case-insensitive hidden card name matching', async () => {
    // Mock existing cards with mixed case hidden card
    (getAllCards as jest.Mock).mockReturnValue([
      {
        id: 'existing-null',
        name: 'null', // lowercase
        type: CardType.HIDDEN,
        element: Element.VOID,
        rarity: Rarity.UNIQUE,
        stats: { health: 15, attack: 5, manaCost: 6 },
        effects: [],
        description: 'Null card',
        lore: 'Void',
        createdAt: new Date(),
        createdBy: 'user',
        mood: 'empty',
        complexity: 12,
        dominantColors: ['#000000', '#2F2F2F', '#696969'],
        imageUrl: '/error_card.png'
      }
    ]);

    // Test checking with different cases
    const result1 = await CardAPI.hasHiddenCard('user-id', 'NULL', true);
    const result2 = await CardAPI.hasHiddenCard('user-id', 'null', true);
    const result3 = await CardAPI.hasHiddenCard('user-id', 'Null', true);

    expect(result1.success).toBe(true);
    expect(result1.data).toBe(true);
    expect(result2.success).toBe(true);
    expect(result2.data).toBe(true);
    expect(result3.success).toBe(true);
    expect(result3.data).toBe(true);
  });
});
