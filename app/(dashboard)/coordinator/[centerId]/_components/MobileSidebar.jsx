// app/(dashboard)/coordinator/[centerId]/components/MobileSidebar.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import * as icons from 'lucide-react';

export const MobileSidebar = ({ centerDetails, navigationItems, session, UserProfileDropdown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Dynamically get the icon component
  const getIconComponent = (iconName) => {
    const Icon = icons[iconName];
    return Icon ? <Icon className="mr-3 h-5 w-5" /> : null;
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 flex items-center sticky top-0 z-40">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-blue-800 mr-2"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <icons.Menu className="h-6 w-6" />
        </Button>
        
        <Link 
          href={`/coordinator/${centerDetails.id}`} 
          className="text-xl font-semibold truncate flex-1"
          onClick={() => setIsOpen(false)}
        >
          {centerDetails.name || "Center Dashboard"}
        </Link>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          <div className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-blue-900 to-blue-700 text-white flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-blue-800">
              <span className="text-xl font-semibold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-800"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <icons.X className="h-6 w-6" />
              </Button>
            </div>
            
            <nav className="flex-grow overflow-y-auto p-4 space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-blue-800 hover:text-white px-4 py-3"
                  asChild
                >
                  <Link href={item.href} onClick={() => setIsOpen(false)}>
                    {getIconComponent(item.icon)}
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>
            
            <div className="p-4 border-t border-blue-800">
              <UserProfileDropdown session={session} className="text-white" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};