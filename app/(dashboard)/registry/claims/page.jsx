// app/(dashboard)/registry/claims/page.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getAllClaimsSystemWide,
  getCenters // Needed for the center filter dropdown
} from '@/lib/actions/registry.actions.js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, FileText } from "lucide-react"; // Icons
import ManageSystemClaimsTab from '../_components/ManageSystemClaimsTab'; // Path to the existing component
import { Toaster } from "@/components/ui/sonner";

export default async function RegistryManageSystemClaimsPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    // This check is also in the layout, but good for direct access attempts
    redirect(session ? '/unauthorized' : '/login');
  }

  // Fetch data required for managing system-wide claims
  // Fetch all claims initially without filters for the initial display.
  // The ManageSystemClaimsTab component will handle subsequent filtered fetches.
  const claimsDataPromise = getAllClaimsSystemWide();
  const centersDataPromise = getCenters(); // For the center filter dropdown

  const [
    claimsResult,
    centersResult
  ] = await Promise.all([
    claimsDataPromise,
    centersDataPromise
  ]);

  // Note: We pass initialClaimsData as an object { claims, error } to the tab component.
  const initialClaimsData = {
    claims: claimsResult.success ? claimsResult.claims : [],
    error: claimsResult.error || null
  };

  if (!centersResult.success) {
    // If centers fail to load, the filter dropdown will be affected.
    // We can still proceed but log the error or show a partial error state.
    console.error("Failed to load centers for filtering:", centersResult.error);
    // The ManageSystemClaimsTab will receive an empty allCenters array and should handle it.
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="mr-3 h-8 w-8 text-primary" />
            System-Wide Claims Management
          </h1>
          <p className="text-muted-foreground">
            View, filter, and process claims from all centers in the system.
          </p>
        </div>
      </div>

      {/* Render the ManageSystemClaimsTab component as the main content */}
      <ManageSystemClaimsTab
        initialClaimsData={initialClaimsData}
        allCenters={centersResult.success ? centersResult.centers : []}
        registryUserId={session.userId}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}
