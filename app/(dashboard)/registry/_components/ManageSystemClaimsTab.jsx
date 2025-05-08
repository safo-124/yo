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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { processClaimByRegistry, getAllClaimsSystemWide } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, ListFilter, Printer, RotateCcw, Search, User, Building, FileText } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";

// Completed formatClaimDetails function
const formatClaimDetails = (claim) => {
  if (!claim) return "<p>No claim details available.</p>";

  let details = [];
  details.push(`<strong>Claim ID:</strong> ${claim.id}`);
  details.push(`<strong>Submitted By:</strong> ${claim.submittedBy?.name || 'N/A'} (${claim.submittedBy?.email || 'N/A'})`);
  // Ensure claim.centerName is populated by getAllClaimsSystemWide or use claim.center.name
  details.push(`<strong>Center:</strong> ${claim.centerName || claim.center?.name || 'N/A'}`);
  details.push(`<strong>Type:</strong> ${claim.claimType}`);
  details.push(`<strong>Submitted At:</strong> ${new Date(claim.submittedAt).toLocaleString()}`);
  details.push(`<strong>Status:</strong> ${claim.status}`);

  if (claim.processedAt) {
    details.push(`<strong>Processed At:</strong> ${new Date(claim.processedAt).toLocaleString()}`);
    details.push(`<strong>Processed By:</strong> ${claim.processedBy?.name || 'N/A'} (${claim.processedBy?.email || 'N/A'})`);
  } else {
    details.push(`<strong>Processed At:</strong> Not yet processed`);
    details.push(`<strong>Processed By:</strong> N/A`);
  }

  details.push(`<hr style="margin: 0.5rem 0;" /><strong>Claim Specifics:</strong>`);

  if (claim.claimType === 'TEACHING') {
    details.push(`<strong>Teaching Date:</strong> ${claim.teachingDate ? new Date(claim.teachingDate).toLocaleDateString() : 'N/A'}`);
    details.push(`<strong>Start Time:</strong> ${claim.teachingStartTime || 'N/A'}`);
    details.push(`<strong>End Time:</strong> ${claim.teachingEndTime || 'N/A'}`);
    details.push(`<strong>Hours Claimed:</strong> ${claim.teachingHours !== null && claim.teachingHours !== undefined ? claim.teachingHours : 'N/A'}`);
  } else if (claim.claimType === 'TRANSPORTATION') {
    details.push(`<strong>Transport Type:</strong> ${claim.transportType || 'N/A'}`);
    details.push(`<strong>From:</strong> ${claim.transportDestinationFrom || 'N/A'}`);
    details.push(`<strong>To:</strong> ${claim.transportDestinationTo || 'N/A'}`);
    details.push(`<strong>Reg. Number:</strong> ${claim.transportRegNumber || 'N/A'}`);
    details.push(`<strong>Cubic Capacity (cc):</strong> ${claim.transportCubicCapacity !== null && claim.transportCubicCapacity !== undefined ? claim.transportCubicCapacity : 'N/A'}`);
    details.push(`<strong>Amount Claimed:</strong> ${claim.transportAmount !== null && claim.transportAmount !== undefined ? `GHS ${Number(claim.transportAmount).toFixed(2)}` : 'N/A'}`);
  } else if (claim.claimType === 'THESIS_PROJECT') {
    details.push(`<strong>Thesis/Project Type:</strong> ${claim.thesisType || 'N/A'}`);
    if (claim.thesisType === 'SUPERVISION') {
      details.push(`<strong>Supervision Rank:</strong> ${claim.thesisSupervisionRank || 'N/A'}`);
      if (claim.supervisedStudents && claim.supervisedStudents.length > 0) {
        let studentsHtml = claim.supervisedStudents.map(s => `<li>${s.studentName || 'N/A'} - ${s.thesisTitle || 'N/A'}</li>`).join('');
        details.push(`<strong>Supervised Students:</strong><ul style="margin-top: 0.25rem; padding-left: 1.5rem;">${studentsHtml}</ul>`);
      } else {
        details.push(`<strong>Supervised Students:</strong> (Not available or none listed)`);
      }
    } else if (claim.thesisType === 'EXAMINATION') {
      details.push(`<strong>Exam Course Code:</strong> ${claim.thesisExamCourseCode || 'N/A'}`);
      details.push(`<strong>Exam Date:</strong> ${claim.thesisExamDate ? new Date(claim.thesisExamDate).toLocaleDateString() : 'N/A'}`);
    }
  }

  // Wrap each detail in a paragraph for better spacing when using Tailwind Prose
  return details.map(detail => `<p style="margin-bottom: 0.25rem;">${detail}</p>`).join('');
};


export default function ManageSystemClaimsTab({
  initialClaimsData = { claims: [], error: null },
  allCenters = [],
  registryUserId
}) {
  const [claims, setClaims] = useState(initialClaimsData.claims);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [processingStates, setProcessingStates] = useState({});
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterCenterId, setFilterCenterId] = useState("");
  const [filterLecturerName, setFilterLecturerName] = useState("");
  const debouncedLecturerName = useDebounce(filterLecturerName, 500);

  const fetchClaims = useCallback(async () => {
    setIsLoadingClaims(true);
    const filters = {};
    if (filterStatus) filters.status = filterStatus;
    if (filterCenterId) filters.centerId = filterCenterId;
    if (debouncedLecturerName) filters.lecturerName = debouncedLecturerName;

    // console.log("Fetching claims with filters:", filters); // Frontend log
    const result = await getAllClaimsSystemWide(filters);
    // console.log("Result from getAllClaimsSystemWide:", result); // Frontend log

    if (result.success) {
      setClaims(result.claims || []); // Ensure claims is always an array
    } else {
      toast.error(result.error || "Failed to fetch claims.");
      setClaims([]);
    }
    setIsLoadingClaims(false);
  }, [filterStatus, filterCenterId, debouncedLecturerName]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  useEffect(() => {
    if (initialClaimsData.error) {
      toast.error(`Initial load failed: ${initialClaimsData.error}`);
    }
    setClaims(initialClaimsData.claims || []); // Ensure claims is always an array
  }, [initialClaimsData]);


  const handleOpenDetailDialog = (claim) => {
    setSelectedClaim(claim);
    setIsDetailDialogOpen(true);
  };

  const handleProcessClaim = async (claimId, status) => {
     if (!registryUserId) {
        toast.error("Registry user ID not found. Cannot process claim.");
        return;
     }
     setProcessingStates(prev => ({ ...prev, [claimId]: status.toLowerCase() })); // e.g., 'approving' or 'rejecting'
     const result = await processClaimByRegistry({ claimId, status, registryUserId });
     if (result.success) {
        toast.success(`Claim ${status.toLowerCase()} successfully!`);
        fetchClaims(); // Refresh the list
        setIsDetailDialogOpen(false); // Close dialog on success
        setSelectedClaim(null);
     } else {
        toast.error(result.error || `Failed to ${status.toLowerCase()} claim.`);
     }
     setProcessingStates(prev => ({ ...prev, [claimId]: null })); // Clear processing state
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'APPROVED': return 'default'; // Or a success-like variant e.g., 'success' if you define it
      case 'REJECTED': return 'destructive';
      default: return 'outline';
    }
  };

  const handlePrintClaim = () => {
      if (selectedClaim) {
        const printWindow = window.open('', '_blank', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Claim Details</title>');
            // Optional: Add basic styling for print
            printWindow.document.write(`
                <style>
                    body { font-family: sans-serif; line-height: 1.5; padding: 20px; }
                    p { margin-bottom: 5px; }
                    strong { font-weight: bold; }
                    hr { margin: 10px 0; border: 0; border-top: 1px solid #ccc; }
                    ul { margin-top: 5px; padding-left: 20px; }
                    li { margin-bottom: 3px; }
                    .prose { max-width: 100%; } /* Ensure prose styles don't limit width too much */
                </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write('<img src="/public/uew.png">');
            printWindow.document.write('<h2>Claim Details</h2>');
            printWindow.document.write('<div class="prose">');
            printWindow.document.write(formatClaimDetails(selectedClaim)); // Use the same formatter
            printWindow.document.write('</div>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus(); // Required for some browsers
            setTimeout(() => { printWindow.print(); }, 500); // Timeout helps ensure content is loaded
        } else {
            toast.error("Could not open print window. Please check your browser's pop-up settings.");
        }
      }
  };

  const resetFilters = () => {
    setFilterStatus("");
    setFilterCenterId("");
    setFilterLecturerName("");
    // fetchClaims will be triggered by useEffect due to state changes
  };

  return (
    <div className="space-y-6">
      <Card className="border-transparent shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">System Claims Management</CardTitle>
              <CardDescription>Monitor and process claims from all centers</CardDescription>
            </div>
            <Button onClick={fetchClaims} variant="outline" size="sm" disabled={isLoadingClaims}>
              <RotateCcw className={`mr-2 h-4 w-4 ${isLoadingClaims ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/40 dark:bg-muted/20 rounded-lg border dark:border-gray-700">
            <div className="space-y-1.5">
              <Label htmlFor="filterStatus">Status</Label>
              <Select
                value={filterStatus || "ALL_STATUSES"}
                onValueChange={(value) => setFilterStatus(value === "ALL_STATUSES" ? "" : value)}
              >
                <SelectTrigger id="filterStatus"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_STATUSES">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filterCenter">Center</Label>
              <Select
                value={filterCenterId || "ALL_CENTERS"}
                onValueChange={(value) => setFilterCenterId(value === "ALL_CENTERS" ? "" : value)}
              >
                <SelectTrigger id="filterCenter"><SelectValue placeholder="All Centers" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_CENTERS">All Centers</SelectItem>
                  {allCenters.map(center => (<SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filterLecturer">Lecturer Name</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    id="filterLecturer"
                    placeholder="Search by lecturer name..."
                    value={filterLecturerName}
                    onChange={(e) => setFilterLecturerName(e.target.value)}
                    className="pl-8"
                  />
                </div>
            </div>

            <div className="flex items-end">
              <Button onClick={resetFilters} variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
          </div>

          {/* Claims Display */}
          <div className="mt-6">
            {isLoadingClaims ? (
              <div className="space-y-4 p-4">
                {[...Array(5)].map((_, i) => ( <Skeleton key={i} className="h-20 w-full rounded-lg" /> ))}
              </div>
            ) : claims && claims.length > 0 ? ( // Added check for claims being defined
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block border rounded-lg">
                  <Table>
                    <TableHeader className="bg-muted/50 dark:bg-muted/30">
                      <TableRow>
                        <TableHead className="w-[100px]">Claim ID</TableHead>
                        <TableHead>Center</TableHead>
                        <TableHead>Lecturer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claims.map((claim) => (
                        <TableRow key={claim.id} className="hover:bg-muted/10 dark:hover:bg-muted/20">
                          <TableCell className="font-mono text-xs">{claim.id ? claim.id.substring(0, 8) + '...' : 'N/A'}</TableCell>
                          <TableCell>{claim.centerName || claim.center?.name}</TableCell>
                          <TableCell className="truncate max-w-[150px]">{claim.submittedBy?.name || 'N/A'}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize text-xs">{claim.claimType?.toLowerCase().replace('_', ' ') || 'N/A'}</Badge></TableCell>
                          <TableCell><Badge variant={getStatusBadgeVariant(claim.status)}>{claim.status}</Badge></TableCell>
                          <TableCell className="text-xs">{claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDetailDialog(claim)} className="hover:bg-primary/10">
                              <Eye className="mr-1 h-4 w-4" /> Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden space-y-4">
                  {claims.map((claim) => (
                    <Card key={claim.id} className="shadow-sm border dark:border-gray-700">
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start gap-2">
                            <div>
                                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-muted-foreground"/> {claim.submittedBy?.name || 'N/A'}
                                </CardTitle>
                                <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                                    <Building className="w-3 h-3 text-muted-foreground"/> {claim.centerName || claim.center?.name}
                                </CardDescription>
                            </div>
                             <Badge variant={getStatusBadgeVariant(claim.status)} className="text-xs whitespace-nowrap">{claim.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 text-xs space-y-1.5">
                          <p><strong>ID:</strong> <span className="font-mono">{claim.id ? claim.id.substring(0, 12) + '...' : 'N/A'}</span></p>
                          <p><strong>Type:</strong> <span className="capitalize">{claim.claimType?.toLowerCase().replace('_', ' ') || 'N/A'}</span></p>
                          <p><strong>Submitted:</strong> {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : 'N/A'}</p>
                      </CardContent>
                        <CardFooter className="p-4 border-t dark:border-gray-700">
                            <Button variant="outline" size="sm" onClick={() => handleOpenDetailDialog(claim)} className="w-full">
                                <Eye className="mr-2 h-4 w-4" /> View Details / Process
                            </Button>
                        </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10 border rounded-lg bg-muted/20 dark:bg-muted/10">
                <ListFilter className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">No Claims Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No claims match your current filter criteria.
                </p>
                 <Button onClick={resetFilters} variant="secondary" className="mt-4">
                   <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
                 </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Claim Details Dialog */}
      {selectedClaim && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="bg-primary/10 p-2 rounded-full inline-flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </span>
                Claim Details
              </DialogTitle>
              <DialogDescription>
                Review and process this {selectedClaim.claimType?.toLowerCase().replace('_', ' ') || 'N/A'} claim.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto py-4 px-1 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent">
              <div className="bg-muted/20 dark:bg-gray-800/30 p-4 rounded-lg">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: formatClaimDetails(selectedClaim)
                  }}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2 border-t pt-4 mt-auto"> {/* mt-auto pushes footer down */}
              <Button variant="outline" onClick={handlePrintClaim} disabled={!!processingStates[selectedClaim.id]} className="gap-2 w-full sm:w-auto">
                <Printer className="h-4 w-4" /> Print
              </Button>
              <div className="flex gap-2 flex-wrap justify-end w-full sm:w-auto">
                {selectedClaim.status === 'PENDING' ? (
                  <>
                    <Button
                        variant="destructive"
                        onClick={() => handleProcessClaim(selectedClaim.id, 'REJECTED')}
                        disabled={!!processingStates[selectedClaim.id]} // Check if any processing ongoing for this claim
                        className="gap-2 flex-1 sm:flex-grow-0"
                    >
                      <XCircle className="h-4 w-4" />
                      {processingStates[selectedClaim.id] === 'rejecting' ? "Rejecting..." : "Reject"}
                    </Button>
                    <Button
                        onClick={() => handleProcessClaim(selectedClaim.id, 'APPROVED')}
                        disabled={!!processingStates[selectedClaim.id]}
                        className="gap-2 bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-grow-0" // Added text-white for better contrast
                    >
                      <CheckCircle className="h-4 w-4" />
                      {processingStates[selectedClaim.id] === 'approving' ? "Approving..." : "Approve"}
                    </Button>
                  </>
                ) : (
                  <DialogClose asChild>
                    <Button variant="outline" className="w-full sm:w-auto">Close</Button>
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