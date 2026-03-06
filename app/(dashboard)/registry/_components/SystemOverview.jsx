// app/(dashboard)/registry/_components/SystemOverview.jsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Users, Building, FileText, Hourglass, CheckCircle, XCircle, UserPlus, Server, Database,
    Activity, RefreshCw, AlertTriangle
} from "lucide-react";
import { useState } from 'react';
import { toast } from 'sonner';

// Helper function to format time since an event
const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

// Helper to get icon and color for activity feed items
const getActivityIcon = (type) => {
    switch(type) {
        case 'NEW_CLAIM': return { Icon: FileText, color: 'text-blue-500' };
        case 'NEW_USER_REQUEST': return { Icon: UserPlus, color: 'text-orange-500' };
        case 'CLAIM_PROCESSED': return { Icon: CheckCircle, color: 'text-green-500' };
        default: return { Icon: Activity, color: 'text-slate-500' };
    }
};

const StatCard = ({ title, value, icon: Icon, description, color }) => (
    <Card className="bg-white dark:bg-slate-800/80 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</CardTitle>
            <Icon className={`h-5 w-5 ${color || 'text-slate-500 dark:text-slate-400'}`} />
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{value}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </CardContent>
    </Card>
);

export default function SystemOverview({ initialStats, initialActivityFeed, initialHealth, onRefresh }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
      setIsRefreshing(true);
      toast.info("Refreshing system data...");
      await onRefresh();
      toast.success("Data refreshed!");
      setIsRefreshing(false);
  };

  const stats = initialStats || {};
  const activityFeed = initialActivityFeed || [];
  const health = initialHealth || { database: { status: 'unknown' }, googleMaps: { status: 'unknown' } };
  
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">At a Glance</h2>
             <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard title="Total Users" value={stats.userCount ?? 0} icon={Users} description="All user accounts" color="text-blue-500" />
            <StatCard title="Total Centers" value={stats.centerCount ?? 0} icon={Building} description="Academic centers" color="text-violet-500" />
            <StatCard title="Pending Claims" value={stats.pendingClaimsCount ?? 0} icon={Hourglass} description="Awaiting processing" color="text-orange-500" />
            <StatCard title="Approved Claims" value={stats.approvedClaimsCount ?? 0} icon={CheckCircle} description="Successfully processed" color="text-green-500" />
            <StatCard title="Rejected Claims" value={stats.rejectedClaimsCount ?? 0} icon={XCircle} description="Denied claims" color="text-red-500" />
            <StatCard title="Pending Signups" value={stats.pendingSignupsCount ?? 0} icon={UserPlus} description="New account requests" color="text-amber-500" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activity Feed */}
            <Card className="lg:col-span-2 bg-white dark:bg-slate-800/80 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Activity className="text-violet-500"/>Recent System Activity</CardTitle>
                    <CardDescription>A log of the latest events across the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {activityFeed.length > 0 ? (
                        <ul className="space-y-4">
                            {activityFeed.map((item, index) => {
                                const { Icon, color } = getActivityIcon(item.type);
                                return (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <Icon className={`h-5 w-5 ${color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-800 dark:text-slate-100">{item.details}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{timeSince(item.timestamp)}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-8">No recent activity found.</p>
                    )}
                </CardContent>
            </Card>

            {/* System Health Card */}
            <Card className="bg-white dark:bg-slate-800/80 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Server className="text-violet-500"/>System Health</CardTitle>
                    <CardDescription>Status of core services.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Database className="h-5 w-5 text-slate-500 dark:text-slate-400"/>
                           <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Database Connection</span>
                        </div>
                        {health.database.status === 'ok' ? (
                             <Badge variant="outline" className="border-green-500 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">OK</Badge>
                        ) : (
                             <Badge variant="destructive">Error</Badge>
                        )}
                    </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Building className="h-5 w-5 text-slate-500 dark:text-slate-400"/>
                           <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Google Maps Service</span>
                        </div>
                        {health.googleMaps.status === 'ok' ? (
                             <Badge variant="outline" className="border-green-500 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">Configured</Badge>
                        ) : (
                             <Badge variant="destructive" title={health.googleMaps.message}>{health.googleMaps.status === 'misconfigured' ? 'Not Configured' : 'Error'}</Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}