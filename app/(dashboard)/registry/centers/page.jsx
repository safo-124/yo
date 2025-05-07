// app/(dashboard)/registry/centers/page.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getCenters,
  getPotentialCoordinators
} from '@/lib/actions/registry.actions.js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, Building } from "lucide-react"; // Icons
import ManageCentersTab from '../_components/ManageCentersTab'; // Path to the existing component
import { Toaster } from "@/components/ui/sonner";

export default async function RegistryManageCentersPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    // This check is also in the layout, but good for direct access attempts
    redirect(session ? '/unauthorized' : '/login');
  }

  // Fetch data required for managing centers
  const centersDataPromise = getCenters();
  const potentialCoordinatorsDataPromise = getPotentialCoordinators();

  const [
    centersResult,
    potentialCoordinatorsResult
  ] = await Promise.all([
    centersDataPromise,
    potentialCoordinatorsDataPromise
  ]);

  if (!centersResult.success || !potentialCoordinatorsResult.success) {
    const errorMsg = centersResult.error || potentialCoordinatorsResult.error || "Could not load necessary data for managing centers.";
    return (
      <div className="mt-4">
        <Alert variant="destructive">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            {errorMsg} Please try again later or contact support.
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/registry">Back to Registry Overview</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Building className="mr-3 h-8 w-8 text-primary" />
            Manage Centers
          </h1>
          <p className="text-muted-foreground">
            Create new academic centers and assign coordinators.
          </p>
        </div>
      </div>

      {/* Render the ManageCentersTab component as the main content */}
      <ManageCentersTab
        initialCenters={centersResult.centers || []}
        potentialCoordinators={potentialCoordinatorsResult.users || []}
        // Pass any specific fetch errors if needed, though handled above for page load
        fetchError={null} // Or pass individual errors if you want the component to also show them
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}
