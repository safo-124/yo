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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
      {/* Header Section for the page */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {/* Back button */}
          <Button variant="outline" size="icon" asChild className="shrink-0">
            <Link href={backUrl}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          {/* Page Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <UserCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-800 dark:text-blue-300" />
              My Profile & Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              View your personal information and manage your account settings
            </p>
          </div>
        </div>
        {/* Separator below the page header */}
        <Separator className="my-2 bg-slate-300 dark:bg-slate-700" />
      </div>

      {/* Main Content: ProfileUpdateForm now takes full available width */}
      {/* The ProfileUpdateForm component itself manages its internal padding and layout */}
      <ProfileUpdateForm initialProfile={user} />

      {/* Toaster for notifications */}
      <Toaster richColors position="top-right" theme="light" />
    </div>
  );
}