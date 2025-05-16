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
import { FileWarning, Building } from "lucide-react";
import ManageCentersTab from '../_components/ManageCentersTab';
import { Toaster } from "@/components/ui/sonner";

export default async function RegistryManageCentersPage() {
  const session = await getSession();

  if (!session || !session.userId || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  // Fetch data concurrently
  const [centersResult, potentialCoordinatorsResult] = await Promise.all([
    getCenters(),
    getPotentialCoordinators()
  ]);

  // Consolidated error handling
  let fetchErrorMsg = null;
  if (!centersResult.success) {
    fetchErrorMsg = centersResult.error || "Could not load centers data.";
  } else if (!potentialCoordinatorsResult.success && !fetchErrorMsg) { // Only set if no previous error
    fetchErrorMsg = potentialCoordinatorsResult.error || "Could not load potential coordinators data.";
  }


  if (fetchErrorMsg) {
    return (
      <div className="flex flex-col flex-1 h-full items-center justify-center p-4 bg-white dark:bg-slate-900">
        <div className="w-full max-w-2xl">
          <Alert
            variant="destructive"
            className="bg-red-50 border-red-300 dark:bg-red-800/20 dark:border-red-700/50 text-red-700 dark:text-red-300 shadow-md rounded-lg"
          >
            <FileWarning className="h-5 w-5 text-red-600 dark:text-red-400" />
            <AlertTitle className="font-semibold text-lg text-red-800 dark:text-red-200">Error Loading Data</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              {fetchErrorMsg} Please try again later or contact support.
              <div className="mt-6">
                <Button
                  asChild
                  variant="outline"
                  className="border-red-600 text-red-700 hover:bg-red-100 focus-visible:ring-red-500 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-700/30"
                >
                  <Link href="/registry">Back to Registry Overview</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
        <Toaster richColors position="top-right" theme="light" />
      </div>
    );
  }

  return (
    // This root div sets up the overall page flex structure.
    // h-full assumes its parent (likely from a layout file) also supports height distribution.
    <div className="flex flex-col flex-1 h-full bg-white dark:bg-slate-900">
      <header className="w-full border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6 bg-white dark:bg-slate-800 shadow-sm shrink-0"> {/* Added shrink-0 to header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center text-blue-800 dark:text-blue-300">
              <Building className="mr-3 h-7 w-7 md:h-8 md:w-8 text-violet-700 dark:text-violet-500" />
              Manage Study Centers
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
              Create and manage Study centers and their coordinators.
            </p>
          </div>
        </div>
      </header>

      {/* Main content area: flex-1 allows it to take available vertical space. overflow-hidden is crucial. */}
      <main className="flex-1 overflow-hidden p-4 sm:p-6">
        <ManageCentersTab
          initialCenters={centersResult.centers || []}
          potentialCoordinators={potentialCoordinatorsResult.users || []}
          currentUserId={session.userId}
        />
      </main>
      <Toaster richColors position="top-right" theme="light" />
    </div>
  );
}