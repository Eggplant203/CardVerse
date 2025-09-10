import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { ImageStorage } from '../../services/storage/imageStorage';
import axios from 'axios';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.ComponentType<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, logout, isLoading, refreshToken } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    isLoading: false,
    emailSent: false,
    error: null as string | null,
    cooldownTime: 0,
    cooldownMinutes: 0
  });
  const [statistics, setStatistics] = useState({
    cardsCreated: 0,
    gamesWon: 0,
    decksBuilt: 0,
    winRate: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to truncate email for mobile display
  const truncateEmail = (email: string, maxLength: number = 25) => {
    if (email.length <= maxLength) return email;
    const atIndex = email.indexOf('@');
    if (atIndex > 0 && atIndex < maxLength - 3) {
      // Keep the username part and domain start
      return email.substring(0, maxLength - 3) + '...';
    }
    return email.substring(0, maxLength - 3) + '...';
  };

  // Countdown timer effect for forgot password
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (forgotPasswordData.cooldownTime > 0) {
      interval = setInterval(() => {
        setForgotPasswordData((prev) => ({
          ...prev,
          cooldownTime: prev.cooldownTime > 0 ? prev.cooldownTime - 1 : 0
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [forgotPasswordData.cooldownTime]);

  React.useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Fetch user statistics when modal opens
  React.useEffect(() => {
    if (isOpen && user) {
      fetchUserStatistics();
    }
  }, [isOpen, user]);

  const fetchUserStatistics = async () => {
    setIsLoadingStats(true);
    try {
      const response = await axios.get('/api/user/statistics');
      
      if (response.data) {
        // Get decks count from localStorage
        const isGuest = !user || user.id.startsWith('guest-');
        const decksKey = isGuest ? 'cardverse_guest_decks' : 'ai_card_game_decks';
        const storedDecks = localStorage.getItem(decksKey);
        const decksCount = storedDecks ? JSON.parse(storedDecks).length : 0;
        
        setStatistics({
          ...response.data,
          decksBuilt: decksCount
        });
      }
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
      // Keep default values if fetch fails
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSaveProfile = async () => {
    setError(null);
    setIsSaving(true);

    try {
      await updateProfile({
        displayName,
        avatarUrl
      });

      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (isLoading) {
      return;
    }

    try {
      await logout();
      onClose();
      // Redirect to home page after logout
      router.push('/');
    } catch {
      // Error is handled by AuthContext
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);

    try {
      // Convert to base64
      const base64 = await ImageStorage.fileToBase64(file);

      // Compress image
      const compressedBase64 = await ImageStorage.compressImage(base64, 400, 0.8);

      // Update avatar URL
      setAvatarUrl(compressedBase64);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to process image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleChangePassword = async () => {
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setError(null);
    setIsChangingPassword(true);

    try {
      const response = await axios.post('/api/auth/change-password', {
        currentPassword: changePasswordData.currentPassword,
        newPassword: changePasswordData.newPassword
      });

      if (response.data.success) {
        setShowChangePasswordModal(false);
        setChangePasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswords({
          current: false,
          new: false,
          confirm: false
        });
        // Show success message and logout
        alert('Password changed successfully! You will be logged out for security.');
        // Logout user after password change
        await logout();
      } else {
        setError(response.data.error?.message || 'Failed to change password');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRefreshToken = async () => {
    setError(null);
    setIsRefreshingToken(true);

    try {
      await refreshToken();
      alert('Token refreshed successfully!');
    } catch {
      setError('Failed to refresh token. Please try logging in again.');
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const handleForgotPassword = () => {
    setShowChangePasswordModal(false);
    setShowForgotPasswordForm(true);
  };

  const handleBackToChangePassword = () => {
    setShowForgotPasswordForm(false);
    setShowChangePasswordModal(true);
    setForgotPasswordData({
      email: '',
      isLoading: false,
      emailSent: false,
      error: null,
      cooldownTime: 0,
      cooldownMinutes: 0
    });
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as HTMLFormElement).email.value;

    setForgotPasswordData(prev => ({ ...prev, error: null, isLoading: true }));

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });

      if (response.data.success) {
        setForgotPasswordData(prev => ({
          ...prev,
          emailSent: true,
          isLoading: false,
          cooldownMinutes: response.data.cooldownMinutes || 5,
          cooldownTime: (response.data.cooldownMinutes || 5) * 60
        }));
      } else {
        throw new Error(response.data.error?.message || 'Failed to send reset email');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string; code?: string; cooldownMinutes?: number } } } };
      const errorMessage = error.response?.data?.error?.message || 'Failed to send reset email. Please try again.';
      const errorCode = error.response?.data?.error?.code;
      const cooldownMins = error.response?.data?.error?.cooldownMinutes;

      setForgotPasswordData(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));

      // If cooldown is active, set the countdown timer
      if (errorCode === 'COOLDOWN_ACTIVE' && cooldownMins) {
        setForgotPasswordData(prev => ({
          ...prev,
          cooldownMinutes: cooldownMins,
          cooldownTime: cooldownMins * 60
        }));
      }
    }
  };

  const handleResendEmail = async () => {
    const email = forgotPasswordData.email;
    if (!email) return;

    setForgotPasswordData(prev => ({ ...prev, error: null, isLoading: true }));

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });

      if (response.data.success) {
        setForgotPasswordData(prev => ({
          ...prev,
          isLoading: false,
          cooldownMinutes: response.data.cooldownMinutes || 5,
          cooldownTime: (response.data.cooldownMinutes || 5) * 60
        }));
      } else {
        throw new Error(response.data.error?.message || 'Failed to send reset email');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const errorMessage = error.response?.data?.error?.message || 'Failed to send reset email. Please try again.';
      setForgotPasswordData(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    }
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Profile Settings</h2>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-start space-x-4 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={displayName} width={96} height={96} className="w-full h-full object-cover" unoptimized priority />
                    ) : (
                      <Image src="/default-avatar.png" alt={displayName} width={96} height={96} className="w-full h-full object-cover" unoptimized priority />
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={handleAvatarClick}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-0 right-0 bg-gray-900 bg-opacity-75 p-1 rounded-full hover:bg-opacity-100 transition-opacity"
                      title="Change avatar"
                    >
                      {isUploadingAvatar ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  ) : (
                    <h3 className="text-lg font-medium text-white mb-1">
                      {displayName}
                    </h3>
                  )}

                  <div className="text-sm text-gray-400">
                    <div>Username: {user.username}</div>
                    <div className="flex items-center space-x-2">
                      <span className="break-words max-w-full">
                        Email: {showEmail ? (
                          <>
                            <span className="hidden sm:inline">{user.email}</span>
                            <span className="sm:hidden">{truncateEmail(user.email)}</span>
                          </>
                        ) : '••••••••••••••••'}
                      </span>
                      <button
                        onClick={() => setShowEmail(!showEmail)}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                        title={showEmail ? 'Hide email' : 'Show email'}
                      >
                        {showEmail ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div>Member since: {user.createdAt ? (() => {
                      try {
                        const date = new Date(user.createdAt);
                        return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
                      } catch {
                        return 'Unknown';
                      }
                    })() : 'Unknown'}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mt-4">
                <h3 className="text-md font-medium text-white mb-3">Account Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Change Password
                  </button>

                  <button
                    onClick={handleRefreshToken}
                    disabled={isRefreshingToken}
                    className="flex items-center justify-center px-3 py-2 bg-blue-700 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md text-sm"
                  >
                    {isRefreshingToken ? (
                      <svg className="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    {isRefreshingToken ? 'Refreshing...' : 'Refresh Token'}
                  </button>
                </div>

                <div className="mt-2">
                  <button
                    onClick={() => {
                      setShowConfirmLogout(true);
                    }}
                    className="flex items-center justify-center w-full px-3 py-2 bg-red-900/50 hover:bg-red-700 text-white rounded-md text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Game statistics */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h3 className="text-md font-medium text-white mb-3">Game Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-700/50 p-3 rounded-md">
                    <div className="text-lg font-bold text-white">
                      {isLoadingStats ? '...' : statistics.cardsCreated}
                    </div>
                    <div className="text-xs text-gray-400">Cards Created</div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-md">
                    <div className="text-lg font-bold text-white">
                      {isLoadingStats ? '...' : statistics.gamesWon}
                    </div>
                    <div className="text-xs text-gray-400">Games Won</div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-md">
                    <div className="text-lg font-bold text-white">
                      {isLoadingStats ? '...' : statistics.decksBuilt}
                    </div>
                    <div className="text-xs text-gray-400">Decks Built</div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-md">
                    <div className="text-lg font-bold text-white">
                      {isLoadingStats ? '...' : `${statistics.winRate}%`}
                    </div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmLogout && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 rounded-lg z-50">
                <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-medium text-white mb-4">Sign Out</h3>
                  <p className="text-gray-300 mb-6">Are you sure you want to sign out of your account?</p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowConfirmLogout(false);
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                      }}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-md flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing Out...
                        </>
                      ) : (
                        'Sign Out'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Change Password Modal */}
            {showChangePasswordModal && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 rounded-lg z-50">
                <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-medium text-white mb-4">Change Password</h3>

                  {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={changePasswordData.currentPassword}
                          onChange={(e) => setChangePasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords.current ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={changePasswordData.newPassword}
                          onChange={(e) => setChangePasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords.new ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={changePasswordData.confirmPassword}
                          onChange={(e) => setChangePasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords.confirm ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowChangePasswordModal(false);
                        setChangePasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setShowPasswords({
                          current: false,
                          new: false,
                          confirm: false
                        });
                        setError(null);
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-md"
                    >
                      {isChangingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Forgot Password Modal */}
            {showForgotPasswordForm && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 rounded-lg z-50">
                <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-medium text-white">Reset Password</h3>
                    <button
                      onClick={handleBackToChangePassword}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {!forgotPasswordData.emailSent ? (
                    <>
                      <div className="text-center mb-6">
                        <p className="text-gray-400">Enter your email to receive a reset link</p>
                      </div>

                      {forgotPasswordData.error && (
                        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm">
                          {forgotPasswordData.error}
                        </div>
                      )}

                      <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            📧 Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={forgotPasswordData.email}
                            onChange={(e) => setForgotPasswordData((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your email"
                            required
                          />
                        </div>

                        <div>
                          <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            disabled={forgotPasswordData.isLoading || forgotPasswordData.cooldownTime > 0}
                          >
                            {forgotPasswordData.isLoading ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                              </span>
                            ) : forgotPasswordData.cooldownTime > 0 ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M12 2v6m0 0l-4-4m4 4l4-4m-4 4v16"></path>
                                </svg>
                                Resend in {Math.floor(forgotPasswordData.cooldownTime / 60)}:{(forgotPasswordData.cooldownTime % 60).toString().padStart(2, '0')}
                              </span>
                            ) : (
                              'Send Reset Link'
                            )}
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="inline-block p-3 bg-green-800/20 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                      <p className="text-gray-400 mb-4">
                        We sent a password reset link to <span className="text-white font-medium">{forgotPasswordData.email}</span>
                      </p>
                      {forgotPasswordData.cooldownTime > 0 && (
                        <p className="text-yellow-400 text-sm mb-4">
                          You can request another reset link in {Math.floor(forgotPasswordData.cooldownTime / 60)}:{(forgotPasswordData.cooldownTime % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                      <button
                        onClick={handleResendEmail}
                        className="w-full mb-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        disabled={forgotPasswordData.cooldownTime > 0}
                      >
                        {forgotPasswordData.cooldownTime > 0 ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Resend in {Math.floor(forgotPasswordData.cooldownTime / 60)}:{(forgotPasswordData.cooldownTime % 60).toString().padStart(2, '0')}
                          </span>
                        ) : (
                          'Resend Email'
                        )}
                      </button>
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <button
                      onClick={handleBackToChangePassword}
                      className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      ← Back to Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
