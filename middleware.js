// middleware.js
import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'app_session'; // Must match the name used in auth.actions.js

async function getSessionFromRequest(request) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    return null;
  }
  try {
    // The value from request.cookies.get() is already the string value of the cookie
    return JSON.parse(sessionCookie.value); // This will now include dashboardPath
  } catch (error) {
    console.error('Middleware: Failed to parse session cookie:', error);
    // Optionally, instruct the browser to delete the corrupted cookie
    // This requires returning a NextResponse object.
    // For simplicity here, we just return null, treating it as no session.
    // If you want to delete:
    // const response = NextResponse.next(); // Or NextResponse.redirect if redirecting
    // response.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    // return null; // Or throw error / redirect
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isHomepage = pathname === '/';

  // 1. Handle Logged-In Users
  if (session?.userId) {
    const userDashboardPath = session.dashboardPath || '/profile'; // Fallback to /profile if dashboardPath is missing

    // 1a. If trying to access an auth page (login/signup) while logged in, redirect to their dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL(userDashboardPath, request.url));
    }

    // 1b. If trying to access the homepage (/) while logged in, redirect to their dashboard
    // Make sure userDashboardPath is not also '/' to prevent redirect loops.
    if (isHomepage && userDashboardPath !== '/') {
      return NextResponse.redirect(new URL(userDashboardPath, request.url));
    }

    // 1c. Role-based access control and center-specific path validation
    if (pathname.startsWith('/registry') && session.role !== 'REGISTRY') {
      console.warn(`Middleware: Unauthorized access attempt to ${pathname} by role ${session.role}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Coordinator path protection
    if (pathname.startsWith('/coordinator')) {
      if (session.role !== 'COORDINATOR' && session.role !== 'REGISTRY') { // Allow REGISTRY to view coordinator pages
        console.warn(`Middleware: Unauthorized role access attempt to ${pathname} by role ${session.role}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      // Ensure coordinator is accessing their own center's path
      if (session.role === 'COORDINATOR') {
        const pathParts = pathname.split('/'); // e.g., ['', 'coordinator', 'centerId', 'dashboard']
        if (pathParts.length > 2) {
          const centerIdFromUrl = pathParts[2];
          let coordinatorActualCenterId = null;
          if (session.dashboardPath && session.dashboardPath.startsWith('/coordinator/')) {
            const sessionPathParts = session.dashboardPath.split('/');
            if (sessionPathParts.length > 2) {
              coordinatorActualCenterId = sessionPathParts[2];
            }
          }
          if (centerIdFromUrl && coordinatorActualCenterId && centerIdFromUrl !== coordinatorActualCenterId) {
            console.warn(`Middleware: Coordinator ${session.userId} attempting to access unauthorized center ${centerIdFromUrl}. Their center is ${coordinatorActualCenterId}.`);
            return NextResponse.redirect(new URL(session.dashboardPath, request.url)); // Redirect to their own center
          }
        }
      }
    }

    // Lecturer path protection
    if (pathname.startsWith('/lecturer')) {
      if (session.role !== 'LECTURER' && session.role !== 'REGISTRY') { // Allow REGISTRY to view lecturer pages
        console.warn(`Middleware: Unauthorized role access attempt to ${pathname} by role ${session.role}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      // Ensure lecturer is accessing their own center's path
      if (session.role === 'LECTURER') {
         // Path structure: /lecturer/center/[centerId]/...
        if (pathname.startsWith('/lecturer/center/')) {
            const pathParts = pathname.split('/'); // e.g., ['', 'lecturer', 'center', 'centerId', 'dashboard']
            if (pathParts.length > 3) {
                const centerIdFromUrl = pathParts[3];
                let lecturerActualCenterId = null;
                 // Extract centerId from lecturer's dashboardPath (e.g., /lecturer/center/[centerId]/dashboard)
                if (session.dashboardPath && session.dashboardPath.startsWith('/lecturer/center/')) {
                    const sessionPathParts = session.dashboardPath.split('/');
                    if (sessionPathParts.length > 3) {
                        lecturerActualCenterId = sessionPathParts[3];
                    }
                }
                if (centerIdFromUrl && lecturerActualCenterId && centerIdFromUrl !== lecturerActualCenterId) {
                    console.warn(`Middleware: Lecturer ${session.userId} attempting to access unauthorized center ${centerIdFromUrl}. Their center is ${lecturerActualCenterId}.`);
                    return NextResponse.redirect(new URL(session.dashboardPath, request.url)); // Redirect to their own center's dashboard
                }
            }
        } else if (pathname === '/lecturer/assignment-pending' && session.dashboardPath !== '/lecturer/assignment-pending') {
            // If a lecturer who IS assigned tries to go to assignment-pending, send them to their dash
            return NextResponse.redirect(new URL(session.dashboardPath, request.url));
        }
      }
    }
    // Profile page is accessible to all logged-in users
    // No specific role check needed here unless you want to restrict /profile further

  } else { // 2. Handle Logged-Out Users
    // Define paths that require authentication
    const protectedPaths = [
      '/registry',
      '/coordinator',
      '/lecturer', // This now includes /lecturer/center/[centerId] and /lecturer/assignment-pending
      '/profile'
    ];

    // If trying to access a protected path without a session, redirect to login
    if (protectedPaths.some(path => pathname.startsWith(path))) {
      const loginUrl = new URL('/login', request.url);
      // Optional: Add a callbackUrl to redirect back after login
      // loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If none of the above conditions are met, proceed with the request
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
     * - image_feea5f.png (your logo file if in public root)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|uew.png).*)',
  ],
};
