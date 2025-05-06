// app/(dashboard)/coordinator/[centerId]/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getCoordinatorDashboardData } from '@/lib/actions/coordinator.actions.js';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileWarning } from "lucide-react"; // Icons
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/sonner";

// Import the new client wrapper component
import CoordinatorTabsWrapper from './_components/CoordinatorTabsWrapper';

export default async function CoordinatorDashboardPage({ params }) {
  const session = await getSession();
  const { centerId } = params;

  if (!session || session.role !== 'COORDINATOR') {
    redirect('/login');
  }

  const result = await getCoordinatorDashboardData(session.userId);

  if (!result.success || !result.data) {
    return (
      <Alert variant="destructive" className="mt-4">
        <FileWarning className="h-4 w-4" />
        <AlertTitle>Error Loading Dashboard Data</AlertTitle>
        <AlertDescription>
          {result.error || "Could not load the necessary data for the coordinator dashboard. Please try again later or contact support."}
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  const {
    center,
    lecturers,
    departments,
    claims // This now likely contains ALL claims for the center from getCoordinatorDashboardData
  } = result.data;

  if (center.id !== centerId) {
    console.error(`Data mismatch: Fetched center ID ${center.id} does not match URL center ID ${centerId} for coordinator ${session.userId}`);
    redirect('/unauthorized?error=data_mismatch');
  }

  // Prepare data for the overview tab (e.g., only pending claims for overview)
  const pendingClaimsForOverview = claims.filter(c => c.status === 'PENDING');
  const initialOverviewData = {
    lecturers: lecturers,
    departments: departments,
    claims: pendingClaimsForOverview
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Coordinator Dashboard</h1>
          <p className="text-muted-foreground">
            Managing Center: <span className="font-semibold">{center.name}</span>
          </p>
        </div>
      </div>

      <CoordinatorTabsWrapper
        centerId={center.id}
        centerName={center.name}
        initialOverviewData={initialOverviewData}
        initialDepartments={departments}
        initialLecturers={lecturers}
        initialClaims={pendingClaimsForOverview} // For the claims tab, initially show pending
        allClaimsForFiltering={claims} // Pass all claims for the filter functionality in ManageCoordinatorClaimsTab
        coordinatorUserId={session.userId}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}
