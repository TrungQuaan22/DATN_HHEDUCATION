import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const role = request.cookies.get('role')?.value;

  // Skip API, Next.js internals, and files with extensions (static assets)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 1. Authenticated users cannot access /login and /register
  if (pathname === '/login' || pathname === '/register') {
    if (accessToken) {
      const url = request.nextUrl.clone();
      if (role === 'admin' || role === 'teacher') {
        url.pathname = '/admin';
      } else {
        url.pathname = '/';
      }
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2. Protect admin routes: only admin and teacher allowed
  if (pathname.startsWith('/admin')) {
    if (!accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    if (role !== 'admin' && role !== 'teacher') {
      const url = request.nextUrl.clone();
      url.pathname = role === 'student' ? '/student' : '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 3. Protect student routes: only students allowed
  if (pathname.startsWith('/student')) {
    if (!accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    if (role === 'admin' || role === 'teacher') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 4. Protect public pages from Admin and Teacher roles
  // Admin and Teacher are redirected to /admin workspace immediately
  if (accessToken && (role === 'admin' || role === 'teacher')) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
