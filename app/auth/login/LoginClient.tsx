'use client';

import { signIn } from 'next-auth/react';
import { LogIn } from 'lucide-react';
import { useState } from 'react';

export default function LoginClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth0Login = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signIn('auth0', { redirect: false });
      if (result?.error) {
        setError('Failed to sign in with Auth0');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <LogIn className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Occamy Field Ops
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Track your field operations efficiently
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleAuth0Login}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign In with Auth0'}
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              About This App
            </h3>
            <p className="text-sm text-gray-600">
              Occamy Field Operations System - Track meetings, sales, and distributions with real-time maps and analytics. Powered by Auth0 authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
