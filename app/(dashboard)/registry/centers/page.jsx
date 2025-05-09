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

// Define UEW-inspired colors for consistency (can be imported from a shared constants file)
const uewDeepRed = '#8C181F';
const uewDeepBlue = '#0D2C54';
const uewAccentGold = '#F9A602';
const veryDarkBackground = 'slate-900'; // Or a very dark shade of uewDeepBlue

// Text colors for dark backgrounds
const textOnDarkPrimary = 'text-slate-100';
const textOnDarkSecondary = 'text-slate-300';

export default async function RegistryManageCentersPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  // Fetch data in parallel
  const [centersResult, potentialCoordinatorsResult] = await Promise.all([
    getCenters(),
    getPotentialCoordinators()
  ]);

  // Error handling for data fetching
  if (!centersResult.success || !potentialCoordinatorsResult.success) {
    const errorMsg = centersResult.error || potentialCoordinatorsResult.error || "Could not load necessary data for managing centers.";
    return (
      <div className={`flex flex-col flex-1 h-full items-center justify-center p-4 bg-${veryDarkBackground}`}>
        <div className="w-full max-w-2xl">
          <Alert variant="destructive" className={`bg-[${uewDeepRed}]/30 border-[${uewDeepRed}]/50 text-red-200`}>
            <FileWarning className="h-5 w-5 text-red-300" />
            <AlertTitle className="text-red-100 font-semibold text-lg">Error Loading Data</AlertTitle>
            <AlertDescription className="text-red-200">
              {errorMsg} Please try again later or contact support.
              <div className="mt-6">
                <Button asChild variant="outline" className={`bg-transparent hover:bg-white/10 border-slate-400 ${textOnDarkSecondary} hover:${textOnDarkPrimary}`}>
                  <Link href="/registry">Back to Registry Overview</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    // This page component should fill the space provided by RegistryLayoutClient
    // RegistryLayoutClient's <main> area has overflow-y-auto
    // This div will establish the dark context for the header, and ManageCentersTab will bring its own gradient.
    <div className={`flex flex-col flex-1 h-full bg-${veryDarkBackground}`}>
      {/* Header with dark background and themed text */}
      <header className={`w-full border-b border-slate-700 p-4 sm:p-6 bg-${veryDarkBackground} shadow-md`}>
        {/* Removed max-w and mx-auto to allow full width within its container */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold flex items-center ${textOnDarkPrimary}`}>
              <Building className={`mr-3 h-7 w-7 md:h-8 md:w-8 text-[${uewAccentGold}]`} />
              Manage Academic Centers
            </h1>
            <p className={`text-sm md:text-base ${textOnDarkSecondary} mt-1`}>
              Create and manage academic centers and their coordinators.
            </p>
          </div>
          {/* "New Center" button is now within ManageCentersTab */}
        </div>
      </header>

      {/* Main content area - ManageCentersTab will provide its own gradient and padding */}
      {/* flex-1 and overflow-hidden allows ManageCentersTab to scroll if its content is long */}
      <main className="flex-1 overflow-hidden">
        <ManageCentersTab
          initialCenters={centersResult.centers || []}
          potentialCoordinators={potentialCoordinatorsResult.users || []}
          fetchError={null} // Errors handled above
        />
      </main>

      {/* Toaster for notifications */}
      <Toaster richColors position="top-right" theme="dark" />
    </div>
  );
}
