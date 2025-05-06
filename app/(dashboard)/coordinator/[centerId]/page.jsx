// app/(dashboard)/coordinator/[centerId]/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getCoordinatorDashboardData } from '@/lib/actions/coordinator.actions.js';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListChecks, Users, Building, FileWarning } from "lucide-react"; // Icons
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function CoordinatorDashboardPage({ params }) {
  const session = await getSession();
  const { centerId } = params;

  if (!session || session.role !== 'COORDINATOR') {
    redirect('/login'); // Should be caught by layout, but good for direct access attempts
  }

  // The layout already verifies that this coordinator is assigned to this centerId.
  // Now, fetch all data for this center.
  const result = await getCoordinatorDashboardData(session.userId);

  if (!result.success || !result.data) {
    return (
      <Alert variant="destructive">
        <FileWarning className="h-4 w-4" />
        <AlertTitle>Error Loading Dashboard Data</AlertTitle>
        <AlertDescription>
          {result.error || "Could not load the necessary data for the coordinator dashboard. Please try again later or contact support."}
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  const {
    center,
    lecturers,
    departments,
    claims: pendingClaims // Assuming getCoordinatorDashboardData fetches pending claims
  } = result.data;

  // Ensure the fetched center ID matches the URL parameter for sanity, though layout should handle primary auth.
  if (center.id !== centerId) {
      console.error(`Data mismatch: Fetched center ID ${center.id} does not match URL center ID ${centerId} for coordinator ${session.userId}`);
      redirect('/unauthorized?error=data_mismatch');
  }

  const summaryCards = [
    { title: "Total Lecturers", value: lecturers.length, icon: Users, href: `/coordinator/${centerId}/lecturers` },
    { title: "Total Departments", value: departments.length, icon: Building, href: `/coordinator/${centerId}/departments` },
    { title: "Pending Claims", value: pendingClaims.length, icon: ListChecks, href: `/coordinator/${centerId}/claims` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, Coordinator {session.name || session.email}!</h1>
          <p className="text-muted-foreground">
            Managing: <span className="font-semibold">{center.name}</span>
          </p>
        </div>
        {/* Add any primary action button here if needed, e.g., "New Claim" (though lecturers submit claims) */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground pt-1">
                <Link href={card.href} className="hover:underline">
                  View &rarr;
                </Link>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for upcoming sections, e.g., recent activity, quick links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions / Overview</CardTitle>
          <CardDescription>Further details and actions will be displayed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This area can be used to display recent claims, important notifications, or quick links to common tasks.</p>
          {/* Example: List a few pending claims */}
          {pendingClaims.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Recent Pending Claims:</h3>
              <ul className="list-disc list-inside space-y-1">
                {pendingClaims.slice(0, 3).map(claim => (
                  <li key={claim.id} className="text-sm">
                    Claim ID: {claim.id.substring(0,8)}... by {claim.submittedBy?.name || 'N/A'} - Type: {claim.claimType}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      {/* We will use a Tabs component here later to switch between managing lecturers, departments, claims etc. */}
    </div>
  );
}
