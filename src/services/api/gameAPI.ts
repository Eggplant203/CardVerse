import { ApiResponse, GameSessionRequest, GameSessionResponse } from '@/types/api';
import { GameState } from '@/types/game';
import { Deck } from '@/types/player';
import { saveDeck, deleteDeck, getAllDecks } from '../storage/deckStorage';

// Simulate API endpoints (in a real app, these would call actual server endpoints)
const API_URL = '/api';

/**
 * API client for game-related operations
 */
export class GameAPI {
  /**
   * Create a new game session
   */
  public static async createGameSession(
    request: GameSessionRequest
  ): Promise<GameSessionResponse> {
    try {
      const response = await fetch(`${API_URL}/games/create`, {
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
      console.error('Error creating game session:', error);
      return {
        success: false,
        error: {
          message: 'Failed to create game session',
          code: 'SESSION_CREATE_ERROR',
        },
      };
    }
  }

  /**
   * Get game state for a game session
   */
  public static async getGameState(gameId: string): Promise<ApiResponse<GameState>> {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}`);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching game state:', error);
      return {
        success: false,
        error: {
          message: 'Failed to fetch game state',
          code: 'GAME_STATE_ERROR',
        },
      };
    }
  }

  /**
   * Update game state
   */
  public static async updateGameState(
    gameId: string,
    gameState: GameState
  ): Promise<ApiResponse<GameState>> {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameState),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating game state:', error);
      return {
        success: false,
        error: {
          message: 'Failed to update game state',
          code: 'UPDATE_STATE_ERROR',
        },
      };
    }
  }

  /**
   * End a game session
   */
  public static async endGameSession(
    gameId: string,
    winnerId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winnerId }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error ending game session:', error);
      return {
        success: false,
        error: {
          message: 'Failed to end game session',
          code: 'END_SESSION_ERROR',
        },
      };
    }
  }

  /**
   * Get user's game history
   */
  public static async getUserGameHistory(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_URL}/games/history/${userId}`);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching game history:', error);
      return {
        success: false,
        error: {
          message: 'Failed to fetch game history',
          code: 'HISTORY_ERROR',
        },
      };
    }
  }

  /**
   * Get user's decks
   */
  public static async getUserDecks(userId: string | null, isGuest: boolean = false): Promise<ApiResponse<Deck[]>> {
    try {
      if (isGuest || !userId) {
        // Get from localStorage for guest users
        const decks = getAllDecks(true);
        return {
          success: true,
          data: decks
        };
      }

      // Get from database for authenticated users
      const response = await fetch(`${API_URL}/decks`);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user decks:', error);
      return {
        success: false,
        error: {
          message: 'Failed to fetch user decks',
          code: 'FETCH_ERROR',
        },
      };
    }
  }

  /**
   * Save a deck to user's collection
   */
  public static async saveDeck(userId: string | null, deck: Deck, isGuest: boolean = false): Promise<ApiResponse<Deck>> {
    try {
      if (isGuest || !userId) {
        // Save to localStorage for guest users
        const success = saveDeck(deck, true);
        if (success) {
          return {
            success: true,
            data: deck
          };
        } else {
          throw new Error('Failed to save deck to localStorage');
        }
      }

      // Save to database for authenticated users
      const response = await fetch(`${API_URL}/decks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deck }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving deck:', error);
      return {
        success: false,
        error: {
          message: 'Failed to save deck',
          code: 'SAVE_ERROR',
        },
      };
    }
  }

  /**
   * Delete a deck from user's collection
   */
  public static async deleteDeck(userId: string | null, deckId: string, isGuest: boolean = false): Promise<ApiResponse<boolean>> {
    try {
      if (isGuest || !userId) {
        // Delete from localStorage for guest users
        const success = deleteDeck(deckId, true);
        return {
          success: true,
          data: success
        };
      }

      // Delete from database for authenticated users
      const response = await fetch(`${API_URL}/decks/${deckId}`, {
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
      console.error('Error deleting deck:', error);
      return {
        success: false,
        error: {
          message: 'Failed to delete deck',
          code: 'DELETE_ERROR',
        },
      };
    }
  }

  /**
   * Update a deck in user's collection
   */
  public static async updateDeck(userId: string | null, deck: Deck, isGuest: boolean = false): Promise<ApiResponse<Deck>> {
    try {
      if (isGuest || !userId) {
        // Update in localStorage for guest users
        const success = saveDeck(deck, true);
        if (success) {
          return {
            success: true,
            data: deck
          };
        } else {
          throw new Error('Failed to update deck in localStorage');
        }
      }

      // Update in database for authenticated users
      const response = await fetch(`${API_URL}/decks/${deck.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deck }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating deck:', error);
      return {
        success: false,
        error: {
          message: 'Failed to update deck',
          code: 'UPDATE_ERROR',
        },
      };
    }
  }
}
