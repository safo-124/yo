// middleware.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/actions/auth.actions'; // We need to adapt getSession for middleware

// Note: Server actions like getSession() which use `cookies()` from `next/headers`
// are primarily designed for Server Components and Route Handlers, not directly in middleware
// in the same way. For middleware, we need to access cookies directly from the request.

const SESSION_COOKIE_NAME = 'app_session'; // Must match the name used in auth.actions.js

async function getSessionFromRequest(request) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    return null;
  }
  try {
    // The value is already a string, no need to access .value again here if using request.cookies.get()
    return JSON.parse(sessionCookie.value);
  } catch (error) {
    console.error('Middleware: Failed to parse session cookie:', error);
    // Optionally, delete the corrupted cookie
    // const response = NextResponse.next();
    // response.cookies.delete(SESSION_COOKIE_NAME);
    // return null; // Or handle as an invalid session
    return null;
  }
}


export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request); // Get session from the request cookies

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup'); // Add other auth pages if any

  // 1. If trying to access an auth page while logged in, redirect to a default dashboard page
  if (isAuthPage && session?.userId) {
    let redirectTo = '/'; // Default redirect for logged-in users trying to access auth pages
    if (session.role === 'REGISTRY') redirectTo = '/registry';
    else if (session.role === 'COORDINATOR') redirectTo = '/coordinator'; // Adjust as needed
    else if (session.role === 'LECTURER') redirectTo = '/lecturer'; // Adjust as needed
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // 2. Define protected paths
  const isDashboardPath = pathname.startsWith('/(dashboard)') || // For files directly in (dashboard)
                          pathname.startsWith('/registry') ||
                          pathname.startsWith('/coordinator') ||
                          pathname.startsWith('/lecturer') ||
                          pathname.startsWith('/profile') || // Example other protected paths
                          pathname.startsWith('/settings');


  // If trying to access a protected path without a session, redirect to login
  if (isDashboardPath && !session?.userId) {
    // Store the intended URL to redirect back after login (optional)
    const loginUrl = new URL('/login', request.url);
    // loginUrl.searchParams.set('callbackUrl', pathname); // Example for callback
    return NextResponse.redirect(loginUrl);
  }

  // 3. Role-based access control for specific dashboard paths
  if (session?.userId) {
    if (pathname.startsWith('/registry') && session.role !== 'REGISTRY') {
      console.warn(`Middleware: Unauthorized access attempt to ${pathname} by role ${session.role}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url)); // Or a generic dashboard/home
    }
    if (pathname.startsWith('/coordinator') && session.role !== 'COORDINATOR' && session.role !== 'REGISTRY') {
      // Allowing REGISTRY to also access coordinator paths might be useful for admin oversight
      // Adjust this logic based on your exact requirements.
      // If a coordinator is trying to access /coordinator/[anotherCenterId], that's a more complex check for later.
      console.warn(`Middleware: Unauthorized access attempt to ${pathname} by role ${session.role}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (pathname.startsWith('/lecturer') && session.role !== 'LECTURER' && session.role !== 'REGISTRY') {
      // Similar logic for lecturer paths
      console.warn(`Middleware: Unauthorized access attempt to ${pathname} by role ${session.role}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // If none of the above, proceed with the request
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets/ (if you have a public assets folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
