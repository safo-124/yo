// app/(dashboard)/lecturer/assignment-pending/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
// No full layout needed here, or a very simple one.
// For now, let's assume it might fall under a generic (dashboard) layout if one exists,
// or it can be a standalone page. If using the main dashboard layout, UserProfileDropdown would be available.

export default async function LecturerAssignmentPendingPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }
  // If by some chance a non-lecturer lands here, or a lecturer who IS assigned, redirect them.
  if (session.role !== 'LECTURER') {
    redirect('/unauthorized');
  }
  // If they are assigned, send them to their dashboard
  const userDetails = await prisma.user.findUnique({where: {id: session.userId}, select: {lecturerCenterId: true}});
  if (userDetails?.lecturerCenterId) {
    redirect(`/lecturer/center/${userDetails.lecturerCenterId}/dashboard`);
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Assignment Pending</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            Welcome, {session.name || session.email}!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Your lecturer account has been created, but you have not yet been assigned to a specific academic center.
          </p>
          <p>
            Please contact your Center Coordinator or the Registry Administrator to get assigned to a center.
            Once assigned, you will be able to access your full dashboard and submit claims.
          </p>
          <div className="mt-6">
            <form action="/api/auth/logout" method="POST"> {/* Or use server action for logout */}
                 <Button type="submit" variant="outline">Logout</Button>
            </form>
            {/* Alternatively, if UserProfileDropdown is available via a broader layout:
            <UserProfileDropdown session={session} />
            But this page might not use the full lecturer layout.
            A simple logout form or link is safer.
            Or, if using a server action for logout:
            <form action={logoutUser}> <Button type="submit" variant="outline">Logout</Button> </form>
            Ensure logoutUser is imported if used directly.
            For now, a direct API route or simple POST is a placeholder.
            Let's use a Link to login for simplicity if logout action isn't easily available here.
            */}
            <Button asChild variant="outline" className="mt-2">
                <Link href="/login">Logout and Login Again Later</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

