// app/(dashboard)/registry/users/page.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getAllUsers,
  getCenters // Needed for assigning lecturers to centers in the 'Add User' form
} from '@/lib/actions/registry.actions.js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, Users as UsersIcon } from "lucide-react"; // Icons
import ManageUsersTab from '../_components/ManageUsersTab'; // Path to the existing component
import { Toaster } from "@/components/ui/sonner";

export default async function RegistryManageUsersPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    // This check is also in the layout, but good for direct access attempts
    redirect(session ? '/unauthorized' : '/login');
  }

  // Fetch data required for managing users
  const usersDataPromise = getAllUsers();
  const centersDataPromise = getCenters(); // For the dropdown when creating/editing lecturers

  const [
    usersResult,
    centersResult
  ] = await Promise.all([
    usersDataPromise,
    centersDataPromise
  ]);

  if (!usersResult.success || !centersResult.success) {
    const errorMsg = usersResult.error || centersResult.error || "Could not load necessary data for managing users.";
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
            <UsersIcon className="mr-3 h-8 w-8 text-primary" />
            Manage Users
          </h1>
          <p className="text-muted-foreground">
            Create new user accounts (Coordinators, Lecturers) and manage existing ones.
          </p>
        </div>
      </div>

      {/* Render the ManageUsersTab component as the main content */}
      <ManageUsersTab
        initialUsers={usersResult.users || []}
        centers={centersResult.centers || []} // Pass centers for forms within ManageUsersTab
        // Pass any specific fetch errors if needed
        fetchError={null}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}
