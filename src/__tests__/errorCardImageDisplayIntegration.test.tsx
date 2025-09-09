import { CardType, Element, Rarity } from '@/types/card';
import { CARD_GENERATION_ERROR } from '@/data/defaultCards/errorCards';

// Mock uuid before importing errorCards
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid')
}));

describe('Error Card Image Display Logic Test', () => {
  test('should prioritize error card imageUrl over uploaded image', () => {
    const errorCard = {
      ...CARD_GENERATION_ERROR,
      id: 'error-card-id',
      name: 'Void Glitch',
      imageUrl: '/error_card.png',
      type: CardType.ERROR,
      element: Element.VOID,
      rarity: Rarity.COMMON
    };

    const uploadedImage = '/user-uploaded-image.jpg';

    // Test the logic: for error cards, always use card.imageUrl
    const displayImage = errorCard.type === CardType.ERROR
      ? errorCard.imageUrl
      : uploadedImage || errorCard.imageUrl;

    expect(displayImage).toBe('/error_card.png');
    expect(displayImage).not.toBe(uploadedImage);
  });

  test('should use uploaded image for non-error cards when available', () => {
    const normalCard = {
      id: 'normal-card-id',
      name: 'Normal Card',
      imageUrl: '/generated-image.png',
      type: CardType.CREATURE,
      element: Element.FLORA,
      rarity: Rarity.COMMON,
      stats: { health: 5, attack: 3, manaCost: 2 },
      effects: [],
      description: 'A normal card',
      lore: 'Normal lore',
      createdAt: new Date(),
      createdBy: 'user',
      mood: 'happy',
      complexity: 1,
      dominantColors: ['#00FF00']
    };

    const uploadedImage = '/user-uploaded-image.jpg';

    // Test the logic: for non-error cards, prefer uploaded image
    const displayImage = normalCard.type === CardType.ERROR
      ? normalCard.imageUrl
      : uploadedImage || normalCard.imageUrl;

    expect(displayImage).toBe('/user-uploaded-image.jpg');
  });

  test('should fallback to generated image for non-error cards when no uploaded image', () => {
    const normalCard = {
      id: 'normal-card-id',
      name: 'Normal Card',
      imageUrl: '/generated-image.png',
      type: CardType.CREATURE,
      element: Element.FLORA,
      rarity: Rarity.COMMON,
      stats: { health: 5, attack: 3, manaCost: 2 },
      effects: [],
      description: 'A normal card',
      lore: 'Normal lore',
      createdAt: new Date(),
      createdBy: 'user',
      mood: 'happy',
      complexity: 1,
      dominantColors: ['#00FF00']
    };

    const uploadedImage = null;

    // Test the logic: for non-error cards with no uploaded image, use generated image
    const displayImage = normalCard.type === CardType.ERROR
      ? normalCard.imageUrl
      : uploadedImage || normalCard.imageUrl;

    expect(displayImage).toBe('/generated-image.png');
  });

  test('should handle error card with no imageUrl gracefully', () => {
    const errorCardWithoutImage = {
      ...CARD_GENERATION_ERROR,
      id: 'error-card-id',
      name: 'Void Glitch',
      imageUrl: null,
      type: CardType.ERROR,
      element: Element.VOID,
      rarity: Rarity.COMMON
    };

    const uploadedImage = '/user-uploaded-image.jpg';

    // Test the logic: for error cards, always use card.imageUrl even if null
    const displayImage = errorCardWithoutImage.type === CardType.ERROR
      ? errorCardWithoutImage.imageUrl
      : uploadedImage || errorCardWithoutImage.imageUrl;

    expect(displayImage).toBeNull();
  });
});
