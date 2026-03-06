// app/(dashboard)/coordinator/[centerId]/claims/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getCoordinatorDashboardData } from '@/lib/actions/coordinator.actions.js';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning } from "lucide-react";
import ManageCoordinatorClaimsTab from '../_components/ManageCoordinatorClaimsTab';
import { Toaster } from "@/components/ui/sonner";

export default async function CoordinatorClaimsPage({ params }) {
  const session = await getSession();
  const { centerId } = await params;

  if (!session || session.role !== 'COORDINATOR') {
    redirect('/login');
  }

  const result = await getCoordinatorDashboardData(session.userId);

  if (!result.success || !result.data) {
    return (
      <div className="w-full py-6 px-4">
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <FileWarning className="h-5 w-5 text-red-600" />
          <AlertTitle className="font-semibold text-red-800 dark:text-red-300">Error Loading Claims</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400">
            {result.error || "Could not load claims data. Please try again."}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                <Link href={`/coordinator/${centerId}`}>Back to Overview</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  const { center, claims } = result.data;

  if (center.id !== centerId) {
    redirect('/unauthorized?error=data_mismatch_claims');
  }

  return (
    <div className="w-full space-y-5 py-2">
      <ManageCoordinatorClaimsTab
        centerId={center.id}
        centerName={center.name}
        initialClaims={claims.filter(c => c.status === 'PENDING') || []}
        allClaimsFromCenter={claims || []}
        coordinatorUserId={session.userId}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}
