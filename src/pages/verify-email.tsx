import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

const VerifyEmail: NextPage = () => {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const response = await axios.post('/api/auth/verify-email', { token });
        if (response.data.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(response.data.error?.message || 'Verification failed.');
        }
      } catch (error: unknown) {
        setStatus('error');
        setMessage((error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Verification failed.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          {status === 'loading' && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Verifying your email...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="mt-4">
              <div className="text-green-600 text-5xl">✓</div>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Go to Home
              </button>
            </div>
          )}
          {status === 'error' && (
            <div className="mt-4">
              <div className="text-red-600 text-5xl">✗</div>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Go to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
