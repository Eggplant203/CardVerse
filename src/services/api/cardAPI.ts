import { Card } from '@/types/card';
import { ApiResponse, CardGenerationRequest } from '@/types/api';

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
  public static async getUserCards(userId: string): Promise<ApiResponse<Card[]>> {
    try {
      const response = await fetch(`${API_URL}/cards/user/${userId}`);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
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
  public static async saveCard(userId: string, card: Card): Promise<ApiResponse<Card>> {
    try {
      const response = await fetch(`${API_URL}/cards/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, card }),
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
  public static async deleteCard(userId: string, cardId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${API_URL}/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
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
  public static async updateCard(userId: string, card: Card): Promise<ApiResponse<Card>> {
    try {
      const response = await fetch(`${API_URL}/cards/${card.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, card }),
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
