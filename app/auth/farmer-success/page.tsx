'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function FarmerSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const handleFarmerLogin = async () => {
      try {
        // Get phone from sessionStorage
        const farmerPhone = sessionStorage.getItem('farmerPhone');
        console.log('farmer-success: Checking sessionStorage for phone:', farmerPhone);

        if (!farmerPhone) {
          console.log('farmer-success: No phone found, redirecting to login');
          router.push('/auth/login');
          return;
        }

        // Clean phone and query DB for recent verified OTP
        const cleanPhone = farmerPhone.replace(/[^0-9]/g, '');
        const response = await fetch('/api/auth/farmer-otp-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone }),
        });

        const data = await response.json();
        console.log('farmer-success: OTP lookup response:', data);

        if (!response.ok || !data.userId) {
          console.log('farmer-success: No verified OTP found, redirecting to login');
          router.push('/auth/login');
          return;
        }

        // Store in sessionStorage that farmer is authenticated
        console.log('farmer-success: Setting authenticated flag');
        sessionStorage.setItem('farmerAuthenticated', 'true');
        sessionStorage.setItem('farmerUserId', data.userId);

        // Wait a moment for visual effect, then redirect
        setTimeout(() => {
          console.log('farmer-success: Redirecting to dashboard after 1.5s');
          router.push('/dashboard/farmer');
        }, 1500);
      } catch (error) {
        console.error('Farmer login error:', error);
        router.push('/auth/login');
      }
    };

    handleFarmerLogin();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center space-y-6">
          <div className="inline-block bg-green-100 p-6 rounded-full animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">
              ✓ Verified!
            </h1>
            <p className="text-gray-600">
              Your phone number has been verified successfully.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Redirecting to your dashboard...
            </p>
            <div className="mt-3 flex justify-center">
              <div className="animate-spin">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full" />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            If you are not redirected within 3 seconds,{' '}
            <button
              onClick={() => {
                sessionStorage.setItem('farmerAuthenticated', 'true');
                router.push('/dashboard/farmer');
              }}
              className="text-green-600 hover:text-green-700 underline font-medium"
            >
              click here
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
