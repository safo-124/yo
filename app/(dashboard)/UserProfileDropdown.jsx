// app/(dashboard)/UserProfileDropdown.jsx
// Or app/(dashboard)/_components/UserProfileDropdown.jsx (adjust path as needed in imports)
"use client";

import Link from 'next/link'; // Keep if any items still use Link directly
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutUser } from '@/lib/actions/auth.actions';
import { UserCircle, Settings as SettingsIcon, LogOut } from 'lucide-react'; // Added icons

// Function to get initials from name
const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.toUpperCase();
};

export default function UserProfileDropdown({ session, userTheme = "light" }) {
  const router = useRouter();

  if (!session) return null;

  const handleNavigation = (path) => {
    router.push(path);
  };

  // Style adjustments based on theme
  const isDark = userTheme === "dark";
  const triggerClasses = isDark 
    ? "relative h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 backdrop-blur-sm"
    : "relative h-10 w-10 rounded-full";
    
  const avatarClasses = isDark ? "h-8 w-8" : "h-10 w-10";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={triggerClasses}>
          <Avatar className={avatarClasses}>
            {/* Example for AvatarImage if you have user avatars
            {session.avatarUrl && <AvatarImage src={session.avatarUrl} alt={session.name || session.email} />}
            */}
            <AvatarFallback className={isDark ? "bg-blue-500/80 text-white font-semibold" : undefined}>
              {getInitials(session.name)}
            </AvatarFallback>
          </Avatar>
          {isDark && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white/20 animate-pulse"></div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-500 text-white font-bold text-lg">
                {getInitials(session.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none">{session.name || "User"}</p>
              <p className="text-xs text-muted-foreground leading-none">
                {session.email}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem onSelect={() => handleNavigation('/profile')} className="p-3 cursor-pointer rounded-lg">
          <UserCircle className="mr-3 h-5 w-5 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">My Profile</span>
            <span className="text-xs text-muted-foreground">View and edit profile</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleNavigation('/profile')} className="p-3 cursor-pointer rounded-lg">
          <SettingsIcon className="mr-3 h-5 w-5 text-slate-600" />
          <div className="flex flex-col">
            <span className="font-medium">Settings</span>
            <span className="text-xs text-muted-foreground">Account preferences</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem asChild>
          <form action={logoutUser} className="w-full">
            <button
              type="submit"
              className="w-full text-left relative flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none transition-colors hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <div className="flex flex-col">
                <span className="font-medium">Sign Out</span>
                <span className="text-xs text-muted-foreground">End current session</span>
              </div>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
