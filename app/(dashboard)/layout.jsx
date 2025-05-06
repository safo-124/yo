// app/(dashboard)/layout.jsx
import { Inter } from 'next/font/google';
import Link from 'next/link'; // Keep for AppLogo link
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import UserProfileDropdown from './UserProfileDropdown'; // Import the new client component

const inter = Inter({ subsets: ['latin'] });

export default async function DashboardLayout({ children }) {
  const session = await getSession(); // Fetch session on the server

  if (!session?.userId) {
    redirect('/login'); // If no user ID in session, redirect to login
  }

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-800 ${inter.className} flex flex-col`}>
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold text-gray-800 dark:text-white">
                AppLogo {/* Replace with your actual logo or app name */}
              </Link>
              {/* Main Navigation Links can go here if needed */}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                Welcome, {session.name || session.email}! (Role: {session.role})
              </span>
              <UserProfileDropdown session={session} />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} Your Application Name. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
