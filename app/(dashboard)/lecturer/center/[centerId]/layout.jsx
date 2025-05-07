// app/(dashboard)/lecturer/center/[centerId]/layout.jsx
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import prisma from '@/lib/prisma'; // To fetch center name for display
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FilePlus, History } from 'lucide-react';
import UserProfileDropdown from '@/app/(dashboard)/UserProfileDropdown';


const inter = Inter({ subsets: ['latin'] });

export default async function LecturerCenterLayout({ children, params }) {
  const session = await getSession();
  const { centerId } = params; // Get centerId from the URL

  if (!session?.userId) {
    redirect('/login');
  }

  if (session.role !== 'LECTURER') {
    console.warn(`Unauthorized access attempt to lecturer (center) dashboard by role: ${session.role}`);
    redirect('/unauthorized');
  }

  // Verify that the logged-in lecturer actually belongs to this centerId
  // Fetch the user again to get their lecturerCenterId to compare
  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { lecturerCenterId: true }
  });

  if (currentUser?.lecturerCenterId !== centerId) {
    console.warn(`Lecturer ${session.userId} attempted to access unauthorized center ${centerId}. Their assigned center is ${currentUser?.lecturerCenterId}.`);
    // Redirect to their actual center's dashboard or an unauthorized page
    if (currentUser?.lecturerCenterId) {
      redirect(`/lecturer/center/${currentUser.lecturerCenterId}/dashboard`);
    } else {
      redirect('/lecturer/assignment-pending'); // If they aren't assigned to any center
    }
  }

  // Fetch center name for display in the layout
  let centerName = "Your Center";
  try {
    const center = await prisma.center.findUnique({
      where: { id: centerId },
      select: { name: true }
    });
    if (center) {
      centerName = center.name;
    }
  } catch (error) {
    console.error("Error fetching center name for lecturer layout:", error);
  }

  const navigationItems = [
    { name: 'Dashboard', href: `/lecturer/center/${centerId}/dashboard`, icon: LayoutDashboard },
    { name: 'Submit Claim', href: `/lecturer/center/${centerId}/submit-claim`, icon: FilePlus },
    { name: 'My Claims', href: `/lecturer/center/${centerId}/my-claims`, icon: History },
  ];

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-800 ${inter.className} flex`}>
      <aside className="w-64 bg-white dark:bg-gray-900 shadow-md p-4 flex flex-col">
        <div className="mb-6">
          <Link href={`/lecturer/center/${centerId}/dashboard`} className="text-2xl font-semibold text-gray-800 dark:text-white">
            Lecturer Panel
          </Link>
          <p className="text-sm text-muted-foreground">{centerName}</p>
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
         {session && <UserProfileDropdown session={session} />}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>{/* Breadcrumbs or page title can go here */}</div>
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
