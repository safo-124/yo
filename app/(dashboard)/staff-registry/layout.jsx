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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/5">
      {/* Enhanced Header with Glassmorphism */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/20 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-700/90">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                <Link href="/staff-registry" className="flex items-center gap-3 text-lg font-semibold mb-4 group">
                  <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-violet-800 to-purple-700 bg-clip-text text-transparent dark:from-violet-300 dark:to-purple-300">
                      Staff Portal
                    </h2>
                  </div>
                </Link>
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-4 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-200 backdrop-blur-sm"
                    >
                      <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 rounded-lg">
                        <item.icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link href="/staff-registry" className="hidden md:flex items-center gap-3 group transition-all duration-200 hover:scale-[1.02]">
            <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-violet-800 to-purple-700 bg-clip-text text-transparent dark:from-violet-300 dark:to-purple-300">
                Staff Registry Portal
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                System Administration
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 dark:border-slate-700/50">
            {session.name || session.email} ({session.role.replace("_", " ")})
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-700/90">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.image || undefined} alt={session.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold">
                    {session.name ? session.name.charAt(0).toUpperCase() : <UserCircle />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.name}</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{session.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Desktop Sidebar with Glassmorphism */}
        <nav className="hidden md:flex md:flex-col md:w-64 border-r border-white/20 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl shadow-blue-500/5 dark:shadow-blue-500/10 p-4 space-y-2 shrink-0 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-white/60 dark:hover:bg-slate-700/60 backdrop-blur-sm hover:shadow-lg hover:shadow-violet-500/10 group"
            >
              <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 rounded-lg group-hover:from-violet-200 group-hover:to-purple-200 dark:group-hover:from-violet-800/70 dark:group-hover:to-purple-800/70 transition-all duration-200">
                <item.icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        {/* Enhanced Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-white/20 via-slate-50/40 to-violet-50/20 dark:from-slate-800/20 dark:via-slate-700/30 dark:to-violet-900/10 p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-violet-500/5 dark:shadow-violet-500/10 border border-white/20 dark:border-slate-700/50 p-6 lg:p-8 min-h-[calc(100vh-12rem)]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffRegistryLayout;