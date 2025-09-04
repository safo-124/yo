// app/(dashboard)/profile/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getCurrentUserProfile } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';
// Removed Card imports as the static card is removed, but Alert, Button, Link are kept.
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
// Kept necessary icons
import { FileWarning, UserCircle, ArrowLeft } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import ProfileUpdateForm from './_components/ProfileUpdateForm';
// Removed Label if no longer used for static display
import { Separator } from "@/components/ui/separator";
// Removed Badge if no longer used for static display

import prisma from '@/lib/prisma'; // Import Prisma client

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }

  const profileResult = await getCurrentUserProfile();

  if (!profileResult.success || !profileResult.user) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Error Loading Profile</AlertTitle>
          <AlertDescription>
            {profileResult.error || "Could not load your profile data. Please try again later or contact support."}
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-right" theme="light" />
      </div>
    );
  }

  const user = profileResult.user;

  // Determine the back URL based on user role and assignments
  let backUrl = "/dashboard"; // Default fallback
  if (user.role === 'REGISTRY') {
    backUrl = "/registry"; // Main registry dashboard
  } else if (user.role === 'COORDINATOR') {
    const coordinatedCenter = await prisma.center.findUnique({
      where: { coordinatorId: user.id },
      select: { id: true }
    });
    if (coordinatedCenter) {
      backUrl = `/coordinator/center/${coordinatedCenter.id}/dashboard`; // Specific center dashboard
    } else {
      backUrl = "/coordinator/dashboard"; // Generic coordinator dashboard if no center assigned
    }
  } else if (user.role === 'LECTURER') {
    backUrl = user.lecturerCenterId
      ? `/lecturer/center/${user.lecturerCenterId}/dashboard` // Specific lecturer center dashboard
      : "/lecturer/dashboard"; // Generic lecturer dashboard if no center assigned
  } else if (user.role === 'STAFF_REGISTRY') {
      backUrl = "/staff_registry/dashboard"; // Staff registry dashboard
  }

  return (
    // Outer container for the page content, applying overall padding and max-width
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">
      {/* Header Section with Back Button and Title */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <Button variant="outline" size="icon" asChild className="shrink-0 shadow-sm hover:shadow-md transition-shadow">
              <Link href={backUrl}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Dashboard</span>
              </Link>
            </Button>
            {/* Page Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <UserCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-800 dark:text-blue-300" />
                My Profile Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your personal information and account settings
              </p>
            </div>
          </div>
          
          {/* Account Information Summary */}
          <div className="hidden md:flex flex-col items-end">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Account ID: <span className="font-mono text-slate-700 dark:text-slate-300">{user.id.substring(0, 8)}...</span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Member since: <span className="font-medium text-slate-700 dark:text-slate-300">
                {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        
        {/* Account Context Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 p-5 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z" />
                <polyline points="15,9 18,9 18,11" />
                <path d="M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2v0" />
                <line x1="6" y1="10" x2="7" y2="10" />
              </svg>
              Email
            </span>
            <span className="text-slate-800 dark:text-slate-200 font-medium mt-1">{user.email}</span>
          </div>
          
          {user.departmentName && (
            <div className="flex flex-col">
              <span className="text-xs uppercase font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 22V8c0-1.1.9-2 2-2h4l2-2h4l2 2h4c1.1 0 2 .9 2 2v14H2z" />
                  <path d="M7 13h10" />
                  <path d="M7 17h10" />
                </svg>
                Department
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium mt-1">{user.departmentName}</span>
            </div>
          )}
          
          {user.centerName && (
            <div className="flex flex-col">
              <span className="text-xs uppercase font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                  <path d="M9 22v-4h6v4" />
                  <path d="M8 6h.01" />
                  <path d="M16 6h.01" />
                  <path d="M12 6h.01" />
                  <path d="M12 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M8 10h.01" />
                  <path d="M8 14h.01" />
                  <path d="M16 10h.01" />
                  <path d="M16 14h.01" />
                </svg>
                {user.role === 'COORDINATOR' ? 'Coordinating Center' : 'Teaching Center'}
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium mt-1">{user.centerName}</span>
            </div>
          )}
          
          <div className="flex flex-col">
            <span className="text-xs uppercase font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Account Role
            </span>
            <span className="text-slate-800 dark:text-slate-200 font-medium mt-1">
              {user.role && user.role.charAt(0) + user.role.slice(1).toLowerCase().replace('_', ' ')}
            </span>
          </div>
          
          {user.designation && (
            <div className="flex flex-col">
              <span className="text-xs uppercase font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Designation
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium mt-1">
                {user.designation && user.designation.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
              </span>
            </div>
          )}
          
          <div className="flex flex-col">
            <span className="text-xs uppercase font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              Member Since
            </span>
            <span className="text-slate-800 dark:text-slate-200 font-medium mt-1">
              {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
        
        {/* Separator below the page header */}
        <Separator className="my-2 bg-slate-300 dark:bg-slate-700" />
      </div>

      {/* Profile Update Form */}
      <ProfileUpdateForm initialProfile={user} />

      {/* Toaster for notifications */}
      <Toaster richColors position="top-right" theme="light" />
    </div>
  );
}