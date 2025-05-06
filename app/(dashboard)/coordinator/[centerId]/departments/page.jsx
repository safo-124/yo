// app/(dashboard)/coordinator/[centerId]/departments/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getCoordinatorDashboardData } from '@/lib/actions/coordinator.actions.js'; // This fetches departments
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, Building } from "lucide-react"; // Icons
import ManageCoordinatorDepartmentsTab from '../_components/ManageCoordinatorDepartmentsTab'; // Adjusted path
import { Toaster } from "@/components/ui/sonner";

export default async function CoordinatorDepartmentsPage({ params }) {
  const session = await getSession();
  const { centerId } = params;

  if (!session || session.role !== 'COORDINATOR') {
    // This should ideally be caught by the layout, but good for direct access attempts
    redirect('/login');
  }

  // The layout (CoordinatorLayout) already verifies that this coordinator is assigned to this centerId.
  // Now, fetch all data for this center, which includes departments.
  const result = await getCoordinatorDashboardData(session.userId);

  if (!result.success || !result.data) {
    return (
      <div className="mt-4">
        <Alert variant="destructive">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Error Loading Department Data</AlertTitle>
          <AlertDescription>
            {result.error || "Could not load the necessary data for managing departments. Please try again later or contact support."}
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
    departments,
    // lecturers, // Not directly used on this page, but fetched by getCoordinatorDashboardData
    // claims: pendingClaims // Not directly used on this page
  } = result.data;

  // Sanity check: ensure the fetched center ID matches the URL parameter.
  // The layout should handle the primary authorization for the center.
  if (center.id !== centerId) {
      console.error(`Data mismatch on departments page: Fetched center ID ${center.id} does not match URL center ID ${centerId} for coordinator ${session.userId}`);
      redirect('/unauthorized?error=data_mismatch_departments');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Building className="mr-3 h-8 w-8 text-primary" />
            Manage Departments
          </h1>
          <p className="text-muted-foreground">
            Center: <span className="font-semibold">{center.name}</span>
          </p>
        </div>
      </div>

      {/* Render the ManageCoordinatorDepartmentsTab component */}
      <ManageCoordinatorDepartmentsTab
        centerId={center.id}
        initialDepartments={departments || []}
        coordinatorUserId={session.userId}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}
