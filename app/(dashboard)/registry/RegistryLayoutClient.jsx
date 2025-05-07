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
      <div className="mb-6">
        <Link href="/registry" className="text-2xl font-semibold text-gray-800 dark:text-white">
          Registry Panel
        </Link>
        <p className="text-sm text-muted-foreground">Super Administrator</p>
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="flex md:hidden items-center justify-between p-4 bg-white dark:bg-gray-900 shadow">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-4 w-64">
            <SheetHeader>
              <SheetTitle>Super Admin</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <Link href="/registry" className="text-xl font-semibold text-gray-800 dark:text-white">
          Registry
        </Link>
      </div>

      {/* Sidebar on desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-gray-900 shadow-md p-4">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
