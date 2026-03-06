// app/(dashboard)/staff-registry/page.jsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/actions/auth.actions';
import { getStaffRegistryDashboardStats, getAssignedCentersForStaffRegistry } from '@/lib/actions/registry.actions.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Building2,
  Hourglass,
  ListChecks,
  BarChart3,
  AlertTriangle,
  Activity,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  MapPin,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function StaffRegistryDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'STAFF_REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  const statsPromise = getStaffRegistryDashboardStats({ staffRegistryUserId: session.userId });
  const centersPromise = getAssignedCentersForStaffRegistry({ staffRegistryUserId: session.userId });

  const [statsResult, centersResult] = await Promise.allSettled([statsPromise, centersPromise]);

  const stats =
    statsResult.status === 'fulfilled' && statsResult.value.success
      ? statsResult.value.data
      : { assignedCentersCount: 0, pendingClaimsCount: 0 };

  const assignedCenters =
    centersResult.status === 'fulfilled' && centersResult.value.success
      ? centersResult.value.centers || []
      : [];

  const statsError =
    statsResult.status === 'fulfilled' && !statsResult.value.success
      ? statsResult.value.error
      : statsResult.status === 'rejected'
        ? 'Failed to load stats'
        : null;

  const statCards = [
    {
      title: 'Assigned Centers',
      count: stats.assignedCentersCount,
      icon: Building2,
      href: '/staff-registry/claims',
      description: 'Centers you manage claims for.',
      gradientClasses: 'bg-gradient-to-br from-violet-700 via-violet-800 to-purple-700',
      iconColor: 'text-white/80',
      error: statsError,
    },
    {
      title: 'Pending Claims',
      count: stats.pendingClaimsCount,
      icon: Hourglass,
      href: '/staff-registry/claims',
      description: 'Claims awaiting your review.',
      gradientClasses: 'bg-gradient-to-br from-orange-600 via-orange-700 to-red-700',
      iconColor: 'text-white/80',
      error: statsError,
    },
    {
      title: 'Manage Claims',
      count: null,
      icon: ListChecks,
      href: '/staff-registry/claims',
      description: 'Review & process lecturer claims.',
      gradientClasses: 'bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-700',
      iconColor: 'text-white/80',
      isAction: true,
    },
    {
      title: 'Summaries',
      count: null,
      icon: BarChart3,
      href: '/staff-registry/summaries',
      description: 'Generate summary reports.',
      gradientClasses: 'bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-700',
      iconColor: 'text-white/80',
      isAction: true,
    },
  ];

  return (
    <div className="min-h-full space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-violet-800 dark:text-violet-400 flex items-center">
          <ShieldCheck className="mr-3 h-7 w-7 sm:h-8 sm:w-8 text-violet-700 dark:text-violet-500" />
          Staff Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1.5 text-sm sm:text-base">
          Welcome, <span className="font-semibold">{session.name || session.email}</span>! Your claims management overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            href={stat.href}
            key={stat.title}
            className="block group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 transition-shadow duration-300"
          >
            <Card
              className={`text-white border-none ${stat.gradientClasses} transform transition-all duration-300 ease-in-out group-hover:scale-[1.02] group-focus-visible:scale-[1.02] group-hover:brightness-110 group-focus-visible:brightness-110 h-full flex flex-col`}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4 px-4">
                <CardTitle className="text-sm sm:text-base font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor} opacity-90`} />
              </CardHeader>
              <CardContent className="px-4 pb-4 flex-grow flex flex-col justify-between">
                <div>
                  {stat.error ? (
                    <div className="flex items-center text-red-200 mt-1">
                      <AlertTriangle className="mr-2 h-6 w-6 sm:h-7 sm:w-7" />
                      <p className="text-2xl sm:text-3xl font-bold">Error</p>
                    </div>
                  ) : stat.isAction ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-semibold">Go to page</span>
                      <ArrowUpRight className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                    </div>
                  ) : (
                    <div className="text-3xl sm:text-4xl font-bold">{stat.count}</div>
                  )}
                </div>
                <p
                  className="text-xs sm:text-sm text-white/70 group-hover:text-white/90 pt-1.5 transition-colors line-clamp-2"
                  title={stat.error || stat.description}
                >
                  {stat.error ? stat.error.substring(0, 60) : stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* No Centers Warning */}
      {stats.assignedCentersCount === 0 && !statsError && (
        <Card className="bg-amber-50 dark:bg-amber-900/30 border-amber-400 dark:border-amber-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 dark:text-amber-200">
              You are not currently assigned to any centers. Please contact a REGISTRY administrator to get assigned to centers to manage their claims.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assigned Centers List & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Centers */}
        <Card className="bg-white dark:bg-slate-800/70 shadow-xl rounded-xl border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-violet-700 dark:text-violet-400" />
              <div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-violet-800 dark:text-violet-300">
                  Your Centers
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                  Centers assigned to you for claims management.
                </CardDescription>
              </div>
            </div>
            <Badge className="mt-2 sm:mt-0 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              {assignedCenters.length} center{assignedCenters.length !== 1 ? 's' : ''}
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            {assignedCenters.length > 0 ? (
              <div className="space-y-3">
                {assignedCenters.map((center) => (
                  <div
                    key={center.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600/50 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                  >
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg shrink-0">
                      <Building2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">
                        {center.name}
                      </p>
                      {center.coordinator && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          Coord: {center.coordinator.name || center.coordinator.email}
                        </p>
                      )}
                    </div>
                    {center._count?.departments != null && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {center._count.departments} dept{center._count.departments !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No centers assigned yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-slate-800/70 shadow-xl rounded-xl border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-violet-700 dark:text-violet-400" />
              <div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-violet-800 dark:text-violet-300">
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                  Common tasks and shortcuts.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            <Link href="/staff-registry/claims" className="block group">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 border border-violet-100 dark:border-violet-800/50 hover:shadow-md transition-all duration-200 hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-900/50 dark:hover:to-purple-900/50">
                <div className="p-3 bg-violet-600 rounded-xl shadow-lg">
                  <ListChecks className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">View & Process Claims</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Review pending claims from your assigned centers
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
              </div>
            </Link>

            <Link href="/staff-registry/summaries" className="block group">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-100 dark:border-emerald-800/50 hover:shadow-md transition-all duration-200 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/50">
                <div className="p-3 bg-emerald-600 rounded-xl shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Generate Summaries</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Create summary reports for your centers
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              </div>
            </Link>

            <Link href="/profile" className="block group">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800/50 hover:shadow-md transition-all duration-200 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">My Profile</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    View and update your account details
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
