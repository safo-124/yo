// app/(dashboard)/registry/_components/ManageSignupRequestsTab.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getPendingSignupRequests,
  approveSignupRequest,
  rejectSignupRequest
} from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { UserCheck, UserX, RefreshCw, User, Building, Mail, CalendarDays, Users as UsersIcon, Loader2, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from '@/components/ui/scroll-area';

const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

// ** ADDED dateLocaleStringOptions **
const dateLocaleStringOptions = {
  year: 'numeric', month: 'short', day: 'numeric',
  timeZone: 'UTC' 
};
// dateTimeLocaleStringOptions is not strictly needed in this component based on current usage,
// but can be added if more detailed time is required for 'submittedAt'.

export default function ManageSignupRequestsTab({ 
  initialRequestsData = { requests: [], error: null }, 
  registryUserId, 
  allCenters = [] 
}) {
  const [requests, setRequests] = useState(initialRequestsData.requests || []);
  const [isLoading, setIsLoading] = useState(false);
  const [processingStates, setProcessingStates] = useState({});

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const result = await getPendingSignupRequests();
    if (result.success) {
      setRequests(result.requests || []);
    } else {
      toast.error(result.error || "Failed to fetch pending signup requests.");
      setRequests([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (initialRequestsData.error) {
        toast.error(`Initial data load failed: ${initialRequestsData.error}`);
    }
    const sortedInitialRequests = Array.isArray(initialRequestsData.requests) 
        ? [...initialRequestsData.requests].sort((a,b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()) 
        : [];
    setRequests(sortedInitialRequests);
  }, [initialRequestsData]);

  const handleApproveRequest = async (requestId) => {
    if (!registryUserId) {
      toast.error("Registry user ID not found. Cannot process request.");
      return;
    }
    setProcessingStates(prev => ({ ...prev, [requestId]: 'approving' }));
    const result = await approveSignupRequest({ requestId, registryUserId });
    if (result.success) {
      toast.success(result.message || "Signup request approved and user created!");
      fetchRequests(); 
    } else {
      toast.error(result.error || "Failed to approve request.");
    }
    setProcessingStates(prev => ({ ...prev, [requestId]: null }));
  };

  const handleRejectRequest = async (requestId) => {
    if (!registryUserId) {
      toast.error("Registry user ID not found. Cannot process request.");
      return;
    }
    setProcessingStates(prev => ({ ...prev, [requestId]: 'rejecting' }));
    const result = await rejectSignupRequest({ requestId, registryUserId });
    if (result.success) {
      toast.success(result.message || "Signup request rejected.");
      fetchRequests();
    } else {
      toast.error(result.error || "Failed to reject request.");
    }
    setProcessingStates(prev => ({ ...prev, [requestId]: null }));
  };

  const getCenterNameById = (centerId) => {
    if (!centerId) return <span className="italic text-slate-500 dark:text-slate-400">N/A</span>;
    const center = (allCenters || []).find(c => c.id === centerId);
    return center ? center.name : <span className="italic text-slate-500 dark:text-slate-400" title={`Unknown Center ID: ${centerId}`}>Unknown</span>;
  };

  const getRoleBadgeClasses = (role) => {
    switch(role) {
      case 'COORDINATOR':
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800/30 dark:text-blue-200 dark:border-blue-700 hover:bg-blue-200/70 dark:hover:bg-blue-700/40";
      case 'LECTURER':
        return "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-800/30 dark:text-violet-200 dark:border-violet-700 hover:bg-violet-200/70 dark:hover:bg-violet-700/40";
      case 'STAFF_REGISTRY':
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-800/30 dark:text-yellow-200 dark:border-yellow-700 hover:bg-yellow-200/70 dark:hover:bg-yellow-700/40";
      default:
        return "border-slate-300 text-slate-600 bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:bg-slate-700/50";
    }
  };

  const RequestCardMobile = ({ request }) => (
    <Card className="bg-white dark:bg-slate-800/90 shadow-lg border border-slate-200 dark:border-slate-700/70 rounded-lg w-full">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <User className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0"/> {request.name}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 flex-shrink-0"/> {request.email}
            </CardDescription>
          </div>
          <Badge variant="outline" className={`text-xs whitespace-nowrap capitalize px-2 py-1 ${getRoleBadgeClasses(request.requestedRole)}`}>
            {request.requestedRole?.toLowerCase().replace("_", " ") || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 text-xs space-y-2 border-t border-slate-100 dark:border-slate-700/50">
        {request.requestedRole === 'LECTURER' && request.requestedCenterId && (
          <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Building className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0"/>
            <strong>Requested Center:</strong> {getCenterNameById(request.requestedCenterId)}
          </p>
        )}
        <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <CalendarDays className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0"/>
          <strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions)}
        </p>
      </CardContent>
      <CardFooter className="p-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-end gap-2">
        <Button
          variant="default" size="sm"
          onClick={() => handleRejectRequest(request.id)}
          disabled={!!processingStates[request.id]}
          className={`text-xs gap-1.5 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white focus-visible:ring-red-500 ${focusRingClass}`}
        >
          {processingStates[request.id] === 'rejecting' ? <Loader2 className="h-4 w-4 animate-spin"/> : <UserX className="h-3.5 w-3.5" />}
          {processingStates[request.id] === 'rejecting' ? '...' : 'Reject'}
        </Button>
        <Button
          variant="default" size="sm"
          onClick={() => handleApproveRequest(request.id)}
          disabled={!!processingStates[request.id]}
          className={`text-xs gap-1.5 bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white focus-visible:ring-violet-500 ${focusRingClass}`}
        >
          {processingStates[request.id] === 'approving' ? <Loader2 className="h-4 w-4 animate-spin"/> : <UserCheck className="h-3.5 w-3.5" />}
          {processingStates[request.id] === 'approving' ? '...' : 'Approve'}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-slate-800/90 shadow-xl border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <UsersIcon className="mr-1 h-6 w-6 text-violet-600 dark:text-violet-400" />
              Pending Signup Requests
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Review and process new account applications for the system.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={isLoading} className={`h-9 px-3 text-xs sm:text-sm border-blue-600 text-blue-700 hover:bg-blue-100 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-700/40 self-start sm:self-center ${focusRingClass}`}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Requests
          </Button>
        </CardHeader>
        <CardContent className="p-0 md:p-0">
          {isLoading && requests.length === 0 ? (
            <div className="space-y-3 p-4 sm:p-6">
              {[...Array(3)].map((_, i) => ( <Skeleton key={i} className="h-24 w-full rounded-md bg-slate-200 dark:bg-slate-700" /> ))}
            </div>
          ) : requests.length > 0 ? (
            <>
              <div className="hidden md:block">
                <ScrollArea className="h-auto max-h-[calc(100vh-350px)]">
                  <Table className="min-w-[800px]">
                    <TableHeader className="bg-slate-50 dark:bg-slate-700/70 sticky top-0 z-10 backdrop-blur-sm">
                      <TableRow className="border-b-slate-200 dark:border-slate-600">
                        <TableHead className="w-[25%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Name</TableHead>
                        <TableHead className="w-[25%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Email</TableHead>
                        <TableHead className="w-[15%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Requested Role</TableHead>
                        <TableHead className="w-[20%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Requested Center</TableHead>
                        <TableHead className="w-[15%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Submitted</TableHead>
                        <TableHead className="w-[15%] text-right text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                      {requests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors">
                          <TableCell className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <User className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0"/>
                              <span className="font-medium text-sm text-slate-800 dark:text-slate-100">{request.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{request.email}</TableCell>
                          <TableCell className="px-4 py-3 whitespace-nowrap">
                            <Badge variant="outline" className={`text-xs capitalize ${getRoleBadgeClasses(request.requestedRole)}`}>
                              {request.requestedRole.toLowerCase().replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {request.requestedRole === 'LECTURER' ? getCenterNameById(request.requestedCenterId) : <span className="italic text-slate-500 dark:text-slate-400">N/A</span>}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(request.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions)}</TableCell>
                          <TableCell className="text-right px-4 py-3 whitespace-nowrap space-x-2">
                            <Button variant="default" size="xs" onClick={() => handleRejectRequest(request.id)} disabled={!!processingStates[request.id]} className={`gap-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white focus-visible:ring-red-500 ${focusRingClass}`}>
                              {processingStates[request.id] === 'rejecting' ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <UserX className="h-3.5 w-3.5" />}
                              {processingStates[request.id] === 'rejecting' ? '...' : 'Reject'}
                            </Button>
                            <Button variant="default" size="xs" onClick={() => handleApproveRequest(request.id)} disabled={!!processingStates[request.id]} className={`gap-1 bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white focus-visible:ring-violet-500 ${focusRingClass}`}>
                              {processingStates[request.id] === 'approving' ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <UserCheck className="h-3.5 w-3.5" />}
                              {processingStates[request.id] === 'approving' ? '...' : 'Approve'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              <div className="block md:hidden space-y-3 p-3 sm:p-4">
                {requests.map((request) => (
                  <RequestCardMobile key={request.id} request={request} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 sm:py-16 px-4">
              <ShieldCheck className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-green-600 dark:text-green-500 opacity-70" />
              <h3 className="mt-3 text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200">All Clear!</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                There are no pending signup requests at this time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}