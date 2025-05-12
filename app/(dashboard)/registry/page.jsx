// app/(dashboard)/registry/page.jsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getCenters,
  getAllUsers,
  getAllClaimsSystemWide
} from '@/lib/actions/registry.actions.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building, Users, FileText, AlertTriangle, BarChart3, Activity, ExternalLink, DatabaseZap } from "lucide-react";

// Color constants for clarity (used for elements other than card gradients now)
const brandColors = {
  blue: "blue-800",
  violet: "violet-800",
  red: "red-800",
};

export default async function RegistryOverviewPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  const centersDataPromise = getCenters();
  const usersDataPromise = getAllUsers();
  const pendingClaimsDataPromise = getAllClaimsSystemWide({ status: "PENDING" });
  const approvedClaimsDataPromise = getAllClaimsSystemWide({ status: "APPROVED" });

  const [
    centersResult,
    usersResult,
    pendingClaimsResult,
    approvedClaimsResult,
  ] = await Promise.allSettled([
    centersDataPromise,
    usersDataPromise,
    pendingClaimsDataPromise,
    approvedClaimsDataPromise,
  ]);

  const processSettledResult = (result, dataKey) => {
    if (result.status === 'fulfilled' && result.value.success) {
      return { success: true, data: result.value[dataKey], count: result.value[dataKey]?.length ?? 0, error: null };
    }
    const errorMessage = result.status === 'fulfilled' ? result.value.error : result.reason?.message || "Failed to fetch data";
    return { success: false, data: null, count: 0, error: errorMessage };
  };

  const centersInfo = processSettledResult(centersResult, 'centers');
  const usersInfo = processSettledResult(usersResult, 'users');
  const pendingClaimsInfo = processSettledResult(pendingClaimsResult, 'claims');
  const approvedClaimsInfo = processSettledResult(approvedClaimsResult, 'claims');

  const stats = [
    {
      title: "Total Centers",
      count: centersInfo.count,
      icon: Building,
      href: "/registry/centers",
      description: "Manage all academic centers.",
      error: centersInfo.error,
      // Hardcoded gradient classes
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
      count: pendingClaimsInfo.count,
      icon: FileText,
      href: "/registry/claims?status=PENDING",
      description: "Review and process claims.",
      error: pendingClaimsInfo.error,
      gradientClasses: "bg-gradient-to-br from-red-700 via-red-800 to-orange-700", // Using orange as an accent with red
      iconColor: "text-white/80",
    },
    {
      title: "Approved Claims",
      count: approvedClaimsInfo.count,
      icon: BarChart3,
      href: "/registry/claims?status=APPROVED",
      description: "View all approved claims.",
      error: approvedClaimsInfo.error,
      // A mix for "approved" - could also be a less intense gradient or solid color if preferred
      gradientClasses: "bg-gradient-to-br from-violet-600 via-blue-700 to-sky-600", 
      iconColor: "text-white/80",
    },
  ];

  return (
    <div className="min-h-full space-y-6 sm:space-y-8 p-3 sm:p-4 md:p-6 lg:p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <div className="mb-6 sm:mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-${brandColors.blue} dark:text-blue-400 flex items-center`}>
          <DatabaseZap className={`mr-3 h-7 w-7 sm:h-8 sm:w-8 text-${brandColors.blue} dark:text-blue-500`} />
          Registry Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
          Welcome, <span className="font-semibold">{session.name || session.email}</span>! Key statistics and quick actions.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.title} className="block group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 transition-shadow duration-300">
            <Card className={`text-white border-none ${stat.gradientClasses} transform transition-all duration-300 ease-in-out group-hover:scale-[1.02] group-focus-visible:scale-[1.02] group-hover:brightness-110 group-focus-visible:brightness-110 h-full flex flex-col`}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4 px-4">
                <CardTitle className="text-sm sm:text-base font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor} opacity-90`} />
              </CardHeader>
              <CardContent className="px-4 pb-4 flex-grow flex flex-col justify-between">
                <div>
                  {stat.error ? (
                    <div className="flex items-center text-red-200 dark:text-red-300 mt-1">
                      <AlertTriangle className="mr-2 h-6 w-6 sm:h-7 sm:w-7" />
                      <p className="text-2xl sm:text-3xl font-bold">Error</p>
                    </div>
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

      {/* System Health & Activity Card */}
      <Card className="bg-white dark:bg-slate-800/70 shadow-xl rounded-xl border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Activity className={`h-6 w-6 sm:h-7 sm:w-7 text-${brandColors.blue} dark:text-blue-400`} />
            <div>
              <CardTitle className={`text-lg sm:text-xl font-semibold text-${brandColors.blue} dark:text-blue-300`}>System Health & Activity</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                Overview of recent system events or notifications.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            This area can be used for important system-wide announcements, a summary of recent user registrations,
            or critical pending tasks. For now, it's a placeholder for future enhancements.
          </p>
          <div className="mt-4 space-y-2 text-xs sm:text-sm">
            {[
              { text: "New center 'Faculty of Science Education' approved.", color: `bg-${brandColors.blue}`, link: "/registry/centers" },
              { text: "3 new signup requests awaiting approval.", color: `bg-${brandColors.red}`, link: "/registry/users?status=PENDING_APPROVAL" }, // using red for attention
              { text: "System maintenance scheduled for May 15th, 2025, 02:00 GMT.", color: `bg-${brandColors.violet}`, link: "#" }
            ].map((item, index) => (
              <Link href={item.link} key={index} className="block group">
                <div className="flex items-center p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-600 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-violet-500">
                  <span className={`flex-shrink-0 h-2.5 w-2.5 rounded-full ${item.color} mr-2.5 sm:mr-3`} />
                  <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 flex-1">{item.text}</span>
                  <ExternalLink className="flex-shrink-0 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-opacity opacity-0 group-hover:opacity-100 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}