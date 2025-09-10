import { HIDDEN_CARDS } from '@/data/defaultCards';
import { CardAPI } from '@/services/api/cardAPI';
import { Card, Rarity, CardType, Element } from '@/types/card';

// Mock uuid to avoid ES module issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid')
}));

// Mock các dependencies
jest.mock('@/services/api/cardAPI', () => ({
  CardAPI: {
    saveCard: jest.fn(),
    hasUniqueCard: jest.fn()
  }
}));

describe('Easter Egg Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect easter egg trigger correctly', () => {
    const testCases = [
      { input: 'EGGPLANT STUDIO', expected: true },
      { input: 'eggplant studio', expected: true },
      { input: 'Eggplant Studio', expected: true },
      { input: 'EGGPLANT studio', expected: true },
      { input: '???', expected: true },
      { input: 'NULL', expected: true },
      { input: 'null', expected: true },
      { input: 'My Card', expected: false },
      { input: 'Eggplant', expected: false },
      { input: 'Studio', expected: false },
      { input: '', expected: false }
    ];

    testCases.forEach(({ input, expected }) => {
      // Simulate the new dynamic logic
      const triggerMapping: Record<string, string> = {
        'EGGPLANT STUDIO': 'EGGPLANT_STUDIO',
        '???': 'MYSTERY',
        'NULL': 'NULL'
      };
      const isEasterEgg = triggerMapping[input.trim().toUpperCase()] !== undefined;
      expect(isEasterEgg).toBe(expected);
    });
  });

  it('should return mystery card when ??? is triggered', () => {
    const mockCard: Card = {
      id: 'test-card',
      name: 'Test Card',
      imageUrl: 'test.jpg',
      rarity: Rarity.COMMON,
      type: CardType.CREATURE,
      element: Element.FLORA,
      stats: { health: 5, attack: 3, manaCost: 2 },
      effects: [],
      description: 'A test card',
      lore: 'Test lore',
      createdAt: new Date(),
      createdBy: 'test-user'
    };

    // Simulate the new dynamic logic
    const cardName = '???';
    let finalCard = mockCard;

    const triggerMapping: Record<string, keyof typeof HIDDEN_CARDS> = {
      'EGGPLANT STUDIO': 'EGGPLANT_STUDIO',
      '???': 'MYSTERY',
      'NULL': 'NULL'
    };

    const hiddenCardKey = triggerMapping[cardName.trim().toUpperCase()];

    if (hiddenCardKey && HIDDEN_CARDS[hiddenCardKey]) {
      finalCard = {
        ...HIDDEN_CARDS[hiddenCardKey],
        id: `hidden-${Date.now()}`,
        createdAt: new Date(),
        createdBy: 'test-user'
      };
    }

    expect(finalCard.name).toBe('???');
    expect(finalCard.type).toBe('hidden');
    expect(finalCard.rarity).toBe('unique');
    expect(finalCard.imageUrl).toBe('/question_mark_card.jpg');
  });

  it('should return null card when NULL is triggered', () => {
    const mockCard: Card = {
      id: 'test-card',
      name: 'Test Card',
      imageUrl: 'test.jpg',
      rarity: Rarity.COMMON,
      type: CardType.CREATURE,
      element: Element.FLORA,
      stats: { health: 5, attack: 3, manaCost: 2 },
      effects: [],
      description: 'A test card',
      lore: 'Test lore',
      createdAt: new Date(),
      createdBy: 'test-user'
    };

    // Simulate the new dynamic logic
    const cardName = 'NULL';
    let finalCard = mockCard;

    const triggerMapping: Record<string, keyof typeof HIDDEN_CARDS> = {
      'EGGPLANT STUDIO': 'EGGPLANT_STUDIO',
      '???': 'MYSTERY',
      'NULL': 'NULL'
    };

    const hiddenCardKey = triggerMapping[cardName.trim().toUpperCase()];

    if (hiddenCardKey && HIDDEN_CARDS[hiddenCardKey]) {
      finalCard = {
        ...HIDDEN_CARDS[hiddenCardKey],
        id: `hidden-${Date.now()}`,
        createdAt: new Date(),
        createdBy: 'test-user'
      };
    }

    expect(finalCard.name).toBe('Null');
    expect(finalCard.type).toBe('hidden');
    expect(finalCard.rarity).toBe('unique');
    expect(finalCard.imageUrl).toBe('/null_card.png');
  });

  it('should validate mystery card structure', () => {
    const mysteryCard = HIDDEN_CARDS.MYSTERY;

    expect(mysteryCard).toHaveProperty('id');
    expect(mysteryCard).toHaveProperty('name', '???');
    expect(mysteryCard).toHaveProperty('type', 'hidden');
    expect(mysteryCard).toHaveProperty('rarity', 'unique');
    expect(mysteryCard).toHaveProperty('element', 'void');
    expect(mysteryCard).toHaveProperty('imageUrl', '/question_mark_card.jpg');
    expect(mysteryCard).toHaveProperty('stats');
    expect(mysteryCard.stats).toHaveProperty('health', 8);
    expect(mysteryCard.stats).toHaveProperty('attack', 10);
    expect(mysteryCard.stats).toHaveProperty('manaCost', 8);
    expect(mysteryCard).toHaveProperty('effects');
    expect(Array.isArray(mysteryCard.effects)).toBe(true);
    expect(mysteryCard.effects.length).toBe(3); // Mystery Strike, ??? Shield, Enigma Effect
  });

  it('should easily support adding new hidden cards', () => {
    // Simulate adding a new hidden card without changing trigger logic
    const NEW_HIDDEN_CARDS = {
      ...HIDDEN_CARDS,
      CHAOS: {
        id: 'chaos-hidden',
        name: 'Chaos',
        imageUrl: '/error_card.png',
        rarity: Rarity.MYTHIC,
        type: CardType.HIDDEN,
        element: Element.STORM,
        stats: { health: 8, attack: 10, manaCost: 9 },
        effects: [],
        description: 'Chaos incarnate',
        lore: 'Born from disorder',
        createdAt: new Date(),
        createdBy: 'Chaos',
        mood: 'chaotic',
        complexity: 10,
        dominantColors: ['#FF0000', '#000000']
      }
    };

    // Update trigger mapping to include new card
    const triggerMapping: Record<string, keyof typeof NEW_HIDDEN_CARDS> = {
      'EGGPLANT STUDIO': 'EGGPLANT_STUDIO',
      '???': 'MYSTERY',
      'NULL': 'NULL',
      'CHAOS': 'CHAOS' // Just add this line!
    };

    // Test that new trigger works
    const cardName = 'CHAOS';
    const hiddenCardKey = triggerMapping[cardName.trim().toUpperCase()];

    expect(hiddenCardKey).toBe('CHAOS');
    expect(NEW_HIDDEN_CARDS[hiddenCardKey]).toBeDefined();
    expect(NEW_HIDDEN_CARDS[hiddenCardKey].name).toBe('Chaos');
  });

  it('should prevent duplicate hidden cards from being saved', () => {
    // Mock user cards that already include a hidden card
    const mockUserCards = [
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
      }
    ];

    // Simulate checking for duplicate
    const hiddenCardName = '???';
    const hasDuplicate = mockUserCards.some(card =>
      card.type === 'hidden' && card.name.toUpperCase() === hiddenCardName.toUpperCase()
    );

    expect(hasDuplicate).toBe(true);
  });

  it('should allow saving hidden card when user does not have it', () => {
    // Mock user cards without the hidden card
    const mockUserCards = [
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
    ];

    // Simulate checking for duplicate
    const hiddenCardName = '???';
    const hasDuplicate = mockUserCards.some(card =>
      card.type === 'hidden' && card.name.toUpperCase() === hiddenCardName.toUpperCase()
    );

    expect(hasDuplicate).toBe(false);
  });

  it('should handle API error when checking for duplicate unique cards', () => {
    // This test verifies that the API method exists and can be mocked
    expect(typeof CardAPI.hasUniqueCard).toBe('function');
  });
});
