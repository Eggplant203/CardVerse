/**
 * Function to delete a card from the collection
 */
import { Card } from '@/types/card';
import { LocalStorage } from './localStorage';

const STORAGE_KEYS = {
  CARDS: 'ai_card_game_cards'
};

/**
 * Delete a card from the collection
 */
export function deleteCard(cardId: string): boolean {
  try {
    // Get current card collection
    const currentCards = LocalStorage.getItem<Card[]>(STORAGE_KEYS.CARDS) || [];
    
    // Filter out the card with the matching ID
    const updatedCards = currentCards.filter(card => card.id !== cardId);
    
    // Save the updated collection
    LocalStorage.setItem(STORAGE_KEYS.CARDS, updatedCards);
    
    // Return true if a card was removed
    return updatedCards.length < currentCards.length;
  } catch (error) {
    console.error('Error deleting card:', error);
    return false;
  }
}
