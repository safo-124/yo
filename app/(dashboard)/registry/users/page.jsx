// app/(dashboard)/registry/users/page.jsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getAllUsers,
  getCenters
} from '@/lib/actions/registry.actions.js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { FileWarning, Users as UsersIcon } from "lucide-react";
import ManageUsersTab from '../_components/ManageUsersTab'; // This component is already styled for light theme
import { Toaster } from "@/components/ui/sonner";

export default async function RegistryManageUsersPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  const [usersResult, centersResult] = await Promise.all([
    getAllUsers(),
    getCenters()
  ]);

  if (!usersResult.success || !centersResult.success) {
    const errorMsg = usersResult.error || centersResult.error || "Could not load necessary data for managing users.";
    return (
      // This page's content assumes it's within a layout that provides max-width and centering.
      // Adding specific padding for the error state when it's the only thing on the page.
      <div className="w-full py-6 px-4"> 
        <Alert 
          variant="destructive" 
          className="bg-red-50 border-red-300 dark:bg-red-800/20 dark:border-red-700/50 text-red-700 dark:text-red-300 shadow-md rounded-lg"
        >
          <FileWarning className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="font-semibold text-lg text-red-800 dark:text-red-200">Error Loading Data</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">
            {errorMsg} Please try again later or contact support.
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

  // This page's root div assumes it's rendered within a parent layout's <main> tag
  // that already handles overall page padding (e.g., px-4, py-6) and max-width (e.g., max-w-7xl mx-auto).
  // This div just provides vertical spacing for its direct children.
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Page Title Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center text-blue-800 dark:text-blue-300">
          <UsersIcon className="mr-2.5 sm:mr-3 h-6 w-6 md:h-7 md:w-7 text-violet-700 dark:text-violet-500" />
          User Management
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
          Create, edit, and manage user accounts and their roles.
        </p>
      </div>

      {/* The Main Content of this page IS the ManageUsersTab */}
      {/* ManageUsersTab is already styled for a light theme */}
      <ManageUsersTab
        initialUsers={usersResult.users || []}
        centers={centersResult.centers || []}
        fetchError={null} // Errors handled above
        registryUserId={session.userId} 
      />
      
      <Toaster richColors position="top-right" theme="light" />
    </div>
  );
}