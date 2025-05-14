// app/(dashboard)/staff-registry/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getStaffRegistryDashboardStats } from '@/lib/actions/registry.actions.js'; // Placeholder action
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListChecks, Hourglass, Building2, AlertTriangle } from "lucide-react";
import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default async function StaffRegistryDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'STAFF_REGISTRY') {
    redirect('/login'); // Or unauthorized
  }

  const statsResult = await getStaffRegistryDashboardStats({ staffRegistryUserId: session.userId });
  const stats = statsResult.success ? statsResult.data : { assignedCentersCount: 0, pendingClaimsCount: 0 };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Staff Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white dark:bg-slate-800 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Assigned Centers</CardTitle>
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.assignedCentersCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Number of centers you manage claims for.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">Pending Claims</CardTitle>
            <Hourglass className="h-5 w-5 text-orange-500 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.pendingClaimsCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Claims awaiting your review in assigned centers.
            </p>
          </CardContent>
        </Card>
        
        {/* Add more stat cards as needed */}
        <Card className="bg-white dark:bg-slate-800 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-700 dark:text-violet-400">Quick Links</CardTitle>
             <ListChecks className="h-5 w-5 text-violet-600 dark:text-violet-500" />
          </CardHeader>
          <CardContent className="pt-4">
             <Button asChild variant="link" className="p-0 h-auto text-violet-700 dark:text-violet-400 hover:underline">
                <Link href="/staff-registry/claims">View & Process Claims</Link>
             </Button>
             <br/>
             <Button asChild variant="link" className="p-0 h-auto text-violet-700 dark:text-violet-400 hover:underline mt-1">
                <Link href="/staff-registry/summaries">Generate Summaries</Link>
             </Button>
          </CardContent>
        </Card>
      </div>
      
      {stats.assignedCentersCount === 0 && (
        <Card className="mt-6 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500 dark:border-yellow-700">
            <CardHeader>
                <CardTitle className="text-yellow-800 dark:text-yellow-300 flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Action Required</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-yellow-700 dark:text-yellow-200">You are not currently assigned to any centers. Please contact a REGISTRY administrator to get assigned to centers to manage their claims.</p>
            </CardContent>
        </Card>
      )}

      {/* You can add more sections here, like recent activity, notifications, etc. */}
    </div>
  );
}