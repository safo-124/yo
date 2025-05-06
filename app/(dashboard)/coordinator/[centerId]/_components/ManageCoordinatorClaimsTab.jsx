// app/(dashboard)/coordinator/[centerId]/_components/ManageCoordinatorClaimsTab.jsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge"; // For claim status
import { processClaim } from '@/lib/actions/coordinator.actions.js';
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, ListFilter } from "lucide-react"; // Icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper to format claim details for display
const formatClaimDetails = (claim) => {
  let details = [];
  details.push(`Type: ${claim.claimType}`);
  if (claim.claimType === 'TEACHING') {
    details.push(`Date: ${claim.teachingDate ? new Date(claim.teachingDate).toLocaleDateString() : 'N/A'}`);
    details.push(`Time: ${claim.teachingStartTime || 'N/A'} - ${claim.teachingEndTime || 'N/A'}`);
    details.push(`Hours: ${claim.teachingHours || 'N/A'}`);
  } else if (claim.claimType === 'TRANSPORTATION') {
    details.push(`Transport: ${claim.transportType || 'N/A'}`);
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
      // Supervised students would ideally be listed here if fetched
      // For now, we'll skip displaying student list in this simple view
      details.push(`Students: ${claim.supervisedStudents?.length || 0} (details not shown)`);
    } else if (claim.thesisType === 'EXAMINATION') {
      details.push(`Course Code: ${claim.thesisExamCourseCode || 'N/A'}`);
      details.push(`Exam Date: ${claim.thesisExamDate ? new Date(claim.thesisExamDate).toLocaleDateString() : 'N/A'}`);
    }
  }
  return details;
};


export default function ManageCoordinatorClaimsTab({
  centerId,
  initialClaims = [], // Initially pending claims
  allClaimsFromCenter = [], // All claims for filtering if needed
  coordinatorUserId
}) {
  const [claims, setClaims] = useState(initialClaims);
  const [selectedClaim, setSelectedClaim] = useState(null); // For viewing details
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("PENDING"); // Default filter

  useEffect(() => {
    // Filter claims based on filterStatus when allClaimsFromCenter or filterStatus changes
    const filtered = allClaimsFromCenter.filter(claim => claim.status === filterStatus);
    setClaims(filtered);
  }, [allClaimsFromCenter, filterStatus]);


  const handleOpenDetailDialog = (claim) => {
    setSelectedClaim(claim);
    setIsDetailDialogOpen(true);
  };

  const handleProcessClaim = async (claimId, status) => {
    setIsProcessing(true);
    const result = await processClaim({
      claimId,
      status,
      processedById: coordinatorUserId,
      centerId, // For revalidation
    });

    if (result.success) {
      toast.success(`Claim ${status.toLowerCase()} successfully!`);
      // The parent page revalidation should update the claims list.
      // For immediate UI update if parent doesn't re-fetch allClaimsFromCenter:
      // setClaims(prevClaims => prevClaims.filter(c => c.id !== claimId)); // Remove processed claim from pending list
      // Or update its status if showing all claims:
      // setClaims(prevClaims => prevClaims.map(c => c.id === claimId ? {...c, status: status, processedAt: new Date()} : c));
      setIsDetailDialogOpen(false); // Close dialog if open
      setSelectedClaim(null);
    } else {
      toast.error(result.error || `Failed to ${status.toLowerCase()} claim.`);
    }
    setIsProcessing(false);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'outline';
      case 'APPROVED': return 'default'; // Greenish in default shadcn
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" /> Filter Status ({filterStatus})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={filterStatus} onValueChange={setFilterStatus}>
              <DropdownMenuRadioItem value="PENDING">Pending</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="APPROVED">Approved</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="REJECTED">Rejected</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* View Claim Detail Dialog */}
      {selectedClaim && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Claim Details (ID: ...{selectedClaim.id.slice(-8)})</DialogTitle>
              <DialogDescription>
                Submitted by: {selectedClaim.submittedBy?.name || 'N/A'} ({selectedClaim.submittedBy?.email || 'N/A'})
                <br />
                Submitted At: {new Date(selectedClaim.submittedAt).toLocaleString()}
                <br />
                Status: <Badge variant={getStatusBadgeVariant(selectedClaim.status)}>{selectedClaim.status}</Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
              <h4 className="font-semibold">Details:</h4>
              <ul className="list-disc list-inside pl-4 text-sm space-y-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                {formatClaimDetails(selectedClaim).map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
              {selectedClaim.status === 'PENDING' && (
                <DialogFooter className="mt-6 pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => handleProcessClaim(selectedClaim.id, 'REJECTED')}
                    disabled={isProcessing}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> {isProcessing ? "Rejecting..." : "Reject Claim"}
                  </Button>
                  <Button
                    onClick={() => handleProcessClaim(selectedClaim.id, 'APPROVED')}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> {isProcessing ? "Approving..." : "Approve Claim"}
                  </Button>
                </DialogFooter>
              )}
               {selectedClaim.processedAt && (
                 <p className="text-xs text-muted-foreground mt-2">
                    Processed At: {new Date(selectedClaim.processedAt).toLocaleString()}
                 </p>
               )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Table of Claims */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted By</TableHead>
              <TableHead>Claim Type</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.length > 0 ? (
              claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.submittedBy?.name || 'N/A'}</TableCell>
                  <TableCell>{claim.claimType}</TableCell>
                  <TableCell>{new Date(claim.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(claim.status)}>{claim.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDetailDialog(claim)}>
                      <Eye className="mr-1 h-3 w-3" /> View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No {filterStatus.toLowerCase()} claims found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {claims.length === 0 && (
         <p className="text-center text-muted-foreground">There are no claims matching the current filter.</p>
      )}
    </div>
  );
}
