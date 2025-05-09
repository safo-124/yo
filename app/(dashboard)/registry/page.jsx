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
import { Building, Users, FileText, AlertTriangle, BarChart3, Activity } from "lucide-react";

// Define UEW-inspired colors for the gradient (as provided by user)
const uewRed = '#AE1C28';
const uewBlue = '#1A213D'; // Dark Navy

export default async function RegistryOverviewPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  // Fetch data for statistics
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

  // Helper to process results from Promise.allSettled
  const processSettledResult = (result, dataKey) => {
    if (result.status === 'fulfilled' && result.value.success) {
      return { success: true, data: result.value[dataKey], count: result.value[dataKey]?.length, error: null };
    }
    const errorMessage = result.status === 'fulfilled' ? result.value.error : result.reason?.message || "Failed to fetch data";
    return { success: false, data: null, count: "Error", error: errorMessage };
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
      color: "text-sky-300", // Icon color remains for visual distinction
    },
    {
      title: "Total Users",
      count: usersInfo.count,
      icon: Users,
      href: "/registry/users",
      description: "Manage all user accounts.",
      error: usersInfo.error,
      color: "text-orange-300", // Icon color remains
    },
    {
      title: "Pending Claims",
      count: pendingClaimsInfo.count,
      icon: FileText,
      href: "/registry/claims?status=PENDING",
      description: "Review and process claims.",
      error: pendingClaimsInfo.error,
      color: "text-amber-300", // Icon color remains
    },
    {
      title: "Approved Claims",
      count: approvedClaimsInfo.count,
      icon: BarChart3,
      href: "/registry/claims?status=APPROVED",
      description: "View all approved claims.",
      error: approvedClaimsInfo.error,
      color: "text-green-300", // Icon color remains
    },
  ];

  return (
    // Main container with gradient background and default text color set to a deep blue
    <div
      className={`min-h-full space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[${uewRed}] via-red-800 to-[${uewBlue}] text-blue-700 dark:text-blue-600`}
    >
      <div>
        {/* Title will inherit the deep blue text color */}
        <h1 className="text-4xl font-bold tracking-tight">Registry Dashboard</h1>
        {/* Subtitle uses a slightly lighter shade of deep blue for hierarchy */}
        <p className="text-blue-500 dark:text-blue-400 mt-1 text-lg">
          Welcome, {session.name || session.email}! Key statistics and quick actions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.title} className="block group">
            <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-300 ease-in-out shadow-xl hover:shadow-2xl rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5 px-5">
                {/* CardTitle will inherit deep blue. Hover uses a lighter deep blue. */}
                <CardTitle className="text-sm font-medium group-hover:text-blue-500 dark:group-hover:text-blue-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-6 w-6 ${stat.color || 'text-slate-300'} transition-transform duration-300 group-hover:scale-110`} />
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {stat.error ? (
                  <div className="flex items-center text-red-300"> {/* Error text remains red */}
                    <AlertTriangle className="mr-2 h-7 w-7" />
                    <p className="text-3xl font-bold">Error</p>
                  </div>
                ) : (
                  // Count will inherit the deep blue text color
                  <div className={`text-4xl font-bold`}>{stat.count}</div>
                )}
                {/* Description text uses a medium shade of deep blue */}
                <p className="text-xs text-blue-600 dark:text-blue-500 group-hover:text-blue-400 dark:group-hover:text-blue-300 pt-1 transition-colors">
                  {stat.error ? stat.error : stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* System Health & Activity Card */}
      <Card className="bg-white/5 dark:bg-black/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Activity className="h-7 w-7 text-sky-300" /> {/* Icon color kept for visual cue */}
            <div>
              {/* CardTitle will inherit deep blue */}
              <CardTitle className="text-xl font-semibold">System Health & Activity</CardTitle>
              {/* CardDescription uses a medium shade of deep blue */}
              <CardDescription className="text-blue-600 dark:text-blue-500">
                Overview of recent system events or notifications.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Paragraph text will inherit deep blue. */}
          <p>
            This area can be used for important system-wide announcements, a summary of recent user registrations,
            or critical pending tasks. For now, it's a placeholder for future enhancements.
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {/* List item text will inherit deep blue. */}
            <div className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500 mr-3" />
              <span>New center "Faculty of Science Education" approved.</span>
            </div>
            <div className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-amber-500 mr-3" />
              <span>3 new signup requests awaiting approval.</span>
            </div>
            <div className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-green-500 mr-3" />
              <span>System maintenance scheduled for May 10th, 2025, 02:00 GMT.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
