// app/(dashboard)/registry/summaries/page.jsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/actions/auth.actions';
import { getAllUsers } from '@/lib/actions/registry.actions.js'; // To get list of users
import ManageLecturerSummariesTab from '../_components/ManageLecturerSummariesTab'; // The component already styled for light theme
import { Toaster } from "@/components/ui/sonner";
import { BarChartHorizontalBig, AlertTriangle, FileWarning } from "lucide-react"; // Updated icon import
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';

// Using direct Tailwind classes with the new palette for a light theme

export default async function RegistryLecturerSummariesPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  const usersResult = await getAllUsers();

  if (!usersResult.success) {
    const errorMsg = usersResult.error || "Could not load user data required for summaries.";
    return (
      // Error display for light theme, assuming this page fills its allocated space in a layout
      <div className="flex flex-col flex-1 items-center justify-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-slate-900 min-h-0"> {/* min-h-0 ensures it fits flex parent */}
        <div className="w-full max-w-2xl">
          <Alert 
            variant="destructive" 
            className="bg-red-50 border-red-300 dark:bg-red-800/20 dark:border-red-700/50 text-red-700 dark:text-red-300 shadow-md rounded-lg"
          >
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" /> {/* Changed icon to AlertTriangle */}
            <AlertTitle className="font-semibold text-lg text-red-800 dark:text-red-200">Error Loading Page Data</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              {errorMsg} Please try refreshing the page or contact support if the issue persists.
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
    // This page component is designed to fill the space given by a parent layout.
    // min-h-0 helps in flexbox contexts to prevent overflow if parent has fixed height.
    <div className="flex flex-col flex-1 h-full p-4 py-6 sm:p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-900">
      {/* Polished Page Header */}
      <header className="pb-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 md:gap-4">
          <span className="p-3 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-violet-500/20">
            <BarChartHorizontalBig className="h-6 w-6 md:h-7 md:w-7 text-white" />
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Lecturer Claim Summaries
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Generate and view monthly claim reports for individual lecturers.
            </p>
          </div>
        </div>
      </header>

      <ManageLecturerSummariesTab
          allUsers={usersResult.users || []} 
          // fetchError is not passed here as this page handles the primary data fetch error.
          // The Tab component handles its own internal errors for summary generation.
        />

      <Toaster richColors position="top-right" theme="light" />
    </div>
  );
}