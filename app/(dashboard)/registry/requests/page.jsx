// app/(dashboard)/registry/requests/page.jsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getPendingSignupRequests,
  getCenters // For passing to the tab for center name resolution
} from '@/lib/actions/registry.actions.js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { FileWarning, Users as UsersIcon, AlertTriangle } from "lucide-react"; // Updated icon imports
import ManageSignupRequestsTab from '../_components/ManageSignupRequestsTab'; // Assumed to be styled for light theme
import { Toaster } from "@/components/ui/sonner"; // Assuming this is from shadcn/ui for themed toasts

export default async function RegistryManageSignupRequestsPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  const requestsDataPromise = getPendingSignupRequests();
  const centersDataPromise = getCenters(); 

  const [
    requestsResult,
    centersResult
  ] = await Promise.all([
    requestsDataPromise,
    centersDataPromise
  ]);

  const initialRequestsData = {
    requests: requestsResult.success ? requestsResult.requests : [],
    error: requestsResult.error || null
  };
  
  // If both essential data fetches fail, show a page-level error.
  if (initialRequestsData.error && !centersResult.success) {
    const errorMsg = initialRequestsData.error || centersResult.error || "Could not load critical data for managing signup requests.";
    return (
      <div className="w-full py-6 px-4"> 
        <Alert 
          variant="destructive" 
          className="bg-red-50 border-red-300 dark:bg-red-800/20 dark:border-red-700/50 text-red-700 dark:text-red-300 shadow-md rounded-lg"
        >
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" /> {/* Changed Icon */}
          <AlertTitle className="font-semibold text-lg text-red-800 dark:text-red-200">Critical Error Loading Data</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">
            {errorMsg} The page cannot be displayed. Please try refreshing or contact support.
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
  
  if (!centersResult.success && centersResult.error) {
      // Log this, but the page can still load. ManageSignupRequestsTab will get empty allCenters.
      console.error("Registry/Requests Page: Failed to load centers for filtering:", centersResult.error);
      // Consider a non-blocking toast notification if `toast` is available here or on client side
      // For server components, direct toast is not possible. This would be handled by client components or useEffect.
  }

  // This page's root div assumes it's rendered within a parent layout's <main> tag
  // that handles overall page padding (e.g., px-4, py-6) and max-width (e.g., max-w-7xl mx-auto).
  // This div just provides vertical spacing for its direct children.
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Page Title Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center text-blue-800 dark:text-blue-300">
          <UsersIcon className="mr-2.5 sm:mr-3 h-6 w-6 md:h-7 md:w-7 text-violet-700 dark:text-violet-500 flex-shrink-0" />
          Manage Signup Requests
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
          Approve or reject new user account requests.
        </p>
      </div>

      {/* The Main Content of this page IS the ManageSignupRequestsTab */}
      <ManageSignupRequestsTab
        initialRequestsData={initialRequestsData} // Contains { requests, error }
        registryUserId={session.userId}
        allCenters={centersResult.success ? centersResult.centers : []} // Pass empty if centers fetch failed
      />
      
      {/* Ensure Toaster is from "sonner" if using richColors, or from "components/ui/toaster" if using shadcn's default */}
      <Toaster richColors position="top-right" theme="light" />
    </div>
  );
}