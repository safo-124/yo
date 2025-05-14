// app/(dashboard)/staff-registry/summaries/page.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
// We'll need actions to get data for summaries, e.g., assigned centers, lecturers in those centers
import { getAssignedCentersForStaffRegistry, getAllUsers } from '@/lib/actions/registry.actions';

import { Toaster } from "@/components/ui/sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, BarChart3 } from "lucide-react";
import StaffRegistrySummariesView from '../_components/StaffRegistrySummariesView';


export default async function StaffRegistrySummariesPage() {
  const session = await getSession();

  if (!session || !session.userId) {
    redirect('/login');
  }
  if (session.role !== 'STAFF_REGISTRY') {
    redirect('/unauthorized');
  }

  // Fetch data needed for the summaries view
  // 1. Centers assigned to this staff member (for filtering grouped summaries)
  const assignedCentersResult = await getAssignedCentersForStaffRegistry({ staffRegistryUserId: session.userId });
  
  // 2. All users (to filter lecturers within assigned centers for individual lecturer summaries)
  // This could be optimized by a dedicated action: getLecturersInStaffAssignedCenters({ staffRegistryUserId })
  const allUsersResult = await getAllUsers(); 

  if (!assignedCentersResult.success || !allUsersResult.success) {
    const errorMsg = assignedCentersResult.error || allUsersResult.error || "Could not load necessary data for summaries.";
     return (
      <div className="flex flex-col flex-1 h-full items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <FileWarning className="h-5 w-5" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            {errorMsg} Please try refreshing.
             <div className="mt-4">
                <Button asChild variant="outline">
                    <Link href="/staff-registry">Back to Dashboard</Link>
                </Button>
            </div>
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  // Filter lecturers to only those in the staff member's assigned centers
  const assignedCenterIds = assignedCentersResult.centers.map(c => c.id);
  const relevantLecturers = (allUsersResult.users || []).filter(user => 
    (user.role === 'LECTURER' || user.role === 'COORDINATOR') && 
    user.lecturerCenterId && 
    assignedCenterIds.includes(user.lecturerCenterId)
  );


  return (
    <div className="flex flex-col flex-1 h-full bg-slate-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 shadow-sm p-4 sm:p-6 border-b dark:border-slate-700">
            <h1 className="text-xl md:text-2xl font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-violet-600 dark:text-violet-500" />
                Claim Summaries & Reports
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Generate and view claim summaries for your assigned centers.
            </p>
        </header>
        <main className="flex-1 overflow-hidden p-3 sm:p-4 md:p-6">
            <StaffRegistrySummariesView
                staffRegistryUserId={session.userId}
                assignedCenters={assignedCentersResult.centers || []}
                lecturersInAssignedCenters={relevantLecturers || []}
            />
        </main>
        <Toaster richColors position="top-center" />
    </div>
  );
}