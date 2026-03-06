// app/(dashboard)/coordinator/[centerId]/_components/ManageCoordinatorClaimsTab.jsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { processClaimByCoordinator } from '@/lib/actions/coordinator.actions.js';
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Clock,
  CheckCircle2,
  XOctagon,
  FileText,
  ClipboardList,
  User,
  Calendar,
  Hash,
  Inbox,
  ArrowRight
} from "lucide-react";

// Helper to format claim details for display
const formatClaimDetails = (claim) => {
  let details = [];
  if (claim.claimType === 'TEACHING') {
    details.push({ label: 'Date', value: claim.teachingDate ? new Date(claim.teachingDate).toLocaleDateString() : 'N/A' });
    details.push({ label: 'Time', value: `${claim.teachingStartTime || 'N/A'} - ${claim.teachingEndTime || 'N/A'}` });
    details.push({ label: 'Hours', value: claim.teachingHours || 'N/A' });
  } else if (claim.claimType === 'TRANSPORTATION') {
    details.push({ label: 'Transport', value: claim.transportType || 'N/A' });
    details.push({ label: 'From', value: claim.transportDestinationFrom || 'N/A' });
    details.push({ label: 'To', value: claim.transportDestinationTo || 'N/A' });
    if (claim.transportType === 'PRIVATE') {
      details.push({ label: 'Reg No', value: claim.transportRegNumber || 'N/A' });
      details.push({ label: 'CC', value: `${claim.transportCubicCapacity || 'N/A'}cc` });
    }
    details.push({ label: 'Amount', value: claim.transportAmount ? `$${claim.transportAmount.toFixed(2)}` : 'N/A' });
  } else if (claim.claimType === 'THESIS_PROJECT') {
    details.push({ label: 'Thesis Type', value: claim.thesisType || 'N/A' });
    if (claim.thesisType === 'SUPERVISION') {
      details.push({ label: 'Rank', value: claim.thesisSupervisionRank || 'N/A' });
      details.push({ label: 'Students', value: `${claim.supervisedStudents?.length || 0}` });
    } else if (claim.thesisType === 'EXAMINATION') {
      details.push({ label: 'Course Code', value: claim.thesisExamCourseCode || 'N/A' });
      details.push({ label: 'Exam Date', value: claim.thesisExamDate ? new Date(claim.thesisExamDate).toLocaleDateString() : 'N/A' });
    }
  }
  return details;
};

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    card: 'from-amber-500 to-orange-500',
  },
  APPROVED: {
    label: 'Approved',
    icon: CheckCircle2,
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    card: 'from-emerald-500 to-green-600',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XOctagon,
    badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    card: 'from-red-500 to-rose-600',
  },
};

const CLAIM_TYPE_CONFIG = {
  TEACHING: { label: 'Teaching', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300' },
  TRANSPORTATION: { label: 'Transportation', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300' },
  THESIS_PROJECT: { label: 'Thesis/Project', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300' },
};

export default function ManageCoordinatorClaimsTab({
  centerId,
  centerName,
  initialClaims = [],
  allClaimsFromCenter = [],
  coordinatorUserId
}) {
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClaims = useMemo(() => {
    let filtered = allClaimsFromCenter.filter(c => c.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.submittedBy?.name?.toLowerCase().includes(q) ||
        c.submittedBy?.email?.toLowerCase().includes(q) ||
        c.claimType?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allClaimsFromCenter, filterStatus, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    pending: allClaimsFromCenter.filter(c => c.status === 'PENDING').length,
    approved: allClaimsFromCenter.filter(c => c.status === 'APPROVED').length,
    rejected: allClaimsFromCenter.filter(c => c.status === 'REJECTED').length,
    total: allClaimsFromCenter.length,
  }), [allClaimsFromCenter]);

  const handleOpenDetailDialog = (claim) => {
    setSelectedClaim(claim);
    setIsDetailDialogOpen(true);
  };

  const handleProcessClaim = async (claimId, status) => {
    setIsProcessing(true);
    const result = await processClaimByCoordinator({
      claimId,
      status,
      processedById: coordinatorUserId,
      centerId,
    });

    if (result.success) {
      toast.success(`Claim ${status.toLowerCase()} successfully!`);
      setIsDetailDialogOpen(false);
      setSelectedClaim(null);
    } else {
      toast.error(result.error || `Failed to ${status.toLowerCase()} claim.`);
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Claims', value: stats.total, icon: ClipboardList, gradient: 'from-blue-600 to-indigo-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-orange-500' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, gradient: 'from-emerald-500 to-green-600' },
          { label: 'Rejected', value: stats.rejected, icon: XOctagon, gradient: 'from-red-500 to-rose-600' },
        ].map(({ label, value, icon: Icon, gradient }, idx) => (
          <Card key={idx} className={`bg-gradient-to-br ${gradient} text-white border-0 shadow-md hover:shadow-lg transition-shadow`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-white/15 rounded-lg p-2 backdrop-blur-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/80">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['PENDING', 'APPROVED', 'REJECTED']).map((status) => {
            const config = STATUS_CONFIG[status];
            const count = status === 'PENDING' ? stats.pending : status === 'APPROVED' ? stats.approved : stats.rejected;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {config.label}
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${filterStatus === status ? config.badge : 'bg-transparent border-gray-300 text-gray-500'}`}>
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* Claims Table */}
      {filteredClaims.length > 0 ? (
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-800 hover:to-indigo-800">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3">Submitted By</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3">Type</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3">Date</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-blue-100 px-4 py-3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => {
                  const statusConfig = STATUS_CONFIG[claim.status] || STATUS_CONFIG.PENDING;
                  const typeConfig = CLAIM_TYPE_CONFIG[claim.claimType] || { label: claim.claimType, color: 'bg-gray-100 text-gray-700' };
                  return (
                    <TableRow key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-1.5">
                            <User className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{claim.submittedBy?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500 truncate">{claim.submittedBy?.email || ''}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs font-medium ${typeConfig.color}`}>
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(claim.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs font-medium ${statusConfig.badge}`}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetailDialog(claim)}
                          className="h-7 text-xs border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-900/20"
                        >
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4 mb-4">
              <Inbox className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              {searchQuery ? 'No matching claims' : `No ${filterStatus.toLowerCase()} claims`}
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              {searchQuery
                ? `No claims match "${searchQuery}" with the current filter.`
                : `There are no ${filterStatus.toLowerCase()} claims in this center.`
              }
            </p>
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')} className="mt-4 border-blue-200 text-blue-700 hover:bg-blue-50">
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      {selectedClaim && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
                  <FileText className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                </div>
                Claim Details
              </DialogTitle>
              <DialogDescription>
                ID: ...{selectedClaim.id.slice(-8)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Submitter Info */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                  <User className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedClaim.submittedBy?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{selectedClaim.submittedBy?.email || 'N/A'}</p>
                </div>
                <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[selectedClaim.status]?.badge || ''}`}>
                  {STATUS_CONFIG[selectedClaim.status]?.label || selectedClaim.status}
                </Badge>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Type</p>
                  <Badge variant="outline" className={`mt-1 text-xs ${CLAIM_TYPE_CONFIG[selectedClaim.claimType]?.color || ''}`}>
                    {CLAIM_TYPE_CONFIG[selectedClaim.claimType]?.label || selectedClaim.claimType}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Submitted</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                    {new Date(selectedClaim.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Claim Details Table */}
              <div>
                <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider mb-2">Details</p>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {formatClaimDetails(selectedClaim).map(({ label, value }, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center px-3 py-2 text-sm ${
                        idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/30' : 'bg-white dark:bg-slate-900'
                      }`}
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">{label}</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium text-xs">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processed info */}
              {selectedClaim.processedAt && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs text-gray-500">
                  Processed: {new Date(selectedClaim.processedAt).toLocaleString()}
                </div>
              )}

              {/* Action Buttons */}
              {selectedClaim.status === 'PENDING' && (
                <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    onClick={() => handleProcessClaim(selectedClaim.id, 'REJECTED')}
                    disabled={isProcessing}
                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {isProcessing ? "Processing..." : "Reject"}
                  </Button>
                  <Button
                    onClick={() => handleProcessClaim(selectedClaim.id, 'APPROVED')}
                    disabled={isProcessing}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isProcessing ? "Processing..." : "Approve"}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
