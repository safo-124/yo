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
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 ${inter.className}`}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#1A213D] text-white shadow-md">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left — Logo & Title */}
          <Link href="/" className="group flex items-center gap-3 min-w-0">
            <div className="relative h-10 w-10 shrink-0 rounded-full bg-white/10 p-1">
              <Image
                src="/uew.png"
                alt="UEW Logo"
                fill
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-semibold truncate leading-tight">
                University of Education, Winneba
              </span>
              <span className="text-[11px] text-slate-300 hidden sm:flex items-center gap-1.5 leading-tight">
                CODeL Claims System
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              </span>
            </div>
          </Link>

          {/* Right — User Profile */}
          <div className="shrink-0">
            {session && <UserProfileDropdown session={session} userTheme="dark" />}
          </div>
        </div>

        {/* Accent stripe */}
        <div className="h-0.75 bg-linear-to-r from-[#AE1C28] via-yellow-500 to-[#AE1C28]" />
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#1A213D] text-slate-300 border-t border-slate-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 py-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 shrink-0">
              <Image src="/uew.png" alt="UEW Logo" fill className="object-contain" />
            </div>
            <span className="font-medium text-white">UEW</span>
            <span className="text-slate-400">|</span>
            <span>CODeL Claims Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span>&copy; {new Date().getFullYear()} All rights reserved</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 font-medium">Online</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}