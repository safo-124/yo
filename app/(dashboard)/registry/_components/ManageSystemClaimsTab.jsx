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
import { CheckCircle, XCircle, Eye, ListFilter, Printer, RotateCcw, Search, User, Building } from "lucide-react"; // Added icons
import { useDebounce } from "@/hooks/useDebounce";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// formatClaimDetails remains the same
const formatClaimDetails = (claim) => {
  let details = [];
  if (!claim) return details;
  details.push(`<strong>Claim ID:</strong> ${claim.id}`);
  details.push(`<strong>Submitted By:</strong> ${claim.submittedBy?.name || 'N/A'} (${claim.submittedBy?.email || 'N/A'})`);
  details.push(`<strong>Center:</strong> ${claim.centerName || 'N/A'}`);
  details.push(`<strong>Type:</strong> ${claim.claimType}`);
  details.push(`<strong>Submitted At:</strong> ${new Date(claim.submittedAt).toLocaleString()}`);
  details.push(`<strong>Status:</strong> <span class="status-badge">${claim.status}</span>`);
  if (claim.processedAt) { /* ... processed details ... */ }
  if (claim.claimType === 'TEACHING') { /* ... teaching details ... */ }
  else if (claim.claimType === 'TRANSPORTATION') { /* ... transportation details ... */ }
  else if (claim.claimType === 'THESIS_PROJECT') { /* ... thesis details ... */ }
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

    const result = await getAllClaimsSystemWide(filters);
    if (result.success) {
      setClaims(result.claims);
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
    setClaims(initialClaimsData.claims);
  }, [initialClaimsData]);


  const handleOpenDetailDialog = (claim) => {
    setSelectedClaim(claim);
    setIsDetailDialogOpen(true);
  };

  const handleProcessClaim = async (claimId, status) => {
    // ... (same as before) ...
     if (!registryUserId) { toast.error("Registry user ID not found."); return; }
     setProcessingStates(prev => ({ ...prev, [claimId]: status.toLowerCase() }));
     const result = await processClaimByRegistry({ claimId, status, registryUserId });
     if (result.success) { toast.success(`Claim ${status.toLowerCase()} successfully!`); fetchClaims(); setIsDetailDialogOpen(false); setSelectedClaim(null); }
     else { toast.error(result.error || `Failed to ${status.toLowerCase()} claim.`); }
     setProcessingStates(prev => ({ ...prev, [claimId]: null }));
  };

  const getStatusBadgeVariant = (status) => {
    // ... (same as before) ...
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'APPROVED': return 'default';
      case 'REJECTED': return 'destructive';
      default: return 'outline';
    }
  };

  const handlePrintClaim = () => {
     // ... (same as before) ...
      if (selectedClaim) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`...`); // Same print HTML structure
        printWindow.document.close();
        printWindow.print();
      }
  };

  const resetFilters = () => {
    setFilterStatus("");
    setFilterCenterId("");
    setFilterLecturerName("");
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
          {/* Filters Section - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/40 dark:bg-muted/20 rounded-lg border dark:border-gray-700">
            <div className="space-y-1.5"> {/* Adjusted spacing */}
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
               {/* Removed 'not implemented' text, server action handles it */}
            </div>

            <div className="flex items-end">
              <Button onClick={resetFilters} variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
          </div>

          {/* Claims Display - Conditional Rendering for Mobile/Desktop */}
          <div className="mt-6">
            {isLoadingClaims ? (
              <div className="space-y-4 p-4">
                {[...Array(5)].map((_, i) => ( <Skeleton key={i} className="h-20 w-full rounded-lg" /> ))}
              </div>
            ) : claims.length > 0 ? (
              <>
                {/* Desktop Table View (Hidden on Mobile) */}
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
                          <TableCell className="font-mono text-xs">{claim.id.substring(0, 8)}...</TableCell>
                          <TableCell>{claim.centerName}</TableCell>
                          <TableCell className="truncate max-w-[150px]">{claim.submittedBy?.name || 'N/A'}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize text-xs">{claim.claimType.toLowerCase().replace('_', ' ')}</Badge></TableCell>
                          <TableCell><Badge variant={getStatusBadgeVariant(claim.status)}>{claim.status}</Badge></TableCell>
                          <TableCell className="text-xs">{new Date(claim.submittedAt).toLocaleDateString()}</TableCell>
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

                {/* Mobile Card View (Hidden on Medium+) */}
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
                                    <Building className="w-3 h-3 text-muted-foreground"/> {claim.centerName}
                                </CardDescription>
                            </div>
                             <Badge variant={getStatusBadgeVariant(claim.status)} className="text-xs whitespace-nowrap">{claim.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 text-xs space-y-1.5">
                         <p><strong>ID:</strong> <span className="font-mono">{claim.id.substring(0, 12)}...</span></p>
                         <p><strong>Type:</strong> <span className="capitalize">{claim.claimType.toLowerCase().replace('_', ' ')}</span></p>
                         <p><strong>Submitted:</strong> {new Date(claim.submittedAt).toLocaleDateString()}</p>
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
          {/* ... Dialog Content remains largely the same, ensure it's responsive ... */}
          {/* Use sm:max-w-2xl for width, max-h-[90vh] and overflow-y-auto for height */}
          <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {/* Icon logic */}
                 <span className="bg-primary/10 p-2 rounded-full">
                   {/* SVG Icons */}
                 </span>
                Claim Details
              </DialogTitle>
              <DialogDescription>Review and process this {selectedClaim.claimType.toLowerCase().replace('_', ' ')} claim.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto py-4 px-1">
              <div className="bg-muted/20 p-4 rounded-lg">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: `...` // Same HTML structure as before
                  }}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2 border-t pt-4">
              <Button variant="outline" onClick={handlePrintClaim} disabled={processingStates[selectedClaim.id]} className="gap-2 w-full sm:w-auto">
                <Printer className="h-4 w-4" /> Print
              </Button>
              <div className="flex gap-2 flex-wrap justify-end w-full sm:w-auto">
                {selectedClaim.status === 'PENDING' ? (
                  <>
                    <Button variant="destructive" onClick={() => handleProcessClaim(selectedClaim.id, 'REJECTED')} disabled={processingStates[selectedClaim.id]} className="gap-2 flex-1 sm:flex-grow-0">
                      <XCircle className="h-4 w-4" /> {processingStates[selectedClaim.id] === 'rejecting' ? "Rejecting..." : "Reject"}
                    </Button>
                    <Button onClick={() => handleProcessClaim(selectedClaim.id, 'APPROVED')} disabled={processingStates[selectedClaim.id]} className="gap-2 bg-green-600 hover:bg-green-700 flex-1 sm:flex-grow-0">
                      <CheckCircle className="h-4 w-4" /> {processingStates[selectedClaim.id] === 'approving' ? "Approving..." : "Approve"}
                    </Button>
                  </>
                ) : ( <DialogClose asChild><Button variant="outline" className="w-full sm:w-auto">Close</Button></DialogClose> )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
