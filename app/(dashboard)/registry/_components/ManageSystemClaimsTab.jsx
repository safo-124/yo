// app/(dashboard)/registry/_components/ManageSystemClaimsTab.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { processClaimByRegistry, getAllClaimsSystemWide, deleteClaimByRegistry } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, ListFilter, Printer, RotateCcw, Search, User, Building, FileText, Loader2, ListChecks, Trash2, AlertTriangle, BookText, Hash, CalendarDays, ArrowRightLeft, Car, Clock, MapPin, GraduationCap, BookOpen, ArrowRight, Banknote, Users, ChevronLeft, ChevronRight, Filter, TrendingUp } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce"; 
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from '@/components/ui/separator';

const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

const dateLocaleStringOptions = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
const dateTimeLocaleStringOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' };

// Helper: Get claim type config (icon, color, label)
const getClaimTypeConfig = (claimType) => {
  switch (claimType) {
    case 'TEACHING': return { icon: BookOpen, label: 'Teaching', gradient: 'from-blue-600 to-indigo-700', lightBg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', iconBg: 'bg-blue-100 dark:bg-blue-900/40' };
    case 'TRANSPORTATION': return { icon: Car, label: 'Transportation', gradient: 'from-amber-600 to-orange-700', lightBg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', iconBg: 'bg-amber-100 dark:bg-amber-900/40' };
    case 'THESIS_PROJECT': return { icon: GraduationCap, label: 'Thesis / Project', gradient: 'from-violet-600 to-purple-700', lightBg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800', text: 'text-violet-700 dark:text-violet-300', iconBg: 'bg-violet-100 dark:bg-violet-900/40' };
    default: return { icon: FileText, label: claimType || 'Unknown', gradient: 'from-slate-600 to-slate-700', lightBg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300', iconBg: 'bg-slate-100 dark:bg-slate-800' };
  }
};

// Helper: Get status config
const getStatusConfig = (status) => {
  switch (status) {
    case 'PENDING': return { label: 'Pending', color: 'bg-amber-500', textColor: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-300 dark:border-amber-700', ringColor: 'ring-amber-500' };
    case 'APPROVED': return { label: 'Approved', color: 'bg-emerald-500', textColor: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-300 dark:border-emerald-700', ringColor: 'ring-emerald-500' };
    case 'REJECTED': return { label: 'Rejected', color: 'bg-red-500', textColor: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/40', border: 'border-red-300 dark:border-red-700', ringColor: 'ring-red-500' };
    default: return { label: status, color: 'bg-slate-500', textColor: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-300 dark:border-slate-700', ringColor: 'ring-slate-500' };
  }
};

// Detail Row component for structured info display
const DetailRow = ({ icon: Icon, label, value, mono, className = '' }) => (
  <div className={`flex items-start gap-3 ${className}`}>
    {Icon && <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />}
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm text-slate-800 dark:text-slate-100 mt-0.5 ${mono ? 'font-mono text-xs' : ''}`}>{value || 'N/A'}</p>
    </div>
  </div>
);

// Status Timeline component
const StatusTimeline = ({ claim }) => {
  const statusCfg = getStatusConfig(claim.status);
  const isProcessed = !!claim.processedAt;
  return (
    <div className="flex items-center gap-0 w-full py-3">
      {/* Step 1: Submitted */}
      <div className="flex flex-col items-center text-center min-w-[80px]">
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-4 ring-blue-100 dark:ring-blue-900/30">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 mt-1.5">Submitted</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">{new Date(claim.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions)}</p>
      </div>
      {/* Connector 1 */}
      <div className={`flex-1 h-0.5 ${isProcessed ? 'bg-gradient-to-r from-blue-400 to-emerald-400' : 'bg-slate-200 dark:bg-slate-700'} mx-1`} />
      {/* Step 2: Processed */}
      <div className="flex flex-col items-center text-center min-w-[80px]">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ${isProcessed ? `${statusCfg.color} ${statusCfg.ringColor}/20` : 'bg-slate-200 dark:bg-slate-700 ring-slate-100 dark:ring-slate-800'}`}>
          {claim.status === 'APPROVED' ? <CheckCircle className="h-4 w-4 text-white" /> : claim.status === 'REJECTED' ? <XCircle className="h-4 w-4 text-white" /> : <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
        </div>
        <p className={`text-[10px] font-semibold mt-1.5 ${isProcessed ? statusCfg.textColor : 'text-slate-400 dark:text-slate-500'}`}>
          {isProcessed ? statusCfg.label : 'Awaiting'}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          {isProcessed ? new Date(claim.processedAt).toLocaleDateString('en-US', dateLocaleStringOptions) : '—'}
        </p>
      </div>
    </div>
  );
};

// Teaching Specifics component
const TeachingSpecifics = ({ claim }) => {
  const hasTransport = [claim.transportToTeachingInDate, claim.transportToTeachingFrom, claim.transportToTeachingTo, claim.transportToTeachingOutDate, claim.transportToTeachingReturnFrom, claim.transportToTeachingReturnTo, claim.transportToTeachingDistanceKM].some(val => val != null && val !== "");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <DetailRow icon={Hash} label="Course Code" value={claim.courseCode} mono />
        <DetailRow icon={BookText} label="Course Title" value={claim.courseTitle} />
        <DetailRow icon={CalendarDays} label="Teaching Date" value={claim.teachingDate ? new Date(claim.teachingDate).toLocaleDateString('en-US', dateLocaleStringOptions) : null} />
        <DetailRow icon={Clock} label="Time" value={claim.teachingStartTime && claim.teachingEndTime ? `${claim.teachingStartTime} — ${claim.teachingEndTime}` : null} />
        <DetailRow icon={BookOpen} label="Contact Hours" value={claim.teachingHours != null ? `${claim.teachingHours} hrs` : null} />
      </div>
      {hasTransport && (
        <div className="mt-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 mb-2.5"><Car className="h-3.5 w-3.5" /> Transport for Teaching Session</p>
          <div className="grid grid-cols-2 gap-2.5">
            {claim.transportToTeachingInDate && <DetailRow icon={CalendarDays} label="Travel Date (To)" value={new Date(claim.transportToTeachingInDate).toLocaleDateString('en-US', dateLocaleStringOptions)} />}
            <DetailRow icon={MapPin} label="To Venue" value={claim.transportToTeachingFrom && claim.transportToTeachingTo ? `${claim.transportToTeachingFrom} → ${claim.transportToTeachingTo}` : null} />
            {(claim.transportToTeachingOutDate || claim.transportToTeachingReturnFrom) && (
              <>
                {claim.transportToTeachingOutDate && <DetailRow icon={CalendarDays} label="Return Date" value={new Date(claim.transportToTeachingOutDate).toLocaleDateString('en-US', dateLocaleStringOptions)} />}
                <DetailRow icon={MapPin} label="Return" value={claim.transportToTeachingReturnFrom && claim.transportToTeachingReturnTo ? `${claim.transportToTeachingReturnFrom} → ${claim.transportToTeachingReturnTo}` : null} />
              </>
            )}
            <DetailRow icon={ArrowRightLeft} label="Total Distance" value={claim.transportToTeachingDistanceKM != null ? `${claim.transportToTeachingDistanceKM} km` : null} />
          </div>
        </div>
      )}
    </div>
  );
};

// Transportation Specifics component
const TransportationSpecifics = ({ claim }) => (
  <div className="grid grid-cols-2 gap-3">
    <DetailRow icon={Car} label="Transport Type" value={claim.transportType} />
    <DetailRow icon={MapPin} label="Route" value={claim.transportDestinationFrom && claim.transportDestinationTo ? `${claim.transportDestinationFrom} → ${claim.transportDestinationTo}` : null} />
    {claim.transportType === 'PRIVATE' && (
      <>
        <DetailRow icon={Hash} label="Reg. Number" value={claim.transportRegNumber} mono />
        <DetailRow icon={ArrowRightLeft} label="Cubic Capacity" value={claim.transportCubicCapacity != null ? `${claim.transportCubicCapacity} cc` : null} />
      </>
    )}
    <DetailRow icon={Banknote} label="Amount Claimed" value={claim.transportAmount != null ? `GHS ${Number(claim.transportAmount).toFixed(2)}` : null} />
  </div>
);

// Thesis/Project Specifics component
const ThesisSpecifics = ({ claim }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <DetailRow icon={GraduationCap} label="Type" value={claim.thesisType} />
      {claim.thesisType === 'SUPERVISION' && <DetailRow icon={User} label="Supervision Rank" value={claim.thesisSupervisionRank} />}
      {claim.thesisType === 'EXAMINATION' && (
        <>
          <DetailRow icon={Hash} label="Exam Course Code" value={claim.thesisExamCourseCode} mono />
          <DetailRow icon={CalendarDays} label="Exam Date" value={claim.thesisExamDate ? new Date(claim.thesisExamDate).toLocaleDateString('en-US', dateLocaleStringOptions) : null} />
        </>
      )}
    </div>
    {claim.thesisType === 'SUPERVISION' && claim.supervisedStudents?.length > 0 && (
      <div className="mt-2">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2"><Users className="h-3.5 w-3.5" />Supervised Students ({claim.supervisedStudents.length})</p>
        <div className="space-y-1.5">
          {claim.supervisedStudents.map((s, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
              <div className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">{idx + 1}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{s.studentName || 'N/A'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate">{s.thesisTitle || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    if (initialClaimsData.error && !initialClaimsData.claims?.length) { 
        toast.error(`Initial data load failed: ${initialClaimsData.error}`);
    }
    const sortedInitialClaims = Array.isArray(initialClaimsData.claims) 
        ? [...initialClaimsData.claims].sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()) 
        : [];
    setClaims(sortedInitialClaims);
  }, [initialClaimsData]);

  const handleOpenDetailDialog = (claim) => { setSelectedClaim(claim); setIsDetailDialogOpen(true); };
  const handleOpenDeleteConfirmDialog = () => { if (selectedClaim) { setIsDeleteConfirmOpen(true); } else { toast.error("No claim selected for deletion."); }};
  
  const handleProcessClaim = async (claimId, status) => {
     if (!registryUserId) { 
        toast.error("Action failed: Registry User ID is missing. Please re-login or contact support."); 
        return; 
     }
     if (!claimId) {
        toast.error("Action failed: Claim ID is missing.");
        return;
     }
     setProcessingStates(prev => ({ ...prev, [claimId]: status.toLowerCase() }));
     try {
        const result = await processClaimByRegistry({ claimId, status, registryUserId });
        if (result.success) {
            toast.success(`Claim ${status.toLowerCase()} successfully!`);
            fetchClaims(); 
            setIsDetailDialogOpen(false); 
            setSelectedClaim(null);
        } else { 
            toast.error(result.error || `Failed to ${status.toLowerCase()} claim.`);
        }
     } catch (error) {
        console.error("Error in handleProcessClaim catch block:", error);
        toast.error("An unexpected error occurred while processing the claim.");
     }
     setProcessingStates(prev => ({ ...prev, [claimId]: null }));
  };

  const handleConfirmDelete = async () => {
    if (!selectedClaim || !registryUserId) { toast.error("Action failed: Claim or Registry User ID missing."); setIsDeleteConfirmOpen(false); return; }
    setProcessingStates(prev => ({ ...prev, [selectedClaim.id]: 'deleting' }));
    try {
        const result = await deleteClaimByRegistry({ claimId: selectedClaim.id, registryUserId });
        if (result.success) {
            toast.success(result.message || "Claim deleted successfully!");
            fetchClaims(); 
            setIsDetailDialogOpen(false); 
        } else {
            toast.error(result.error || "Failed to delete claim.");
        }
    } catch (error) {
        console.error("Error in handleConfirmDelete catch block:", error);
        toast.error("An unexpected error occurred while deleting the claim.");
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
    if (!selectedClaim) { toast.info("No claim selected to print."); return; }
    const printWindow = window.open('', '_blank', 'height=800,width=800,scrollbars=yes,resizable=yes');
    if (printWindow) {
        const universityBlue = "#1E3A8A"; const universityRed = "#991B1B"; const lightGrayBorder = "#D1D5DB"; const textColor = "#1F2937"; const headingColor = "#111827";
        let specificsHtml = '';
        const claim = selectedClaim;
        const submittedByName = claim.submittedBy?.name || 'N/A';
        const submittedByEmail = claim.submittedBy?.email || 'N/A';
        const submitterDesignationText = claim.submittedBy?.designation ? `(${claim.submittedBy.designation.replace(/_/g, " ")})` : '';
        const processedByName = claim.processedBy?.name || 'N/A';
        const processedByEmail = claim.processedBy?.email || 'N/A';
        const processorDesignationText = claim.processedBy?.designation ? `(${claim.processedBy.designation.replace(/_/g, " ")})` : '';
        const submittedAtPrint = new Date(claim.submittedAt).toLocaleString('en-US', dateTimeLocaleStringOptions) + " (UTC)";
        const processedAtPrint = claim.processedAt ? new Date(claim.processedAt).toLocaleString('en-US', dateTimeLocaleStringOptions) + " (UTC)" : 'N/A';

        if (claim.claimType === 'TEACHING') { 
            specificsHtml = `<p><strong>Course Code:</strong> ${claim.courseCode || 'N/A'}</p><p><strong>Course Title:</strong> ${claim.courseTitle || 'N/A'}</p><p><strong>Teaching Date:</strong> ${claim.teachingDate ? new Date(claim.teachingDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</p><p><strong>Start Time:</strong> ${claim.teachingStartTime || 'N/A'}</p><p><strong>End Time:</strong> ${claim.teachingEndTime || 'N/A'}</p><p><strong>Contact Hours:</strong> ${claim.teachingHours !== null && claim.teachingHours !== undefined ? claim.teachingHours : 'N/A'}</p>`;
            const ttFieldsPresent = [ claim.transportToTeachingInDate, claim.transportToTeachingFrom, claim.transportToTeachingTo, claim.transportToTeachingOutDate, claim.transportToTeachingReturnFrom, claim.transportToTeachingReturnTo, claim.transportToTeachingDistanceKM ].some(val => val !== null && val !== undefined && val !== "");
            if (ttFieldsPresent) {
                specificsHtml += `<br/><h5 style="font-weight:bold; margin-top:10px; margin-bottom: 5px; font-size:1.05em; color:${headingColor};">Transport for this Teaching Session:</h5>`;
                if(claim.transportToTeachingInDate) specificsHtml +=`<p><strong>Travel Date (To Venue):</strong> ${new Date(claim.transportToTeachingInDate).toLocaleDateString('en-US', dateLocaleStringOptions)}</p>`;
                specificsHtml +=`<p><strong>Journey To Venue:</strong> From: ${claim.transportToTeachingFrom || 'N/A'} &rarr; To: ${claim.transportToTeachingTo || 'N/A'}</p>`;
                if(claim.transportToTeachingOutDate || claim.transportToTeachingReturnFrom || claim.transportToTeachingReturnTo) {
                    specificsHtml += `<br/><p style="font-weight:bold; margin-top:5px; margin-bottom:3px;font-size:1em;color:${headingColor};">Return Journey:</p>`;
                    if(claim.transportToTeachingOutDate) specificsHtml +=`<p><strong>Travel Date (Return):</strong> ${new Date(claim.transportToTeachingOutDate).toLocaleDateString('en-US', dateLocaleStringOptions)}</p>`;
                    specificsHtml +=`<p><strong>From:</strong> ${claim.transportToTeachingReturnFrom || 'N/A'} &rarr; <strong>To:</strong> ${claim.transportToTeachingReturnTo || 'N/A'}</p>`;
                }
                specificsHtml +=`<p><strong>Total Distance for Teaching Transport (KM):</strong> ${claim.transportToTeachingDistanceKM !== null && claim.transportToTeachingDistanceKM !== undefined ? claim.transportToTeachingDistanceKM : '(Not calculated/provided)'}</p>`;
            }
        } else if (claim.claimType === 'TRANSPORTATION') { 
            specificsHtml = `<p><strong>Transport Type:</strong> ${claim.transportType || 'N/A'}</p><p><strong>From:</strong> ${claim.transportDestinationFrom || 'N/A'}</p><p><strong>To:</strong> ${claim.transportDestinationTo || 'N/A'}</p>`;
            if(claim.transportType === 'PRIVATE') {
                specificsHtml += `<p><strong>Reg. Number:</strong> ${claim.transportRegNumber || 'N/A'}</p><p><strong>Cubic Capacity (cc):</strong> ${claim.transportCubicCapacity != null ? claim.transportCubicCapacity : 'N/A'}</p>`;
            }
            specificsHtml += `<p><strong>Amount Claimed:</strong> ${claim.transportAmount != null ? `GHS ${Number(claim.transportAmount).toFixed(2)}` : 'N/A'}</p>`;
        } else if (claim.claimType === 'THESIS_PROJECT') { 
            specificsHtml = `<p><strong>Thesis/Project Type:</strong> ${claim.thesisType || 'N/A'}</p>`; 
            if (claim.thesisType === 'SUPERVISION') { 
                specificsHtml += `<p><strong>Supervision Rank:</strong> ${claim.thesisSupervisionRank || 'N/A'}</p>`; 
                if (claim.supervisedStudents && claim.supervisedStudents.length > 0) { 
                    let studentsListHtml = claim.supervisedStudents.map(s => `<li style="overflow-wrap:break-word;word-break:break-word;">${s.studentName || 'N/A'} - ${s.thesisTitle || 'N/A'}</li>`).join(''); 
                    specificsHtml += `<p><strong>Supervised Students:</strong><ul style="margin-top:2px; padding-left:18px;">${studentsListHtml}</ul></p>`; 
                } else { specificsHtml += `<p><strong>Supervised Students:</strong> (None listed)</p>`; } 
            } else if (claim.thesisType === 'EXAMINATION') { 
                specificsHtml += `<p><strong>Exam Course Code:</strong> ${claim.thesisExamCourseCode || 'N/A'}</p>`; 
                specificsHtml += `<p><strong>Exam Date:</strong> ${claim.thesisExamDate ? new Date(claim.thesisExamDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</p>`; 
            } 
        }
        const printHtml = `<html><head><title>Claim Details Report - ${claim.id}</title><meta charset="UTF-8"><style>
        /* Reset and Base Styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            line-height: 1.5; 
            color: #2d3748; 
            background: white;
            font-size: 11pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        /* Print Container */
        .print-container { 
            max-width: 210mm; 
            margin: 0 auto; 
            padding: 15mm 20mm; 
            background: white;
            min-height: 297mm;
        }
        
        /* Header Section */
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px; 
            border-bottom: 3px solid ${universityBlue};
            page-break-inside: avoid;
        }
        .logo { 
            height: 80px; 
            width: auto;
            margin-bottom: 15px;
        }
        .university-name { 
            font-size: 22pt; 
            font-weight: 700; 
            color: ${universityBlue}; 
            margin-bottom: 5px;
            letter-spacing: 0.5px;
        }
        .college-name { 
            font-size: 14pt; 
            font-weight: 500; 
            color: ${universityBlue}; 
            margin-bottom: 10px;
        }
        .document-title { 
            font-size: 18pt; 
            font-weight: 600; 
            color: ${universityRed}; 
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 15px;
        }
        
        /* Section Styles */
        .section { 
            margin-bottom: 25px; 
            padding: 18px; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            background: #fafafa;
            page-break-inside: avoid;
        }
        .section-alt {
            background: #f0f9ff;
            border-color: #bae6fd;
        }
        .section-title { 
            font-size: 14pt; 
            font-weight: 600; 
            color: ${headingColor}; 
            margin-bottom: 15px; 
            padding-bottom: 10px; 
            border-bottom: 2px solid ${universityBlue}40;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Details Grid */
        .details-grid { 
            display: grid; 
            grid-template-columns: 160px 1fr; 
            gap: 15px 20px; 
            font-size: 11pt;
            line-height: 1.4;
        }
        .details-grid strong { 
            font-weight: 600; 
            color: ${headingColor};
            display: block;
        }
        .details-grid span { 
            word-break: break-word; 
            overflow-wrap: break-word;
        }
        
        /* Status Badges */
        .status-badge { 
            padding: 6px 12px; 
            border-radius: 15px; 
            font-weight: 600; 
            font-size: 9pt; 
            color: white; 
            text-transform: uppercase; 
            display: inline-block;
            letter-spacing: 0.5px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .status-PENDING { background: linear-gradient(135deg, #F59E0B, #D97706); }
        .status-APPROVED { background: linear-gradient(135deg, #10B981, #059669); }
        .status-REJECTED { background: linear-gradient(135deg, ${universityRed}, #B91C1C); }
        
        /* Claim Specifics */
        .claim-specifics-content { 
            background: white;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        .claim-specifics-content p { 
            margin: 0 0 10px 0; 
            font-size: 11pt; 
            line-height: 1.5; 
            overflow-wrap: break-word; 
            word-break: break-word;
        }
        .claim-specifics-content ul { 
            margin: 8px 0 10px 25px; 
            padding: 0;
        }
        .claim-specifics-content li { 
            margin-bottom: 5px; 
            overflow-wrap: break-word; 
            word-break: break-word;
            line-height: 1.4;
        }
        .claim-specifics-content strong {
            color: ${headingColor};
            font-weight: 600;
        }
        
        /* Signature Section */
        .signature-section { 
            margin-top: 50px; 
            padding-top: 25px; 
            border-top: 2px dashed #cbd5e0;
            page-break-inside: avoid;
        }
        .signature-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 40px; 
            margin-top: 30px;
        }
        .signature-box { 
            text-align: center;
            min-height: 100px;
        }
        .signature-line { 
            border-bottom: 2px solid ${textColor}; 
            width: 80%; 
            margin: 40px auto 10px auto;
            height: 50px;
            position: relative;
        }
        .signature-line::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 1px;
            background: #cbd5e0;
        }
        .signature-label { 
            font-size: 11pt; 
            font-weight: 600;
            color: ${headingColor};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Footer */
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0; 
            font-size: 9pt; 
            color: #718096;
            font-style: italic;
            font-weight: 500;
        }
        
        /* Print Specific Styles */
        @media print { 
            body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
                font-size: 10pt;
                margin: 0;
                padding: 0;
            }
            .print-container { 
                width: 100%; 
                margin: 0; 
                padding: 12mm 15mm;
                box-shadow: none; 
                border: none;
                min-height: auto;
            }
            .section {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 20px;
                padding: 15px;
            }
            .signature-section {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            .status-badge { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
            }
            .logo {
                height: 70px;
            }
            .university-name {
                font-size: 20pt;
            }
            .document-title {
                font-size: 16pt;
            }
        }
        
        @page {
            margin: 15mm;
            size: A4;
        }
        </style></head><body>
        <div class="print-container">
            <div class="header">
                <img src="/uew.png" alt="University Logo" class="logo" />
                <div class="university-name">UNIVERSITY OF EDUCATION, WINNEBA</div>
                <div class="college-name">COLLEGE OF DISTANCE AND e-LEARNING (CODeL)</div>
                <div class="document-title">Claim Details Report</div>
            </div>
            
            <div class="section">
                <div class="section-title">General Information</div>
                <div class="details-grid">
                    <strong>Claim ID:</strong> 
                    <span style="font-family: monospace; font-size: 10pt; color: #6b7280;">${claim.id}</span>
                    <strong>Submitted By:</strong> 
                    <span><strong>${submittedByName}</strong> (${submittedByEmail}) ${submitterDesignationText}</span>
                    <strong>Center:</strong> 
                    <span>${claim.centerName||claim.center?.name||'N/A'}</span>
                    <strong>Claim Type:</strong> 
                    <span style="text-transform:capitalize; font-weight: 600; color: ${universityRed};">${claim.claimType.toLowerCase().replace('_', ' ')}</span>
                    <strong>Submitted At:</strong> 
                    <span>${submittedAtPrint}</span>
                    <strong>Status:</strong> 
                    <span><span class="status-badge status-${claim.status}">${claim.status}</span></span>
                </div>
            </div>
            
            ${claim.processedAt?`<div class="section section-alt">
                <div class="section-title">Processing Information</div>
                <div class="details-grid">
                    <strong>Processed By:</strong> 
                    <span><strong>${processedByName}</strong> (${processedByEmail}) ${processorDesignationText}</span>
                    <strong>Processed At:</strong> 
                    <span>${processedAtPrint}</span>
                </div>
            </div>`:''}
            
            <div class="section">
                <div class="section-title">Claim Details & Specifics</div>
                <div class="claim-specifics-content">${specificsHtml}</div>
            </div>
            
            <div class="signature-section">
                <div class="signature-grid">
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="signature-label">Claimant's Signature</div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="signature-label">Authorizing Officer's Signature</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">Printed on: ${new Date().toLocaleString('en-US', dateTimeLocaleStringOptions)} by UEW Claims Management System</div>
        </div>
        </body></html>`;
        printWindow.document.write(printHtml);printWindow.document.close();printWindow.focus();setTimeout(()=>{try{printWindow.print();}catch(e){console.error("Print error:",e); printWindow.close();toast.error("Printing failed.");}},600);
      } else {toast.error("Could not open print window. Please check pop-up blocker.");}
  };

  const resetFilters = () => { setFilterStatus(""); setFilterCenterId(""); setFilterLecturerName(""); setCurrentPage(1); };

  // Stats computed from current claims
  const claimStats = useMemo(() => {
    const total = claims.length;
    const pending = claims.filter(c => c.status === 'PENDING').length;
    const approved = claims.filter(c => c.status === 'APPROVED').length;
    const rejected = claims.filter(c => c.status === 'REJECTED').length;
    return { total, pending, approved, rejected };
  }, [claims]);

  // Pagination computed
  const totalPages = Math.max(1, Math.ceil(claims.length / itemsPerPage));
  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return claims.slice(start, start + itemsPerPage);
  }, [claims, currentPage, itemsPerPage]);

  // Reset to page 1 when claims change
  useEffect(() => { setCurrentPage(1); }, [claims.length]);

  const activeFilterCount = [filterStatus, filterCenterId, debouncedLecturerName].filter(Boolean).length;

  // Type badge helper
  const getTypeBadgeClasses = (type) => {
    switch(type) {
      case 'TEACHING': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700';
      case 'TRANSPORTATION': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700';
      case 'THESIS_PROJECT': return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-5 p-1">

      {/* ── A) Stats Summary Banner ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Claims', value: claimStats.total, icon: ListChecks, gradient: 'from-violet-600 to-indigo-600', lightBg: 'bg-violet-50 dark:bg-violet-950/30', iconBg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300' },
          { label: 'Pending', value: claimStats.pending, icon: Clock, gradient: 'from-amber-500 to-orange-500', lightBg: 'bg-amber-50 dark:bg-amber-950/30', iconBg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
          { label: 'Approved', value: claimStats.approved, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500', lightBg: 'bg-emerald-50 dark:bg-emerald-950/30', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
          { label: 'Rejected', value: claimStats.rejected, icon: XCircle, gradient: 'from-red-500 to-rose-500', lightBg: 'bg-red-50 dark:bg-red-950/30', iconBg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
        ].map((stat) => (
          <div key={stat.label} className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/70 ${stat.lightBg} p-4 transition-all hover:shadow-md group`}>
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.text}`}>{isLoadingClaims ? '—' : stat.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-5 w-5 ${stat.text}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card className="bg-white dark:bg-slate-800/80 shadow-xl border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden">
        {/* ── Card Header with Refresh ── */}
        <CardHeader className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <ListChecks className="h-4 w-4 text-white" />
                </div>
                Claims Management
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Monitor and process claims from all centers.
              </CardDescription>
            </div>
            <Button onClick={fetchClaims} variant="outline" size="sm" disabled={isLoadingClaims} className={`border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-600 dark:text-violet-300 dark:hover:bg-violet-700/30 self-start sm:self-center rounded-lg ${focusRingClass} gap-1.5 h-9 px-3.5 text-xs font-medium`}>
              <RotateCcw className={`h-3.5 w-3.5 ${isLoadingClaims ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">

          {/* ── B) Redesigned Filter Bar ── */}
          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 h-5 min-w-[20px] px-1.5 rounded-full bg-violet-600 text-[10px] font-bold text-white flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <Select value={filterStatus || "ALL_STATUSES"} onValueChange={(value) => { setFilterStatus(value === "ALL_STATUSES" ? "" : value); setCurrentPage(1); }}>
                <SelectTrigger className={`h-9 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600/80 rounded-lg focus:ring-violet-500 focus:border-violet-500`}><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800"><SelectItem value="ALL_STATUSES">All Statuses</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="APPROVED">Approved</SelectItem><SelectItem value="REJECTED">Rejected</SelectItem></SelectContent>
              </Select>
              <Select value={filterCenterId || "ALL_CENTERS"} onValueChange={(value) => { setFilterCenterId(value === "ALL_CENTERS" ? "" : value); setCurrentPage(1); }}>
                <SelectTrigger className={`h-9 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600/80 rounded-lg focus:ring-violet-500 focus:border-violet-500`}><SelectValue placeholder="All Centers" /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800"><SelectItem value="ALL_CENTERS">All Centers</SelectItem>{allCenters.map(center => (<SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>))}</SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <Input type="search" placeholder="Search lecturer..." value={filterLecturerName} onChange={(e) => { setFilterLecturerName(e.target.value); setCurrentPage(1); }} className={`pl-8 h-9 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600/80 rounded-lg focus:ring-violet-500 focus:border-violet-500`} />
              </div>
              {activeFilterCount > 0 ? (
                <Button onClick={resetFilters} className="h-9 text-xs rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm gap-1.5 font-medium">
                  <RotateCcw className="h-3.5 w-3.5" /> Clear All ({activeFilterCount})
                </Button>
              ) : (
                <Button onClick={resetFilters} variant="ghost" disabled className="h-9 text-xs rounded-lg gap-1.5 text-slate-400 dark:text-slate-500">
                  <RotateCcw className="h-3.5 w-3.5" /> No filters
                </Button>
              )}
            </div>
          </div>

          {/* ── C+D) Enhanced Table with Pagination ── */}
          <div>
            {isLoadingClaims ? ( <div className="space-y-3 p-4">{[...Array(5)].map((_, i) => ( <Skeleton key={i} className="h-14 w-full rounded-lg bg-slate-200 dark:bg-slate-700" /> ))}</div>
            ) : claims && claims.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block border dark:border-slate-700/70 rounded-xl overflow-hidden shadow-sm">
                  <Table className="min-w-[800px]">
                    <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80">
                      <TableRow className="border-b border-slate-200 dark:border-slate-700">
                        <TableHead className="w-[100px] text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Claim ID</TableHead>
                        <TableHead className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Center</TableHead>
                        <TableHead className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Lecturer</TableHead>
                        <TableHead className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Type</TableHead>
                        <TableHead className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Status</TableHead>
                        <TableHead className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Submitted</TableHead>
                        <TableHead className="text-right text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold tracking-wider px-4 py-3 whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClaims.map((claim, idx) => (
                        <TableRow key={claim.id} onClick={() => handleOpenDetailDialog(claim)} className={`cursor-pointer transition-colors hover:bg-violet-50/50 dark:hover:bg-violet-900/10 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900/20' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                          <TableCell className="font-mono text-xs px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">{claim.id ? claim.id.substring(0, 8) + '...' : 'N/A'}</TableCell>
                          <TableCell className="text-xs px-4 py-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-200">{claim.centerName || claim.center?.name}</TableCell>
                          <TableCell className="text-xs px-4 py-3.5 whitespace-nowrap text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{claim.submittedBy?.name || 'N/A'}</TableCell>
                          <TableCell className="px-4 py-3.5 whitespace-nowrap">
                            <Badge variant="outline" className={`capitalize text-[10px] px-2 py-0.5 rounded-md font-medium border ${getTypeBadgeClasses(claim.claimType)}`}>
                              {claim.claimType?.toLowerCase().replace('_', ' ') || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full ${claim.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : claim.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span className={`text-xs font-medium capitalize ${claim.status === 'PENDING' ? 'text-amber-700 dark:text-amber-300' : claim.status === 'APPROVED' ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                                {claim.status.toLowerCase()}
                              </span>
                            </span>
                          </TableCell>
                          <TableCell className="text-xs px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">{claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</TableCell>
                          <TableCell className="text-right px-4 py-3.5 whitespace-nowrap">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDetailDialog(claim); }} className="h-8 px-2.5 text-xs text-violet-700 hover:bg-violet-100 dark:text-violet-400 dark:hover:bg-violet-900/30 rounded-lg gap-1.5 font-medium">
                              <Eye className="h-3.5 w-3.5" /> Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* ── E) Mobile Cards Upgrade ── */}
                <div className="block md:hidden space-y-3">
                  {paginatedClaims.map((claim) => {
                    const mTypeCfg = getClaimTypeConfig(claim.claimType);
                    const MTypeIcon = mTypeCfg.icon;
                    return (
                      <div key={claim.id} onClick={() => handleOpenDetailDialog(claim)} className={`relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/70 shadow-sm border border-slate-200 dark:border-slate-700/70 cursor-pointer transition-all hover:shadow-md active:scale-[0.99]`}>
                        <div className={`absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b ${mTypeCfg.gradient}`} />
                        <div className="p-3.5 pl-4">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`h-8 w-8 rounded-lg ${mTypeCfg.iconBg} flex items-center justify-center flex-shrink-0`}>
                                <MTypeIcon className={`h-4 w-4 ${mTypeCfg.text}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{claim.submittedBy?.name || 'N/A'}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1"><Building className="w-3 h-3 flex-shrink-0" /> {claim.centerName || claim.center?.name}</p>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1.5 flex-shrink-0">
                              <span className={`h-2 w-2 rounded-full ${claim.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : claim.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span className={`text-[11px] font-semibold capitalize ${claim.status === 'PENDING' ? 'text-amber-700 dark:text-amber-300' : claim.status === 'APPROVED' ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                                {claim.status.toLowerCase()}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <Badge variant="outline" className={`capitalize text-[10px] px-1.5 py-0 rounded-md font-medium border ${getTypeBadgeClasses(claim.claimType)}`}>
                              {claim.claimType?.toLowerCase().replace('_', ' ')}
                            </Badge>
                            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── D) Pagination Controls ── */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, claims.length)}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{claims.length}</span> claims
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-lg border-slate-300 dark:border-slate-600">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                        .map((page, idx, arr) => (
                          <span key={page} className="flex items-center">
                            {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1 text-xs text-slate-400">…</span>}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={`h-8 w-8 p-0 rounded-lg text-xs font-medium ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm border-0'
                                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {page}
                            </Button>
                          </span>
                        ))}
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0 rounded-lg border-slate-300 dark:border-slate-600">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : ( <div className="text-center py-16 sm:py-20 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30"><ListFilter className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-400 dark:text-slate-500 opacity-80" /><h3 className="mt-4 text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200">No Claims Found</h3><p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Adjust filters or wait for new submissions.</p><Button onClick={resetFilters} variant="ghost" className={`mt-6 h-9 px-4 text-xs sm:text-sm ${focusRingClass} gap-1.5 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30`}><RotateCcw className="h-4 w-4" /> Reset Filters</Button></div>)}
          </div>
        </CardContent>
      </Card>

      {selectedClaim && (() => {
        const typeCfg = getClaimTypeConfig(selectedClaim.claimType);
        const statusCfg = getStatusConfig(selectedClaim.status);
        const TypeIcon = typeCfg.icon;
        return (
        <>
            <Dialog open={isDetailDialogOpen} onOpenChange={(open) => { if(!open) { setSelectedClaim(null); } setIsDetailDialogOpen(open);}}>
                <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 shadow-2xl">
                    
                    {/* ── A) Gradient Header with Claim Type & Status ── */}
                    <div className={`bg-gradient-to-r ${typeCfg.gradient} px-6 py-5 flex-shrink-0`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-white/20 backdrop-blur-sm">
                            <TypeIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <DialogTitle className="text-white text-lg font-semibold">Claim Details</DialogTitle>
                            <DialogDescription className="text-white/70 text-sm mt-0.5">
                              {typeCfg.label} claim • {selectedClaim.centerName || selectedClaim.center?.name || 'N/A'}
                            </DialogDescription>
                          </div>
                        </div>
                        <Badge className={`${statusCfg.bg} ${statusCfg.textColor} border ${statusCfg.border} text-xs font-semibold px-3 py-1 rounded-full`}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                    </div>

                    {/* ── B+E) Structured Info + Status Timeline ── */}
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <div className="px-6 py-5 space-y-5">

                        {/* Status Timeline */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <StatusTimeline claim={selectedClaim} />
                        </div>

                        {/* General Information Grid */}
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5" /> General Information
                          </h4>
                          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                            <DetailRow icon={Hash} label="Claim ID" value={selectedClaim.id} mono />
                            <DetailRow icon={User} label="Submitted By" value={
                              <span>
                                <span className="font-medium">{selectedClaim.submittedBy?.name || 'N/A'}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">{selectedClaim.submittedBy?.email}</span>
                                {selectedClaim.submittedBy?.designation && <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">{selectedClaim.submittedBy.designation.replace(/_/g, " ")}</span>}
                              </span>
                            } />
                            <DetailRow icon={Building} label="Center" value={selectedClaim.centerName || selectedClaim.center?.name} />
                            <DetailRow icon={CalendarDays} label="Submitted At" value={new Date(selectedClaim.submittedAt).toLocaleString('en-US', dateTimeLocaleStringOptions) + ' (UTC)'} />
                            {selectedClaim.processedAt && (
                              <>
                                <DetailRow icon={User} label="Processed By" value={
                                  <span>
                                    <span className="font-medium">{selectedClaim.processedBy?.name || 'N/A'}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 block">{selectedClaim.processedBy?.email}</span>
                                    {selectedClaim.processedBy?.designation && <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">{selectedClaim.processedBy.designation.replace(/_/g, " ")}</span>}
                                  </span>
                                } />
                                <DetailRow icon={CalendarDays} label="Processed At" value={new Date(selectedClaim.processedAt).toLocaleString('en-US', dateTimeLocaleStringOptions) + ' (UTC)'} />
                              </>
                            )}
                          </div>
                        </div>

                        {/* ── C) Claim Specifics Section ── */}
                        <div>
                          <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${typeCfg.text}`}>
                            <TypeIcon className="h-3.5 w-3.5" /> {typeCfg.label} Details
                          </h4>
                          <div className={`p-4 rounded-xl ${typeCfg.lightBg} border ${typeCfg.border}`}>
                            {selectedClaim.claimType === 'TEACHING' && <TeachingSpecifics claim={selectedClaim} />}
                            {selectedClaim.claimType === 'TRANSPORTATION' && <TransportationSpecifics claim={selectedClaim} />}
                            {selectedClaim.claimType === 'THESIS_PROJECT' && <ThesisSpecifics claim={selectedClaim} />}
                          </div>
                        </div>

                        {/* Pending Banner */}
                        {selectedClaim.status === 'PENDING' && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Awaiting Decision</p>
                              <p className="text-xs text-amber-600 dark:text-amber-400">This claim has not been processed yet. Use the buttons below to approve or reject.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── D) Redesigned Sticky Footer Action Bar ── */}
                    <div className="flex-shrink-0 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex flex-col sm:flex-row justify-between items-stretch gap-2.5">
                        <div className="flex gap-2 flex-wrap">
                          <Button variant="ghost" size="sm" onClick={handlePrintClaim} disabled={!!processingStates[selectedClaim.id]} className="h-9 text-xs gap-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 rounded-lg">
                            <Printer className="h-3.5 w-3.5" /> Print
                          </Button>
                          <Button variant="ghost" size="sm" onClick={handleOpenDeleteConfirmDialog} disabled={!!processingStates[selectedClaim.id]} className="h-9 text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                        <div className="flex gap-2.5 flex-wrap">
                          {selectedClaim.status === 'PENDING' ? (
                            <>
                              <Button onClick={() => handleProcessClaim(selectedClaim.id, 'REJECTED')} disabled={!!processingStates[selectedClaim.id]} className="h-9 text-xs gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md flex-1 sm:flex-auto">
                                {processingStates[selectedClaim.id] === 'rejecting' ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <XCircle className="h-3.5 w-3.5" />}
                                {processingStates[selectedClaim.id] === 'rejecting' ? "Rejecting..." : "Reject"}
                              </Button>
                              <Button onClick={() => handleProcessClaim(selectedClaim.id, 'APPROVED')} disabled={!!processingStates[selectedClaim.id]} className="h-9 text-xs gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md flex-1 sm:flex-auto">
                                {processingStates[selectedClaim.id] === 'approving' ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <CheckCircle className="h-3.5 w-3.5" />}
                                {processingStates[selectedClaim.id] === 'approving' ? "Approving..." : "Approve"}
                              </Button>
                            </>
                          ) : (
                            <DialogClose asChild>
                              <Button variant="outline" className="h-9 text-xs rounded-lg w-full sm:w-auto">Close</Button>
                            </DialogClose>
                          )}
                        </div>
                      </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── F) Restyled Delete Confirmation Dialog ── */}
            <AlertDialog open={isDeleteConfirmOpen} onOpenChange={(open) => { setIsDeleteConfirmOpen(open); if(!open && !(processingStates[selectedClaim?.id] === 'deleting')) setSelectedClaim(null);}}>
                <AlertDialogContent className="p-0 gap-0 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-5">
                    <AlertDialogTitle className="text-white text-lg font-semibold flex items-center gap-2.5">
                      <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-white/20 backdrop-blur-sm"><Trash2 className="h-5 w-5 text-white" /></div>
                      Delete Claim
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-red-200 text-sm mt-1">This action cannot be undone</AlertDialogDescription>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Are you sure you want to permanently delete this claim?</p>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4">
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Claim ID</p>
                      <p className="text-sm font-mono text-slate-800 dark:text-slate-100 mt-0.5 break-all">{selectedClaim?.id}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 p-3 rounded-xl text-sm flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-xs">Warning</p>
                        <p className="text-xs mt-0.5 opacity-80">All data associated with this claim will be permanently removed.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                    <AlertDialogCancel className="rounded-lg h-9 text-xs" disabled={processingStates[selectedClaim?.id] === 'deleting'} onClick={() => { if (!(processingStates[selectedClaim?.id] === 'deleting')) { setProcessingStates(prev => ({ ...prev, [selectedClaim.id]: null })); setSelectedClaim(null); }}}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} disabled={processingStates[selectedClaim?.id] === 'deleting'} className="rounded-lg h-9 text-xs bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold shadow-md">
                      {processingStates[selectedClaim?.id] === 'deleting' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin"/> : <Trash2 className="mr-2 h-3.5 w-3.5"/>}
                      {processingStates[selectedClaim?.id] === 'deleting' ? 'Deleting...' : 'Delete Claim'}
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
        );
      })()}
    </div>
  );
}