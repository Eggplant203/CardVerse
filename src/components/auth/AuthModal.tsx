import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'register' | 'forgotPassword';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const { isAuthenticated } = useAuth();

  // If user becomes authenticated, close modal
  React.useEffect(() => {
    if (isAuthenticated) {
      onClose();
    }
  }, [isAuthenticated, onClose]);

  const handleSuccessfulAuth = () => {
    onClose();
  };

  const handleGuestContinue = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900 rounded-lg shadow-2xl relative max-w-md w-full max-h-[90vh] overflow-hidden mx-4 sm:mx-0"
          >
            {/* Close button in top-right corner */}
            <button
              className="absolute top-4 right-4 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full p-2 transition-all duration-200 z-10 shadow-lg"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Scrollable content area */}
            <div className="max-h-[90vh] overflow-y-auto scrollbar-hide">
              {currentView === 'login' && (
                <LoginForm
                  onSuccess={handleSuccessfulAuth}
                  onRegisterClick={() => setCurrentView('register')}
                  onForgotPasswordClick={() => setCurrentView('forgotPassword')}
                  onGuestContinue={handleGuestContinue}
                />
              )}

              {currentView === 'register' && (
                <RegisterForm
                  onSuccess={handleSuccessfulAuth}
                  onLoginClick={() => setCurrentView('login')}
                />
              )}

              {currentView === 'forgotPassword' && (
                <ForgotPasswordForm
                  onBackToLogin={() => setCurrentView('login')}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
