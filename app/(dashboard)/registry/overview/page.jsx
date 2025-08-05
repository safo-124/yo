// app/(dashboard)/registry/overview/page.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import { getSystemOverviewData } from '@/lib/actions/registry.actions.js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from "lucide-react";
import SystemOverview from '../_components/SystemOverview';
import { revalidatePath } from 'next/cache';

// This function allows the refresh button in the client component to re-fetch server data
async function refreshData() {
    "use server";
    revalidatePath('/registry/overview');
}

export default async function RegistryOverviewPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  const { stats, activityFeed, health, error } = await getSystemOverviewData();

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Alert variant="destructive" className="w-full max-w-lg">
          <ServerCrash className="h-5 w-5" />
          <AlertTitle>Failed to Load System Overview</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          System Health & Activity
        </h1>
      </div>
      <SystemOverview 
        initialStats={stats} 
        initialActivityFeed={activityFeed}
        initialHealth={health}
        onRefresh={refreshData}
      />
    </div>
  );
}