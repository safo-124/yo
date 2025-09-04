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
        session.role !== 'REGISTRY'
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
        if (pathParts.length > 2 && pathParts[1] === 'coordinator') {
          const centerIdFromUrl = pathParts[2];
          let coordinatorActualCenterId = null;
          
          if (session.dashboardPath && session.dashboardPath.startsWith('/coordinator/')) {
            const sessionPathParts = session.dashboardPath.split('/');
            if (sessionPathParts.length > 2) {
              coordinatorActualCenterId = sessionPathParts[2];
            }
          }
          
          if (centerIdFromUrl && 
              centerIdFromUrl !== "assignment-pending" &&
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
      console.log(`[MIDDLEWARE] Lecturer path access: ${pathname}, Role: ${session.role}, DashboardPath: ${session.dashboardPath}`);
      
      // VVVV THIS IS THE LINE WE ARE FIXING VVVV
      if (session.role !== 'LECTURER' && session.role !== 'REGISTRY' && session.role !== 'COORDINATOR') {
        console.warn(`Middleware: Unauthorized role access attempt to ${pathname} by role ${session.role}. Expected LECTURER, REGISTRY, or COORDINATOR.`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
      // If the user is a Lecturer (not REGISTRY or COORDINATOR), verify they are accessing their own center's resources
      if (session.role === 'LECTURER') {
        if (pathname.startsWith('/lecturer/center/')) {
          const pathParts = pathname.split('/');
          if (pathParts.length > 3) { 
            const centerIdFromUrl = pathParts[3];
            let lecturerActualCenterId = null;

            if (session.dashboardPath && session.dashboardPath.startsWith('/lecturer/center/')) {
                const sessionPathParts = session.dashboardPath.split('/');
                if (sessionPathParts.length > 3) {
                    lecturerActualCenterId = sessionPathParts[3];
                }
            }
            
            console.log(`[MIDDLEWARE] Center ID validation - URL: ${centerIdFromUrl}, Session: ${lecturerActualCenterId}`);
            
            if (centerIdFromUrl && 
                lecturerActualCenterId && 
                centerIdFromUrl !== lecturerActualCenterId) {
                console.warn(`Middleware: Lecturer ${session.userId} attempting to access unauthorized center ${centerIdFromUrl}. Assigned to ${lecturerActualCenterId}. Redirecting to own dashboard.`);
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
      '/staff-registry',
      '/profile'
    ];

    if (protectedPaths.some(path => pathname.startsWith(path))) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|uew.png).*)',
  ],
};