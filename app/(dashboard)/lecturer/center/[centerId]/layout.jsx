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
    // Select necessary fields for UserProfileDropdown if it needs more than session
    select: { 
        lecturerCenterId: true,
        // Add other fields like name, email, image if UserProfileDropdown uses them directly from currentUser
        // name: true, 
        // email: true,
    }
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
    // Root: Full height, no scrolling for the layout itself
    <div className={`min-h-screen max-h-screen flex bg-gray-100 dark:bg-gray-900 ${inter.className} overflow-hidden`}>
      {/* Desktop Sidebar: Scrolls its own content if needed */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 p-4 shadow-lg border-r dark:border-gray-800 overflow-y-auto">
        <div className="mb-6">
          <Link 
            href={`/lecturer/center/${centerId}/dashboard`} 
            className="text-2xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Lecturer Panel
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate" title={centerName}>{centerName}</p>
        </div>
        
        {/* Navigation should grow and allow scrolling if items overflow the aside's height minus header/footer */}
        <nav className="flex-grow space-y-1">
          {navigationItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg px-4 py-2.5"
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-3 h-5 w-5 text-blue-500 dark:text-blue-400" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="mt-auto border-t dark:border-gray-700 pt-4">
          {/* Pass currentUser if UserProfileDropdown expects richer data, otherwise session is fine */}
          <UserProfileDropdown user={currentUser} session={session} />
        </div>
      </aside>

      {/* Mobile Sidebar (Fixed, handled by its own component as per your provided code) */}
      <LecturerMobileSidebar
        session={session}
        centerName={centerName}
        centerId={centerId}
        navigationItems={navigationItems}
        // Pass user={currentUser} if your mobile sidebar's UserProfileDropdown also needs it
      />

      {/* Main Content Area Wrapper: Takes remaining width, full height, no scrolling */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
        {/* Header: Sticky, fixed height */}
        <header className="bg-white dark:bg-gray-950 shadow-sm sticky top-0 z-20 border-b dark:border-gray-800 flex-shrink-0">
          <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8"> {/* Added justify-between */}
            {/* Mobile: Center Name (or leave space for mobile menu trigger if added here) */}
            <div className="md:hidden font-semibold text-gray-700 dark:text-white text-sm truncate">
              {centerName}
            </div>
            {/* Desktop: Placeholder for breadcrumbs or other header content */}
            <div className="hidden md:block">
              {/* You could add breadcrumbs or other info here */}
            </div>
            {/* User Profile Dropdown can be added here for mobile header if LecturerMobileSidebar doesn't handle it */}
            {/* <div className="md:hidden"> <UserProfileDropdown user={currentUser} session={session} /> </div> */}
          </div>
        </header>
        
        {/* Main Content: Takes remaining height, scrolls its own content */}
        <main className="flex-grow p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto bg-slate-50 dark:bg-gray-800/70">
          <div className="w-full max-w-7xl mx-auto"> {/* Constrains and centers children */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}