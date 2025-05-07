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
import { Building, Users, FileText, AlertTriangle } from "lucide-react"; // Icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function RegistryOverviewPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    // This check is also in the layout, but good for belt-and-suspenders
    redirect(session ? '/unauthorized' : '/login');
  }

  // Fetch data for statistics
  const centersDataPromise = getCenters();
  const usersDataPromise = getAllUsers();
  // Fetch all claims to get a count; could be filtered for pending if preferred for the stat card
  const claimsDataPromise = getAllClaimsSystemWide({ status: "PENDING" }); // Example: show pending claims count

  const [
    centersResult,
    usersResult,
    claimsResult
  ] = await Promise.all([
    centersDataPromise,
    usersDataPromise,
    claimsDataPromise
  ]);

  const stats = [
    {
      title: "Total Centers",
      count: centersResult.success ? centersResult.centers.length : "Error",
      icon: Building,
      href: "/registry/centers",
      description: "Manage all academic centers.",
      error: centersResult.error
    },
    {
      title: "Total Users",
      // Exclude Registry user from count if desired, or show all.
      // For simplicity, showing all users fetched by getAllUsers.
      count: usersResult.success ? usersResult.users.length : "Error",
      icon: Users,
      href: "/registry/users",
      description: "Manage all user accounts.",
      error: usersResult.error
    },
    {
      title: "Pending System Claims", // Changed to pending for more actionable stat
      count: claimsResult.success ? claimsResult.claims.length : "Error",
      icon: FileText,
      href: "/registry/claims", // This page will allow filtering for all statuses
      description: "Review and process claims.",
      error: claimsResult.error
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Registry Overview</h1>
        <p className="text-muted-foreground">
          Key statistics and quick access to management sections.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <Link href={stat.href} className="block">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {stat.error ? (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="mr-2 h-6 w-6" />
                    <p className="text-2xl font-bold">Error</p>
                  </div>
                ) : (
                  <div className="text-2xl font-bold">{stat.count}</div>
                )}
                <p className="text-xs text-muted-foreground pt-1">
                  {stat.error ? stat.error : stat.description}
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* You can add more sections here, like recent activities or important alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Health & Activity</CardTitle>
          <CardDescription>Overview of recent system events or notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This area can be used for important system-wide announcements, a summary of recent user registrations,
            or critical pending tasks. For now, it's a placeholder for future enhancements.
          </p>
          {/* Example:
          <ul className="mt-4 space-y-2 text-sm">
            <li>New center "Faculty of Arts" created on [Date].</li>
            <li>5 new claims submitted today.</li>
            <li>User "coordinator@example.com" password changed.</li>
          </ul>
          */}
        </CardContent>
      </Card>
    </div>
  );
}
