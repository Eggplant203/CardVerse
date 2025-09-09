import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { calculatePasswordStrength } from '../../lib/auth/password';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onLoginClick
}) => {
  const { register, isRegistering } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
  }>({ score: 0, label: 'Weak' });

  // Update password strength when password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, label: 'Weak' });
    }
  }, [password]);

  // Get color based on password strength
  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0: return 'bg-red-600';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-green-500';
      case 4: return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Username validation
    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(username)) {
      errors.username = 'Username must be 3-50 characters with only letters, numbers, underscores, and hyphens';
    }

    // Password validation
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/.test(password)) {
      errors.password = 'Password must have at least 8 characters with uppercase, lowercase, number, and special character';
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!agreeTos) {
      errors.agreeTos = 'You must agree to the Terms of Service';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email,
        username,
        password,
        displayName: displayName || username
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string; details?: Array<{ field: string; message: string }> } } } };
      setError(error.response?.data?.error?.message || 'Registration failed. Please try again.');
      
      // Extract field-specific errors from the response
      const fieldErrors = error.response?.data?.error?.details;
      if (fieldErrors) {
        const errorMap: Record<string, string> = {};
        fieldErrors.forEach((fieldError: { field: string; message: string }) => {
          errorMap[fieldError.field] = fieldError.message;
        });
        setFieldErrors(errorMap);
      }
    }
  };

  return (
    <div className="w-full p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-gray-400">Join the CardVerse community</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            📧 Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              fieldErrors.email ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter your email"
            required
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
            👤 Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-4 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              fieldErrors.username ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Choose a username"
            required
          />
          {fieldErrors.username && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.username}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
            👤 Display Name (optional)
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="How you'll appear to others"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            🔒 Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                fieldErrors.password ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Create a password"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
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
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.password}</p>
          )}
          
          {/* Password strength meter */}
          {password && (
            <div className="mt-2">
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStrengthColor(passwordStrength.score)}`} 
                  style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Password strength: <span className={`font-medium text-${getStrengthColor(passwordStrength.score).replace('bg-', '')}`}>
                  {passwordStrength.label}
                </span>
              </p>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
            🔒 Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Confirm your password"
            required
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.confirmPassword}</p>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            id="agreeTos"
            type="checkbox"
            checked={agreeTos}
            onChange={(e) => setAgreeTos(e.target.checked)}
            className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700 ${
              fieldErrors.agreeTos ? 'border-red-500' : ''
            }`}
          />
          <label htmlFor="agreeTos" className="ml-2 block text-sm text-gray-300">
            I agree to the Terms of Service and Privacy Policy
          </label>
        </div>
        {fieldErrors.agreeTos && (
          <p className="mt-1 text-sm text-red-400">{fieldErrors.agreeTos}</p>
        )}
        
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={isRegistering}
          >
            {isRegistering ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <button
          onClick={onLoginClick}
          className="font-medium text-indigo-400 hover:text-indigo-300"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
