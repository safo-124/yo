// app/(dashboard)/registry/_components/ManageSignupRequestsTab.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getPendingSignupRequests,
  approveSignupRequest,
  rejectSignupRequest
} from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { CheckCircle, XCircle, UserCheck, UserX, RefreshCw, User, Building, Mail, CalendarDays } from "lucide-react"; // Added more icons
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

export default function ManageSignupRequestsTab({ initialRequestsData = { requests: [], error: null }, registryUserId, allCenters = [] }) {
  const [requests, setRequests] = useState(initialRequestsData.requests);
  const [isLoading, setIsLoading] = useState(false); // For table refresh/load
  const [processingStates, setProcessingStates] = useState({}); // { [requestId]: 'approving' | 'rejecting' }

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const result = await getPendingSignupRequests();
    if (result.success) {
      setRequests(result.requests);
    } else {
      toast.error(result.error || "Failed to fetch pending signup requests.");
      setRequests([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (initialRequestsData.error) {
        toast.error(`Initial load failed: ${initialRequestsData.error}`);
    }
    setRequests(initialRequestsData.requests);
  }, [initialRequestsData]);

  // Optionally fetch fresh on mount if initial data might be stale
  // useEffect(() => {
  //   fetchRequests();
  // }, [fetchRequests]);

  const handleApproveRequest = async (requestId) => {
    if (!registryUserId) {
      toast.error("Registry user ID not found. Cannot process request.");
      return;
    }
    setProcessingStates(prev => ({ ...prev, [requestId]: 'approving' }));
    const result = await approveSignupRequest({ requestId, registryUserId });
    if (result.success) {
      toast.success(result.message || "Signup request approved and user created!");
      fetchRequests(); // Refresh the list
    } else {
      toast.error(result.error || "Failed to approve request.");
      setProcessingStates(prev => ({ ...prev, [requestId]: null })); // Reset state on error
    }
    // No need to reset state here on success, as the item will disappear after fetchRequests
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
      fetchRequests(); // Refresh the list
    } else {
      toast.error(result.error || "Failed to reject request.");
      setProcessingStates(prev => ({ ...prev, [requestId]: null })); // Reset state on error
    }
     // No need to reset state here on success, as the item will disappear after fetchRequests
  };

  const getCenterNameById = (centerId) => {
    if (!centerId) return 'N/A';
    const center = allCenters.find(c => c.id === centerId);
    return center ? center.name : `ID: ${centerId.substring(0,8)}...`;
  };

  const RequestCard = ({ request }) => (
     <Card className="shadow-sm border dark:border-gray-700 w-full">
        <CardHeader className="p-4">
            <div className="flex justify-between items-start gap-2">
                <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground"/> {request.name}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                         <Mail className="w-3 h-3 text-muted-foreground"/> {request.email}
                    </CardDescription>
                </div>
                 <Badge variant={request.requestedRole === 'COORDINATOR' ? 'secondary' : 'outline'} className="text-xs whitespace-nowrap capitalize">
                    {request.requestedRole.toLowerCase()}
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="p-4 text-xs space-y-1.5 border-t dark:border-gray-700">
            {request.requestedRole === 'LECTURER' && (
                 <p className="flex items-center gap-1.5">
                    <Building className="w-3 h-3 text-muted-foreground"/>
                    <strong>Center:</strong> {getCenterNameById(request.requestedCenterId)}
                 </p>
            )}
             <p className="flex items-center gap-1.5">
                <CalendarDays className="w-3 h-3 text-muted-foreground"/>
                <strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}
             </p>
        </CardContent>
        <CardFooter className="p-3 border-t dark:border-gray-700 flex justify-end gap-2">
             <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRejectRequest(request.id)}
                disabled={processingStates[request.id]}
                className="text-xs gap-1"
            >
                <UserX className="h-4 w-4" />
                {processingStates[request.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleApproveRequest(request.id)}
                disabled={processingStates[request.id]}
                className="text-xs gap-1 bg-green-500 hover:bg-green-600 text-white border-green-600"
            >
                <UserCheck className="h-4 w-4" />
                {processingStates[request.id] === 'approving' ? 'Approving...' : 'Approve'}
            </Button>
        </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Signup Requests</CardTitle>
            <CardDescription>Review and process new account requests.</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={fetchRequests} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => ( <Skeleton key={i} className="h-24 w-full rounded-lg" /> ))}
            </div>
          ) : requests.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Requested Role</TableHead>
                      <TableHead>Requested Center</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.name}</TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>
                          <Badge variant={request.requestedRole === 'COORDINATOR' ? 'secondary' : 'outline'} className="capitalize">
                            {request.requestedRole.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.requestedRole === 'LECTURER' ? getCenterNameById(request.requestedCenterId) : 'N/A'}
                        </TableCell>
                        <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={processingStates[request.id]}
                          >
                            <UserX className="mr-1 h-4 w-4" />
                             {processingStates[request.id] === 'rejecting' ? '...' : 'Reject'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={processingStates[request.id]}
                            className="bg-green-500 hover:bg-green-600 text-white border-green-600"
                          >
                            <UserCheck className="mr-1 h-4 w-4" />
                            {processingStates[request.id] === 'approving' ? '...' : 'Approve'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {requests.map((request) => (
                   <RequestCard key={request.id} request={request} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 border rounded-lg bg-muted/20 dark:bg-muted/10">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">All Clear!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                There are no pending signup requests.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
