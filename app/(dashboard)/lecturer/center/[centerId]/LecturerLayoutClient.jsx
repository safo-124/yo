'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FilePlus,
  History,
  Menu as MenuIcon,
  ChevronRight,
  Home,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import UserProfileDropdown from '@/app/(dashboard)/UserProfileDropdown';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function LecturerLayoutClient({ session, centerName, centerId, children }) {
  const pathname = usePathname();

  const navigationGroups = [
    {
      label: 'Main',
      items: [
        { name: 'Dashboard', href: `/lecturer/center/${centerId}/dashboard`, icon: LayoutDashboard, description: 'Overview & stats' },
      ],
    },
    {
      label: 'Claims',
      items: [
        { name: 'Submit Claim', href: `/lecturer/center/${centerId}/submit-claim`, icon: FilePlus, description: 'File a new claim' },
        { name: 'My Claims', href: `/lecturer/center/${centerId}/my-claims`, icon: History, description: 'Track submitted claims' },
      ],
    },
  ];

  const isActiveRoute = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col text-white">
      {/* Header Section */}
      <div className="p-6 mb-4 border-b border-white/20">
        <Link href={`/lecturer/center/${centerId}/dashboard`} className="group flex items-center gap-3 text-xl font-bold text-white hover:text-emerald-100 transition-all duration-200">
          <div className="relative">
            <GraduationCap className="h-8 w-8 text-emerald-200 group-hover:text-emerald-100 transition-colors" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight">Lecturer Panel</span>
            <span className="text-xs text-emerald-200/90 font-normal truncate max-w-[180px]">{centerName}</span>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-grow px-4">
        <nav className="space-y-6 pb-4">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              {/* Group Label */}
              <div className="flex items-center gap-2 px-3 py-2 mb-3">
                <span className="text-xs font-semibold text-emerald-200/80 uppercase tracking-wider">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Group Items */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = isActiveRoute(item.href);

                  return (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className={`w-full justify-start px-3 py-3 h-auto rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-white/20 text-white shadow-lg border border-white/30 hover:bg-white/25'
                          : 'text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                      asChild
                    >
                      <Link href={item.href} className="flex items-center">
                        <IconComponent
                          className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                            isActive ? 'text-emerald-200' : 'text-emerald-300/80 group-hover:text-emerald-200'
                          }`}
                        />
                        <div className="flex-1 flex flex-col items-start">
                          <span className="font-medium">{item.name}</span>
                          {item.description && (
                            <span className="text-xs text-slate-300/70 mt-0.5 leading-tight">
                              {item.description}
                            </span>
                          )}
                        </div>
                        {isActive && <ChevronRight className="ml-2 h-4 w-4 text-emerald-200" />}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer Section */}
      <div className="mt-auto border-t border-white/20 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-200 font-medium">System Online</span>
        </div>
        {session && <UserProfileDropdown session={session} userTheme="dark" />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex flex-col md:flex-row">
      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center justify-between p-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 shadow-xl text-white sticky top-0 z-50 print:hidden backdrop-blur-sm">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 focus-visible:bg-white/25 rounded-lg transition-all duration-200">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-80 border-r-0 bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 flex flex-col print:hidden shadow-2xl"
          >
            <SheetHeader className="p-6 border-b border-white/20 flex-shrink-0">
              <SheetTitle className="flex items-center gap-3 text-xl font-bold text-white">
                <div className="relative">
                  <GraduationCap className="h-8 w-8 text-emerald-200" />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
                </div>
                <div className="flex flex-col text-left">
                  <span>Lecturer Panel</span>
                  <span className="text-xs text-emerald-200/90 font-normal">Mobile Menu</span>
                </div>
              </SheetTitle>
              <SheetDescription className="text-emerald-200/80 text-sm text-left">
                {centerName} - {session?.name || 'Lecturer'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-grow overflow-y-auto">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile Header */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold leading-tight truncate max-w-[200px]">{centerName}</span>
            <span className="text-xs text-emerald-200/90">Lecturer</span>
          </div>
          <GraduationCap className="h-6 w-6 text-emerald-200" />
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
          <UserProfileDropdown session={session} userTheme="dark" />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-80 bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 shadow-2xl print:hidden border-r border-white/10">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto bg-gradient-to-br from-white via-slate-50/50 to-slate-100/80 dark:from-slate-900 dark:via-slate-800/50 dark:to-gray-900/80">
          <div className="w-full">
            {/* Breadcrumb Bar */}
            <div className="mb-6 hidden md:block">
              <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Lecturer</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                    {pathname.includes('/submit-claim') ? 'Submit Claim' 
                      : pathname.includes('/my-claims') ? 'My Claims'
                      : 'Dashboard'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
                    System Online
                  </Badge>
                  <Separator orientation="vertical" className="h-6" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Welcome, {session?.name || 'Lecturer'}
                  </span>
                </div>
              </div>
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
