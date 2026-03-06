// app/(dashboard)/coordinator/[centerId]/layout.jsx
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Home, Users, FileText, Building, BookUser, Send } from 'lucide-react'; // <-- ADDED 'Send' ICON
import UserProfileDropdown from '../../UserProfileDropdown';
import { MobileSidebar } from './_components/MobileSidebar';

const inter = Inter({ subsets: ['latin'] });

export default async function CoordinatorLayout({ children, params }) {
  const session = await getSession();
  const { centerId } = await params;

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
    { name: 'Assignments', href: `/coordinator/${centerId}/assignments`, icon: 'BookUser' },
    { name: 'Claims', href: `/coordinator/${centerId}/claims`, icon: 'FileText' },
    { name: 'Submit Claim', href: `/lecturer/center/${centerId}/submit-claim`, icon: 'Send' },
  ];

  const iconMap = { Home, Building, Users, BookUser, FileText, Send };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/5 ${inter.className} flex flex-col lg:flex-row`}>
      {/* Mobile Sidebar */}
      <MobileSidebar
        centerDetails={centerDetails}
        navigationItems={navigationItems}
        session={session}
        UserProfileDropdown={UserProfileDropdown}
      />

      {/* Enhanced Desktop Sidebar with Glassmorphism */}
      <aside className="hidden lg:flex w-64 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50 shadow-2xl shadow-blue-500/5 dark:shadow-blue-500/10 flex-col fixed h-full overflow-y-auto">
        <div className="p-6 border-b border-white/20 dark:border-slate-700/30">
          <Link 
            href={`/coordinator/${centerId}`} 
            className="flex items-center gap-3 group transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-300">
                {centerDetails.name || "Center Dashboard"}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Coordinator Panel
              </p>
            </div>
          </Link>
        </div>
        
        {/* Enhanced Navigation */}
        <nav className="flex-grow p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 hover:text-blue-700 dark:hover:text-blue-300 rounded-xl px-4 py-3 h-auto transition-all duration-200 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/10 group"
                asChild
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg group-hover:from-blue-200 group-hover:to-indigo-200 dark:group-hover:from-blue-800/70 dark:group-hover:to-indigo-800/70 transition-all duration-200">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
        
        {/* Enhanced Profile Section */}
        <div className="p-4 mt-auto border-t border-white/20 dark:border-slate-700/30 bg-gradient-to-r from-white/40 to-blue-50/40 dark:from-slate-800/40 dark:to-blue-900/20 backdrop-blur-sm">
          <UserProfileDropdown session={session} className="text-slate-700 dark:text-slate-300" />
        </div>
      </aside>

      {/* Enhanced Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Enhanced Header with Glassmorphism */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10 sticky top-0 z-20 h-16 lg:hidden">
          <div className="h-full flex items-center justify-between px-4 sm:px-6">
            {/* Mobile Header Content */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Building className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">
                  Coordinator Panel
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {centerDetails.name}
                </p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Enhanced Main Content */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gradient-to-br from-white/20 via-slate-50/40 to-blue-50/20 dark:from-slate-800/20 dark:via-slate-700/30 dark:to-blue-900/10">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}