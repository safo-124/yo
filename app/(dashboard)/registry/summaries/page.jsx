// app/(dashboard)/registry/summaries/page.jsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/actions/auth.actions';
import { getAllUsers } from '@/lib/actions/registry.actions.js'; // To get list of users
import ManageLecturerSummariesTab from '../_components/ManageLecturerSummariesTab'; // The component we created
import { Toaster } from "@/components/ui/sonner";
import { BarChartHorizontalBig, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';

// Define UEW-inspired colors (ensure consistency with your theme)
const uewDeepRed = '#8C181F';
const uewDeepBlue = '#0D2C54';
const uewAccentGold = '#F9A602';
const veryDarkBackground = 'slate-900'; // Consistent dark background for page wrappers

// Text colors for dark backgrounds
const textOnDarkPrimary = 'text-slate-100';
const textOnDarkSecondary = 'text-slate-300';

export default async function RegistryLecturerSummariesPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  // Fetch all users to populate the lecturer selection dropdown in the tab component
  const usersResult = await getAllUsers();

  // Handle potential errors during data fetching for users
  if (!usersResult.success) {
    const errorMsg = usersResult.error || "Could not load user data required for summaries.";
    return (
      // This error state will fill the content area provided by RegistryLayoutClient
      <div className={`flex flex-col flex-1 h-full items-center justify-center p-4 sm:p-6 lg:p-8 bg-${veryDarkBackground}`}>
        <div className="w-full max-w-2xl">
          <Alert variant="destructive" className={`bg-[${uewDeepRed}]/40 border-[${uewDeepRed}]/60 text-red-100 shadow-xl rounded-lg`}>
            <AlertTriangle className="h-5 w-5 text-red-200" />
            <AlertTitle className="text-red-50 font-semibold text-lg">Error Loading Page Data</AlertTitle>
            <AlertDescription className="text-red-100/90">
              {errorMsg} Please try refreshing the page or contact support if the issue persists.
              <div className="mt-6">
                <Button 
                  asChild 
                  variant="outline" 
                  className={`bg-transparent hover:bg-white/10 border-slate-400/70 ${textOnDarkSecondary} hover:${textOnDarkPrimary} focus:ring-[${uewAccentGold}]`}
                >
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
    // This page component should fill the space provided by RegistryLayoutClient's <main> tag.
    // The RegistryLayoutClient <main> already has overflow-y-auto.
    // This div establishes the dark context for the header. ManageLecturerSummariesTab brings its own gradient.
    <div className={`flex flex-col flex-1 h-full bg-${veryDarkBackground}`}>
      {/* Header with dark background and themed text */}
      <header className={`w-full border-b border-slate-700/80 p-4 sm:p-6 bg-${veryDarkBackground} shadow-lg`}>
        {/* The div below ensures content within the header aligns with the overall layout if needed, but can be full width */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold flex items-center ${textOnDarkPrimary}`}>
              <BarChartHorizontalBig className={`mr-3 h-7 w-7 md:h-8 md:w-8 text-[${uewAccentGold}]`} />
              Lecturer Claim Summaries
            </h1>
            <p className={`text-sm md:text-base ${textOnDarkSecondary} mt-1`}>
              Generate and view monthly claim reports for individual lecturers.
            </p>
          </div>
          {/* No additional buttons needed in this header as actions are within the tab */}
        </div>
      </header>

      {/* Main content area - ManageLecturerSummariesTab will provide its own gradient and padding */}
      {/* flex-1 and overflow-hidden allows ManageLecturerSummariesTab to fill space and manage its own scroll */}
      <main className="flex-1 overflow-hidden">
        <ManageLecturerSummariesTab
          allUsers={usersResult.users || []} 
          // fetchError is not passed as it's handled above for the page's primary data.
          // The Tab component will handle its own errors for summary generation.
        />
      </main>

      {/* Toaster for notifications, themed for dark background */}
      <Toaster richColors position="top-right" theme="dark" />
    </div>
  );
}
