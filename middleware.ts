// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Read the HttpOnly cookie set on login
  const userId = request.cookies.get('userId')?.value;
  const { pathname } = request.nextUrl;

  // 2. Protect /dashboard: If NOT logged in, redirect to login page
  if (pathname.startsWith('/dashboard') && !userId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. Prevent logged-in users from viewing the Login/Register page
  if (pathname === '/' && userId) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Specify which paths this middleware should run on
export const config = {
  matcher: ['/', '/dashboard/:path*'],
};