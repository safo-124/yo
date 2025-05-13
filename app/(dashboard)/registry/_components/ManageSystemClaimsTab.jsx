// app/(dashboard)/registry/_components/ManageSystemClaimsTab.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { processClaimByRegistry, getAllClaimsSystemWide, deleteClaimByRegistry } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, ListFilter, Printer, RotateCcw, Search, User, Building, FileText, Loader2, ListChecks, Trash2, AlertTriangle, BookText, Hash } from "lucide-react"; // Added BookText, Hash
import { useDebounce } from "@/hooks/useDebounce"; 
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from '@/components/ui/scroll-area';

const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

const dateLocaleStringOptions = {
  year: 'numeric', month: 'short', day: 'numeric', // Changed month to 'short' for better readability
  timeZone: 'UTC' 
};

const dateTimeLocaleStringOptions = {
  year: 'numeric', month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: true, // Added hour12 for AM/PM
  timeZone: 'UTC' 
};

const formatClaimDetailsForDialog = (claim) => {
    if (!claim) return "<p>No claim details available.</p>";
    let details = [];
    details.push(`<strong>Claim ID:</strong> <span style="font-family: monospace;">${claim.id}</span>`);
    details.push(`<strong>Submitted By:</strong> ${claim.submittedBy?.name || 'N/A'} (${claim.submittedBy?.email || 'N/A'})`);
    details.push(`<strong>Center:</strong> ${claim.centerName || claim.center?.name || 'N/A'}`);
    details.push(`<strong style="text-transform: capitalize;">Type:</strong> ${claim.claimType?.toLowerCase().replace("_", " ") || 'N/A'}`);
    details.push(`<strong>Submitted At:</strong> ${new Date(claim.submittedAt).toLocaleString('en-US', dateTimeLocaleStringOptions)} (UTC)`);
    details.push(`<strong>Status:</strong> <span class="status-badge status-${claim.status}">${claim.status}</span>`);

    if (claim.processedAt) {
        details.push(`<strong>Processed At:</strong> ${new Date(claim.processedAt).toLocaleString('en-US', dateTimeLocaleStringOptions)} (UTC)`);
        details.push(`<strong>Processed By:</strong> ${claim.processedBy?.name || 'N/A'} (${claim.processedBy?.email || 'N/A'})`);
    } else { details.push(`<strong>Processed Info:</strong> Not yet processed`); }
    
    details.push(`<hr style="margin: 0.85rem 0; border-color: #cbd5e1;" /><strong>Claim Specifics:</strong>`);
    
    if (claim.claimType === 'TEACHING') {
        details.push(`<strong>Course Code:</strong> ${claim.courseCode || 'N/A'}`);
        details.push(`<strong>Course Title:</strong> ${claim.courseTitle || 'N/A'}`);
        details.push(`<strong>Teaching Date:</strong> ${claim.teachingDate ? new Date(claim.teachingDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}`);
        details.push(`<strong>Start Time:</strong> ${claim.teachingStartTime || 'N/A'}`);
        details.push(`<strong>End Time:</strong> ${claim.teachingEndTime || 'N/A'}`);
        details.push(`<strong>Contact Hours:</strong> ${claim.teachingHours !== null && claim.teachingHours !== undefined ? claim.teachingHours : 'N/A'}`);
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
            let studentsHtml = claim.supervisedStudents.map(s => `<li style="margin-bottom: 0.3rem; font-size: 0.9em;"><strong>${s.studentName || 'N/A'}</strong> - <em>${s.thesisTitle || 'N/A'}</em></li>`).join('');
            details.push(`<strong>Supervised Students:</strong><ul style="margin-top: 0.3rem; padding-left: 1.5rem; list-style-type: disc;">${studentsHtml}</ul>`);
        } else { details.push(`<strong>Supervised Students:</strong> (None listed)`);}
        } else if (claim.thesisType === 'EXAMINATION') {
        details.push(`<strong>Exam Course Code:</strong> ${claim.thesisExamCourseCode || 'N/A'}`);
        details.push(`<strong>Exam Date:</strong> ${claim.thesisExamDate ? new Date(claim.thesisExamDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}`);}
    }
    // Enhanced paragraph styling for readability in the dialog
    return details.map(detail => `<p style="margin-bottom: 0.5rem; line-height: 1.6;">${detail}</p>`).join('');
};

export default function ManageSystemClaimsTab({
  initialClaimsData = { claims: [], error: null },
  allCenters = [],
  registryUserId
}) {
  const [claims, setClaims] = useState(initialClaimsData.claims || []);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
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
      setClaims(result.claims || []);
    } else {
      toast.error(result.error || "Failed to fetch claims.");
      setClaims([]);
    }
    setIsLoadingClaims(false);
  }, [filterStatus, filterCenterId, debouncedLecturerName]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);
  
  useEffect(() => {
    if (initialClaimsData.error) { toast.error(`Initial load failed: ${initialClaimsData.error}`); }
    // Sort initial claims by submittedAt descending
    const sortedInitialClaims = Array.isArray(initialClaimsData.claims) 
        ? [...initialClaimsData.claims].sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()) 
        : [];
    setClaims(sortedInitialClaims);
  }, [initialClaimsData]);

  const handleOpenDetailDialog = (claim) => { setSelectedClaim(claim); setIsDetailDialogOpen(true); };
  
  const handleOpenDeleteConfirmDialog = () => {
    if (selectedClaim) { setIsDeleteConfirmOpen(true); } 
    else { toast.error("No claim selected for deletion."); }
  };

  const handleProcessClaim = async (claimId, status) => {
     if (!registryUserId) { toast.error("Action failed: User ID missing."); return; }
     setProcessingStates(prev => ({ ...prev, [claimId]: status.toLowerCase() }));
     const result = await processClaimByRegistry({ claimId, status, registryUserId });
     if (result.success) {
        toast.success(`Claim ${status.toLowerCase()} successfully!`);
        fetchClaims(); setIsDetailDialogOpen(false); setSelectedClaim(null);
     } else { toast.error(result.error || `Failed to ${status.toLowerCase()} claim.`);}
     setProcessingStates(prev => ({ ...prev, [claimId]: null }));
  };

  const handleConfirmDelete = async () => {
    if (!selectedClaim || !registryUserId) {
        toast.error("Action failed: Claim or User ID missing.");
        setIsDeleteConfirmOpen(false); return;
    }
    setProcessingStates(prev => ({ ...prev, [selectedClaim.id]: 'deleting' }));
    const result = await deleteClaimByRegistry({ claimId: selectedClaim.id, registryUserId });
    if (result.success) {
        toast.success(result.message || "Claim deleted successfully!");
        fetchClaims(); // Re-fetch to update the list
        setIsDetailDialogOpen(false); // Close detail dialog if it was open for this claim
    } else {
        toast.error(result.error || "Failed to delete claim.");
    }
    setProcessingStates(prev => ({ ...prev, [selectedClaim.id]: null }));
    setIsDeleteConfirmOpen(false);
    setSelectedClaim(null); 
  };

  const getStatusBadgeClasses = (status) => { 
    switch (status) {
      case 'PENDING': return 'border-blue-500 text-blue-700 bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:bg-blue-900/40 hover:bg-blue-100/80';
      case 'APPROVED': return 'border-violet-500 text-violet-700 bg-violet-100 dark:border-violet-600 dark:text-violet-300 dark:bg-violet-900/40 hover:bg-violet-100/80';
      case 'REJECTED': return 'border-red-600 text-red-700 bg-red-100 dark:border-red-600 dark:text-red-300 dark:bg-red-900/40 hover:bg-red-100/80';
      default: return 'border-slate-400 text-slate-600 bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:bg-slate-700/30 hover:bg-slate-100/80';
    }
  };
  
  const handlePrintClaim = () => { 
    if (selectedClaim) {
        const printWindow = window.open('', '_blank', 'height=800,width=800,scrollbars=yes,resizable=yes');
        if (printWindow) {
            const universityBlue = "#1E3A8A"; const universityRed = "#991B1B"; const lightGrayBorder = "#D1D5DB"; const textColor = "#1F2937"; const headingColor = "#111827";
            let specificsHtml = '';
            // Date formatting for print view
            const submittedAtPrint = new Date(selectedClaim.submittedAt).toLocaleString('en-US', dateTimeLocaleStringOptions) + " (UTC)";
            const processedAtPrint = selectedClaim.processedAt ? new Date(selectedClaim.processedAt).toLocaleString('en-US', dateTimeLocaleStringOptions) + " (UTC)" : 'N/A';

            if (selectedClaim.claimType === 'TEACHING') { 
                specificsHtml = `
                    <p><strong>Course Code:</strong> ${selectedClaim.courseCode || 'N/A'}</p>
                    <p><strong>Course Title:</strong> ${selectedClaim.courseTitle || 'N/A'}</p>
                    <p><strong>Teaching Date:</strong> ${selectedClaim.teachingDate ? new Date(selectedClaim.teachingDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</p>
                    <p><strong>Start Time:</strong> ${selectedClaim.teachingStartTime || 'N/A'}</p>
                    <p><strong>End Time:</strong> ${selectedClaim.teachingEndTime || 'N/A'}</p>
                    <p><strong>Contact Hours:</strong> ${selectedClaim.teachingHours !== null && selectedClaim.teachingHours !== undefined ? selectedClaim.teachingHours : 'N/A'}</p>
                `;
            } else if (selectedClaim.claimType === 'TRANSPORTATION') { 
                specificsHtml = `
                    <p><strong>Transport Type:</strong> ${selectedClaim.transportType || 'N/A'}</p>
                    <p><strong>From:</strong> ${selectedClaim.transportDestinationFrom || 'N/A'}</p>
                    <p><strong>To:</strong> ${selectedClaim.transportDestinationTo || 'N/A'}</p>
                    <p><strong>Reg. Number:</strong> ${selectedClaim.transportRegNumber || 'N/A'}</p>
                    <p><strong>Cubic Capacity (cc):</strong> ${selectedClaim.transportCubicCapacity !== null && selectedClaim.transportCubicCapacity !== undefined ? selectedClaim.transportCubicCapacity : 'N/A'}</p>
                    <p><strong>Amount Claimed:</strong> ${selectedClaim.transportAmount !== null && selectedClaim.transportAmount !== undefined ? `GHS ${Number(selectedClaim.transportAmount).toFixed(2)}` : 'N/A'}</p>
                `;
            } else if (selectedClaim.claimType === 'THESIS_PROJECT') { 
                specificsHtml = `<p><strong>Thesis/Project Type:</strong> ${selectedClaim.thesisType || 'N/A'}</p>`; 
                if (selectedClaim.thesisType === 'SUPERVISION') { 
                    specificsHtml += `<p><strong>Supervision Rank:</strong> ${selectedClaim.thesisSupervisionRank || 'N/A'}</p>`; 
                    if (selectedClaim.supervisedStudents && selectedClaim.supervisedStudents.length > 0) { 
                        let studentsListHtml = selectedClaim.supervisedStudents.map(s => `<li>${s.studentName || 'N/A'} - ${s.thesisTitle || 'N/A'}</li>`).join(''); 
                        specificsHtml += `<p><strong>Supervised Students:</strong><ul>${studentsListHtml}</ul></p>`; 
                    } else { specificsHtml += `<p><strong>Supervised Students:</strong> (None listed)</p>`; } 
                } else if (selectedClaim.thesisType === 'EXAMINATION') { 
                    specificsHtml += `<p><strong>Exam Course Code:</strong> ${selectedClaim.thesisExamCourseCode || 'N/A'}</p>`; 
                    specificsHtml += `<p><strong>Exam Date:</strong> ${selectedClaim.thesisExamDate ? new Date(selectedClaim.thesisExamDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</p>`; 
                } 
            }
            const printHtml = `<html><head><title>Claim Voucher - ${selectedClaim.id}</title><style>body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;padding:0;color:${textColor};background-color:#fff;}.print-container{width:100%;max-width:800px;margin:20px auto;padding:25px;background-color:#fff;}.header{text-align:center;margin-bottom:25px;padding-bottom:20px;border-bottom:3px solid ${universityBlue};}.logo{max-width:120px;margin-bottom:10px;}.university-name{font-size:22px;font-weight:bold;color:${universityBlue};margin-bottom:5px;}.document-title{font-size:20px;font-weight:600;color:${universityRed};margin-top:8px;text-transform:uppercase;}.section{margin-bottom:18px;padding:12px;border:1px solid ${lightGrayBorder};border-radius:6px;background-color:#f9fafb;}.section-alt{background-color:#f3f4f6;}.section-title{font-size:16px;font-weight:600;color:${universityBlue};margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid ${universityBlue}33;}.details-grid{display:grid;grid-template-columns:140px 1fr;gap:6px 10px;font-size:13px;}.details-grid strong{font-weight:600;color:${headingColor};}.details-grid span{word-break:break-word;}.status-badge{padding:3px 8px;border-radius:12px;font-weight:600;font-size:0.75em;color:white;text-transform:uppercase;display:inline-block;}.status-PENDING{background-color:#F59E0B;}.status-APPROVED{background-color:#10B981;}.status-REJECTED{background-color:${universityRed};}.claim-specifics-content p{margin:0 0 8px 0;font-size:13px;line-height:1.5;}.claim-specifics-content ul{margin:4px 0 8px 20px;padding:0;}.claim-specifics-content li{margin-bottom:4px;}.footer{text-align:center;margin-top:25px;font-size:11px;color:#6B7280;border-top:1px solid ${lightGrayBorder};padding-top:12px;}.signature-section{margin-top:35px;padding-top:18px;border-top:1px dashed ${lightGrayBorder};}.signature-grid{display:grid;grid-template-columns:1fr 1fr;gap:35px;margin-top:25px;}.signature-box{text-align:center;}.signature-line{border-bottom:1px solid ${textColor};width:75%;margin:35px auto 5px auto;}.signature-label{font-size:12px;color:${headingColor};}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;margin:0;background-color:#fff!important;}.print-container{width:100%;margin:0 auto;padding:10mm;border:none;box-shadow:none;background-color:#fff!important;}.section{border:1px solid ${lightGrayBorder}!important;background-color:#f9fafb!important;}.section-alt{background-color:#f3f4f6!important;}.status-badge{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.header,.university-name,.document-title,.section-title{color:${universityBlue}!important;}.document-title{color:${universityRed}!important;}.status-PENDING{background-color:#F59E0B!important;}.status-APPROVED{background-color:#10B981!important;}.status-REJECTED{background-color:${universityRed}!important;}}</style></head><body><div class="print-container"><div class="header"><img src="/uew.png" alt="University Logo" class="logo"><div class="university-name">UNIVERSITY OF EDUCATION, WINNEBA</div><div class="university-name">COLLEGE OF DISTANCE LEARNING EDUCATION</div><div class="document-title">Claim Voucher</div></div><div class="section"><div class="section-title">General Information</div><div class="details-grid"><strong>Claim ID:</strong> <span>${selectedClaim.id}</span><strong>Submitted By:</strong> <span>${selectedClaim.submittedBy?.name||'N/A'} (${selectedClaim.submittedBy?.email||'N/A'})</span><strong>Center:</strong> <span>${selectedClaim.centerName||selectedClaim.center?.name||'N/A'}</span><strong>Claim Type:</strong> <span style="text-transform:capitalize;">${selectedClaim.claimType.toLowerCase().replace('_', ' ')}</span><strong>Submitted At:</strong> <span>${submittedAtPrint}</span><strong>Status:</strong> <span><span class="status-badge status-${selectedClaim.status}">${selectedClaim.status}</span></span></div></div>${selectedClaim.processedAt?`<div class="section section-alt"><div class="section-title">Processing Information</div><div class="details-grid"><strong>Processed By:</strong> <span>${selectedClaim.processedBy?.name||'N/A'} (${selectedClaim.processedBy?.email||'N/A'})</span><strong>Processed At:</strong> <span>${processedAtPrint}</span></div></div>`:''}<div class="section"><div class="section-title">Claim Specifics</div><div class="claim-specifics-content">${specificsHtml}</div></div><div class="signature-section"><div class="signature-grid"><div class="signature-box"><div class="signature-line"></div><div class="signature-label">Claimant's Signature</div></div><div class="signature-box"><div class="signature-line"></div><div class="signature-label">Authorizing Officer's Signature</div></div></div></div><div class="footer">Printed on: ${new Date().toLocaleString('en-US', dateTimeLocaleStringOptions)} by Registry.<br/>University of Education, Winneba &bull; Ghana</div></div></body></html>`;
            printWindow.document.write(printHtml);printWindow.document.close();printWindow.focus();setTimeout(()=>{try{printWindow.print();}catch(e){console.error("Print failed:",e);printWindow.close();toast.error("Printing failed. Please try again or check browser console.");}},600); // Increased timeout, added error handling
        } else {toast.error("Could not open print window. Please check pop-up blocker settings.");}
    } else {toast.error("No claim selected to print.");}
  };

  const resetFilters = () => { setFilterStatus(""); setFilterCenterId(""); setFilterLecturerName(""); };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-semibold text-blue-800 dark:text-blue-300 flex items-center">
                <ListChecks className="mr-2.5 h-6 w-6 text-violet-700 dark:text-violet-500" /> System Claims Management
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Monitor and process claims from all centers. Filter and review details.
              </CardDescription>
            </div>
            <Button onClick={fetchClaims} variant="outline" size="sm" disabled={isLoadingClaims} className={`border-blue-600 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-700/30 self-start sm:self-center ${focusRingClass} gap-1.5`}>
              <RotateCcw className={`h-4 w-4 ${isLoadingClaims ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 space-y-5">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/40 rounded-md border border-slate-200 dark:border-slate-700">
            <div className="space-y-1.5">
              <Label htmlFor="filterStatus" className="text-xs font-medium text-slate-700 dark:text-slate-300">Status</Label>
              <Select value={filterStatus || "ALL_STATUSES"} onValueChange={(value) => setFilterStatus(value === "ALL_STATUSES" ? "" : value)}>
                <SelectTrigger id="filterStatus" className={`h-9 text-xs bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 ${focusRingClass}`}><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800"><SelectItem value="ALL_STATUSES">All Statuses</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="APPROVED">Approved</SelectItem><SelectItem value="REJECTED">Rejected</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filterCenter" className="text-xs font-medium text-slate-700 dark:text-slate-300">Center</Label>
              <Select value={filterCenterId || "ALL_CENTERS"} onValueChange={(value) => setFilterCenterId(value === "ALL_CENTERS" ? "" : value)}>
                <SelectTrigger id="filterCenter" className={`h-9 text-xs bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 ${focusRingClass}`}><SelectValue placeholder="All Centers" /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800"><SelectItem value="ALL_CENTERS">All Centers</SelectItem>{allCenters.map(center => (<SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filterLecturer" className="text-xs font-medium text-slate-700 dark:text-slate-300">Lecturer Name</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input type="search" id="filterLecturer" placeholder="Search by name..." value={filterLecturerName} onChange={(e) => setFilterLecturerName(e.target.value)} className={`pl-8 h-9 text-xs bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 ${focusRingClass}`} />
                </div>
            </div>
            <div className="flex items-end">
              <Button onClick={resetFilters} variant="outline" className={`w-full h-9 text-xs border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 ${focusRingClass} gap-1.5`}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            </div>
          </div>

          <div className="mt-5">
            {isLoadingClaims ? (
              <div className="space-y-3 p-4">
                {[...Array(5)].map((_, i) => ( <Skeleton key={i} className="h-16 w-full rounded-md bg-slate-200 dark:bg-slate-700" /> ))}
              </div>
            ) : claims && claims.length > 0 ? (
              <>
                <div className="hidden md:block border dark:border-slate-700 rounded-lg overflow-hidden">
                  <ScrollArea className="h-auto max-h-[calc(100vh-420px)]"> {/* Adjusted max-height slightly */}
                    <Table className="min-w-[800px]">
                      <TableHeader className="bg-slate-100 dark:bg-slate-700/70 sticky top-0 z-10 backdrop-blur-sm">
                        <TableRow className="border-slate-200 dark:border-slate-600">
                          <TableHead className="w-[120px] text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Claim ID</TableHead><TableHead className="text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Center</TableHead><TableHead className="text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Lecturer</TableHead><TableHead className="text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Type</TableHead><TableHead className="text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Status</TableHead><TableHead className="text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Submitted</TableHead><TableHead className="text-right text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {claims.map((claim) => (
                          <TableRow key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <TableCell className="font-mono text-xs px-3 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{claim.id ? claim.id.substring(0, 8) + '...' : 'N/A'}</TableCell><TableCell className="text-xs px-3 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{claim.centerName || claim.center?.name}</TableCell><TableCell className="text-xs px-3 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{claim.submittedBy?.name || 'N/A'}</TableCell><TableCell className="px-3 py-3 whitespace-nowrap"><Badge variant="outline" className="capitalize text-[10px] border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400">{claim.claimType?.toLowerCase().replace('_', ' ') || 'N/A'}</Badge></TableCell><TableCell className="px-3 py-3 whitespace-nowrap"><Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${getStatusBadgeClasses(claim.status)}`}>{claim.status.toLowerCase()}</Badge></TableCell><TableCell className="text-xs px-3 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</TableCell><TableCell className="text-right px-3 py-3 whitespace-nowrap">
                              <Button variant="ghost" size="sm" onClick={() => handleOpenDetailDialog(claim)} className={`h-8 px-2 text-xs text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-700/30 ${focusRingClass} gap-1`}>
                                <Eye className="h-3.5 w-3.5" /> Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
                <div className="block md:hidden space-y-3">
                  {claims.map((claim) => (
                    <Card key={claim.id} className="bg-white dark:bg-slate-800/70 shadow-md border border-slate-200 dark:border-slate-700 rounded-lg">
                      <CardHeader className="p-3">
                        <div className="flex justify-between items-start gap-2">
                            <div>
                                <CardTitle className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-violet-700 dark:text-violet-500"/> {claim.submittedBy?.name || 'N/A'}
                                </CardTitle>
                                <CardDescription className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    <Building className="w-3 h-3"/> {claim.centerName || claim.center?.name}
                                </CardDescription>
                            </div>
                           <Badge variant="outline" className={`text-[10px] whitespace-nowrap px-1.5 py-0.5 rounded-full font-medium capitalize ${getStatusBadgeClasses(claim.status)}`}>{claim.status.toLowerCase()}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 text-xs space-y-1 border-t border-slate-100 dark:border-slate-700">
                          <p><strong>ID:</strong> <span className="font-mono text-slate-600 dark:text-slate-400">{claim.id ? claim.id.substring(0, 10) + '...' : 'N/A'}</span></p>
                          <p><strong>Type:</strong> <span className="capitalize text-slate-700 dark:text-slate-300">{claim.claimType?.toLowerCase().replace('_', ' ') || 'N/A'}</span></p>
                          <p><strong>Submitted:</strong> <span className="text-slate-700 dark:text-slate-300">{claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</span></p>
                      </CardContent>
                        <CardFooter className="p-3 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" size="sm" onClick={() => handleOpenDetailDialog(claim)} className={`w-full h-8 text-xs border-blue-600 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-700/30 ${focusRingClass} gap-1.5`}>
                                <Eye className="h-3.5 w-3.5" /> View Details / Process
                            </Button>
                        </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10 sm:py-12 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <ListFilter className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-blue-700 dark:text-blue-500 opacity-60" />
                <h3 className="mt-3 text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-300">No Claims Found</h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">No claims match your current filter criteria or none have been submitted yet.</p>
                 <Button onClick={resetFilters} variant="outline" className={`mt-6 h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm border-blue-600 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-700/30 ${focusRingClass} gap-1.5`}>
                   <RotateCcw className="h-4 w-4" /> Reset Filters
                 </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Claim Detail Dialog */}
      {selectedClaim && (
        <>
            <Dialog 
                open={isDetailDialogOpen} 
                onOpenChange={(open) => { 
                    if(!open) { setSelectedClaim(null); } 
                    setIsDetailDialogOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 shadow-xl rounded-lg">
                    <DialogHeader className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2.5 text-lg sm:text-xl text-blue-800 dark:text-blue-300">
                        <span className="p-1.5 rounded-full inline-flex items-center justify-center bg-violet-100 dark:bg-violet-800/30">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-violet-700 dark:text-violet-500" />
                        </span>
                        Claim Details
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Review and process this <span className="font-medium capitalize">{selectedClaim.claimType?.toLowerCase().replace('_', ' ') || 'N/A'}</span> claim.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto py-3 px-1 sm:py-4 sm:px-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                        <div 
                            className="prose prose-sm dark:prose-invert max-w-none p-3 sm:p-4 rounded-md bg-slate-50 dark:bg-slate-700/40 
                                    prose-p:mb-1.5 prose-p:leading-relaxed prose-strong:text-slate-800 dark:prose-strong:text-slate-100 
                                    prose-headings:text-blue-800 dark:prose-headings:text-blue-300
                                    prose-hr:my-3 prose-hr:border-slate-300 dark:prose-hr:border-slate-600
                                    prose-ul:pl-5 prose-li:mb-1"
                            dangerouslySetInnerHTML={{ __html: formatClaimDetailsForDialog(selectedClaim) }}
                        />
                    </div>
                    <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between items-stretch gap-2 border-t border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex-shrink-0">
                        <div className="flex gap-2.5 w-full sm:w-auto justify-start flex-wrap"> {/* Left aligned buttons */}
                            <Button variant="outline" onClick={handlePrintClaim} disabled={!!processingStates[selectedClaim.id]} className={`gap-2 w-full sm:w-auto h-9 text-xs sm:h-10 sm:text-sm border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 ${focusRingClass}`}>
                                <Printer className="h-4 w-4" /> Print
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={handleOpenDeleteConfirmDialog}
                                disabled={!!processingStates[selectedClaim.id]} 
                                className={`gap-2 w-full sm:w-auto h-9 text-xs sm:h-10 sm:text-sm border-red-600 text-red-700 hover:bg-red-100 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-700/30 focus-visible:ring-red-500 ${focusRingClass}`}
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        </div>
                        <div className="flex gap-2.5 w-full sm:w-auto justify-end"> {/* Right aligned buttons */}
                            {selectedClaim.status === 'PENDING' ? (
                            <>
                                <Button
                                    variant="default" 
                                    onClick={() => handleProcessClaim(selectedClaim.id, 'REJECTED')}
                                    disabled={!!processingStates[selectedClaim.id]}
                                    className={`gap-1.5 sm:gap-2 flex-1 sm:flex-auto h-9 text-xs sm:h-10 sm:text-sm bg-red-700 text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 focus-visible:ring-red-500 ${focusRingClass}`}
                                >
                                {processingStates[selectedClaim.id] === 'rejecting' ? <Loader2 className="h-4 w-4 animate-spin"/> : <XCircle className="h-4 w-4" />}
                                {processingStates[selectedClaim.id] === 'rejecting' ? "Rejecting..." : "Reject"}
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={() => handleProcessClaim(selectedClaim.id, 'APPROVED')}
                                    disabled={!!processingStates[selectedClaim.id]}
                                    className={`gap-1.5 sm:gap-2 flex-1 sm:flex-auto h-9 text-xs sm:h-10 sm:text-sm bg-violet-700 text-white hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 focus-visible:ring-violet-500 ${focusRingClass}`}
                                >
                                {processingStates[selectedClaim.id] === 'approving' ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4" />}
                                {processingStates[selectedClaim.id] === 'approving' ? "Approving..." : "Approve"}
                                </Button>
                            </>
                            ) : (
                            <DialogClose asChild>
                                <Button variant="outline" className={`w-full sm:w-auto h-9 text-xs sm:h-10 sm:text-sm border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 ${focusRingClass}`}>Close</Button>
                            </DialogClose>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteConfirmOpen} onOpenChange={(open) => { setIsDeleteConfirmOpen(open); if(!open && !(processingStates[selectedClaim?.id] === 'deleting')) setSelectedClaim(null);}}>
                <AlertDialogContent className="bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700">
                    <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-800 dark:text-red-300 text-lg sm:text-xl">
                        <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-500"/>Confirm Deletion
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-sm py-2">
                        Are you sure you want to delete claim ID: <br/>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono my-1 block">{selectedClaim?.id}</span> <br/>
                        This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-2 gap-2 sm:gap-2.5">
                    <AlertDialogCancel 
                        className={`h-9 text-xs sm:h-10 sm:text-sm border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 ${focusRingClass}`}
                        disabled={processingStates[selectedClaim?.id] === 'deleting'}
                        onClick={() => {
                            if (!(processingStates[selectedClaim?.id] === 'deleting')) {
                                setProcessingStates(prev => ({ ...prev, [selectedClaim.id]: null })); // Clear processing state if cancelled normally
                                setSelectedClaim(null); // Also clear selected claim here
                            }
                        }}
                    >Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirmDelete}
                        disabled={processingStates[selectedClaim?.id] === 'deleting'}
                        className={`h-9 text-xs sm:h-10 sm:text-sm bg-red-700 text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 focus-visible:ring-red-500 ${focusRingClass}`}
                    >
                        {processingStates[selectedClaim?.id] === 'deleting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        {processingStates[selectedClaim?.id] === 'deleting' ? 'Deleting...' : 'Confirm Delete'}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
      )}
    </div>
  );
}