import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
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

// Notification permission state
let notificationPermission: NotificationPermission = 'default';

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Request notification permission
  const requestNotificationPermission = async (): Promise<void> => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;
        console.log('🔔 Notification permission:', permission);
      } catch (error) {
        console.error('❌ Error requesting notification permission:', error);
      }
    } else {
      console.log('🔔 Notifications not supported in this browser');
    }
  };

  // Show browser notification
  const showNotification = (title: string, body: string, icon?: string): void => {
    if (notificationPermission === 'granted' && 'Notification' in window) {
      try {
        const notification = new Notification(title, {
          body,
          icon: icon || '/favicon-32x32.svg',
          tag: 'cardverse-auth', // Group similar notifications
          requireInteraction: false
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        console.log('🔔 Notification shown:', title);
      } catch (error) {
        console.error('❌ Error showing notification:', error);
      }
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

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
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { status?: number; data?: unknown } };
      console.error('Error transferring guest data:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      // Don't throw error to prevent registration from failing
    }
  };

  // Initialize auth state from local storage and session storage
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        // Check both localStorage and sessionStorage for tokens
        const localToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const localRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const localUser = localStorage.getItem(USER_KEY);
        
        const sessionToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
        const sessionRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
        const sessionUser = sessionStorage.getItem(USER_KEY);
        
        const storedGuestMode = localStorage.getItem(GUEST_MODE_KEY);

        // Use localStorage data if available, otherwise use sessionStorage
        const storedToken = localToken || sessionToken;
        const storedRefreshToken = localRefreshToken || sessionRefreshToken;
        const storedUser = localUser || sessionUser;

        if (storedGuestMode === 'true') {
          // Guest mode
          setIsGuestMode(true);
          setIsAuthenticated(false);
          setUser(null);
        } else if (storedToken && storedUser && storedRefreshToken) {
          // Authenticated user - verify tokens are still valid
          try {
            // Try to refresh token to ensure it's still valid
            const refreshResponse = await axios.post('/api/auth/refresh', {
              refreshToken: storedRefreshToken
            });

            if (refreshResponse.data.success) {
              const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

              // Store new tokens in the same storage that was used originally
              const storage = localToken ? localStorage : sessionStorage;
              storage.setItem(ACCESS_TOKEN_KEY, accessToken);
              storage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
              
              // Also update localStorage for axios interceptor
              localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
              localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

              // Set auth header with new token
              axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

              // Load user data
              const userData = JSON.parse(storedUser) as UserProfile;
              setUser(userData);
              setIsAuthenticated(true);
              setIsGuestMode(false);

              console.log('✅ Token refreshed successfully on app load');
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            console.log('❌ Token refresh failed on app load, clearing stored data:', refreshError);
            // Clear invalid tokens from both storages
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(USER_CARDS_KEY);
            localStorage.removeItem(USER_DECKS_KEY);
            
            sessionStorage.removeItem(ACCESS_TOKEN_KEY);
            sessionStorage.removeItem(REFRESH_TOKEN_KEY);
            sessionStorage.removeItem(USER_KEY);

            // Default to guest mode
            setIsGuestMode(true);
            setIsAuthenticated(false);
            setUser(null);
          }
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
    setIsRegistering(true);
    try {
      const response = await axios.post('/api/auth/register', data, { skipAuthRefresh: true } as AxiosRequestConfig & { skipAuthRefresh: boolean });

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
      setIsRegistering(false);
    }
  };

  // Login a user
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoggingIn(true);
    try {
      const response = await axios.post('/api/auth/login', credentials, { skipAuthRefresh: true } as AxiosRequestConfig & { skipAuthRefresh: boolean });

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data;

        // Choose storage based on rememberMe
        const primaryStorage = credentials.rememberMe ? localStorage : sessionStorage;

        // Store tokens in primary storage
        primaryStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        primaryStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        primaryStorage.setItem(USER_KEY, JSON.stringify(user));

        // Always store in localStorage for axios interceptor compatibility
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

        // Show success notification
        showNotification(
          'Welcome Back!',
          `Welcome back, ${user.username}! You are now logged in.`,
          '/favicon-32x32.svg'
        );

        // Sync data from database (this will overwrite local guest data)
        await syncUserDataFromDatabase();
      } else {
        throw new Error(response.data.error?.message || 'Login failed');
      }
    } catch (error) {
      // Error will be handled by the component
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout a user
  const logout = useCallback(async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      // Call logout API if authenticated
      if (isAuthenticated) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear stored data from both storages
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(GUEST_CARDS_KEY);
      localStorage.removeItem(GUEST_DECKS_KEY);
      localStorage.removeItem(USER_CARDS_KEY);
      localStorage.removeItem(USER_DECKS_KEY);
      
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);

      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];

      setUser(null);
      setIsAuthenticated(false);
      setIsGuestMode(true);

      // Set guest mode flag
      localStorage.setItem(GUEST_MODE_KEY, 'true');

      // Show logout notification
      showNotification(
        'Logged Out',
        'You have been logged out and switched to guest mode.',
        '/favicon-32x32.svg'
      );

      setIsLoggingOut(false);
    }
  }, [isAuthenticated]);

  // Refresh the access token
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedRefreshToken) {
        console.log('❌ No refresh token available in localStorage');
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing token...');
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

        console.log('✅ Token refreshed successfully');

        // Show success notification
        showNotification(
          'Session Extended',
          'Your session has been automatically renewed. You can continue playing!',
          '/favicon-32x32.svg'
        );

        return;
      }

      console.log('❌ Token refresh failed - no success in response');
      throw new Error('Failed to refresh token');
    } catch (error) {
      console.error('❌ Token refresh error:', error);

      // Show failure notification
      showNotification(
        'Session Expired',
        'Your session has expired. You have been switched to guest mode.',
        '/favicon-32x32.svg'
      );

      // If refresh fails, logout
      await logout();
      throw error;
    }
  }, [logout]);

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

          console.log('🔄 Token expired, attempting refresh for:', originalRequest.url);

          try {
            await refreshToken();
            console.log('✅ Token refreshed successfully, retrying request');
            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            console.log('❌ Token refresh failed, logging out user:', refreshError);
            // If refresh fails, logout
            await logout();
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
  }, [logout, refreshToken]);

  const contextValue: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated,
    isGuestMode,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
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
