import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export const middleware = withAuth(
  function onSuccess(req: NextRequest) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Protect admin routes
    if (pathname.startsWith('/dashboard/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/officer', req.url));
      }
    }

    // Protect officer routes
    if (pathname.startsWith('/dashboard/officer')) {
      if (token?.role !== 'OFFICER' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
    }

    // Protect general dashboard
    if (pathname === '/dashboard') {
      if (token?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/admin', req.url));
      } else if (token?.role === 'OFFICER') {
        return NextResponse.redirect(new URL('/dashboard/officer', req.url));
      }
    }

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
    '/dashboard/:path*',
    '/api/activities/:path*',
  ],
};
