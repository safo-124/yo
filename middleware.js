// middleware.js
import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'app_session'; // Must match the name used in auth.actions.js

async function getSessionFromRequest(request) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    return null;
  }
  try {
    return JSON.parse(sessionCookie.value); 
  } catch (error) {
    console.error('Middleware: Failed to parse session cookie:', error);
    // Consider deleting the corrupted cookie if this happens often
    // const response = NextResponse.next();
    // response.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    // And then decide to return null or redirect
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
    // Ensure dashboardPath is set in your auth.actions.js upon login for each role
    // e.g., /registry, /coordinator/center/[id], /lecturer/center/[id], /staff-registry
    const userDashboardPath = session.dashboardPath || '/profile'; // Fallback

    if (isAuthPage) {
      return NextResponse.redirect(new URL(userDashboardPath, request.url));
    }

    if (isHomepage && userDashboardPath !== '/') {
      return NextResponse.redirect(new URL(userDashboardPath, request.url));
    }

    // Role-based access control
    if (pathname.startsWith('/registry') && session.role !== 'REGISTRY') {
      console.warn(`Middleware: Unauthorized access attempt to ${pathname} by role ${session.role}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // STAFF_REGISTRY path protection
    if (pathname.startsWith('/staff-registry') && session.role !== 'STAFF_REGISTRY') {
        // Only STAFF_REGISTRY users can access /staff-registry paths.
        // REGISTRY users would use their own /registry views.
        console.warn(`Middleware: Unauthorized access attempt to ${pathname} by role ${session.role}. Expected STAFF_REGISTRY.`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Coordinator path protection
    if (pathname.startsWith('/coordinator')) {
      if (session.role !== 'COORDINATOR' && session.role !== 'REGISTRY') {
        console.warn(`Middleware: Unauthorized role access attempt to ${pathname} by role ${session.role}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (session.role === 'COORDINATOR') {
        const pathParts = pathname.split('/'); 
        if (pathParts.length > 2 && pathParts[1] === 'coordinator') { // Path like /coordinator/[centerId]/...
          const centerIdFromUrl = pathParts[2];
          let coordinatorActualCenterId = null;
          if (session.dashboardPath && session.dashboardPath.startsWith('/coordinator/')) {
            const sessionPathParts = session.dashboardPath.split('/');
            if (sessionPathParts.length > 2) {
              coordinatorActualCenterId = sessionPathParts[2];
            }
          }
          // If dashboardPath doesn't conform, or if centerId is different and not 'center' literal for generic coordinator path
          if (centerIdFromUrl && centerIdFromUrl !== "center" && coordinatorActualCenterId && centerIdFromUrl !== coordinatorActualCenterId) {
            console.warn(`Middleware: Coordinator ${session.userId} attempting to access unauthorized center ${centerIdFromUrl}. Their center is ${coordinatorActualCenterId}.`);
            return NextResponse.redirect(new URL(session.dashboardPath, request.url));
          }
        }
      }
    }

    // Lecturer path protection
    if (pathname.startsWith('/lecturer')) {
      if (session.role !== 'LECTURER' && session.role !== 'REGISTRY') {
        console.warn(`Middleware: Unauthorized role access attempt to ${pathname} by role ${session.role}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (session.role === 'LECTURER') {
        if (pathname.startsWith('/lecturer/center/')) {
          const pathParts = pathname.split('/');
          if (pathParts.length > 3) { // ['', 'lecturer', 'center', 'centerId', ...]
              const centerIdFromUrl = pathParts[3];
              let lecturerActualCenterId = null;
              if (session.dashboardPath && session.dashboardPath.startsWith('/lecturer/center/')) {
                  const sessionPathParts = session.dashboardPath.split('/');
                  if (sessionPathParts.length > 3) {
                      lecturerActualCenterId = sessionPathParts[3];
                  }
              }
              if (centerIdFromUrl && lecturerActualCenterId && centerIdFromUrl !== lecturerActualCenterId) {
                  console.warn(`Middleware: Lecturer ${session.userId} attempting to access unauthorized center ${centerIdFromUrl}. Their center is ${lecturerActualCenterId}.`);
                  return NextResponse.redirect(new URL(session.dashboardPath, request.url));
              }
          }
        } else if (pathname === '/lecturer/assignment-pending' && session.dashboardPath !== '/lecturer/assignment-pending') {
            return NextResponse.redirect(new URL(session.dashboardPath, request.url));
        }
      }
    }

  } else { // 2. Handle Logged-Out Users
    const protectedPaths = [
      '/registry',
      '/coordinator',
      '/lecturer',
      '/staff-registry', // Added staff-registry to protected paths
      '/profile'
    ];

    if (protectedPaths.some(path => pathname.startsWith(path))) {
      const loginUrl = new URL('/login', request.url);
      // loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search); // Add callback for better UX
      return NextResponse.redirect(loginUrl);
    }
  }

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
     * - assets/ (if you have a public assets folder, e.g., public/assets)
     * - uew.png (your logo file if in public root)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|uew.png).*)',
  ],
};