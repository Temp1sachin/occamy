'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function FarmerAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check for OTP-based farmer auth in sessionStorage
      const farmerAuth = sessionStorage.getItem('farmerAuthenticated');
      
      if (farmerAuth === 'true') {
        setIsAuthorized(true);
      } else {
        // No farmer auth found, redirect to login
        router.push('/auth/login');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full" />
          </div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
