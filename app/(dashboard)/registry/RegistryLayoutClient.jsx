'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  UserCheck as UserCheckIcon,
  Menu,
  ClipboardList,
  ShieldCheck // Added for Panel title
} from 'lucide-react';
import UserProfileDropdown from '../UserProfileDropdown'; // Assuming path is correct relative to app/(dashboard)/
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'; // Added SheetFooter
import { ScrollArea } from '@/components/ui/scroll-area'; // For sidebar content

// Color palette to use: Red-800, Blue-800, Violet-800, White

export default function RegistryLayoutClient({ session, children }) {
  const navigationItems = [
    { name: 'Overview', href: '/registry', icon: LayoutDashboard },
    { name: 'Manage Users', href: '/registry/users', icon: Users },
    { name: 'Manage Centers', href: '/registry/centers', icon: Building },
    { name: 'System Claims', href: '/registry/claims', icon: FileText },
    { name: 'Summaries', href: '/registry/summaries', icon: ClipboardList },
    { name: 'Signup Requests', href: '/registry/requests', icon: UserCheckIcon },
  ];

  const SidebarContent = ({ isMobile = false }) => (
    <div className="h-full flex flex-col">
      {/* Panel Title - slightly different styling for mobile sheet vs desktop */}
      <div className={`${isMobile ? 'p-4 border-b border-white/10' : 'p-4 mb-4'}`}>
        <Link href="/registry" className="flex items-center gap-2.5 text-xl font-semibold text-white hover:text-slate-100 transition-colors">
          <ShieldCheck className="h-7 w-7 text-violet-300" />
          Registry Panel
        </Link>
        {!isMobile && <p className="text-xs text-blue-200/80 mt-1">Super Administrator</p>}
      </div>
      
      <ScrollArea className="flex-grow"> {/* Make nav scrollable */}
        <nav className="space-y-1 px-3 py-2">
          {navigationItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start px-3 py-2.5 h-auto text-sm font-medium rounded-md text-slate-100 hover:bg-white/10 hover:text-white focus-visible:bg-white/15 focus-visible:text-white transition-colors duration-150"
              asChild
            >
              <Link href={item.href} className="flex items-center">
                <item.icon className="mr-3 h-4.5 w-4.5 text-blue-300/90 group-hover:text-blue-200" />
                <span>{item.name}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </ScrollArea>

      {/* UserProfileDropdown - Conditionally render padding based on context */}
      <div className={`mt-auto border-t border-white/10 ${isMobile ? 'p-4' : 'p-3'}`}>
        {session && <UserProfileDropdown session={session} userTheme="dark" />} {/* Assuming UserProfileDropdown can take a theme prop */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="flex md:hidden items-center justify-between p-2.5 sm:p-3 bg-gradient-to-r from-blue-800 to-violet-800 shadow-md text-white sticky top-0 z-40">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 focus-visible:bg-white/15">
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 sm:w-72 border-r-0"> {/* Remove default padding & border */}
            <div className="h-full bg-gradient-to-b from-blue-800 to-violet-800 text-white">
              {/* SheetHeader is optional, can be part of SidebarContent */}
              <SidebarContent isMobile={true} />
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/registry" className="text-lg sm:text-xl font-semibold text-white">
          Registry
        </Link>
        {/* Placeholder for right-side mobile actions, or UserProfileDropdown if desired here */}
        <div className="w-10 h-10"> {/* Spacer to balance menu icon if no action on right */}
            {/* <UserProfileDropdown session={session} userTheme="dark" /> */}
        </div>
      </div>

      {/* Sidebar on desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gradient-to-b from-blue-800 to-violet-800 shadow-lg print:hidden">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden"> {/* This ensures header sticks and main content scrolls */}
        {/* Optional: A subtle header for the main content area if needed, distinct from mobile top bar */}
        {/* <header className="bg-white dark:bg-slate-800 shadow-sm flex-shrink-0 print:hidden">
          <div className="h-12 sm:h-14 flex items-center px-4 sm:px-6 justify-end">
             Desktop header actions like UserProfileDropdown if not in sidebar
             <div className="hidden md:block"> <UserProfileDropdown session={session} /> </div>
          </div>
        </header> 
        */}
        <main className="flex-grow p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto w-full"> {/* Added max-w and centering for children */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}