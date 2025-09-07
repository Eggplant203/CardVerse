import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import { motion } from 'framer-motion';

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Redirect to home if no token or after success
  useEffect(() => {
    if (!token && router.isReady) {
      router.replace('/');
    }
    
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.replace('/');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [token, router, isSuccess]);
  
  const handleSuccess = () => {
    setIsSuccess(true);
  };
  
  if (!token || typeof token !== 'string') {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">🃏 CardVerse</h1>
        <p className="text-gray-400">Reset your password</p>
      </motion.div>
      
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700 text-center"
        >
          <div className="inline-block p-3 bg-green-800/20 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Reset Complete</h2>
          <p className="text-gray-400 mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <div className="text-gray-400">
            Redirecting to homepage in a few seconds...
          </div>
        </motion.div>
      ) : (
        <ResetPasswordForm token={token} onSuccess={handleSuccess} />
      )}
    </div>
  );
};

export default ResetPasswordPage;
