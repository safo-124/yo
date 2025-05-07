// app/(dashboard)/lecturer/center/[centerId]/dashboard/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getLecturerDashboardData } from '@/lib/actions/lecturer.actions.js';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, UserCircle, Building, Briefcase, History, FilePlus } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from '@/components/ui/sonner';

export default async function LecturerCenterDashboardPage({ params }) {
  const session = await getSession();
  const { centerId } = params; // centerId from the URL

  if (!session || session.role !== 'LECTURER') {
    redirect('/login');
  }

  // The layout already performs a check to ensure session.lecturerCenterId matches params.centerId
  // So, we can be reasonably sure the user belongs to this center.

  const result = await getLecturerDashboardData(session.userId);

  if (!result.success || !result.data) {
    return (
      <Alert variant="destructive" className="mt-4">
        <FileWarning className="h-4 w-4" />
        <AlertTitle>Error Loading Dashboard Data</AlertTitle>
        <AlertDescription>
          {result.error || "Could not load your dashboard data. Please try again later or contact support."}
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  const { profile, center, department, claims } = result.data;

  // Additional check: ensure the fetched center data matches the URL's centerId
  if (center?.id !== centerId) {
    console.warn(`Data mismatch: Lecturer ${session.userId} in center ${center?.id} accessed URL for center ${centerId}.`);
    // The layout should have already redirected, but this is a fallback.
    redirect('/lecturer/assignment-pending');
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'outline';
      case 'APPROVED': return 'default';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile.name || profile.email}!</p>
          <p className="text-sm text-muted-foreground">
            Center: <span className="font-semibold">{center?.name || 'N/A'}</span>
          </p>
        </div>
        <Button asChild>
          {/* Ensure this link also includes the centerId */}
          <Link href={`/lecturer/center/${centerId}/submit-claim`}>
            <FilePlus className="mr-2 h-4 w-4" /> Submit New Claim
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Profile</CardTitle>
            <UserCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Center</CardTitle>
            <Building className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{center?.name || 'Not Assigned'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Department</CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{department?.name || 'Not Assigned'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
          <CardDescription>A quick overview of your latest submitted claims.</CardDescription>
        </CardHeader>
        <CardContent>
          {claims.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.slice(0, 5).map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono text-xs">{claim.id.substring(0, 12)}...</TableCell>
                      <TableCell>{claim.claimType}</TableCell>
                      <TableCell>{new Date(claim.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(claim.status)}>{claim.status}</Badge>
                      </TableCell>
                      <TableCell>{claim.processedByCoordinator || (claim.status !== 'PENDING' ? 'N/A' : '')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">You have not submitted any claims yet.</p>
          )}
          {claims.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                {/* Ensure this link also includes the centerId */}
                <Link href={`/lecturer/center/${centerId}/my-claims`}>View All My Claims</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster richColors position="top-right" />
    </div>
  );
}
