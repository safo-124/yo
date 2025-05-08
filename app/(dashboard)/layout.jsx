// app/(dashboard)/layout.jsx
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import UserProfileDropdown from './UserProfileDropdown'; // Ensure this path is correct

const inter = Inter({ subsets: ['latin'] });

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }

  // Define UEW-inspired colors for use in Tailwind classes
  const uewRed = '#AE1C28';
  const uewBlue = '#1A213D';
  // const uewGold = '#F9A602'; // Optional accent

  return (
    <div className={`min-h-screen ${inter.className} flex flex-col bg-slate-100 dark:bg-slate-900`}>
      <header className={`bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-30 border-t-4 border-[${uewRed}]`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 text-xl font-semibold">
                <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                  <Image
                    src="/uew.png" // Ensure this path is correct and image is in /public
                    alt="UEW CODeL Logo"
                    layout="fill"
                    objectFit="contain"
                    priority
                  />
                </div>
                {/* Portal Name with University Color */}
                <div className="flex flex-col leading-tight">
                  <span className={`text-[${uewBlue}] dark:text-slate-100 text-lg sm:text-xl font-bold`}>
                    CODeL Claims
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                    University of Education, Winneba
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Optional: Welcome message can be styled here if not in dropdown */}
              {/* <span className={`text-sm text-slate-600 dark:text-slate-300 hidden md:block`}>
                Welcome, {session.name || session.email}!
              </span> */}
              {session && <UserProfileDropdown session={session} />}
            </div>
          </div>
        </div>
      </header>

      {/* The children will render role-specific layouts (e.g., RegistryLayout).
        This DashboardLayout provides the header, session check, and overall page structure.
        Removed w-[80%] to allow children to manage their own width and layout.
      */}
      <main className="flex-1 w-full overflow-y-auto">
        {/* Content will typically have its own padding within child layouts/pages */}
        {children}
      </main>

      <footer className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
            <div className="relative h-8 w-8">
                <Image src="/uew.png" alt="UEW Mini Logo" layout="fill" objectFit="contain" />
            </div>
            <p className={`text-sm text-[${uewBlue}] dark:text-slate-300 font-medium`}>
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