// app/(dashboard)/lecturer/center/[centerId]/dashboard/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { getLecturerDashboardData } from '@/lib/actions/lecturer.actions.js';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Building, 
  Briefcase, 
  UserCircle, 
  FilePlus, 
  ListChecks,
  BarChart3,
  PieChart,
  FileWarning,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
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
  const { centerId } = await params;

  if (!session || session.role !== 'LECTURER') {
    redirect('/login');
  }

  const result = await getLecturerDashboardData(session.userId);

  if (!result.success || !result.data) {
    return (
      <div className="w-full py-6 px-4">
        <Alert variant="destructive" className="mt-4 border-red-800/50 text-red-800 bg-red-100 dark:text-red-400 dark:bg-red-800/20">
          <FileWarning className="h-5 w-5 text-red-800 dark:text-red-400" />
          <AlertTitle className="font-semibold text-red-900 dark:text-red-300">Error Loading Dashboard</AlertTitle>
          <AlertDescription>
            {result.error || "Could not load your dashboard data. Please try again later."}
            <div className="mt-4">
              <Button asChild variant="outline" className="border-red-800 text-red-800 hover:bg-red-100">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  const { profile, center, department, claims, courseAssignments } = result.data;

  if (center?.id !== centerId) {
    redirect('/lecturer/assignment-pending');
  }

  // Calculate claim statistics
  const claimStats = {
    total: claims.length,
    teaching: claims.filter(c => c.claimType === 'TEACHING').length,
    transportation: claims.filter(c => c.claimType === 'TRANSPORTATION').length,
    thesis: claims.filter(c => c.claimType === 'THESIS_PROJECT').length,
    pending: claims.filter(c => c.status === 'PENDING').length,
    approved: claims.filter(c => c.status === 'APPROVED').length,
    rejected: claims.filter(c => c.status === 'REJECTED').length,
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'PENDING': 
        return 'border-amber-500/50 text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30';
      case 'APPROVED': 
        return 'border-emerald-500/50 text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30';
      case 'REJECTED': 
        return 'border-red-500/50 text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/30';
      default: 
        return 'border-gray-400 text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/30';
    }
  };

  const getClaimTypeDisplay = (claimType) => {
    switch (claimType) {
      case 'TEACHING': return 'Teaching';
      case 'TRANSPORTATION': return 'Transportation';
      case 'THESIS_PROJECT': return 'Thesis/Project';
      default: return claimType.replace(/_/g, ' ');
    }
  };

  const getClaimTypeColor = (claimType) => {
    switch (claimType) {
      case 'TEACHING':
        return 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30';
      case 'TRANSPORTATION':
        return 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30';
      case 'THESIS_PROJECT':
        return 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30';
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800/30';
    }
  };

  // Stats cards with emerald/teal theme
  const statsCards = [
    { 
      title: "Profile", 
      icon: UserCircle,
      value: profile.name || "N/A",
      subtitle: profile.email || "N/A",
      gradient: "from-emerald-600 to-teal-600",
    },
    { 
      title: "Center", 
      icon: Building,
      value: center?.name || 'Not Assigned',
      subtitle: department?.name || 'No Department',
      gradient: "from-teal-600 to-cyan-600",
    },
    { 
      title: "Total Claims", 
      icon: TrendingUp,
      value: claimStats.total,
      subtitle: `${claimStats.pending} pending · ${claimStats.approved} approved`,
      gradient: "from-cyan-600 to-emerald-600",
    }
  ];

  // Quick action cards
  const quickActions = [
    {
      title: "Submit New Claim",
      description: "Create a teaching, transportation, or thesis claim",
      icon: FilePlus,
      href: `/lecturer/center/${centerId}/submit-claim`,
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    {
      title: "View My Claims",
      description: "Track all your submitted claims and their status",
      icon: ListChecks,
      href: `/lecturer/center/${centerId}/my-claims`,
      color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    },
  ];

  return (
    <div className="w-full space-y-5 md:space-y-6 py-2">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-900 to-teal-900 p-5 md:p-6 text-white shadow-lg">
        <h2 className="text-lg md:text-xl font-semibold">
          Welcome back, {profile.name || profile.email}!
        </h2>
        <p className="text-emerald-200/80 text-sm mt-1">
          {center?.name} · {department?.name || 'No Department'}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button asChild size="sm" className="bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm">
            <Link href={`/lecturer/center/${centerId}/submit-claim`}>
              <FilePlus className="mr-1.5 h-4 w-4" /> Submit Claim
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10">
            <Link href={`/lecturer/center/${centerId}/my-claims`}>
              <ListChecks className="mr-1.5 h-4 w-4" /> My Claims
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map(({ title, icon: Icon, value, subtitle, gradient }, idx) => (
          <Card 
            key={idx} 
            className={`text-white shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-br ${gradient} border-0`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
              <Icon className="h-5 w-5 text-white/70" />
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <p className="text-xl font-bold truncate" title={String(value)}>{value}</p>
              <p className="text-xs text-white/70 truncate mt-0.5" title={subtitle}>{subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Claims Overview Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Claims Summary */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-emerald-600" />
              Claims Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Claims</span>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold">
                {claimStats.total}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{claimStats.pending}</div>
                <div className="text-[11px] font-medium text-amber-600/80 dark:text-amber-500">Pending</div>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{claimStats.approved}</div>
                <div className="text-[11px] font-medium text-emerald-600/80 dark:text-emerald-500">Approved</div>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">{claimStats.rejected}</div>
                <div className="text-[11px] font-medium text-red-600/80 dark:text-red-500">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims by Type */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-teal-600" />
              Claims by Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Teaching', count: claimStats.teaching, color: 'bg-emerald-500', textColor: 'text-emerald-700 dark:text-emerald-300' },
              { label: 'Transportation', count: claimStats.transportation, color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-300' },
              { label: 'Thesis/Project', count: claimStats.thesis, color: 'bg-purple-500', textColor: 'text-purple-700 dark:text-purple-300' },
            ].map(({ label, count, color, textColor }) => (
              <div key={label} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
                  <span className={`text-sm font-medium ${textColor}`}>{label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{count}</span>
              </div>
            ))}
            {claimStats.total === 0 && (
              <p className="text-xs text-gray-500 text-center py-3">No claims submitted yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        {quickActions.map(({ title, description, icon: Icon, href, color }) => (
          <Link key={title} href={href}>
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex-shrink-0 rounded-lg p-3 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Claims Table */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-t-lg px-4 py-4">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
            <ListChecks className="mr-2 h-5 w-5" />
            Recent Claims
          </CardTitle>
          <CardDescription className="text-emerald-100/80 text-xs sm:text-sm mt-0.5">
            Your latest submitted claims overview
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {claims.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="min-w-[650px]">
                <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider px-4 py-2.5">Claim ID</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider px-4 py-2.5">Type</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider px-4 py-2.5">Submitted</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider px-4 py-2.5">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider px-4 py-2.5">Processed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {claims.slice(0, 5).map((claim) => (
                    <TableRow key={claim.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="font-mono text-xs px-4 py-2.5 text-gray-600 dark:text-gray-400">{claim.id.substring(0, 12)}...</TableCell>
                      <TableCell className="px-4 py-2.5">
                        <Badge variant="outline" className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${getClaimTypeColor(claim.claimType)}`}>
                          {getClaimTypeDisplay(claim.claimType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        {new Date(claim.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <Badge variant="outline" className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusBadgeClasses(claim.status)}`}>
                          {claim.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        {claim.processedByCoordinator || (claim.status !== 'PENDING' ? 'N/A' : '—')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 px-4">
              <ListChecks className="mx-auto h-12 w-12 text-emerald-600/40" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No claims submitted yet</p>
              <Button asChild size="sm" className="mt-3 bg-emerald-700 hover:bg-emerald-800 text-white">
                <Link href={`/lecturer/center/${centerId}/submit-claim`}>
                  <FilePlus className="mr-1.5 h-4 w-4" /> Submit Your First Claim
                </Link>
              </Button>
            </div>
          )}
          {claims.length > 5 && (
            <div className="p-3 text-center border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" asChild size="sm" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-700 dark:hover:bg-emerald-900/30">
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
