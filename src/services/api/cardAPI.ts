import { Card } from '@/types/card';
import { ApiResponse, CardGenerationRequest } from '@/types/api';
import { saveCard, deleteCard, getAllCards } from '../storage/cardStorage';

// Simulate API endpoints (in a real app, these would call actual server endpoints)
const API_URL = '/api';

/**
 * API client for card-related operations
 */
export class CardAPI {
  /**
   * Generate a new card from an image
   */
  public static async generateCard(request: CardGenerationRequest): Promise<ApiResponse<Card>> {
    try {
      const response = await fetch(`${API_URL}/cards/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating card:', error);
      return {
        success: false,
        error: {
          message: 'Failed to generate card',
          code: 'GENERATION_ERROR',
        },
      };
    }
  }

  /**
   * Get a user's card collection
   */
  public static async getUserCards(userId: string | null, isGuest: boolean = false): Promise<ApiResponse<Card[]>> {
    try {
      console.log('CardAPI.getUserCards called with:', { userId, isGuest });

      if (isGuest || !userId) {
        console.log('Getting cards from localStorage for guest');
        // Get from localStorage for guest users
        const cards = getAllCards(true);
        console.log('LocalStorage cards count:', cards.length);
        return {
          success: true,
          data: cards
        };
      }

      console.log('Getting cards from database for authenticated user');
      const token = localStorage.getItem('cardverse_access_token');
      console.log('Access token exists for getUserCards:', !!token);

      // Get from database for authenticated users
      const response = await fetch(`${API_URL}/cards`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Get cards API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get cards API error:', errorText);
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Get cards API response:', result);
      console.log('Cards returned count:', result.data ? result.data.length : 0);

      return result;
    } catch (error) {
      console.error('Error fetching user cards:', error);
      return {
        success: false,
        error: {
          message: 'Failed to fetch user cards',
          code: 'FETCH_ERROR',
        },
      };
    }
  }

  /**
   * Save a card to user's collection
   */
  public static async saveCard(userId: string | null, card: Card, isGuest: boolean = false): Promise<ApiResponse<Card>> {
    try {
      if (isGuest || !userId) {
        // Save to localStorage for guest users
        const success = saveCard(card, true);
        if (success) {
          return {
            success: true,
            data: card
          };
        } else {
          throw new Error('Failed to save card to localStorage');
        }
      }

      // Save to database for authenticated users
      const response = await fetch(`${API_URL}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('cardverse_access_token')}`,
        },
        body: JSON.stringify({ card }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving card:', error);
      return {
        success: false,
        error: {
          message: 'Failed to save card',
          code: 'SAVE_ERROR',
        },
      };
    }
  }

  /**
   * Delete a card from user's collection
   */
  public static async deleteCard(userId: string | null, cardId: string, isGuest: boolean = false): Promise<ApiResponse<boolean>> {
    try {
      console.log('CardAPI.deleteCard called with:', { userId, cardId, isGuest });

      if (isGuest || !userId) {
        console.log('Deleting card from localStorage for guest user');
        // Delete from localStorage for guest users
        const success = deleteCard(cardId, true);
        return {
          success: true,
          data: success
        };
      }

      console.log('Deleting card from database for authenticated user');
      const token = localStorage.getItem('cardverse_access_token');
      console.log('Access token exists:', !!token);

      // Delete from database for authenticated users
      const response = await fetch(`${API_URL}/cards?cardId=${cardId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API response:', result);
      return result;
    } catch (error) {
      console.error('Error deleting card:', error);
      return {
        success: false,
        error: {
          message: 'Failed to delete card',
          code: 'DELETE_ERROR',
        },
      };
    }
  }

  /**
   * Update a card in user's collection
   */
  public static async updateCard(userId: string | null, card: Card, isGuest: boolean = false): Promise<ApiResponse<Card>> {
    try {
      if (isGuest || !userId) {
        // Update in localStorage for guest users
        const success = saveCard(card, true);
        if (success) {
          return {
            success: true,
            data: card
          };
        } else {
          throw new Error('Failed to update card in localStorage');
        }
      }

      // Update in database for authenticated users
      const response = await fetch(`${API_URL}/cards?cardId=${card.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('cardverse_access_token')}`,
        },
        body: JSON.stringify({ card }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating card:', error);
      return {
        success: false,
        error: {
          message: 'Failed to update card',
          code: 'UPDATE_ERROR',
        },
      };
    }
  }
}
