// app/(dashboard)/staff-registry/claims/page.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import { getClaimsForStaffRegistry } from '@/lib/actions/registry.actions.js';
 // Adjusted path
import { Toaster } from "@/components/ui/sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, ListChecks } from "lucide-react"; // Added ListChecks
import StaffRegistryClaimsView from '../_components/StaffRegistryClaimsView';

export default async function StaffRegistryClaimsPage() {
  const session = await getSession();

  if (!session || !session.userId) {
    redirect('/login');
  }
  if (session.role !== 'STAFF_REGISTRY') {
    redirect('/unauthorized');
  }

  const initialDataResult = await getClaimsForStaffRegistry({ staffRegistryUserId: session.userId });

   if (!initialDataResult.success && initialDataResult.error === "Staff Registry user has no centers assigned.") {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
        <Alert variant="default" className="max-w-lg mx-auto bg-white dark:bg-slate-800 border-blue-500">
          <ListChecks className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-700 dark:text-blue-300">No Centers Assigned</AlertTitle>
          <AlertDescription className="text-slate-600 dark:text-slate-400">
            You need to be assigned to centers to manage their claims. Contact a REGISTRY administrator.
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  if (!initialDataResult.success) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <FileWarning className="h-5 w-5" />
          <AlertTitle>Error Loading Claims</AlertTitle>
          <AlertDescription>
            {initialDataResult.error || "Could not load claims."}
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
  
  return (
    // The parent layout.jsx provides the main structure, here we just render the view
    <StaffRegistryClaimsView
      initialClaimsData={initialDataResult} 
      staffRegistryUserId={session.userId}
    />
  );
}