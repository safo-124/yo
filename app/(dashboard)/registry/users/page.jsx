// app/(dashboard)/registry/users/page.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getAllUsers,
  getCenters
} from '@/lib/actions/registry.actions.js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, Users as UsersIcon } from "lucide-react";
import ManageUsersTab from '../_components/ManageUsersTab';
import { Toaster } from "@/components/ui/sonner";

export default async function RegistryManageUsersPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  // Fetch data in parallel
  const [usersResult, centersResult] = await Promise.all([
    getAllUsers(),
    getCenters()
  ]);

  if (!usersResult.success || !centersResult.success) {
    const errorMsg = usersResult.error || centersResult.error || "Could not load necessary data for managing users.";
    return (
      <div className="w-full py-8">
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
    <div className="w-screen min-h-screen flex flex-col">
    {/* Header with full width */}
    <header className="w-full border-b p-6 bg-background">
      <div className="w-full max-w-[99vw] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <UsersIcon className="mr-3 h-6 w-6 md:h-8 md:w-8 text-primary" />
                User Management
                </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Create, Edit and Manage user
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Section - Table at 80% width */}
      <main className="w-[80%] flex-1 overflow-hidden">
        <div className="w-full max-w-[99vw] mx-auto p-2 md:p-6">
          <ManageUsersTab
            initialUsers={usersResult.users || []}
            centers={centersResult.centers || []}
            fetchError={null}
          />
       </div>
       </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}