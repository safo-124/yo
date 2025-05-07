// app/(dashboard)/lecturer/center/[centerId]/my-claims/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getLecturerDashboardData } from '@/lib/actions/lecturer.actions.js';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, History, FilePlus } from "lucide-react"; // Icons
import { Toaster } from '@/components/ui/sonner';

export default async function MyClaimsPage({ params }) {
  const session = await getSession();
  const { centerId } = params; // centerId from the URL

  if (!session || session.role !== 'LECTURER') {
    redirect('/login');
  }

  // The layout (LecturerCenterLayout) already verifies that the lecturer belongs to this center.
  const result = await getLecturerDashboardData(session.userId);

  if (!result.success || !result.data) {
    return (
      <Alert variant="destructive" className="mt-4">
        <FileWarning className="h-4 w-4" />
        <AlertTitle>Error Loading Claims Data</AlertTitle>
        <AlertDescription>
          {result.error || "Could not load your claims data. Please try again later or contact support."}
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href={`/lecturer/center/${centerId}/dashboard`}>Back to Dashboard</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  const { claims, center, profile } = result.data; // We get all claims from getLecturerDashboardData

  // Ensure the fetched center data matches the URL's centerId for consistency
  if (center?.id !== centerId) {
    console.warn(`Data mismatch on My Claims page: Lecturer ${session.userId} in center ${center?.id} accessed URL for center ${centerId}.`);
    redirect('/lecturer/assignment-pending'); // Or their actual dashboard
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'outline';
      case 'APPROVED': return 'default'; // Usually a success-like color (often green in shadcn default)
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <History className="mr-3 h-8 w-8 text-primary" />
            My Submitted Claims
          </h1>
          <p className="text-muted-foreground">
            Track the status of all claims you have submitted for center: <span className="font-semibold">{center?.name || 'N/A'}</span>.
          </p>
        </div>
        <Button asChild>
          <Link href={`/lecturer/center/${centerId}/submit-claim`}>
            <FilePlus className="mr-2 h-4 w-4" /> Submit Another Claim
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claim History</CardTitle>
          <CardDescription>
            Below is a list of all claims you have submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {claims.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Claim ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed At</TableHead>
                    <TableHead>Processed By</TableHead>
                    {/* <TableHead className="text-right">Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono text-xs">{claim.id.substring(0,12)}...</TableCell>
                      <TableCell>{claim.claimType}</TableCell>
                      <TableCell>{new Date(claim.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(claim.status)}>{claim.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {claim.processedAt ? new Date(claim.processedAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{claim.processedByCoordinator || (claim.status !== 'PENDING' ? 'N/A' : '')}</TableCell>
                      {/* <TableCell className="text-right">
                        <Button variant="outline" size="sm" disabled>View Details</Button>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <History className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">No Claims Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You haven't submitted any claims yet.
              </p>
              <Button asChild className="mt-4">
                <Link href={`/lecturer/center/${centerId}/submit-claim`}>Submit Your First Claim</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster richColors position="top-right" />
    </div>
  );
}
