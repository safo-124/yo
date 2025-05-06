// app/(dashboard)/coordinator/[centerId]/layout.jsx
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import prisma from '@/lib/prisma'; // For verifying coordinator's center
import { Button } from '@/components/ui/button';
import { Home, Users, FileText, Building, LogOut } from 'lucide-react'; // Icons for navigation

// UserProfileDropdown would be the same as used in the main DashboardLayout
// For simplicity, we might include a simpler logout here or reuse UserProfileDropdown if preferred
// For now, let's add a simple logout directly.
import { logoutUser } from '@/lib/actions/auth.actions';
import UserProfileDropdown from '../../UserProfileDropdown'; // Adjust path if UserProfileDropdown is elsewhere

const inter = Inter({ subsets: ['latin'] });

export default async function CoordinatorLayout({ children, params }) {
  const session = await getSession();
  const { centerId } = params; // Get centerId from the URL parameters

  if (!session?.userId) {
    redirect('/login');
  }

  if (session.role !== 'COORDINATOR') {
    console.warn(`Unauthorized access attempt to coordinator dashboard by role: ${session.role}`);
    redirect('/unauthorized'); // Or to a generic dashboard
  }

  // Verify that the logged-in coordinator is the coordinator of THIS specific center
  let centerDetails = null;
  try {
    centerDetails = await prisma.center.findUnique({
      where: {
        id: centerId,
        coordinatorId: session.userId, // Crucial check
      },
      select: {
        id: true,
        name: true,
      }
    });
  } catch (error) {
    console.error("Error fetching center details for coordinator layout:", error);
    // Handle error appropriately, maybe redirect to an error page or /
    redirect('/?error=center_fetch_failed');
  }

  if (!centerDetails) {
    console.warn(`Coordinator ${session.userId} attempted to access unauthorized center ${centerId}.`);
    redirect('/unauthorized?error=center_mismatch'); // Or to their actual center if discoverable
  }

  const navigationItems = [
    { name: 'Overview', href: `/coordinator/${centerId}`, icon: Home },
    { name: 'Departments', href: `/coordinator/${centerId}/departments`, icon: Building },
    { name: 'Lecturers', href: `/coordinator/${centerId}/lecturers`, icon: Users },
    { name: 'Claims', href: `/coordinator/${centerId}/claims`, icon: FileText },
  ];

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-800 ${inter.className} flex`}>
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-gray-900 shadow-md p-4 flex flex-col">
        <div className="mb-6">
          <Link href={`/coordinator/${centerId}`} className="text-2xl font-semibold text-gray-800 dark:text-white">
            {centerDetails.name || "Center Dashboard"}
          </Link>
          <p className="text-sm text-muted-foreground">Coordinator Panel</p>
        </div>
        <nav className="flex-grow space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="mt-auto">
          {/* User profile and logout - reusing UserProfileDropdown */}
          {session && <UserProfileDropdown session={session} />}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>{/* Can add breadcrumbs or page title here */}</div>
              {/* Header elements specific to coordinator view, if any */}
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Your Application Name. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
