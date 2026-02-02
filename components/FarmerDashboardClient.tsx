'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Calendar, Users } from 'lucide-react';

export default function FarmerDashboardClient() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for farmer-auth cookie (set by lookup API)
        const hasCookie = document.cookie.includes('farmer-auth');
        
        console.log('FarmerDashboardClient: Checking auth cookie', { hasCookie });
        
        if (!hasCookie) {
          console.log('FarmerDashboardClient: No auth cookie found, checking sessionStorage...');
          // Fallback: check sessionStorage
          const farmerAuth = sessionStorage.getItem('farmerAuthenticated');
          if (farmerAuth !== 'true') {
            console.log('FarmerDashboardClient: No valid auth found, redirecting to login');
            router.push('/auth/login');
            return;
          }
        }
        
        console.log('FarmerDashboardClient: Auth verified, rendering dashboard');
        setIsAuthorized(true);
      } catch (error) {
        console.error('FarmerDashboardClient: Auth check error:', error);
        router.push('/auth/login');
      } finally {
        setIsChecking(false);
      }
    };

    // Small delay to ensure cookies are set
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin inline-block mb-4">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full" />
          </div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-bold">Farmer Portal</h1>
          <p className="mt-2 text-green-100 text-lg">
            Confirm your meetings, sales, and interactions
          </p>
          <p className="mt-4 text-sm text-green-100">
            Welcome to your dashboard
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-2">Pending Confirmations</p>
              <p className="text-5xl font-bold text-green-600">0</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200 group-hover:text-green-400 transition" />
          </div>
        </div>

        <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-2">Confirmed</p>
              <p className="text-5xl font-bold text-emerald-600">0</p>
            </div>
            <CheckCircle className="w-12 h-12 text-emerald-200 group-hover:text-emerald-400 transition" />
          </div>
        </div>

        <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-2">Total Interactions</p>
              <p className="text-5xl font-bold text-blue-600">0</p>
            </div>
            <Users className="w-12 h-12 text-blue-200 group-hover:text-blue-400 transition" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-16 text-center">
        <Calendar className="w-16 h-16 text-green-300 mx-auto mb-4" />
        <p className="text-gray-600 text-lg font-medium mb-2">No interactions yet</p>
        <p className="text-gray-500">
          Your interactions with field officers will appear here for confirmation
        </p>
      </div>
    </div>
  );
}
