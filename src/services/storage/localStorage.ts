/**
 * Local storage service for persisting client-side data
 */
import { Card } from '@/types/card';

// Storage key constants
const STORAGE_KEYS = {
  CARDS: 'ai_card_game_cards',
  USER: 'ai_card_game_user',
  DECKS: 'ai_card_game_decks',
};

/**
 * Get all cards from storage
 * @returns Array of all cards
 */
export async function getCardCollection(): Promise<Card[]> {
  try {
    const cardsJson = localStorage.getItem(STORAGE_KEYS.CARDS);
    return cardsJson ? JSON.parse(cardsJson) : [];
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
