/**
 * Storage service for deck management
 */
import { Deck } from '@/types/player';
import { LocalStorage } from './localStorage';

const STORAGE_KEYS = {
  DECKS: 'ai_card_game_decks',
  GUEST_DECKS: 'cardverse_guest_decks'
};

/**
 * Get the appropriate storage key based on authentication status
 */
const getStorageKey = (isGuest: boolean = false): string => {
  return isGuest ? STORAGE_KEYS.GUEST_DECKS : STORAGE_KEYS.DECKS;
};

/**
 * Save a deck to storage
 */
export function saveDeck(deck: Deck, isGuest: boolean = false): boolean {
  try {
    const storageKey = getStorageKey(isGuest);
    // Get current deck collection
    const currentDecks = LocalStorage.getItem<Deck[]>(storageKey) || [];

    // Check if deck already exists
    const existingIndex = currentDecks.findIndex(d => d.id === deck.id);

    if (existingIndex >= 0) {
      // Update existing deck
      currentDecks[existingIndex] = deck;
    } else {
      // Add new deck
      currentDecks.push(deck);
    }

    // Save the updated collection
    LocalStorage.setItem(storageKey, currentDecks);

    return true;
  } catch (error) {
    console.error('Error saving deck:', error);
    return false;
  }
}

/**
 * Delete a deck from storage
 */
export function deleteDeck(deckId: string, isGuest: boolean = false): boolean {
  try {
    const storageKey = getStorageKey(isGuest);
    // Get current deck collection
    const currentDecks = LocalStorage.getItem<Deck[]>(storageKey) || [];

    // Filter out the deck with the matching ID
    const updatedDecks = currentDecks.filter(deck => deck.id !== deckId);

    // Save the updated collection
    LocalStorage.setItem(storageKey, updatedDecks);

    // Return true if a deck was removed
    return updatedDecks.length < currentDecks.length;
  } catch (error) {
    console.error('Error deleting deck:', error);
    return false;
  }
}

/**
 * Get all decks from storage
 */
export function getAllDecks(isGuest: boolean = false): Deck[] {
  try {
    const storageKey = getStorageKey(isGuest);
    const decks = LocalStorage.getItem<Deck[]>(storageKey) || [];
    
    // Convert createdAt strings back to Date objects in cards
    return decks.map(deck => ({
      ...deck,
      cards: deck.cards.map(card => ({
        ...card,
        createdAt: card.createdAt instanceof Date ? card.createdAt : new Date(card.createdAt)
      })),
      coverCard: deck.coverCard ? {
        ...deck.coverCard,
        createdAt: deck.coverCard.createdAt instanceof Date ? deck.coverCard.createdAt : new Date(deck.coverCard.createdAt)
      } : null
    }));
  } catch (error) {
    console.error('Error getting decks:', error);
    return [];
  }
}

/**
 * Clear all decks from storage
 */
export function clearAllDecks(isGuest: boolean = false): void {
  try {
    const storageKey = getStorageKey(isGuest);
    LocalStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error clearing decks:', error);
  }
}
