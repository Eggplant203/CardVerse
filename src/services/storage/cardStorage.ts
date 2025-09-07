/**
 * Function to delete a card from the collection
 */
import { Card } from '@/types/card';
import { LocalStorage } from './localStorage';

const STORAGE_KEYS = {
  CARDS: 'ai_card_game_cards',
  GUEST_CARDS: 'cardverse_guest_cards'
};

/**
 * Get the appropriate storage key based on authentication status
 */
const getStorageKey = (isGuest: boolean = false): string => {
  return isGuest ? STORAGE_KEYS.GUEST_CARDS : STORAGE_KEYS.CARDS;
};

/**
 * Delete a card from the collection
 */
export function deleteCard(cardId: string, isGuest: boolean = false): boolean {
  try {
    const storageKey = getStorageKey(isGuest);
    // Get current card collection
    const currentCards = LocalStorage.getItem<Card[]>(storageKey) || [];

    // Filter out the card with the matching ID
    const updatedCards = currentCards.filter(card => card.id !== cardId);

    // Save the updated collection
    LocalStorage.setItem(storageKey, updatedCards);

    // Return true if a card was removed
    return updatedCards.length < currentCards.length;
  } catch (error) {
    console.error('Error deleting card:', error);
    return false;
  }
}

/**
 * Save a card to the collection
 */
export function saveCard(card: Card, isGuest: boolean = false): boolean {
  try {
    const storageKey = getStorageKey(isGuest);
    // Get current card collection
    const currentCards = LocalStorage.getItem<Card[]>(storageKey) || [];

    // Check if card already exists
    const existingIndex = currentCards.findIndex(c => c.id === card.id);

    if (existingIndex >= 0) {
      // Update existing card
      currentCards[existingIndex] = card;
    } else {
      // Add new card
      currentCards.push(card);
    }

    // Save the updated collection
    LocalStorage.setItem(storageKey, currentCards);

    return true;
  } catch (error) {
    console.error('Error saving card:', error);
    return false;
  }
}

/**
 * Get all cards from the collection
 */
export function getAllCards(isGuest: boolean = false): Card[] {
  try {
    const storageKey = getStorageKey(isGuest);
    const cards = LocalStorage.getItem<Card[]>(storageKey) || [];
    
    // Convert createdAt strings back to Date objects
    return cards.map(card => ({
      ...card,
      createdAt: card.createdAt instanceof Date ? card.createdAt : new Date(card.createdAt)
    }));
  } catch (error) {
    console.error('Error getting cards:', error);
    return [];
  }
}

/**
 * Clear all cards from the collection
 */
export function clearAllCards(isGuest: boolean = false): void {
  try {
    const storageKey = getStorageKey(isGuest);
    LocalStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error clearing cards:', error);
  }
}
