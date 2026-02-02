'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function FarmerOTPVerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const savedPhone = sessionStorage.getItem('farmerPhone');
    if (!savedPhone) {
      router.push('/auth/login');
      return;
    }
    setPhone(savedPhone);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/farmer-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp, action: 'verify' }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('OTP verified successfully');
        setSuccess(true);
        // Store phone for farmer-success to lookup user in DB
        sessionStorage.setItem('farmerPhone', phone);
        console.log('Stored phone in sessionStorage:', phone);
        setTimeout(() => {
          console.log('Redirecting to farmer-success');
          router.push('/auth/farmer-success');
        }, 2000);
      } else {
        setError(data.error || 'Verification failed');
        setAttempts((a) => a + 1);
      }
    } catch (e) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!phone) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-2xl shadow-lg mb-4">
            <Phone className="w-10 h-10 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Phone</h1>
          <p className="text-gray-600 mt-2">Enter the 6-digit code sent to</p>
          <p className="font-mono text-lg text-green-700 font-bold">
            +91 {phone.slice(0, 5)} {phone.slice(5)}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-green-100 mb-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="inline-block bg-green-100 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-700">✓ Verified!</h2>
              <p className="text-gray-600">Your phone is verified. Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length > 6) val = val.slice(0, 6);
                    setOtp(val);
                  }}
                  maxLength={6}
                  disabled={loading}
                  className="w-full px-6 py-4 text-4xl font-bold text-center tracking-widest border-2 border-green-300 rounded-xl focus:outline-none focus:border-green-600 transition-colors font-mono disabled:bg-gray-100"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Timer */}
              {timeLeft > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">Code expires in</p>
                  <p className="text-3xl font-bold text-green-600 font-mono">
                    {formatTime(timeLeft)}
                  </p>
                </div>
              )}

              {timeLeft === 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-yellow-800 font-medium">⏰ Code expired</p>
                  <Link
                    href="/auth/login"
                    className="text-yellow-700 underline text-sm mt-1 block"
                  >
                    Request a new code
                  </Link>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6 || timeLeft === 0}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block mr-2">⏳</span>
                    Verifying...
                  </>
                ) : (
                  '✓ Verify & Login'
                )}
              </button>

              {/* Resend */}
              {timeLeft < 60 && timeLeft > 0 && (
                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Don't receive code? Request new one
                  </Link>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-700">
            <strong>ℹ️ Need help?</strong>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Contact your field officer if you don't receive the code within 1 minute
          </p>
        </div>
      </div>
    </div>
  );
}
