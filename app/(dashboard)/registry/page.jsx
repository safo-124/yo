// app/(dashboard)/registry/page.jsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getCenters,
  getAllUsers,
  getAllClaimsSystemWide,
  getPendingSignupRequests // Import the action for pending requests
} from '@/lib/actions/registry.actions.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building, Users, FileText, UserCheck as UserCheckIcon, AlertTriangle } from "lucide-react"; // Added UserCheckIcon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function RegistryOverviewPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  // Fetch data for statistics
  const centersDataPromise = getCenters();
  const usersDataPromise = getAllUsers();
  const pendingClaimsDataPromise = getAllClaimsSystemWide({ status: "PENDING" });
  const pendingSignupRequestsPromise = getPendingSignupRequests(); // Fetch pending signup requests

  const [
    centersResult,
    usersResult,
    claimsResult,
    signupRequestsResult // Result for pending signup requests
  ] = await Promise.all([
    centersDataPromise,
    usersDataPromise,
    pendingClaimsDataPromise,
    pendingSignupRequestsPromise
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
      count: usersResult.success ? usersResult.users.length : "Error",
      icon: Users,
      href: "/registry/users",
      description: "Manage all user accounts.",
      error: usersResult.error
    },
    {
      title: "Pending System Claims",
      count: claimsResult.success ? claimsResult.claims.length : "Error",
      icon: FileText,
      href: "/registry/claims",
      description: "Review and process claims.",
      error: claimsResult.error
    },
    { // New Card for Pending Signup Requests
      title: "Pending Signup Requests",
      count: signupRequestsResult.success ? signupRequestsResult.requests.length : "Error",
      icon: UserCheckIcon, // Using the UserCheckIcon
      href: "/registry/requests", // Link to the dedicated page
      description: "Approve or reject new user signups.",
      error: signupRequestsResult.error
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> {/* Adjusted grid for 4 cards */}
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <Link href={stat.href} className="block h-full"> {/* Ensure link takes full card height */}
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
        </CardContent>
      </Card>
    </div>
  );
}
