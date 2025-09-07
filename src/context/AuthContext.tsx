import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import {
  UserProfile,
  LoginCredentials,
  RegisterData,
  ProfileUpdate,
  AuthContextValue
} from '../types/auth';

// Create the context
const AuthContext = createContext<AuthContextValue | null>(null);

// Token storage keys
const ACCESS_TOKEN_KEY = 'cardverse_access_token';
const REFRESH_TOKEN_KEY = 'cardverse_refresh_token';
const USER_KEY = 'cardverse_user';
const GUEST_MODE_KEY = 'cardverse_guest_mode';
const GUEST_CARDS_KEY = 'cardverse_guest_cards';
const GUEST_DECKS_KEY = 'cardverse_guest_decks';
const USER_CARDS_KEY = 'ai_card_game_cards';
const USER_DECKS_KEY = 'ai_card_game_decks';

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Sync user data from database
  const syncUserDataFromDatabase = async (): Promise<void> => {
    try {
      // Get cards from database
      const cardsResponse = await axios.get('/api/cards');
      if (cardsResponse.data.success) {
        // Store authenticated user data in authenticated keys
        localStorage.setItem(USER_CARDS_KEY, JSON.stringify(cardsResponse.data.data));
      }

      // Get decks from database
      const decksResponse = await axios.get('/api/decks');
      if (decksResponse.data.success) {
        // Store authenticated user data in authenticated keys
        localStorage.setItem(USER_DECKS_KEY, JSON.stringify(decksResponse.data.data));
      }
    } catch (error) {
      console.error('Error syncing data from database:', error);
      // Don't throw error to prevent login from failing
    }
  };

  // Transfer guest data to user account
  const transferGuestDataToUser = async (userId: string): Promise<void> => {
    try {
      // Get guest data from localStorage
      const guestCards = JSON.parse(localStorage.getItem(GUEST_CARDS_KEY) || '[]');
      const guestDecks = JSON.parse(localStorage.getItem(GUEST_DECKS_KEY) || '[]');

      console.log('Transferring guest data:', {
        userId,
        guestCardsCount: guestCards.length,
        guestDecksCount: guestDecks.length
      });

      if (guestCards.length > 0 || guestDecks.length > 0) {
        // Transfer data via API
        const response = await axios.post('/api/auth/transfer-guest-data', {
          userId,
          cards: guestCards,
          decks: guestDecks
        });

        console.log('Transfer guest data API response:', response.data);

        // Clear guest data after successful transfer
        localStorage.removeItem(GUEST_CARDS_KEY);
        localStorage.removeItem(GUEST_DECKS_KEY);

        console.log('Guest data transferred successfully');
      } else {
        console.log('No guest data to transfer');
      }
    } catch (error: any) {
      console.error('Error transferring guest data:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Don't throw error to prevent registration from failing
    }
  };

  // Initialize auth state from local storage
  useEffect(() => {
    const loadStoredUser = () => {
      try {
        const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        const storedGuestMode = localStorage.getItem(GUEST_MODE_KEY);

        if (storedGuestMode === 'true') {
          // Guest mode
          setIsGuestMode(true);
          setIsAuthenticated(false);
          setUser(null);
        } else if (storedToken && storedUser) {
          // Authenticated user
          const userData = JSON.parse(storedUser) as UserProfile;
          setUser(userData);
          setIsAuthenticated(true);
          setIsGuestMode(false);

          // Set auth header for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } else {
          // No stored data, default to guest mode
          // Clear any existing user data
          localStorage.removeItem(USER_CARDS_KEY);
          localStorage.removeItem(USER_DECKS_KEY);
          setIsGuestMode(true);
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
        // Clear potentially corrupted data
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(GUEST_MODE_KEY);
        localStorage.removeItem(GUEST_CARDS_KEY);
        localStorage.removeItem(GUEST_DECKS_KEY);
        localStorage.removeItem(USER_CARDS_KEY);
        localStorage.removeItem(USER_DECKS_KEY);

        // Default to guest mode
        setIsGuestMode(true);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // Register a new user
  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/register', data, { skipAuthRefresh: true } as any);

      if (response.data.success) {
        // Check if we were in guest mode before login
        const wasGuestMode = isGuestMode;

        // Auto-login after successful registration
        await login({
          emailOrUsername: data.email,
          password: data.password
        });

        // If we were in guest mode, transfer guest data to new account AFTER login
        if (wasGuestMode) {
          await transferGuestDataToUser(response.data.user.id);
        }

        // Reload page to ensure proper state synchronization after registration
        window.location.reload();
      } else {
        throw new Error(response.data.error?.message || 'Registration failed');
      }
    } catch (error) {
      // Error will be handled by the component
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login a user
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/login', credentials, { skipAuthRefresh: true } as any);

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data;

        // Store tokens
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // Set auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        setUser(user);
        setIsAuthenticated(true);
        setIsGuestMode(false);

        // Clear guest mode flag
        localStorage.removeItem(GUEST_MODE_KEY);

        // Sync data from database (this will overwrite local guest data)
        await syncUserDataFromDatabase();
      } else {
        throw new Error(response.data.error?.message || 'Login failed');
      }
    } catch (error) {
      // Error will be handled by the component
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout a user
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Call logout API if authenticated
      if (isAuthenticated) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear stored data
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(GUEST_CARDS_KEY);
      localStorage.removeItem(GUEST_DECKS_KEY);
      localStorage.removeItem(USER_CARDS_KEY);
      localStorage.removeItem(USER_DECKS_KEY);

      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];

      setUser(null);
      setIsAuthenticated(false);
      setIsGuestMode(true);

      // Set guest mode flag
      localStorage.setItem(GUEST_MODE_KEY, 'true');

      setIsLoading(false);
    }
  };

  // Refresh the access token
  const refreshToken = async (): Promise<void> => {
    try {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post('/api/auth/refresh', {
        refreshToken: storedRefreshToken
      });

      if (response.data.success) {
        const { accessToken, refreshToken } = response.data;

        // Store new tokens
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

        // Update auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        return;
      }

      throw new Error('Failed to refresh token');
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      // If refresh fails, logout
      await logout();
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (data: ProfileUpdate): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axios.put('/api/user/profile', data);

      if (response.data.success) {
        const updatedUser = response.data.data;

        // Update stored user
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

        setUser(updatedUser);
      } else {
        throw new Error(response.data.error?.message || 'Profile update failed');
      }
    } catch (error) {
      // Error will be handled by the component
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Set up axios interceptor for token refresh
  useEffect(() => {
    // Add request interceptor to handle expired tokens
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Skip auth refresh for requests that explicitly opt out
        if (originalRequest.skipAuthRefresh) {
          return Promise.reject(error);
        }

        // If the error is 401 and not from a refresh token request and not already retried
        // Also exclude login requests from token refresh
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('api/auth/refresh') &&
          !originalRequest.url?.includes('api/auth/login')
        ) {
          originalRequest._retry = true;

          try {
            await refreshToken();
            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            // If refresh fails, pass through the original error
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      // Clean up interceptor on unmount
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const contextValue: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated,
    isGuestMode,
    login,
    register,
    logout,
    refreshToken,
    updateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using the auth context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
