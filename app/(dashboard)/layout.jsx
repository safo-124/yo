// app/(dashboard)/layout.jsx
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image'; // For the logo
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
// Assuming UserProfileDropdown is in app/(dashboard)/UserProfileDropdown.jsx
// Adjust path if it's in app/(dashboard)/_components/UserProfileDropdown.jsx
// For example: import UserProfileDropdown from './_components/UserProfileDropdown';
import UserProfileDropdown from './UserProfileDropdown'; // Make sure this path is correct

const inter = Inter({ subsets: ['latin'] });

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }

  return (
    <div className={`min-h-screen  ${inter.className} flex flex-col`}>
      <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-20"> {/* Increased z-index for header */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 text-xl font-semibold text-gray-800 dark:text-white">
                <div className="relative h-10 w-10 sm:h-12 sm:w-12"> {/* Adjusted logo size */}
                  <Image
                    src="/uew.png" // Updated logo path
                    alt="UEW CODeL Logo"
                    layout="fill"
                    objectFit="contain"
                    priority
                  />
                </div>
                {/* Updated Portal Name */}
                <span className="hidden sm:inline">CODeL Claims Portal</span>
                <span className="sm:hidden text-lg">CODeL Claims Portal</span> {/* Shorter name for mobile */}
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Welcome message can be part of UserProfileDropdown or displayed here if needed */}
              {/* <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
                Welcome, {session.name || session.email}!
              </span> */}
              {session && <UserProfileDropdown session={session} />}
            </div>
          </div>
        </div>
      </header>

      {/*
        The rest of the layout (sidebar + main content) will be handled by role-specific layouts
        e.g., RegistryLayout, CoordinatorLayout, LecturerCenterLayout.
        This main DashboardLayout provides the top header and session check.
        The {children} here will render those role-specific layouts.
      */}
      <div className="flex-1 flex overflow-hidden w-[80%]" > {/* Ensure content area can scroll if needed */}
        {children}
      </div>

      {/* A global footer for the dashboard area could go here if desired,
          otherwise, footers can be part of the role-specific layouts or pages.
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} University of Education, Winneba. All rights reserved.
        </div>
      </footer>
      */}
    </div>
  );
}
