/**
 * Local storage service for persisting client-side data
 */
import { Card } from '@/types/card';

// Storage key constants
const STORAGE_KEYS = {
  CARDS: 'ai_card_game_cards',
  GUEST_CARDS: 'cardverse_guest_cards',
  GUEST_DECKS: 'cardverse_guest_decks'
};

/**
 * Get all cards from storage
 * @param isGuest Whether to get guest cards or authenticated user cards
 * @returns Array of all cards
 */
export async function getCardCollection(isGuest: boolean = false): Promise<Card[]> {
  try {
    const storageKey = isGuest ? STORAGE_KEYS.GUEST_CARDS : STORAGE_KEYS.CARDS;
    const cardsJson = localStorage.getItem(storageKey);
    if (!cardsJson) return [];
    
    const cards = JSON.parse(cardsJson);
    
    // Convert createdAt strings back to Date objects
    return cards.map((card: Card | unknown) => ({
      ...(card as Card),
      createdAt: (card as Card).createdAt instanceof Date ? (card as Card).createdAt : new Date((card as Card).createdAt)
    }));
  } catch (error) {
    console.error('Error getting card collection:', error);
    return [];
  }
}

export class LocalStorage {
  /**
   * Save data to localStorage
   */
  public static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Get data from localStorage
   */
  public static getItem<T>(key: string): T | null {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   */
  public static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  /**
   * Clear all data from localStorage
   */
  public static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if a key exists in localStorage
   */
  public static hasKey(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('Error checking localStorage key:', error);
      return false;
    }
  }
}
