import { ApiResponse } from '@/types/api';
import { UserProfile } from '@/types/player';

// Simulate API endpoints (in a real app, these would call actual server endpoints)
const API_URL = '/api';

/**
 * API client for player-related operations
 */
export class PlayerAPI {
  /**
   * Get player profile
   */
  public static async getPlayerProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${API_URL}/players/${userId}`);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching player profile:', error);
      return {
        success: false,
        error: {
          message: 'Failed to fetch player profile',
          code: 'PROFILE_ERROR',
        },
      };
    }
  }

  /**
   * Update player profile
   */
  public static async updatePlayerProfile(
    userId: string,
    profileData: Partial<UserProfile>
  ): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${API_URL}/players/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating player profile:', error);
      return {
        success: false,
        error: {
          message: 'Failed to update player profile',
          code: 'PROFILE_UPDATE_ERROR',
        },
      };
    }
  }

  /**
   * Update player stats after a game
   */
  public static async updatePlayerStats(
    userId: string,
    gameResult: 'win' | 'loss' | 'draw'
  ): Promise<ApiResponse<{ stats: UserProfile['stats'] }>> {
    try {
      const response = await fetch(`${API_URL}/players/${userId}/stats`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameResult }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating player stats:', error);
      return {
        success: false,
        error: {
          message: 'Failed to update player stats',
          code: 'STATS_UPDATE_ERROR',
        },
      };
    }
  }

  /**
   * Get top players leaderboard
   */
  public static async getLeaderboard(limit = 10): Promise<ApiResponse<UserProfile[]>> {
    try {
      const response = await fetch(`${API_URL}/players/leaderboard?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return {
        success: false,
        error: {
          message: 'Failed to fetch leaderboard',
          code: 'LEADERBOARD_ERROR',
        },
      };
    }
  }

  /**
   * Register a new player
   */
  public static async registerPlayer(
    username: string,
    email: string,
    password: string
  ): Promise<ApiResponse<{ userId: string }>> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error registering player:', error);
      return {
        success: false,
        error: {
          message: 'Failed to register player',
          code: 'REGISTER_ERROR',
        },
      };
    }
  }

  /**
   * Login player
   */
  public static async loginPlayer(
    email: string,
    password: string
  ): Promise<ApiResponse<{ userId: string; token: string }>> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error logging in player:', error);
      return {
        success: false,
        error: {
          message: 'Failed to login',
          code: 'LOGIN_ERROR',
        },
      };
    }
  }
}
