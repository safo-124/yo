// app/(dashboard)/registry/_components/ManageSystemClaimsTab.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { processClaimByRegistry, getAllClaimsSystemWide } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, ListFilter, Printer, RotateCcw } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

// Helper to format claim details
const formatClaimDetails = (claim) => {
  let details = [];
  if (!claim) return details;
  details.push(`Claim ID: ${claim.id}`);
  details.push(`Submitted By: ${claim.submittedBy?.name || 'N/A'} (${claim.submittedBy?.email || 'N/A'})`);
  details.push(`Center: ${claim.centerName || 'N/A'}`);
  details.push(`Type: ${claim.claimType}`);
  details.push(`Submitted At: ${new Date(claim.submittedAt).toLocaleString()}`);
  details.push(`Status: ${claim.status}`);
  if (claim.processedAt) {
    details.push(`Processed At: ${new Date(claim.processedAt).toLocaleString()}`);
    details.push(`Processed By: ${claim.processedBy?.name || 'N/A'}`);
  }

  if (claim.claimType === 'TEACHING') {
    details.push(`Teaching Date: ${claim.teachingDate ? new Date(claim.teachingDate).toLocaleDateString() : 'N/A'}`);
    details.push(`Time: ${claim.teachingStartTime || 'N/A'} - ${claim.teachingEndTime || 'N/A'}`);
    details.push(`Hours: ${claim.teachingHours || 'N/A'}`);
  } else if (claim.claimType === 'TRANSPORTATION') {
    details.push(`Transport Mode: ${claim.transportType || 'N/A'}`);
    details.push(`From: ${claim.transportDestinationFrom || 'N/A'}`);
    details.push(`To: ${claim.transportDestinationTo || 'N/A'}`);
    if (claim.transportType === 'PRIVATE') {
      details.push(`Reg No: ${claim.transportRegNumber || 'N/A'}`);
      details.push(`CC: ${claim.transportCubicCapacity || 'N/A'}cc`);
    }
    details.push(`Amount: ${claim.transportAmount ? '$' + claim.transportAmount.toFixed(2) : 'N/A'}`);
  } else if (claim.claimType === 'THESIS_PROJECT') {
    details.push(`Thesis Type: ${claim.thesisType || 'N/A'}`);
    if (claim.thesisType === 'SUPERVISION') {
      details.push(`Rank: ${claim.thesisSupervisionRank || 'N/A'}`);
      details.push(`Students: (Details would require specific fetching for this claim)`);
    } else if (claim.thesisType === 'EXAMINATION') {
      details.push(`Course Code: ${claim.thesisExamCourseCode || 'N/A'}`);
      details.push(`Exam Date: ${claim.thesisExamDate ? new Date(claim.thesisExamDate).toLocaleDateString() : 'N/A'}`);
    }
  }
  return details;
};


export default function ManageSystemClaimsTab({
  initialClaimsData = { claims: [], error: null },
  allCenters = [],
  registryUserId
}) {
  const [claims, setClaims] = useState(initialClaimsData.claims);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterCenterId, setFilterCenterId] = useState("");
  const [filterLecturerName, setFilterLecturerName] = useState("");
  // const debouncedLecturerName = useDebounce(filterLecturerName, 500); // Debounce hook is available

  const fetchClaims = useCallback(async () => {
    setIsLoadingClaims(true);
    const filters = {};
    if (filterStatus) filters.status = filterStatus;
    if (filterCenterId) filters.centerId = filterCenterId;
    // if (debouncedLecturerName) filters.lecturerName = debouncedLecturerName; // Server action needs to support this

    const result = await getAllClaimsSystemWide(filters);
    if (result.success) {
      setClaims(result.claims);
    } else {
      toast.error(result.error || "Failed to fetch claims.");
      setClaims([]);
    }
    setIsLoadingClaims(false);
  }, [filterStatus, filterCenterId /*, debouncedLecturerName */]);

  useEffect(() => {
    if (initialClaimsData.error && !initialClaimsData.claims.length) {
        toast.error(`Initial load failed: ${initialClaimsData.error}`);
    }
    fetchClaims();
  }, [fetchClaims, initialClaimsData.error, initialClaimsData.claims.length]);


  const handleOpenDetailDialog = (claim) => {
    setSelectedClaim(claim);
    setIsDetailDialogOpen(true);
  };

  const handleProcessClaim = async (claimId, status) => {
    if (!registryUserId) {
      toast.error("Registry user ID not found. Cannot process claim.");
      return;
    }
    setIsProcessing(true);
    const result = await processClaimByRegistry({
      claimId,
      status,
      registryUserId,
    });

    if (result.success) {
      toast.success(`Claim ${status.toLowerCase()} successfully by Registry!`);
      fetchClaims();
      setIsDetailDialogOpen(false);
      setSelectedClaim(null);
    } else {
      toast.error(result.error || `Failed to ${status.toLowerCase()} claim.`);
    }
    setIsProcessing(false);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'outline';
      case 'APPROVED': return 'default';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  const handlePrintClaim = () => {
    if (selectedClaim) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write('<html><head><title>Claim Details</title>');
      printWindow.document.write('<style>body{font-family:sans-serif;margin:20px;} h1,h2,h3{margin-bottom:0.5em;} ul{padding-left:20px;} li{margin-bottom:0.3em;} table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(`<h1>Claim Details (ID: ...${selectedClaim.id.slice(-8)})</h1>`);
      formatClaimDetails(selectedClaim).forEach(detail => {
        printWindow.document.write(`<p>${detail.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`);
      });
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  const resetFilters = () => {
    setFilterStatus("");
    setFilterCenterId("");
    setFilterLecturerName("");
    // fetchClaims will be called by useEffect due to state changes triggering the dependency array of fetchClaims
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System-Wide Claims Monitoring</CardTitle>
          <CardDescription>View and process claims from all centers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-md">
            <div>
              <Label htmlFor="filterStatus">Status</Label>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value === "ALL_STATUSES" ? "" : value)}>
                <SelectTrigger id="filterStatus"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  {/* No explicit "All Statuses" item with value="". Placeholder handles it. */}
                  {/* If you want an explicit "All" option that sets filterStatus to "", handle it in onValueChange */}
                  <SelectItem value="ALL_STATUSES">All Statuses</SelectItem> 
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterCenter">Center</Label>
              <Select value={filterCenterId} onValueChange={(value) => setFilterCenterId(value === "ALL_CENTERS" ? "" : value)}>
                <SelectTrigger id="filterCenter"><SelectValue placeholder="All Centers" /></SelectTrigger>
                <SelectContent>
                  {/* No explicit "All Centers" item with value="". Placeholder handles it. */}
                  <SelectItem value="ALL_CENTERS">All Centers</SelectItem>
                  {allCenters.map(center => (
                    <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
                 <Button onClick={resetFilters} variant="outline" className="w-full sm:w-auto">
                    <RotateCcw className="mr-2 h-4 w-4"/> Reset Filters
                </Button>
            </div>
          </div>

          {isLoadingClaims && <p className="text-center p-4">Loading claims...</p>}
          {!isLoadingClaims && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Center</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.length > 0 ? (
                    claims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-mono text-xs">{claim.id.substring(0,12)}...</TableCell>
                        <TableCell>{claim.centerName}</TableCell>
                        <TableCell>{claim.submittedBy?.name || 'N/A'}</TableCell>
                        <TableCell>{claim.claimType}</TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(claim.status)}>{claim.status}</Badge></TableCell>
                        <TableCell>{new Date(claim.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleOpenDetailDialog(claim)}>
                            <Eye className="mr-1 h-3 w-3" /> View/Process
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        No claims found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedClaim && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Claim Details (ID: ...{selectedClaim.id.slice(-8)})</DialogTitle>
              <DialogDescription>
                Review the claim details below. As Registry, you can approve or reject any claim.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
              <ul className="list-none space-y-1 text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                {formatClaimDetails(selectedClaim).map((detail, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: detail.replace(/\n/g, "<br />") }}></li>
                ))}
              </ul>
            </div>
            <DialogFooter className="sm:justify-between items-center">
              <Button type="button" variant="outline" onClick={handlePrintClaim} disabled={isProcessing}>
                <Printer className="mr-2 h-4 w-4" /> Print Claim
              </Button>
              <div className="flex gap-2">
                {selectedClaim.status === 'PENDING' && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleProcessClaim(selectedClaim.id, 'REJECTED')}
                      disabled={isProcessing}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> {isProcessing ? "Rejecting..." : "Reject"}
                    </Button>
                    <Button
                      onClick={() => handleProcessClaim(selectedClaim.id, 'APPROVED')}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> {isProcessing ? "Approving..." : "Approve"}
                    </Button>
                  </>
                )}
                 {selectedClaim.status !== 'PENDING' && (
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Close</Button>
                    </DialogClose>
                 )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
