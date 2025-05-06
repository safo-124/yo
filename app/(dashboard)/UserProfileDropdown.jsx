// app/(dashboard)/UserProfileDropdown.jsx
"use client";

import Link from 'next/link';
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
import { logoutUser } from '@/lib/actions/auth.actions'; // Assuming logoutUser is a server action

// Function to get initials from name
const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.toUpperCase();
};

export default function UserProfileDropdown({ session }) {
  const router = useRouter();

  if (!session) return null;

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {/* Example for AvatarImage if you have user avatars
            {session.avatarUrl && <AvatarImage src={session.avatarUrl} alt={session.name || session.email} />}
            */}
            <AvatarFallback>{getInitials(session.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleNavigation('/profile')}>
          Profile {/* Placeholder for profile page */}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleNavigation('/settings')}>
          Settings {/* Placeholder for settings page */}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* The form for logout can still call the server action directly */}
        <DropdownMenuItem asChild>
          {/*
            We wrap the form in a DropdownMenuItem to keep consistent styling and behavior.
            The form itself will be the item.
            Alternatively, use onSelect to trigger form submission if preferred.
          */}
          <form action={logoutUser} className="w-full">
            <button
              type="submit"
              className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              Logout
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
