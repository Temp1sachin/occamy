'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RoleSelectClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Read from URL params first, then fall back to sessionStorage
    let role = searchParams.get('preferredRole') || sessionStorage.getItem('preferredRole');

    if (!role) {
      router.push('/auth/login');
      return;
    }

    // Validate role
    if (!['ADMIN', 'OFFICER', 'FARMER'].includes(role)) {
      router.push('/auth/login');
      return;
    }

    fetch('/api/auth/assign-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
      .then(() => {
        sessionStorage.removeItem('preferredRole');
        router.push('/auth/role-apply');
      })
      .catch(() => {
        router.push('/auth/error');
      });
  }, [router, searchParams]);

  return (
    <p className="text-center mt-20 text-gray-600">
      Setting up your account…
    </p>
  );
}
