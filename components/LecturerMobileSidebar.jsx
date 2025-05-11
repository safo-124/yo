'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, LayoutDashboard, FilePlus, History } from 'lucide-react';
import clsx from 'clsx';
import UserProfileDropdown from '@/app/(dashboard)/UserProfileDropdown';

const iconMap = { LayoutDashboard, FilePlus, History };

export default function LecturerMobileSidebar({ session, centerName, centerId, navigationItems }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Toggle Button */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Sidebar */}
      <div
        className={clsx(
          'fixed top-0 left-0 h-full w-64 bg-white text-gray-800 z-40',
          'transform transition-transform duration-300 ease-in-out shadow-xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 border-b">
          <Link 
            href={`/lecturer/center/${centerId}/dashboard`}
            className="text-xl font-semibold text-gray-900 block hover:text-blue-600"
          >
            Lecturer Panel
          </Link>
          <p className="text-sm text-gray-600 mt-1">{centerName}</p>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navigationItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Button
                key={item.name}
                className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg px-4 py-2.5"
                variant="ghost"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link href={item.href}>
                  <Icon className="mr-3 h-5 w-5 text-blue-500" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="mt-auto border-t p-4">
          <UserProfileDropdown session={session} />
        </div>
      </div>
    </div>
  );
}