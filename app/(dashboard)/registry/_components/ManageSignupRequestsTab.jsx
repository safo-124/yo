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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getPendingSignupRequests,
  approveSignupRequest,
  rejectSignupRequest
} from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { CheckCircle, XCircle, UserCheck, UserX, RefreshCw } from "lucide-react";

export default function ManageSignupRequestsTab({ initialRequestsData = { requests: [], error: null }, registryUserId, allCenters = [] }) {
  const [requests, setRequests] = useState(initialRequestsData.requests);
  const [isLoading, setIsLoading] = useState(false); // For table refresh
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
    // If initial data had an error, or to ensure fresh data on first load if preferred
    if (initialRequestsData.error) {
        toast.error(`Initial load failed: ${initialRequestsData.error}`);
    }
    // fetchRequests(); // Optionally fetch fresh on mount, or rely on initialRequestsData
    setRequests(initialRequestsData.requests); // Set initial data
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
      fetchRequests(); // Refresh the list
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
      fetchRequests(); // Refresh the list
    } else {
      toast.error(result.error || "Failed to reject request.");
    }
    setProcessingStates(prev => ({ ...prev, [requestId]: null }));
  };
  
  const getCenterNameById = (centerId) => {
    if (!centerId) return 'N/A';
    const center = allCenters.find(c => c.id === centerId);
    return center ? center.name : `ID: ${centerId.substring(0,8)}...`;
  };


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
          <div className="border rounded-lg">
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
                {isLoading && requests.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center h-24">Loading requests...</TableCell></TableRow>
                )}
                {!isLoading && requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>
                        <Badge variant={request.requestedRole === 'COORDINATOR' ? 'secondary' : 'outline'}>
                          {request.requestedRole}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.requestedRole === 'LECTURER' ? getCenterNameById(request.requestedCenterId) : 'N/A'}
                      </TableCell>
                      <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                          disabled={processingStates[request.id] === 'approving' || processingStates[request.id] === 'rejecting'}
                          className="bg-green-500 hover:bg-green-600 text-white border-green-600"
                        >
                          <UserCheck className="mr-1 h-4 w-4" />
                          {processingStates[request.id] === 'approving' ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={processingStates[request.id] === 'approving' || processingStates[request.id] === 'rejecting'}
                        >
                          <UserX className="mr-1 h-4 w-4" />
                           {processingStates[request.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  !isLoading && <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No pending signup requests.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
