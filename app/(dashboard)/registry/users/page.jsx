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
import { FileWarning } from "lucide-react";
import ManageUsersTab from '../_components/ManageUsersTab';
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
      <div className="w-full py-8 px-6"> 
        <Alert 
          variant="destructive" 
          className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/20 dark:to-red-800/10 dark:border-red-700/50 text-red-800 dark:text-red-200 shadow-lg rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <FileWarning className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertTitle className="font-bold text-lg text-red-900 dark:text-red-100">
                Unable to Load User Data
              </AlertTitle>
            </div>
          </div>
          <AlertDescription className="text-red-700 dark:text-red-300 leading-relaxed">
            {errorMsg}
            <div className="mt-6 flex gap-3">
              <Button 
                asChild 
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-red-100 focus-visible:ring-red-500 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                <Link href="/registry">← Back to Registry</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-right" theme="light" />
      </div>
    );
  }

  // Compute per-role counts for stats
  const users = usersResult.users || [];
  const roleCounts = {
    REGISTRY: users.filter(u => u.role === 'REGISTRY').length,
    STAFF_REGISTRY: users.filter(u => u.role === 'STAFF_REGISTRY').length,
    COORDINATOR: users.filter(u => u.role === 'COORDINATOR').length,
    LECTURER: users.filter(u => u.role === 'LECTURER').length,
  };

  return (
    <div className="w-full">
      <ManageUsersTab
        initialUsers={users}
        centers={centersResult.centers || []}
        fetchError={null}
        registryUserId={session.userId}
        totalCenters={centersResult.centers?.length || 0}
        roleCounts={roleCounts}
      />
      <Toaster richColors position="top-right" theme="light" />
    </div>
  );
}