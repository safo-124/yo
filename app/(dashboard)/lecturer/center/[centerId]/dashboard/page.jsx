import { getSession } from '@/lib/actions/auth.actions';
import { getLecturerDashboardData } from '@/lib/actions/lecturer.actions.js';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, UserCircle, Building, Briefcase, FilePlus } from "lucide-react";
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
  const { centerId } = params;

  if (!session || session.role !== 'LECTURER') {
    redirect('/login');
  }

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

  if (center?.id !== centerId) {
    console.warn(`Data mismatch: Lecturer ${session.userId} in center ${center?.id} accessed URL for center ${centerId}.`);
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
    <div className="space-y-6 bg-white min-h-screen text-gray-900 px-4 py-6 sm:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full max-w-full overflow-x-hidden">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Lecturer Dashboard</h1>
          <p className="text-gray-700">Welcome back, {profile.name || profile.email}!</p>
          <p className="text-sm text-gray-500">
            Center: <span className="font-semibold">{center?.name || 'N/A'}</span>
          </p>
        </div>
        <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 mt-4 sm:mt-0">
          <Link href={`/lecturer/center/${centerId}/submit-claim`}>
            <FilePlus className="mr-2 h-4 w-4" /> Submit New Claim
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-full overflow-x-hidden">
        {[{
          title: "My Profile",
          icon: <UserCircle className="h-5 w-5 text-gray-600" />,
          content: [profile.name, profile.email]
        }, {
          title: "My Center",
          icon: <Building className="h-5 w-5 text-gray-600" />,
          content: [center?.name || 'Not Assigned']
        }, {
          title: "My Department",
          icon: <Briefcase className="h-5 w-5 text-gray-600" />,
          content: [department?.name || 'Not Assigned']
        }].map(({ title, icon, content }, idx) => (
          <Card key={idx} className="bg-white text-gray-900 shadow-md border border-gray-200 w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              {icon}
            </CardHeader>
            <CardContent>
              {content.map((line, i) => (
                <p key={i} className={`text-${i === 0 ? "lg font-semibold" : "sm text-gray-700"}`}>{line}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white text-gray-900 shadow-md border border-gray-200 w-full">
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
          <CardDescription className="text-gray-600">
            A quick overview of your latest submitted claims.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {claims.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-auto">
              <Table className="min-w-full bg-white text-gray-900">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-700">Claim ID</TableHead>
                    <TableHead className="text-gray-700">Type</TableHead>
                    <TableHead className="text-gray-700">Submitted</TableHead>
                    <TableHead className="text-gray-700">Status</TableHead>
                    <TableHead className="text-gray-700">Processed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.slice(0, 5).map((claim) => (
                    <TableRow key={claim.id} className="hover:bg-gray-100">
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
            <p className="text-gray-600">You have not submitted any claims yet.</p>
          )}
          {claims.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" asChild className="text-gray-900 border-gray-200 hover:bg-gray-100 hover:text-blue-600">
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
