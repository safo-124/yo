// app/(dashboard)/registry/centers/page.jsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getCenters,
  getPotentialCoordinators
} from '@/lib/actions/registry.actions.js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { FileWarning } from "lucide-react";
import ManageCentersTab from '../_components/ManageCentersTab';
import { Toaster } from "@/components/ui/sonner";

export default async function RegistryManageCentersPage() {
  const session = await getSession();

  if (!session || !session.userId || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  const [centersResult, potentialCoordinatorsResult] = await Promise.all([
    getCenters(),
    getPotentialCoordinators()
  ]);

  let fetchErrorMsg = null;
  if (!centersResult.success) {
    fetchErrorMsg = centersResult.error || "Could not load centers data.";
  } else if (!potentialCoordinatorsResult.success) {
    fetchErrorMsg = potentialCoordinatorsResult.error || "Could not load potential coordinators data.";
  }

  if (fetchErrorMsg) {
    return (
      <div className="w-full py-8 px-6">
        <Alert
          variant="destructive"
          className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/20 dark:to-red-800/10 dark:border-red-700/50 text-red-800 dark:text-red-200 shadow-lg rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <FileWarning className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertTitle className="font-bold text-lg text-red-900 dark:text-red-100">
              Unable to Load Data
            </AlertTitle>
          </div>
          <AlertDescription className="text-red-700 dark:text-red-300 leading-relaxed">
            {fetchErrorMsg}
            <div className="mt-6">
              <Button asChild variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-900/30">
                <Link href="/registry">← Back to Registry</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-right" theme="light" />
      </div>
    );
  }

  const centers = centersResult.centers || [];

  // Compute aggregate stats
  const stats = {
    totalCenters: centers.length,
    totalLecturers: centers.reduce((sum, c) => sum + (c.lecturerCount || 0), 0),
    totalDepartments: centers.reduce((sum, c) => sum + (c.departmentCount || 0), 0),
    totalStaffRegistry: centers.reduce((sum, c) => sum + (c.staffRegistryCount || 0), 0),
  };

  return (
    <div className="w-full">
      <ManageCentersTab
        initialCenters={centers}
        potentialCoordinators={potentialCoordinatorsResult.users || []}
        currentUserId={session.userId}
        stats={stats}
      />
      <Toaster richColors position="top-right" theme="light" />
    </div>
  );
}
