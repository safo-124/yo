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
import { FileWarning, History, FilePlus, Loader2, ListX } from "lucide-react";
import { Toaster } from '@/components/ui/sonner';

export default async function MyClaimsPage({ params }) {
  const session = await getSession();
  const { centerId } = params;

  if (!session || session.role !== 'LECTURER') {
    redirect('/login');
  }

  const result = await getLecturerDashboardData(session.userId);

  if (!result.success || !result.data) {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 px-4">
        <Alert variant="destructive" className="mt-4 border-red-700/50 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30">
          <FileWarning className="h-5 w-5 text-red-700 dark:text-red-400" />
          <AlertTitle className="font-semibold text-red-800 dark:text-red-300">Error Loading Claims Data</AlertTitle>
          <AlertDescription>
            {result.error || "Could not load your claims data. Please try again later or contact support."}
            <div className="mt-4">
              <Button asChild variant="outline" className="border-red-700 text-red-700 hover:bg-red-100 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-700/20">
                <Link href={`/lecturer/center/${centerId}/dashboard`}>Back to Dashboard</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  const { claims, center, profile } = result.data; // Assuming profile is available if needed by layout/other components

  if (center?.id !== centerId) {
    console.warn(`Data mismatch on My Claims page: Lecturer ${session.userId} in center ${center?.id} accessed URL for center ${centerId}.`);
    // It's good practice to use profile?.lecturerCenterId if available for redirect logic
    const userSpecificCenterDashboard = profile?.lecturerCenterId ? `/lecturer/center/${profile.lecturerCenterId}/dashboard` : '/lecturer/assignment-pending';
    return (
        <div className="w-full max-w-4xl mx-auto py-6 px-4">
            <Alert variant="destructive" className="mt-4 border-red-700/50 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30">
              <FileWarning className="h-5 w-5 text-red-700 dark:text-red-400" />
              <AlertTitle className="font-semibold text-red-800 dark:text-red-300">Page Access Error</AlertTitle>
              <AlertDescription>
                You are trying to access claims for a different center.
                <div className="mt-4">
                  <Button asChild variant="outline" className="border-red-700 text-red-700 hover:bg-red-100 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-700/20">
                    <Link href={userSpecificCenterDashboard}>Go to My Dashboard</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
            <Toaster richColors position="top-right" />
        </div>
    );
  }

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'PENDING': 
        return 'border-blue-500 text-blue-700 bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-900/30 hover:bg-blue-100/80';
      case 'APPROVED': 
        return 'border-violet-500 text-violet-700 bg-violet-100 dark:border-violet-600 dark:text-violet-300 dark:bg-violet-700/30 hover:bg-violet-100/80';
      case 'REJECTED': 
        return 'border-red-500 text-red-700 bg-red-100 dark:border-red-600 dark:text-red-300 dark:bg-red-700/30 hover:bg-red-100/80';
      default: 
        return 'border-gray-400 text-gray-600 bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-700/30 hover:bg-gray-100/80';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center text-blue-800 dark:text-blue-300">
            <History className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 md:h-8 md:w-8 text-blue-700 dark:text-blue-400" />
            My Submitted Claims
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track all claims for center: <span className="font-semibold text-blue-700 dark:text-blue-300">{center?.name || 'N/A'}</span>.
          </p>
        </div>
        <Button 
          asChild 
          className="bg-violet-700 text-white hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 focus-visible:ring-violet-500 h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm w-full sm:w-auto mt-2 sm:mt-0"
        >
          <Link href={`/lecturer/center/${centerId}/submit-claim`}>
            <FilePlus className="mr-1.5 h-4 w-4" /> Submit New Claim
          </Link>
        </Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader className="bg-blue-800 text-white rounded-t-lg p-4 sm:p-5">
          <CardTitle className="text-lg sm:text-xl font-semibold">Claim History</CardTitle>
          <CardDescription className="text-blue-100 text-xs sm:text-sm">
            Below is a list of all claims you have submitted.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {claims.length > 0 ? (
            // CRITICAL FIX FOR HYDRATION ERROR:
            // Ensure no whitespace/newlines between <Table> and its direct children <TableHeader>, <TableBody>
            // The <Table> component from shadcn/ui handles its own scroll wrapper div.
            <Table className="min-w-[750px] md:min-w-[800px] lg:min-w-full"><TableHeader className="bg-slate-50 dark:bg-slate-800/60"><TableRow>
                  <TableHead className="w-[130px] sm:w-[150px] text-xs font-semibold uppercase text-blue-700 dark:text-blue-300 tracking-wider px-3 py-2.5 sm:px-4">Claim ID</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300 tracking-wider px-3 py-2.5 sm:px-4">Type</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300 tracking-wider px-3 py-2.5 sm:px-4">Submitted</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300 tracking-wider px-3 py-2.5 sm:px-4">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300 tracking-wider px-3 py-2.5 sm:px-4">Processed At</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300 tracking-wider px-3 py-2.5 sm:px-4">Processed By</TableHead>
                </TableRow></TableHeader><TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                {claims.map((claim) => (
                  <TableRow key={claim.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/70 transition-colors">
                    <TableCell className="font-mono text-[11px] sm:text-xs px-3 py-2.5 sm:px-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{claim.id.substring(0,12)}...</TableCell>
                    <TableCell className="text-xs sm:text-sm px-3 py-2.5 sm:px-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{claim.claimType.replace("_", " ")}</TableCell>
                    <TableCell className="text-xs sm:text-sm px-3 py-2.5 sm:px-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{new Date(claim.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="px-3 py-2.5 sm:px-4 whitespace-nowrap">
                      <Badge 
                        variant="outline"
                        className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusBadgeClasses(claim.status)}`}
                      >
                        {claim.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm px-3 py-2.5 sm:px-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {claim.processedAt ? new Date(claim.processedAt).toLocaleDateString() : <span className="text-gray-500 dark:text-gray-400">N/A</span>}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm px-3 py-2.5 sm:px-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {claim.processedByCoordinator || (claim.status !== 'PENDING' ? <span className="text-gray-500 dark:text-gray-400">N/A</span> : <span className="text-gray-500 dark:text-gray-400">-</span>)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>
          ) : (
            <div className="text-center py-10 sm:py-16 px-4">
              <ListX className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-blue-700 dark:text-blue-500 opacity-60" />
              <h3 className="mt-3 text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-300">No Claims Found</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                You haven't submitted any claims yet for this center.
              </p>
              <Button 
                asChild 
                className="mt-6 bg-violet-700 text-white hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 focus-visible:ring-violet-500 h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
              >
                <Link href={`/lecturer/center/${centerId}/submit-claim`}>
                    <FilePlus className="mr-1.5 h-4 w-4" /> Submit Your First Claim
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster richColors position="top-right" />
    </div>
  );
}