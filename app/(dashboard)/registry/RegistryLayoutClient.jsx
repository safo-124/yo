'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  UserCheck as UserCheckIcon,
  Menu as MenuIcon, // Renamed for clarity
  ClipboardList,
  ShieldCheck 
} from 'lucide-react';
import UserProfileDropdown from '../UserProfileDropdown'; 
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'; // Added SheetDescription
import { ScrollArea } from '@/components/ui/scroll-area';

// Color palette: Red-800, Blue-800, Violet-800, White

export default function RegistryLayoutClient({ session, children }) {
  const navigationItems = [
    { name: 'Overview', href: '/registry', icon: LayoutDashboard },
    { name: 'Manage Users', href: '/registry/users', icon: Users },
    { name: 'Manage Centers', href: '/registry/centers', icon: Building },
    { name: 'System Claims', href: '/registry/claims', icon: FileText },
    { name: 'Summaries', href: '/registry/summaries', icon: ClipboardList },
    { name: 'Courses', href: '/registry/courses', icon: ClipboardList },
    { name: 'Signup Requests', href: '/registry/requests', icon: UserCheckIcon },
  ];

  // SidebarContent is now consistently styled for a dark gradient background
  const SidebarContent = () => (
    <div className="h-full flex flex-col text-white"> {/* Base text white for content */}
      <div className="p-4 mb-2 border-b border-white/10"> {/* Reduced bottom margin */}
        <Link href="/registry" className="flex items-center gap-2.5 text-xl font-semibold text-white hover:text-slate-100 transition-colors">
          <ShieldCheck className="h-7 w-7 text-violet-300" />
          Registry Panel
        </Link>
        <p className="text-xs text-blue-200/80 mt-1">Super Administrator</p>
      </div>
      
      <ScrollArea className="flex-grow">
        <nav className="space-y-1 px-3 py-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start px-3 py-2.5 h-auto text-sm font-medium rounded-md text-slate-100 hover:bg-white/10 hover:text-white focus-visible:bg-white/15 focus-visible:text-white transition-colors duration-150"
                asChild
              >
                <Link href={item.href} className="flex items-center">
                  <IconComponent className="mr-3 h-[18px] w-[18px] text-blue-300/90 group-hover:text-blue-200" />
                  <span>{item.name}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="mt-auto border-t border-white/10 p-3">
        {/* Assuming UserProfileDropdown can adapt to dark background or has a userTheme="dark" prop */}
        {session && <UserProfileDropdown session={session} userTheme="dark" />} 
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="flex md:hidden items-center justify-between p-2.5 sm:p-3 bg-gradient-to-r from-blue-800 to-violet-800 shadow-md text-white sticky top-0 z-40 print:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 focus-visible:bg-white/15">
              <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          {/* SheetContent now includes SheetHeader for accessibility */}
          <SheetContent 
            side="left" 
            className="p-0 w-64 sm:w-72 border-r-0 bg-gradient-to-b from-blue-800 to-violet-800 flex flex-col print:hidden" // Added flex flex-col
          >
            <SheetHeader className="p-4 border-b border-white/10 flex-shrink-0">
              <SheetTitle className="flex items-center gap-2.5 text-xl font-semibold text-white">
                <ShieldCheck className="h-7 w-7 text-violet-300" />
                Registry Menu
              </SheetTitle>
              <SheetDescription className="text-blue-200/80 text-xs text-left"> 
                {/* text-left to override potential SheetDescription centering */}
                Super Administrator Panel
              </SheetDescription>
            </SheetHeader>
            {/* SidebarContent is rendered in the remaining space and handles its own scroll */}
            <div className="flex-grow overflow-y-auto"> {/* Wrapper for SidebarContent to make it scroll */}
                <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/registry" className="text-lg sm:text-xl font-semibold text-white">
          Registry
        </Link>
        <div className="w-10 h-10"> {/* Spacer, or for UserProfileDropdown on mobile header */}
             {/* <UserProfileDropdown session={session} userTheme="dark" /> */}
        </div>
      </div>

      {/* Sidebar on desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gradient-to-b from-blue-800 to-violet-800 shadow-lg print:hidden">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-grow p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}