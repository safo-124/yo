import { Inter } from 'next/font/google';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FilePlus, History } from 'lucide-react';
import UserProfileDropdown from '@/app/(dashboard)/UserProfileDropdown';
import LecturerMobileSidebar from '@/components/LecturerMobileSidebar';

const inter = Inter({ subsets: ['latin'] });

export default async function LecturerCenterLayout({ children, params }) {
  const session = await getSession();
  const { centerId } = params;

  if (!session?.userId) redirect('/login');
  if (session.role !== 'LECTURER') redirect('/unauthorized');

  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { lecturerCenterId: true }
  });

  if (currentUser?.lecturerCenterId !== centerId) {
    currentUser?.lecturerCenterId 
      ? redirect(`/lecturer/center/${currentUser.lecturerCenterId}/dashboard`)
      : redirect('/lecturer/assignment-pending');
  }

  let centerName = "Your Center";
  try {
    const center = await prisma.center.findUnique({
      where: { id: centerId },
      select: { name: true }
    });
    if (center) centerName = center.name;
  } catch (error) {
    console.error("Error fetching center name:", error);
  }

  const navigationItems = [
    { name: 'Dashboard', href: `/lecturer/center/${centerId}/dashboard`, icon: 'LayoutDashboard' },
    { name: 'Submit Claim', href: `/lecturer/center/${centerId}/submit-claim`, icon: 'FilePlus' },
    { name: 'My Claims', href: `/lecturer/center/${centerId}/my-claims`, icon: 'History' },
  ];

  const iconMap = { LayoutDashboard, FilePlus, History };

  return (
    <div className={`min-h-screen flex ${inter.className}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white text-gray-800 p-4 shadow-lg border-r">
        <div className="mb-6">
          <Link 
            href={`/lecturer/center/${centerId}/dashboard`} 
            className="text-2xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            Lecturer Panel
          </Link>
          <p className="text-sm text-gray-600 mt-1">{centerName}</p>
        </div>
        
        <nav className="flex-grow space-y-1">
          {navigationItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg px-4 py-2.5"
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-3 h-5 w-5 text-blue-500" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="mt-auto border-t pt-4">
          <UserProfileDropdown session={session} />
        </div>
      </aside>

      <LecturerMobileSidebar
        session={session}
        centerName={centerName}
        centerId={centerId}
        navigationItems={navigationItems}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="h-16 flex items-center px-4 sm:px-6 lg:px-8">
            <div className="md:hidden font-medium text-gray-700">{centerName}</div>
          </div>
        </header>
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}