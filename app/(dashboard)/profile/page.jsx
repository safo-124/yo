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
import { FileWarning, UserCircle, ArrowLeft, Calendar, Shield, Building2, Users } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import ProfileUpdateForm from './_components/ProfileUpdateForm';
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
      </div>
    );
  }

  const user = profileResult.user;

  // Determine the back URL based on user role and assignments
  let backUrl = "/"; // Default fallback
  if (user.role === 'REGISTRY') {
    backUrl = "/registry";
  } else if (user.role === 'COORDINATOR') {
    const coordinatedCenter = await prisma.center.findUnique({
      where: { coordinatorId: user.id },
      select: { id: true }
    });
    if (coordinatedCenter) {
      backUrl = `/coordinator/${coordinatedCenter.id}`;
    }
  } else if (user.role === 'LECTURER') {
    backUrl = user.lecturerCenterId 
      ? `/lecturer/center/${user.lecturerCenterId}/dashboard`
      : "/lecturer/assignment-pending";
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0">
            <Link href={backUrl}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <UserCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              My Profile & Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              View your personal information and manage your account settings
            </p>
          </div>
        </div>
        <Separator />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Information Card */}
        <Card className="lg:col-span-1 border-transparent bg-gradient-to-br from-background to-muted/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Your registered account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <p className="font-medium text-sm">{user.name || 'Not provided'}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Email Address</Label>
              <p className="font-medium text-sm">{user.email}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Account Role</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {user.role?.toLowerCase() || 'N/A'}
                </Badge>
              </div>
            </div>

            {user.centerName && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {user.role === 'COORDINATOR' ? 'Coordinating Center' : 'Assigned Center'}
                </Label>
                <p className="font-medium text-sm">{user.centerName}</p>
              </div>
            )}

            {user.departmentName && user.role === 'LECTURER' && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Department
                </Label>
                <p className="font-medium text-sm">{user.departmentName}</p>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined On
              </Label>
              <p className="font-medium text-sm">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Last Updated
              </Label>
              <p className="font-medium text-sm">
                {new Date(user.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Update Forms Section */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileUpdateForm initialName={user.name || ""} />
        </div>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}