// app/(dashboard)/registry/page.jsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getCenters,
  getAllUsers,
  getAllClaimsSystemWide,
  getSystemOverviewData // 1. Import the new server action
} from '@/lib/actions/registry.actions.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
    Building, Users, FileText, AlertTriangle, BarChart3, Activity, ExternalLink, DatabaseZap, 
    Database, CheckCircle, XCircle, 
    UserPlus
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Helper to get icon for activity feed items
const getActivityIcon = (type) => {
    switch(type) {
        case 'NEW_CLAIM': return { Icon: FileText, color: 'text-blue-500' };
        case 'NEW_USER_REQUEST': return { Icon: Users, color: 'text-orange-500' };
        case 'CLAIM_PROCESSED': return { Icon: CheckCircle, color: 'text-green-500' };
        default: return { Icon: Activity, color: 'text-slate-500' };
    }
};

// Helper function to format time since an event
const timeSince = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

export default async function RegistryDashboardPage() { // Renamed for clarity
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  // 2. Add the new data promise to the list
  const centersDataPromise = getCenters();
  const usersDataPromise = getAllUsers();
  const pendingClaimsDataPromise = getAllClaimsSystemWide({ status: "PENDING" });
  const overviewDataPromise = getSystemOverviewData(); // Fetch overview data

  const [
    centersResult,
    usersResult,
    pendingClaimsResult,
    overviewResult, // Get result for overview data
  ] = await Promise.allSettled([
    centersDataPromise,
    usersDataPromise,
    pendingClaimsDataPromise,
    overviewDataPromise,
  ]);

  const processSettledResult = (result, dataKey, isCount=true) => {
    if (result.status === 'fulfilled' && result.value.success) {
      const data = result.value[dataKey];
      return { 
        success: true, 
        data: data, 
        count: isCount ? (data?.length ?? 0) : null,
        error: null 
      };
    }
    const errorMessage = result.status === 'fulfilled' ? result.value.error : result.reason?.message || "Failed to fetch data";
    return { success: false, data: null, count: 0, error: errorMessage };
  };

  const centersInfo = processSettledResult(centersResult, 'centers');
  const usersInfo = processSettledResult(usersResult, 'users');
  const pendingClaimsInfo = processSettledResult(pendingClaimsResult, 'claims');
  
  // 3. Process the new overview data result
  const overviewInfo = processSettledResult(overviewResult, 'stats', false);
  const activityFeed = (overviewResult.status === 'fulfilled' && overviewResult.value.success) ? overviewResult.value.activityFeed : [];
  const healthStatus = (overviewResult.status === 'fulfilled' && overviewResult.value.success) ? overviewResult.value.health : { database: { status: 'error' }, googleMaps: { status: 'error' } };


  const stats = [
    {
      title: "Total Centers",
      count: centersInfo.count,
      icon: Building,
      href: "/registry/centers",
      description: "Manage all academic centers.",
      error: centersInfo.error,
      gradientClasses: "bg-gradient-to-br from-blue-700 via-blue-800 to-violet-700",
      iconColor: "text-white/80",
    },
    {
      title: "Registered Users",
      count: usersInfo.count,
      icon: Users,
      href: "/registry/users",
      description: "Manage all user accounts.",
      error: usersInfo.error,
      gradientClasses: "bg-gradient-to-br from-violet-700 via-violet-800 to-red-700",
      iconColor: "text-white/80",
    },
    {
      title: "Pending Claims",
      // Use the more accurate count from the overview data if available
      count: overviewInfo.success ? overviewInfo.data.pendingClaimsCount : pendingClaimsInfo.count,
      icon: FileText,
      href: "/registry/claims?status=PENDING",
      description: "Review and process claims.",
      error: pendingClaimsInfo.error || overviewInfo.error,
      gradientClasses: "bg-gradient-to-br from-red-700 via-red-800 to-orange-700",
      iconColor: "text-white/80",
    },
    {
      title: "Pending Signups",
      // Get this count from our new overview data
      count: overviewInfo.success ? overviewInfo.data.pendingSignupsCount : 'N/A',
      icon: UserPlus,
      href: "/registry/requests",
      description: "Review new account requests.",
      error: overviewInfo.error,
      gradientClasses: "bg-gradient-to-br from-violet-600 via-blue-700 to-sky-600", 
      iconColor: "text-white/80",
    },
  ];

  return (
    <div className="min-h-full space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <div className="mb-6 sm:mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-blue-800 dark:text-blue-400 flex items-center`}>
          <DatabaseZap className={`mr-3 h-7 w-7 sm:h-8 sm:w-8 text-blue-700 dark:text-blue-500`} />
          Registry Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1.5 text-sm sm:text-base">
          Welcome, <span className="font-semibold">{session.name || session.email}</span>! Key statistics and system overview.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.title} className="block group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 transition-shadow duration-300">
            <Card className={`text-white border-none ${stat.gradientClasses} transform transition-all duration-300 ease-in-out group-hover:scale-[1.02] group-focus-visible:scale-[1.02] group-hover:brightness-110 group-focus-visible:brightness-110 h-full flex flex-col`}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4 px-4">
                <CardTitle className="text-sm sm:text-base font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor} opacity-90`} />
              </CardHeader>
              <CardContent className="px-4 pb-4 flex-grow flex flex-col justify-between">
                <div>
                  {stat.error ? (
                    <div className="flex items-center text-red-200 dark:text-red-300 mt-1"><AlertTriangle className="mr-2 h-6 w-6 sm:h-7 sm:w-7" /><p className="text-2xl sm:text-3xl font-bold">Error</p></div>
                  ) : (
                    <div className="text-3xl sm:text-4xl font-bold">{stat.count}</div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-white/70 group-hover:text-white/90 pt-1.5 transition-colors line-clamp-2" title={stat.error ? stat.error : stat.description}>
                  {stat.error ? stat.error.substring(0,60) + (stat.error.length > 60 ? "..." : "") : stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* --- UPDATED: System Health & Activity Card --- */}
      <Card className="bg-white dark:bg-slate-800/70 shadow-xl rounded-xl border border-slate-200 dark:border-slate-700">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center space-x-3">
            <Activity className={`h-6 w-6 sm:h-7 sm:w-7 text-blue-700 dark:text-blue-400`} />
            <div>
              <CardTitle className={`text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-300`}>System Health & Activity</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                A live overview of core services and recent events.
              </CardDescription>
            </div>
          </div>
          <Button asChild variant="outline" className="mt-3 sm:mt-0 border-blue-600 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-900/40">
            <Link href="/registry/overview">View Full Report <ExternalLink className="ml-2 h-4 w-4" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {/* Health Status Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 border-b dark:border-slate-700 pb-2">Core Services</h3>
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                    <div className="flex items-center gap-2"><Database className="h-4 w-4 text-slate-500 dark:text-slate-400"/><span>Database Connection</span></div>
                    {healthStatus.database.status === 'ok' ? 
                        <Badge variant="outline" className="border-green-500 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">OK</Badge> : 
                        <Badge variant="destructive">Error</Badge>}
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                    <div className="flex items-center gap-2"><Building className="h-4 w-4 text-slate-500 dark:text-slate-400"/><span>Google Maps Service</span></div>
                    {healthStatus.googleMaps.status === 'ok' ? 
                        <Badge variant="outline" className="border-green-500 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Configured</Badge> : 
                        <Badge variant="destructive" title={healthStatus.googleMaps.message}>Not Configured</Badge>}
                </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="space-y-3">
                 <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 border-b dark:border-slate-700 pb-2">Recent Activity</h3>
                 {activityFeed.length > 0 ? (
                    <ul className="space-y-3">
                        {activityFeed.slice(0, 4).map((item, index) => { // Show top 4 items
                            const { Icon, color } = getActivityIcon(item.type);
                            return (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="mt-1"><Icon className={`h-4 w-4 ${color}`} /></div>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-800 dark:text-slate-100">{item.details}</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{timeSince(item.timestamp)}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                 ) : (
                    <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-6">No recent activity logged.</p>
                 )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}