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
import ManageCentersTab from '../_components/ManageCentersTab'; // Path to your styled component
import { Toaster } from "@/components/ui/sonner";

// Using direct Tailwind classes with the new palette for a light theme
// Palette: Red-800, Blue-800, Violet-800, White

export default async function RegistryManageCentersPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  const [centersResult, potentialCoordinatorsResult] = await Promise.all([
    getCenters(),
    getPotentialCoordinators()
  ]);

  if (!centersResult.success || !potentialCoordinatorsResult.success) {
    const errorMsg = centersResult.error || potentialCoordinatorsResult.error || "Could not load necessary data for managing centers.";
    return (
      // Error display for light theme
      <div className="flex flex-col flex-1 h-full items-center justify-center p-4 bg-white dark:bg-slate-900">
        <div className="w-full max-w-2xl">
          <Alert 
            variant="destructive" 
            className="bg-red-50 border-red-300 dark:bg-red-800/20 dark:border-red-700/50 text-red-700 dark:text-red-300 shadow-md rounded-lg"
          >
            <FileWarning className="h-5 w-5 text-red-600 dark:text-red-400" />
            <AlertTitle className="font-semibold text-lg text-red-800 dark:text-red-200">Error Loading Data</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              {errorMsg} Please try again later or contact support.
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
        <Toaster richColors position="top-right" theme="light" /> {/* Changed theme to light */}
      </div>
    );
  }

  return (
    // Page container with white background
    <div className="flex flex-col flex-1 h-full bg-white dark:bg-slate-900">
      {/* Header with light background and themed text */}
      <header className="w-full border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6 bg-white dark:bg-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center text-blue-800 dark:text-blue-300">
              <Building className="mr-3 h-7 w-7 md:h-8 md:w-8 text-violet-700 dark:text-violet-500" />
              Manage Academic Centers
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
              Create and manage academic centers and their coordinators.
            </p>
          </div>
          {/* "New Center" button is expected to be within ManageCentersTab */}
        </div>
      </header>

      {/* Main content area - ManageCentersTab will provide its own styling */}
      {/* flex-1 and overflow-hidden allows ManageCentersTab to fill and scroll if its content is long */}
      <main className="flex-1 overflow-hidden">
        <ManageCentersTab
          initialCenters={centersResult.centers || []}
          potentialCoordinators={potentialCoordinatorsResult.users || []}
          fetchError={null} 
        />
      </main>

      <Toaster richColors position="top-right" theme="light" /> {/* Changed theme to light */}
    </div>
  );
}