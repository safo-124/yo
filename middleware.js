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
    // Optionally, you could delete the corrupted cookie here if it becomes a recurring issue
    // const response = NextResponse.next();
    // response.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    // return null; // And then return null, or redirect to login
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
    const userDashboardPath = session.dashboardPath || '/profile'; // Fallback

    // If on an auth page (login/signup) but already logged in, redirect to their dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL(userDashboardPath, request.url));
    }

    // If on the homepage but their dashboard is elsewhere, redirect them
    if (isHomepage && userDashboardPath !== '/') {
      return NextResponse.redirect(new URL(userDashboardPath, request.url));
    }

    // Role-based access control for specific dashboard areas
    if (pathname.startsWith('/registry') && session.role !== 'REGISTRY') {
      console.warn(`Middleware: Unauthorized access attempt to ${pathname} by role ${session.role}. Expected REGISTRY.`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // STAFF_REGISTRY path protection: Allow STAFF_REGISTRY and REGISTRY roles
    if (pathname.startsWith('/staff-registry') && 
        session.role !== 'STAFF_REGISTRY' && 
        session.role !== 'REGISTRY'  // UPDATED: REGISTRY can also access staff-registry paths
    ) {
      console.warn(`Middleware: Unauthorized access attempt to ${pathname} by role ${session.role}. Expected STAFF_REGISTRY or REGISTRY.`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Coordinator path protection
    if (pathname.startsWith('/coordinator')) {
      if (session.role !== 'COORDINATOR' && session.role !== 'REGISTRY') {
        console.warn(`Middleware: Unauthorized role access attempt to ${pathname} by role ${session.role}. Expected COORDINATOR or REGISTRY.`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      // If the user is a Coordinator (not REGISTRY), verify they are accessing their own center's resources
      if (session.role === 'COORDINATOR') {
        const pathParts = pathname.split('/'); 
        // Expected path: /coordinator/[centerId]/...
        // pathParts: ['', 'coordinator', 'ACTUAL_CENTER_ID', ...]
        if (pathParts.length > 2 && pathParts[1] === 'coordinator') {
          const centerIdFromUrl = pathParts[2];
          let coordinatorActualCenterId = null;
          
          if (session.dashboardPath && session.dashboardPath.startsWith('/coordinator/')) {
            const sessionPathParts = session.dashboardPath.split('/');
            // dashboardPath is /coordinator/[centerId]/dashboard
            if (sessionPathParts.length > 2) { // Ensure enough parts (e.g. ['', 'coordinator', 'centerId', 'dashboard'])
              coordinatorActualCenterId = sessionPathParts[2];
            }
          }
          
          // Redirect if trying to access a different center's specific page,
          // unless it's a generic coordinator page like 'assignment-pending'.
          if (centerIdFromUrl && 
              centerIdFromUrl !== "assignment-pending" && // Allow access to generic pages
              coordinatorActualCenterId && 
              centerIdFromUrl !== coordinatorActualCenterId) {
            console.warn(`Middleware: Coordinator ${session.userId} attempting to access unauthorized center ${centerIdFromUrl}. Assigned to ${coordinatorActualCenterId}. Redirecting to own dashboard.`);
            return NextResponse.redirect(new URL(session.dashboardPath, request.url));
          }
        }
      }
    }

    // Lecturer path protection
    if (pathname.startsWith('/lecturer')) {
      if (session.role !== 'LECTURER' && session.role !== 'REGISTRY') {
        console.warn(`Middleware: Unauthorized role access attempt to ${pathname} by role ${session.role}. Expected LECTURER or REGISTRY.`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      // If the user is a Lecturer (not REGISTRY), verify they are accessing their own center's resources
      if (session.role === 'LECTURER') {
        if (pathname.startsWith('/lecturer/center/')) {
          const pathParts = pathname.split('/');
          // Expected path: /lecturer/center/[centerId]/...
          // pathParts: ['', 'lecturer', 'center', 'ACTUAL_CENTER_ID', ...]
          if (pathParts.length > 3) { 
            const centerIdFromUrl = pathParts[3];
            let lecturerActualCenterId = null;

            if (session.dashboardPath && session.dashboardPath.startsWith('/lecturer/center/')) {
                const sessionPathParts = session.dashboardPath.split('/');
                if (sessionPathParts.length > 3) {
                    lecturerActualCenterId = sessionPathParts[3];
                }
            }
            if (centerIdFromUrl && 
                lecturerActualCenterId && 
                centerIdFromUrl !== lecturerActualCenterId) {
                console.warn(`Middleware: Lecturer ${session.userId} attempting to access unauthorized center ${centerIdFromUrl}. Assigned to ${lecturerActualCenterId}. Redirecting to own dashboard.`);
                return NextResponse.redirect(new URL(session.dashboardPath, request.url));
            }
          }
        } else if (pathname === '/lecturer/assignment-pending' && session.dashboardPath !== '/lecturer/assignment-pending') {
            // If a lecturer has an assigned center, don't let them access assignment-pending
            return NextResponse.redirect(new URL(session.dashboardPath, request.url));
        }
      }
    }

  } else { // 2. Handle Logged-Out Users
    const protectedPaths = [
      '/registry',
      '/coordinator',
      '/lecturer',
      '/staff-registry',
      '/profile'
      // Add any other paths that require authentication
    ];

    if (protectedPaths.some(path => pathname.startsWith(path))) {
      const loginUrl = new URL('/login', request.url);
      // Optionally add a callbackUrl to redirect back after login
      // loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
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
     * - Any other public files or paths
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|uew.png).*)',
  ],
};