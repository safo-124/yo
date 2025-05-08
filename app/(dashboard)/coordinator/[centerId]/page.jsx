// app/(dashboard)/coordinator/[centerId]/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getCoordinatorDashboardData } from '@/lib/actions/coordinator.actions.js';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileWarning } from "lucide-react"; // Icons
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/sonner";
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-red-50 p-4">
        <Alert variant="destructive" className="max-w-2xl mx-auto border-red-600 bg-white shadow-lg">
          <FileWarning className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error Loading Dashboard Data</AlertTitle>
          <AlertDescription className="text-red-700">
            {result.error || "Could not load the necessary data for the coordinator dashboard. Please try again later or contact support."}
            <div className="mt-4">
              <Button asChild variant="outline" className="border-red-300 hover:bg-red-50 text-red-700">
                <Link href="/">Go to Homepage</Link>
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
    departments,
    claims
  } = result.data;

  if (center.id !== centerId) {
    console.error(`Data mismatch: Fetched center ID ${center.id} does not match URL center ID ${centerId} for coordinator ${session.userId}`);
    redirect('/unauthorized?error=data_mismatch');
  }

  const pendingClaimsForOverview = claims.filter(c => c.status === 'PENDING');
  const initialOverviewData = {
    lecturers: lecturers,
    departments: departments,
    claims: pendingClaimsForOverview
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-red-50 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl"> {/* Changed to max-w-7xl (80% of typical desktop) */}
        <div className="space-y-8 bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-blue-100">
          {/* Header with gradient text */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                Coordinator Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Managing Center: <span className="font-semibold text-blue-700">{center.name}</span>
              </p>
            </div>
            {/* Optional: Add a profile button or other actions here */}
          </div>

          {/* Main content area */}
          <div className="border-t border-blue-100 pt-6">
            <CoordinatorTabsWrapper
              centerId={center.id}
              centerName={center.name}
              initialOverviewData={initialOverviewData}
              initialDepartments={departments}
              initialLecturers={lecturers}
              initialClaims={pendingClaimsForOverview}
              allClaimsForFiltering={claims}
              coordinatorUserId={session.userId}
            />
          </div>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}