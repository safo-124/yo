// app/(dashboard)/coordinator/[centerId]/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getCoordinatorDashboardData } from '@/lib/actions/coordinator.actions.js';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileWarning } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import CoordinatorTabsWrapper from './_components/CoordinatorTabsWrapper';

export default async function CoordinatorDashboardPage({ params }) {
  const session = await getSession();
  const { centerId } = await params;

  if (!session || session.role !== 'COORDINATOR') {
    redirect('/login');
  }

  const result = await getCoordinatorDashboardData(session.userId);

  if (!result.success || !result.data) {
    return (
      <div className="w-full py-8 px-4">
        <Alert
          variant="destructive"
          className="max-w-2xl mx-auto bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/20 dark:to-red-800/10 dark:border-red-700/50 text-red-800 dark:text-red-200 shadow-lg rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <FileWarning className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertTitle className="font-bold text-lg text-red-900 dark:text-red-100">
              Error Loading Dashboard Data
            </AlertTitle>
          </div>
          <AlertDescription className="text-red-700 dark:text-red-300">
            {result.error || 'Could not load dashboard data. Please try again later.'}
            <div className="mt-4">
              <Button asChild variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { center, lecturers, departments, claims } = result.data;

  if (center.id !== centerId) {
    redirect('/unauthorized?error=data_mismatch');
  }

  const pendingClaimsForOverview = claims.filter((c) => c.status === 'PENDING');
  const initialOverviewData = { lecturers, departments, claims: pendingClaimsForOverview };

  return (
    <div className="w-full space-y-6">
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
      <Toaster richColors position="top-right" />
    </div>
  );
}
