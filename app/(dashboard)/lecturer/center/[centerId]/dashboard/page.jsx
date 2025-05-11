// app/(dashboard)/lecturer/center/[centerId]/dashboard/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getLecturerDashboardData } from '@/lib/actions/lecturer.actions.js';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, UserCircle, Building, Briefcase, FilePlus, ListChecks, Activity } from "lucide-react"; // Added ListChecks, Activity
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
      // Error Alert styling adjusted for theme
      <div className="w-full py-6 px-4">
        <Alert variant="destructive" className="mt-4 border-red-800/50 text-red-800 dark:text-red-400 bg-red-100 dark:bg-red-800/20">
          <FileWarning className="h-5 w-5 text-red-800 dark:text-red-400" />
          <AlertTitle className="font-semibold text-red-900 dark:text-red-300">Error Loading Dashboard Data</AlertTitle>
          <AlertDescription>
            {result.error || "Could not load your dashboard data. Please try again later or contact support."}
            <div className="mt-4">
              <Button asChild variant="outline" className="border-red-800 text-red-800 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-800/30">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  const { profile, center, department, claims } = result.data;

  if (center?.id !== centerId) {
    console.warn(`Data mismatch: Lecturer ${session.userId} in center ${center?.id} accessed URL for center ${centerId}.`);
    redirect('/lecturer/assignment-pending');
  }

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'PENDING': 
        return 'border-blue-600 text-blue-800 bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-800/30 hover:bg-blue-100/80';
      case 'APPROVED': 
        return 'border-violet-600 text-violet-800 bg-violet-100 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-800/30 hover:bg-violet-100/80';
      case 'REJECTED': 
        return 'border-red-600 text-red-800 bg-red-100 dark:border-red-700 dark:text-red-300 dark:bg-red-800/30 hover:bg-red-100/80';
      default: 
        return 'border-gray-400 text-gray-600 bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-700/30 hover:bg-gray-100/80';
    }
  };
  
  const statsCardsData = [
    { 
      title: "My Profile", 
      icon: UserCircle, // Pass component directly
      content: [profile.name || "N/A", profile.email || "N/A"],
      gradient: "from-blue-800 to-violet-800",
    },
    { 
      title: "My Center", 
      icon: Building,
      content: [center?.name || 'Not Assigned'],
      gradient: "from-violet-800 to-red-800",
    },
    { 
      title: "My Department", 
      icon: Briefcase,
      content: [department?.name || 'Not Assigned'],
      gradient: "from-red-800 to-blue-800",
    }
  ];


  // This page's root div assumes the layout provides the main horizontal padding (px) and max-width centering.
  // It only adds vertical spacing (space-y) and vertical padding (py).
  return (
    <div className="w-full space-y-4 md:space-y-6 py-3 md:py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-300 flex items-center">
            <Activity className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 md:h-8 md:w-8 text-blue-700 dark:text-blue-500" />
            Lecturer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, <span className="font-semibold">{profile.name || profile.email}</span>!
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Center: <span className="font-medium text-gray-700 dark:text-gray-300">{center?.name || 'N/A'}</span>
          </p>
        </div>
        <Button 
          asChild 
          className="bg-violet-800 text-white hover:bg-violet-900 dark:bg-violet-700 dark:hover:bg-violet-800 focus-visible:ring-violet-600 h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm w-full sm:w-auto mt-2 sm:mt-0 shadow-md hover:shadow-lg transition-shadow"
        >
          <Link href={`/lecturer/center/${centerId}/submit-claim`}>
            <FilePlus className="mr-1.5 h-4 w-4" /> Submit New Claim
          </Link>
        </Button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {statsCardsData.map(({ title, icon: Icon, content, gradient }, idx) => (
          <Card 
            key={idx} 
            className={`text-white shadow-lg hover:shadow-xl transform transition-all duration-300 ease-in-out hover:-translate-y-1 bg-gradient-to-br ${gradient}`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm sm:text-base font-medium">{title}</CardTitle>
              <Icon className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent className="pb-4 px-4">
              {content.map((line, i) => (
                <p 
                  key={i} 
                  className={`truncate ${i === 0 ? "text-lg sm:text-xl font-semibold" : "text-xs sm:text-sm text-white/80"}`}
                  title={line}
                >
                  {line}
                </p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Claims Card */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-lg w-full">
        <CardHeader className="bg-blue-800 text-white rounded-t-lg p-4 sm:p-5">
          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center">
            <ListChecks className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
            Recent Claims
          </CardTitle>
          <CardDescription className="text-blue-100/90 text-xs sm:text-sm mt-0.5">
            A quick overview of your latest submitted claims.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {claims.length > 0 ? (
            // shadcn/ui Table component handles its own scroll wrapper
            <Table className="min-w-[700px] md:min-w-full">
              <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                <TableRow>
                  <TableHead className="w-[120px] sm:w-[140px] text-xs font-semibold uppercase text-blue-800 dark:text-blue-300 tracking-wider px-3 py-2.5 sm:px-4">Claim ID</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-blue-800 dark:text-blue-300 tracking-wider px-3 py-2.5 sm:px-4">Type</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-blue-800 dark:text-blue-300 tracking-wider px-3 py-2.5 sm:px-4">Submitted</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-blue-800 dark:text-blue-300 tracking-wider px-3 py-2.5 sm:px-4">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-blue-800 dark:text-blue-300 tracking-wider px-3 py-2.5 sm:px-4">Processed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                {claims.slice(0, 5).map((claim) => (
                  <TableRow key={claim.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/70 transition-colors">
                    <TableCell className="font-mono text-[11px] sm:text-xs px-3 py-2.5 sm:px-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{claim.id.substring(0, 12)}...</TableCell>
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
                    <TableCell className="text-xs sm:text-sm px-3 py-2.5 sm:px-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{claim.processedByCoordinator || (claim.status !== 'PENDING' ? <span className="text-gray-500 dark:text-gray-400">N/A</span> : <span className="text-gray-500 dark:text-gray-400">-</span>)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <ListChecks className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-blue-800 dark:text-blue-500 opacity-50" />
              <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">You have not submitted any claims yet.</p>
            </div>
          )}
          {claims.length > 0 && claims.length > 5 && ( // Show only if there are claims and more than 5
            <div className="mt-0 p-3 sm:p-4 text-center border-t border-slate-200 dark:border-slate-700">
              <Button 
                variant="outline" 
                asChild 
                className="text-violet-800 border-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:border-violet-600 dark:hover:bg-violet-800/30 dark:hover:text-violet-200 focus-visible:ring-violet-500 h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
              >
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