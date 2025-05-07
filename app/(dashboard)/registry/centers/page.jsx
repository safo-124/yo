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
import { FileWarning, Building } from "lucide-react";
import ManageCentersTab from '../_components/ManageCentersTab';
import { Toaster } from "@/components/ui/sonner";

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

  if (!centersResult.success || !potentialCoordinatorsResult.success) {
    const errorMsg = centersResult.error || potentialCoordinatorsResult.error || "Could not load necessary data for managing centers.";
    return (
      <div className="w-screen h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
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
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen flex flex-col">
      {/* Header with full width */}
      <header className="w-full border-b p-6 bg-background">
        <div className="w-full max-w-[99vw] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <Building className="mr-3 h-6 w-6 md:h-8 md:w-8 text-primary" />
                Manage Academic Centers
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Create and manage academic centers and their coordinators
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area - full width */}
      <main className="w-[80%] flex-1 overflow-hidden">
        <div className="w-full max-w-[99vw] mx-auto p-2 md:p-6">
          <ManageCentersTab
            initialCenters={centersResult.centers || []}
            potentialCoordinators={potentialCoordinatorsResult.users || []}
            fetchError={null}
          />
        </div>
      </main>

      {/* Toaster positioned absolutely */}
      <Toaster richColors position="top-right" />
    </div>
  );
}