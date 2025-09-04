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
import { FileWarning, Users as UsersIcon, ShieldCheck, Sparkles } from "lucide-react";
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
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-right" theme="light" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-300">
                User Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Create, manage, and organize user accounts across the system
              </p>
            </div>
          </div>
          
          {/* Stats Summary */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {usersResult.users?.length || 0}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {centersResult.centers?.length || 0}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Centers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main User Management Component */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <ManageUsersTab
          initialUsers={usersResult.users || []}
          centers={centersResult.centers || []}
          fetchError={null}
          registryUserId={session.userId} 
        />
      </div>
      
      <Toaster richColors position="top-right" theme="light" />
    </div>
  );
}