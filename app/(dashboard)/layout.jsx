import { Inter } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import UserProfileDropdown from './UserProfileDropdown';

const inter = Inter({ subsets: ['latin'] });

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  if (!session?.userId) redirect('/login');

  return (
    <div className={`min-h-screen flex flex-col bg-white dark:bg-slate-900 ${inter.className}`}>
      {/* Enhanced Glassy Header */}
      <header className="sticky top-0 z-50 border-t-4 border-[#AE1C28] backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-lg shadow-black/5 dark:shadow-black/20 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="group flex items-center space-x-3 text-xl font-semibold transition-all duration-300 hover:scale-[1.02]">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                {/* Enhanced Logo Container */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-full shadow-inner border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm group-hover:shadow-md transition-all duration-300"></div>
                <div className="relative h-10 w-10 sm:h-12 sm:w-12 p-1.5 sm:p-2">
                  <Image
                    src="/uew.png"
                    alt="University of Education, Winneba Logo"
                    layout="fill"
                    objectFit="contain"
                    priority
                    className="drop-shadow-sm"
                  />
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
              
              <div className="flex flex-col leading-tight">
                <span className="text-[#1A213D] dark:text-slate-100 text-lg sm:text-xl font-bold group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors duration-300">
                  University of Education, Winneba
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">
                  CODeL Claims System
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                </span>
              </div>
            </Link>

            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Glass Effect Container for User Profile */}
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-full p-1 shadow-sm hover:shadow-md transition-all duration-300">
                {session && <UserProfileDropdown session={session} />}
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Border Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 dark:via-slate-700/50 to-transparent"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>

      {/* Enhanced University Footer - Compact Version */}
      <footer className="bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-t border-slate-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Main Footer Content */}
          <div className="flex flex-col items-center justify-center space-y-2">
            {/* University Branding Section */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {/* University Logo */}
              <div className="relative">
                <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 p-1.5 shadow-sm border border-blue-200/50 dark:border-blue-700/50">
                  <Image 
                    src="/uew.png" 
                    alt="University of Education, Winneba Logo" 
                    layout="fill" 
                    objectFit="contain" 
                    className="p-0.5"
                  />
                </div>
                {/* Decorative sparkle */}
                <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  <span className="text-white text-xs">✨</span>
                </div>
              </div>
              
              {/* University Information */}
              <div className="flex flex-col items-center sm:items-start">
                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                  University of Education, Winneba
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                    CODeL Claims Portal
                  </span>
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Footer Information */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 text-xs">
              {/* Copyright */}
              <div className="flex items-center gap-1">
                <span className="text-slate-600 dark:text-slate-400">
                  &copy; {new Date().getFullYear()} CODeL Claims Portal
                </span>
                <span className="text-slate-500 dark:text-slate-400">•</span>
                <span className="text-slate-500 dark:text-slate-400">All rights reserved</span>
              </div>
              
              {/* System Status */}
              <div className="flex items-center gap-2 text-xs">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}