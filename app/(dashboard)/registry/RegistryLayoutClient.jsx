'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  UserCheck as UserCheckIcon,
  Menu
} from 'lucide-react';
import UserProfileDropdown from '../UserProfileDropdown';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function RegistryLayoutClient({ session, children }) {
  const navigationItems = [
    { name: 'Overview', href: '/registry', icon: LayoutDashboard },
    { name: 'Manage Centers', href: '/registry/centers', icon: Building },
    { name: 'Manage Users', href: '/registry/users', icon: Users },
    { name: 'System Claims', href: '/registry/claims', icon: FileText },
    { name: 'Signup Requests', href: '/registry/requests', icon: UserCheckIcon },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="mb-8 px-2">
        <Link href="/registry" className="text-2xl font-semibold text-white">
          Registry Panel
        </Link>
        <p className="text-sm text-blue-200">Super Administrator</p>
      </div>
      <nav className="flex-grow space-y-3 px-2">
        {navigationItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className="w-full justify-start px-4 py-3 hover:bg-blue-700/50 transition-colors duration-200"
            asChild
          >
            <Link href={item.href} className="flex items-center">
              <item.icon className="mr-3 h-5 w-5 text-blue-200" />
              <span className="text-white">{item.name}</span>
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto px-2">
        {session && <UserProfileDropdown session={session} />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="flex md:hidden items-center justify-between p-4 bg-gradient-to-r from-blue-800 to-blue-600 shadow text-white">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="h-full bg-gradient-to-b from-blue-900 to-blue-700">
              <SheetHeader className="px-4 pt-4">
                <SheetTitle className="text-white">Super Admin</SheetTitle>
              </SheetHeader>
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/registry" className="text-xl font-semibold text-white">
          Registry
        </Link>
      </div>

      {/* Sidebar on desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gradient-to-b from-blue-900 to-blue-700 shadow-md p-4">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto bg-white dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}