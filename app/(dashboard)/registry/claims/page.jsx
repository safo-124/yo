// app/(dashboard)/registry/claims/page.jsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getAllClaimsSystemWide,
  getCenters // Needed for the center filter dropdown
} from '@/lib/actions/registry.actions.js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { FileWarning, FileText as FileTextIcon } from "lucide-react"; // Renamed FileText to FileTextIcon for clarity
import ManageSystemClaimsTab from '../_components/ManageSystemClaimsTab'; // Path to the existing component
import { Toaster } from "@/components/ui/sonner";

export default async function RegistryManageSystemClaimsPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  const claimsDataPromise = getAllClaimsSystemWide();
  const centersDataPromise = getCenters();

  const [
    claimsResult,
    centersResult
  ] = await Promise.all([
    claimsDataPromise,
    centersDataPromise
  ]);

  const initialClaimsData = {
    claims: claimsResult.success ? claimsResult.claims : [],
    error: claimsResult.error || null
  };

  // Critical error: If both claims and centers (essential for filtering) fail to load,
  // display a page-level error before attempting to render the tab.
  if (initialClaimsData.error && !centersResult.success) {
    const errorMsg = initialClaimsData.error || centersResult.error || "Could not load critical data for managing claims.";
    return (
      <div className="w-full py-6 px-4"> 
        <Alert 
          variant="destructive" 
          className="bg-red-50 border-red-300 dark:bg-red-800/20 dark:border-red-700/50 text-red-700 dark:text-red-300 shadow-md rounded-lg"
        >
          <FileWarning className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="font-semibold text-lg text-red-800 dark:text-red-200">Critical Error Loading Data</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">
            {errorMsg} The page cannot be displayed. Please try again later or contact support.
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
        <Toaster richColors position="top-right" theme="light" />
      </div>
    );
  }
  
  if (!centersResult.success) {
    // Log this, but the page can still load with a potentially degraded filter experience.
    // The ManageSystemClaimsTab will receive an empty allCenters array and should handle it.
    console.error("Registry/Claims Page: Failed to load centers for filtering:", centersResult.error);
    toast.warning("Could not load center filters. Center list may be incomplete.", { duration: 5000 });
  }


  // This page's root div assumes it's rendered within a parent layout's <main> tag
  // that handles overall page padding and max-width.
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Page Title Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center text-blue-800 dark:text-blue-300">
          <FileTextIcon className="mr-2.5 sm:mr-3 h-6 w-6 md:h-7 md:w-7 text-violet-700 dark:text-violet-500 flex-shrink-0" />
          System-Wide Claims Management
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
          View, filter, and process claims from all centers in the system.
        </p>
      </div>

      {/* The Main Content of this page IS the ManageSystemClaimsTab */}
      {/* ManageSystemClaimsTab is already styled for a light theme */}
      <ManageSystemClaimsTab
        initialClaimsData={initialClaimsData} // Contains { claims, error }
        allCenters={centersResult.success ? centersResult.centers : []} // Pass empty array if centers fetch failed
        registryUserId={session.userId}
      />
      
      <Toaster richColors position="top-right" theme="light" />
    </div>
  );
}