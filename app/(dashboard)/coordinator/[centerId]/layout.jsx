// app/(dashboard)/coordinator/[centerId]/layout.jsx
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Home, Users, FileText, Building } from 'lucide-react';
import UserProfileDropdown from '../../UserProfileDropdown';
import { MobileSidebar } from './_components/MobileSidebar';

const inter = Inter({ subsets: ['latin'] });

export default async function CoordinatorLayout({ children, params }) {
  const session = await getSession();
  const { centerId } = params;

  if (!session?.userId) {
    redirect('/login');
  }

  if (session.role !== 'COORDINATOR') {
    console.warn(`Unauthorized access attempt to coordinator dashboard by role: ${session.role}`);
    redirect('/unauthorized');
  }

  let centerDetails = null;
  try {
    centerDetails = await prisma.center.findUnique({
      where: {
        id: centerId,
        coordinatorId: session.userId,
      },
      select: {
        id: true,
        name: true,
      }
    });
  } catch (error) {
    console.error("Error fetching center details for coordinator layout:", error);
    redirect('/?error=center_fetch_failed');
  }

  if (!centerDetails) {
    console.warn(`Coordinator ${session.userId} attempted to access unauthorized center ${centerId}.`);
    redirect('/unauthorized?error=center_mismatch');
  }

  const navigationItems = [
    { name: 'Overview', href: `/coordinator/${centerId}`, icon: 'Home' },
    { name: 'Departments', href: `/coordinator/${centerId}/departments`, icon: 'Building' },
    { name: 'Lecturers', href: `/coordinator/${centerId}/lecturers`, icon: 'Users' },
    { name: 'Claims', href: `/coordinator/${centerId}/claims`, icon: 'FileText' },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${inter.className} flex flex-col lg:flex-row`}>
      {/* Mobile Sidebar */}
      <MobileSidebar
        centerDetails={centerDetails}
        navigationItems={navigationItems}
        session={session}
        UserProfileDropdown={UserProfileDropdown}
      />

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 bg-gradient-to-b from-blue-900 to-blue-700 text-white p-4 flex-col fixed h-full">
        <div className="mb-8">
          <Link href={`/coordinator/${centerId}`} className="text-2xl font-semibold text-white">
            {centerDetails.name || "Center Dashboard"}
          </Link>
          <p className="text-sm text-blue-200">Coordinator Panel</p>
        </div>
        
        <nav className="flex-grow space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-800 hover:text-white"
              asChild
            >
              <Link href={item.href}>
                {item.icon === 'Home' && <Home className="mr-3 h-5 w-5" />}
                {item.icon === 'Building' && <Building className="mr-3 h-5 w-5" />}
                {item.icon === 'Users' && <Users className="mr-3 h-5 w-5" />}
                {item.icon === 'FileText' && <FileText className="mr-3 h-5 w-5" />}
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
        
        <div className="mt-auto">
          <UserProfileDropdown session={session} className="text-white" />
        </div>
      </aside>

      {/* Main Content Area - Now takes about 80% width */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Empty header for mobile to maintain spacing */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 lg:hidden h-16" />
        
        <main className="flex-grow mx-auto p-4 sm:p-6 lg:p-8 w-full max-w-[80vw]">
          {children}
        </main>
        
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm max-w-[80vw]">
            © {new Date().getFullYear()} Your Application Name. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}