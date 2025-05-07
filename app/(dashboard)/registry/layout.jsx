// app/(dashboard)/registry/layout.jsx
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Building, Users, FileText, UserCheck as UserCheckIcon } from 'lucide-react'; // Added UserCheckIcon
import UserProfileDropdown from '../UserProfileDropdown';

const inter = Inter({ subsets: ['latin'] });

export default async function RegistryLayout({ children }) {
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }

  if (session.role !== 'REGISTRY') {
    console.warn(`Unauthorized access attempt to registry section by role: ${session.role}`);
    redirect('/unauthorized');
  }

  const navigationItems = [
    { name: 'Overview', href: '/registry', icon: LayoutDashboard },
    { name: 'Manage Centers', href: '/registry/centers', icon: Building },
    { name: 'Manage Users', href: '/registry/users', icon: Users },
    { name: 'System Claims', href: '/registry/claims', icon: FileText },
    { name: 'Signup Requests', href: '/registry/requests', icon: UserCheckIcon }, // New Link
  ];

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-800 ${inter.className} flex`}>
      <aside className="w-64 bg-white dark:bg-gray-900 shadow-md p-4 flex flex-col">
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
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
