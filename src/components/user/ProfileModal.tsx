import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { ImageStorage } from '../../services/storage/imageStorage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, logout, isLoading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setError(null);
    setIsSaving(true);
    
    try {
      await updateProfile({
        displayName,
        avatarUrl
      });
      
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
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
    } catch (error) {
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
    } catch (err: any) {
      setError(err.message || 'Failed to process image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
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
          onClick={onClose}
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
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <img src="/default-avatar.png" alt={displayName} className="w-full h-full object-cover" />
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
                    <div>Email: {user.email}</div>
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
                    onClick={() => {/* Implement change password */}}
                    className="flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Change Password
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowConfirmLogout(true);
                    }}
                    className="flex items-center justify-center px-3 py-2 bg-red-900/50 hover:bg-red-700 text-white rounded-md text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
              
              {/* Game statistics placeholder */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h3 className="text-md font-medium text-white mb-3">Game Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-700/50 p-3 rounded-md">
                    <div className="text-lg font-bold text-white">0</div>
                    <div className="text-xs text-gray-400">Cards Created</div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-md">
                    <div className="text-lg font-bold text-white">0</div>
                    <div className="text-xs text-gray-400">Games Won</div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-md">
                    <div className="text-lg font-bold text-white">0</div>
                    <div className="text-xs text-gray-400">Decks Built</div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-md">
                    <div className="text-lg font-bold text-white">0%</div>
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
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-md"
                    >
                      {isLoading ? 'Signing Out...' : 'Sign Out'}
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
