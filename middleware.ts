import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export const middleware = withAuth(
  function onSuccess(req: NextRequest) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/login',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/admin/:path*',
    '/dashboard/officer/:path*',
    '/api/activities/:path*',
  ],
};
