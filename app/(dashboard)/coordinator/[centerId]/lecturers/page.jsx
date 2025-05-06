// app/(dashboard)/coordinator/[centerId]/lecturers/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getCoordinatorDashboardData } from '@/lib/actions/coordinator.actions.js'; // This fetches lecturers and departments
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, Users } from "lucide-react"; // Icons
import ManageCoordinatorLecturersTab from '../_components/ManageCoordinatorLecturersTab'; // Adjusted path
import { Toaster } from "@/components/ui/sonner";

export default async function CoordinatorLecturersPage({ params }) {
  const session = await getSession();
  const { centerId } = params;

  if (!session || session.role !== 'COORDINATOR') {
    // This should ideally be caught by the layout, but good for direct access attempts
    redirect('/login');
  }

  // The layout (CoordinatorLayout) already verifies that this coordinator is assigned to this centerId.
  // Now, fetch all data for this center, which includes lecturers and departments (for assignment).
  const result = await getCoordinatorDashboardData(session.userId);

  if (!result.success || !result.data) {
    return (
      <div className="mt-4">
        <Alert variant="destructive">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Error Loading Lecturer Data</AlertTitle>
          <AlertDescription>
            {result.error || "Could not load the necessary data for managing lecturers. Please try again later or contact support."}
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href={`/coordinator/${centerId}`}>Back to Overview</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const {
    center,
    lecturers,
    departments, // Needed for assigning lecturers to departments
    // claims: pendingClaims // Not directly used on this page
  } = result.data;

  // Sanity check: ensure the fetched center ID matches the URL parameter.
  if (center.id !== centerId) {
      console.error(`Data mismatch on lecturers page: Fetched center ID ${center.id} does not match URL center ID ${centerId} for coordinator ${session.userId}`);
      redirect('/unauthorized?error=data_mismatch_lecturers');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" />
            Manage Lecturers
          </h1>
          <p className="text-muted-foreground">
            Center: <span className="font-semibold">{center.name}</span>
          </p>
        </div>
      </div>

      {/* Render the ManageCoordinatorLecturersTab component */}
      <ManageCoordinatorLecturersTab
        centerId={center.id}
        initialLecturers={lecturers || []}
        departmentsForAssignment={departments || []}
        coordinatorUserId={session.userId}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}
