// app/(dashboard)/profile/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getCurrentUserProfile } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, UserCircle, ArrowLeft } from "lucide-react"; // Added ArrowLeft icon
import { Toaster } from "@/components/ui/sonner";
import ProfileUpdateForm from './_components/ProfileUpdateForm';
import { Label } from "@/components/ui/label";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }

  const profileResult = await getCurrentUserProfile();

  if (!profileResult.success || !profileResult.user) {
    return (
      <div className="mt-4 container mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
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
      </div>
    );
  }

  const user = profileResult.user;

  // Determine the back URL based on user role and assignments
  let backUrl = "/"; // Default fallback
  if (user.role === 'REGISTRY') {
    backUrl = "/registry";
  } else if (user.role === 'COORDINATOR') {
    // getCurrentUserProfile fetches Center_Center_coordinatorIdToUser which contains the center ID
    const coordinatedCenter = await prisma.center.findUnique({
        where: { coordinatorId: user.id },
        select: { id: true }
    });
    if (coordinatedCenter) {
        backUrl = `/coordinator/${coordinatedCenter.id}`;
    } else {
        backUrl = "/"; // Fallback if coordinator somehow not linked to a center
    }
  } else if (user.role === 'LECTURER') {
    if (user.lecturerCenterId) {
      backUrl = `/lecturer/center/${user.lecturerCenterId}/dashboard`;
    } else {
      backUrl = "/lecturer/assignment-pending"; // Or a generic lecturer page
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={backUrl}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <UserCircle className="mr-3 h-8 w-8 text-primary hide-on-mobile" /> {/* Added hide-on-mobile for better small screen layout */}
              My Profile & Settings
            </h1>
            <p className="text-muted-foreground">
              View your personal information and manage your account settings.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Information Card (Read-only display) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your registered details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <p className="font-medium">{user.name || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email Address</Label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Role</Label>
              <p className="font-medium capitalize">{user.role?.toLowerCase() || 'N/A'}</p>
            </div>
            {user.centerName && ( // centerName is now pre-formatted in getCurrentUserProfile
              <div>
                <Label className="text-xs text-muted-foreground">
                  {user.role === 'COORDINATOR' ? 'Coordinating Center' : 'Assigned Center'}
                </Label>
                <p className="font-medium">{user.centerName}</p>
              </div>
            )}
            {user.departmentName && user.role === 'LECTURER' && ( // departmentName is pre-formatted
              <div>
                <Label className="text-xs text-muted-foreground">Department</Label>
                <p className="font-medium">{user.departmentName}</p>
              </div>
            )}
             <div>
              <Label className="text-xs text-muted-foreground">Joined On</Label>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
             <div>
              <Label className="text-xs text-muted-foreground">Last Updated</Label>
              <p className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Update Forms Card (Client Component) */}
        <div className="lg:col-span-2 space-y-6">
            <ProfileUpdateForm initialName={user.name || ""} />
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
