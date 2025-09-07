import { ApiResponse, GameSessionRequest, GameSessionResponse } from '@/types/api';
import { GameState } from '@/types/game';

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
}
