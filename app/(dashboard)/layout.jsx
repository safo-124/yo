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
    <div className={`min-h-screen flex flex-col bg-blue-800 dark:bg-slate-900 ${inter.className}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-30 border-t-4 border-[#AE1C28]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 text-xl font-semibold">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                <Image
                  src="/uew.png"
                  alt="UEW CODeL Logo"
                  layout="fill"
                  objectFit="contain"
                  priority
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[#1A213D] dark:text-slate-100 text-lg sm:text-xl font-bold">
                   University of Education, Winneba
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  CODeL Claims System
                </span>
              </div>
            </Link>

            <div className="flex items-center space-x-3 sm:space-x-4">
              {session && <UserProfileDropdown session={session} />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
            <div className="relative h-8 w-8">
              <Image src="/uew.png" alt="UEW Mini Logo" layout="fill" objectFit="contain" />
            </div>
            <p className="text-sm text-[#1A213D] dark:text-slate-300 font-medium">
              University of Education, Winneba
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} CODeL Claims Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
