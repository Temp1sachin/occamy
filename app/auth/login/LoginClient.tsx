'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Phone, Mail, Lock, Smartphone } from 'lucide-react';

type Role = 'ADMIN' | 'OFFICER' | 'FARMER';

export default function LoginClient() {
  const [role, setRole] = useState<Role>('OFFICER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');

  // ==================== ADMIN LOGIN ====================
  const handleAdminLogin = async () => {
    setLoading(true);
    setError('');

    try {
      sessionStorage.setItem('preferredRole', 'ADMIN');
      await signIn('auth0', {
        callbackUrl: '/auth/role-select?preferredRole=ADMIN',
        authorizationParams: {
          prompt: 'login',
          max_age: 0,
        },
      });
    } catch (e) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  // ==================== OFFICER LOGIN ====================
  const handleOfficerLogin = async (method: 'email' | 'magic-link') => {
    setLoading(true);
    setError('');

    try {
      sessionStorage.setItem('preferredRole', 'OFFICER');
      sessionStorage.setItem('authMethod', method);

      await signIn('auth0', {
        callbackUrl: '/auth/role-select?preferredRole=OFFICER',
        authorizationParams: {
          prompt: 'login',
          max_age: 0,
          connection: method === 'magic-link' ? 'email' : undefined,
        },
      });
    } catch (e) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  // ==================== FARMER OTP LOGIN ====================
  const handleFarmerOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(farmerPhone.replace(/[^0-9]/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      const cleanPhone = farmerPhone.replace(/[^0-9]/g, '');
      const response = await fetch('/api/auth/farmer-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, action: 'send' }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      sessionStorage.setItem('farmerPhone', cleanPhone);
      window.location.href = '/auth/farmer-otp-verify';
    } catch (e) {
      setError('Failed to send OTP. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-2xl shadow-lg mb-4">
            <h1 className="text-4xl font-bold">🌾 Occamy</h1>
          </div>
          <p className="text-gray-600 text-lg font-medium">Field Operations Portal</p>
          <p className="text-gray-500 text-sm mt-1">Transforming Rural Workflows</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-purple-100">
          <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setRole('ADMIN')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                role === 'ADMIN'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👔 Admin
            </button>
            <button
              onClick={() => setRole('OFFICER')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                role === 'OFFICER'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📱 Officer
            </button>
            <button
              onClick={() => setRole('FARMER')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                role === 'FARMER'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌾 Farmer
            </button>
          </div>

          {/* ADMIN LOGIN FLOW */}
          {role === 'ADMIN' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <Lock className="inline w-4 h-4 mr-2" />
                  Secure email and password authentication
                </p>
              </div>
              <button
                onClick={handleAdminLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Signing in...' : '✉️ Login with Auth0'}
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">
                Full access to dashboards, analytics, and user management
              </p>
            </div>
          )}

          {/* OFFICER LOGIN FLOW */}
          {role === 'OFFICER' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <Smartphone className="inline w-4 h-4 mr-2" />
                  Choose your preferred login method
                </p>
              </div>
              <button
                onClick={() => handleOfficerLogin('email')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Signing in...' : '📧 Email + Password'}
              </button>
              <button
                onClick={() => handleOfficerLogin('magic-link')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending link...' : '✨ Magic Link'}
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">
                Log daily activities, meetings, sales & location data
              </p>
            </div>
          )}

          {/* FARMER OTP LOGIN FLOW */}
          {role === 'FARMER' && (
            <form onSubmit={handleFarmerOTP} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 font-medium mb-1">
                  <Smartphone className="inline w-4 h-4 mr-2" />
                  Mobile-first OTP Login
                </p>
                <p className="text-xs text-gray-600">
                  Easy verification with 6-digit code
                </p>
              </div>

              {/* Phone Input - Large & Clear for Low Literacy */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  📱 Your Phone Number
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 font-semibold mr-2">+91</span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={farmerPhone}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length > 10) val = val.slice(0, 10);
                      setFarmerPhone(val);
                    }}
                    maxLength="14"
                    className="flex-1 px-4 py-4 text-lg font-semibold border-2 border-green-300 rounded-xl focus:outline-none focus:border-green-600 transition-colors"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We'll send a 6-digit code to verify
                </p>
              </div>

              {/* Visual OTP Display */}
              {farmerPhone.length === 10 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-600 mb-2">Phone ready:</p>
                  <p className="text-2xl font-bold text-green-700 font-mono tracking-widest">
                    +91 {farmerPhone.slice(0, 5)} {farmerPhone.slice(5)}
                  </p>
                </div>
              )}

              {/* Send OTP Button - Large & Prominent */}
              <button
                type="submit"
                disabled={loading || farmerPhone.length !== 10}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    Send 6-Digit Code
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                ✓ No password needed
                <br />
                ✓ Confirm meetings, payments & interactions
                <br />
                ✓ Simple & secure
              </p>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-red-600 font-bold text-lg">⚠️</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center space-y-3">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-gray-600">
              <p className="font-semibold text-gray-900">👔</p>
              <p>Admin</p>
              <p className="text-gray-500">Full Control</p>
            </div>
            <div className="text-gray-600">
              <p className="font-semibold text-gray-900">📱</p>
              <p>Officer</p>
              <p className="text-gray-500">Log Activities</p>
            </div>
            <div className="text-gray-600">
              <p className="font-semibold text-gray-900">🌾</p>
              <p>Farmer</p>
              <p className="text-gray-500">Confirm Only</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 border-t border-gray-200 pt-4">
            Replacing WhatsApp-based workflows with structured, role-aware authentication
          </p>
        </div>
      </div>
    </div>
  );
}
