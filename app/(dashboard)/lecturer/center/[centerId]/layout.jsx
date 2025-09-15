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
  const { centerId } = await params;

  if (!session?.userId) redirect('/login');
  if (session.role !== 'LECTURER' && session.role !== 'COORDINATOR') redirect('/unauthorized');

  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { 
        lecturerCenterId: true,
        lecturerCourseAssignments: {
          include: {
            course: {
              include: {
                program: {
                  include: {
                    departmentAssignments: {
                      include: {
                        department: {
                          include: {
                            centerAssignments: {
                              include: {
                                center: {
                                  select: { id: true }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
    }
  });

  // For lecturers, verify they're accessing their assigned center
  if (session.role === 'LECTURER') {
    let assignedCenterId = currentUser?.lecturerCenterId;
    
    // If no direct center assignment, check course assignments
    if (!assignedCenterId && currentUser?.lecturerCourseAssignments?.length > 0) {
      const firstAssignment = currentUser.lecturerCourseAssignments[0];
      const departmentAssignments = firstAssignment.course.program.departmentAssignments;
      
      if (departmentAssignments?.length > 0) {
        const centerAssignments = departmentAssignments[0].department.centerAssignments;
        if (centerAssignments?.length > 0) {
          assignedCenterId = centerAssignments[0].center.id;
        }
      }
    }
    
    if (assignedCenterId && assignedCenterId !== centerId) {
      redirect(`/lecturer/center/${assignedCenterId}/dashboard`);
    } else if (!assignedCenterId) {
      redirect('/lecturer/assignment-pending');
    }
  }
  
  // For coordinators, verify if this center is their assigned center
  if (session.role === 'COORDINATOR') {
    const coordinatorCenter = await prisma.center.findUnique({
      where: {
        id: centerId,
        coordinatorId: session.userId,
      },
      select: { id: true }
    });
    
    if (!coordinatorCenter) {
      redirect('/unauthorized?error=coordinator_center_mismatch');
    }
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
    <div className={`min-h-screen max-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/5 ${inter.className} overflow-hidden`}>
      {/* Enhanced Desktop Sidebar with Glassmorphism */}
      <aside className="hidden md:flex w-64 flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50 shadow-2xl shadow-blue-500/5 dark:shadow-blue-500/10 overflow-y-auto">
        <div className="p-6 border-b border-white/20 dark:border-slate-700/30">
          <Link 
            href={`/lecturer/center/${centerId}/dashboard`} 
            className="flex items-center gap-3 group transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-300">
                Lecturer Panel
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate" title={centerName}>
                {centerName}
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
          <UserProfileDropdown user={currentUser} session={session} />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <LecturerMobileSidebar
        session={session}
        centerName={centerName}
        centerId={centerId}
        navigationItems={navigationItems}
      />

      {/* Enhanced Main Content Area */}
      <div className="flex-1 flex flex-col bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm overflow-hidden">
        {/* Enhanced Header with Glassmorphism */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10 sticky top-0 z-20 flex-shrink-0">
          <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile: Center Name */}
            <div className="md:hidden flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">
                  Lecturer Panel
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {centerName}
                </p>
              </div>
            </div>
            
            {/* Desktop: Header Content */}
            <div className="hidden md:flex items-center gap-4 flex-1">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20 rounded-xl">
                <LayoutDashboard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {centerName}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Lecturer Dashboard
                </p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Enhanced Main Content */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gradient-to-br from-white/20 via-slate-50/40 to-blue-50/20 dark:from-slate-800/20 dark:via-slate-700/30 dark:to-blue-900/10">
          <div className="w-full max-w-7xl mx-auto">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/5 dark:shadow-blue-500/10 border border-white/20 dark:border-slate-700/50 p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}