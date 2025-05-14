// app/(dashboard)/staff-registry/layout.jsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, LayoutDashboard, ListChecks, BarChart3, UserCircle } from "lucide-react"; // LogOut removed from here
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator, // Keep if other items might be added below label
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import AppLogo from '@/components/AppLogo'; 

async function StaffRegistryLayout({ children }) {
  const session = await getSession();

  if (!session || !session.userId) {
    redirect('/login');
  }
  if (session.role !== 'STAFF_REGISTRY') {
    redirect('/dashboard'); // Or '/unauthorized'
  }

  const navItems = [
    { href: '/staff-registry', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff-registry/claims', label: 'Manage Claims', icon: ListChecks },
    { href: '/staff-registry/summaries', label: 'View Summaries', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white dark:bg-slate-800 px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs bg-white dark:bg-slate-800">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                {/* <AppLogo className="h-8 mb-4" /> */}
                <Link href="/staff-registry" className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                    <LayoutDashboard className="h-6 w-6 text-violet-600" />
                    <span>Staff Portal</span>
                </Link>
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-4 px-2.5 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
           <Link href="/staff-registry" className="hidden md:flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
             {/* <AppLogo className="h-7" /> */}
             <LayoutDashboard className="h-6 w-6 text-violet-600" />
             <span className="hidden sm:inline-block">Staff Registry Portal</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline">
                {session.name || session.email} ({session.role.replace("_", " ")})
            </span>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.image || undefined} alt={session.name || "User"} />
                  <AvatarFallback>{session.name ? session.name.charAt(0).toUpperCase() : <UserCircle />}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.name}</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{session.email}</p>
                </div>
              </DropdownMenuLabel>
              {/* If you plan to add other items like "Profile" or "Settings", you might keep the separator */}
              {/* <DropdownMenuSeparator /> */}
              {/* <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem> */}
              {/* Sign Out link removed */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="hidden md:flex md:flex-col md:w-64 border-r bg-white dark:bg-slate-800 p-4 space-y-2 shrink-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 transition-all hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-700"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1 overflow-auto">
            {children}
        </div>
      </div>
    </div>
  );
}

export default StaffRegistryLayout;