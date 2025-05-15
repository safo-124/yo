// app/(dashboard)/registry/claims/page.jsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getAllClaimsSystemWide,
  getCenters 
} from '@/lib/actions/registry.actions.js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { FileWarning, ListChecks as PageIcon } from "lucide-react"; 
import ManageSystemClaimsTab from '../_components/ManageSystemClaimsTab';
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

  if (!claimsResult.success) {
    const errorMsg = initialClaimsData.error || "Could not load critical claims data for the page.";
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 sm:p-8 min-h-[calc(100vh-8rem)] bg-slate-50 dark:bg-slate-900"> 
        <Alert 
          variant="destructive" 
          className="w-full max-w-lg bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 shadow-xl rounded-xl p-6"
        >
          <FileWarning className="h-6 w-6 text-red-600 dark:text-red-400" />
          <AlertTitle className="font-semibold text-xl text-red-800 dark:text-red-100 mt-2">Critical Error Loading Data</AlertTitle>
          <AlertDescription className="mt-2.5 text-red-700/90 dark:text-red-200/90">
            {errorMsg} The page cannot be displayed. Please try refreshing, or contact support if the issue persists.
            <div className="mt-6">
              <Button 
                asChild 
                variant="outline" 
                className="border-red-500 text-red-600 hover:bg-red-100/80 focus-visible:ring-red-500 dark:border-red-500 dark:text-red-200 dark:hover:bg-red-700/50"
              >
                <Link href="/registry">Back to Registry Overview</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-center" theme={session?.theme || "light"} />
      </div>
    );
  }
  
  if (!centersResult.success) {
    console.error("Registry/Claims Page: Failed to load centers for filtering:", centersResult.error);
    // A toast can be shown client-side in ManageSystemClaimsTab if allCenters prop is empty
  }

  return (
    <div className="flex flex-col flex-1 h-full p-4 py-6 sm:p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-900">
      <header className="pb-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 md:gap-4">
          <span className="p-3 bg-violet-100 dark:bg-violet-800/30 rounded-xl">
            <PageIcon className="h-6 w-6 md:h-7 md:w-7 text-violet-700 dark:text-violet-400" />
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              System-Wide Claims
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Oversee, filter, and process all submitted claims across every academic center.
            </p>
          </div>
        </div>
      </header>

      <ManageSystemClaimsTab
        initialClaimsData={initialClaimsData}
        allCenters={centersResult.success ? centersResult.centers : []}
        registryUserId={session.userId}
      />
      
      <Toaster richColors position="top-center" theme={session?.theme || "light"} />
    </div>
  );
}