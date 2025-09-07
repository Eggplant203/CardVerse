/**
 * Migration utilities for card data
 */
import { LocalStorage } from '@/services/storage/localStorage';
import { Card } from '@/types/card';

const STORAGE_KEYS = {
  CARDS: 'ai_card_game_cards'
};

/**
 * Updates existing cards in localStorage to include the new mood, complexity, and dominantColors fields
 * This function should be called once when the app starts to migrate existing cards
 */
export function migrateExistingCards(): void {
  try {
    // Get existing cards
    const existingCards = LocalStorage.getItem<Card[]>(STORAGE_KEYS.CARDS) || [];
    
    // Check if we need to migrate any cards
    const needsMigration = existingCards.some(card => 
      !card.hasOwnProperty('mood') || 
      !card.hasOwnProperty('complexity') || 
      !card.hasOwnProperty('dominantColors')
    );
    
    if (!needsMigration) {
      console.log('No card migration needed');
      return;
    }
    
    console.log(`Migrating ${existingCards.length} cards to include new fields`);
    
    // Update each card with missing fields
    const updatedCards = existingCards.map(card => {
      // Get the mood with proper capitalization
      let mood = card.mood || 'neutral';
      if (mood) {
        mood = mood.charAt(0).toUpperCase() + mood.slice(1);
      }
      
      return {
        ...card,
        mood,
        complexity: card.complexity !== undefined ? card.complexity : 5,
        dominantColors: card.dominantColors || ['#888888']
      };
    });
    
    // Save back to storage
    LocalStorage.setItem(STORAGE_KEYS.CARDS, updatedCards);
    
    console.log('Card migration completed');
  } catch (error) {
    console.error('Error migrating cards:', error);
  }
}
