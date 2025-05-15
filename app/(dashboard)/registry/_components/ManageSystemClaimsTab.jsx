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
import { CheckCircle, XCircle, Eye, ListFilter, Printer, RotateCcw, Search, User, Building, FileText, Loader2, ListChecks, Trash2, AlertTriangle, BookText, Hash, CalendarDays, ArrowRightLeft, Car } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce"; 
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from '@/components/ui/scroll-area';

const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

const dateLocaleStringOptions = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
const dateTimeLocaleStringOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' };

const formatClaimDetailsForDialog = (claim) => {
    if (!claim) return "<p>No claim details available.</p>";
    let detailsHtml = "";
    const pStyle = "margin-bottom: 0.5rem; line-height: 1.6; overflow-wrap: break-word; word-break: break-word;";
    const headingStyle = "font-size: 1.05em; color: #1d4ed8; margin-bottom: 0.6rem; margin-top: 1.1rem; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem;";
    const subHeadingStyle = "font-weight:bold; margin-top:0.8rem; margin-bottom:0.4rem; font-size:0.95em; color:#0ea5e9;";
    const nestedPStyle = `margin-left: 1.25em; margin-bottom: 0.3rem; line-height: 1.5; overflow-wrap: break-word; word-break: break-word;`;

    const submittedByName = claim.submittedBy?.name || 'N/A';
    const submittedByEmail = claim.submittedBy?.email || 'N/A';
    const submittedByDesignation = claim.submittedBy?.designation ? claim.submittedBy.designation.replace(/_/g, " ") : '';
    const submitterInfo = `${submittedByName} (${submittedByEmail})${submittedByDesignation ? ` - <span style="font-style:italic; color:#4b5563;">${submittedByDesignation}</span>` : ''}`;

    detailsHtml += `<p style="${pStyle}"><strong>Claim ID:</strong> <span style="font-family: monospace; color: #4A5568;">${claim.id}</span></p>`;
    detailsHtml += `<p style="${pStyle}"><strong>Submitted By:</strong> ${submitterInfo}</p>`;
    detailsHtml += `<p style="${pStyle}"><strong>Center:</strong> ${claim.centerName || claim.center?.name || 'N/A'}</p>`;
    detailsHtml += `<p style="${pStyle}"><strong style="text-transform: capitalize;">Type:</strong> ${claim.claimType?.toLowerCase().replace("_", " ") || 'N/A'}</p>`;
    detailsHtml += `<p style="${pStyle}"><strong>Submitted At:</strong> ${new Date(claim.submittedAt).toLocaleString('en-US', dateTimeLocaleStringOptions)} (UTC)</p>`;
    detailsHtml += `<p style="${pStyle}"><strong>Status:</strong> <span class="status-badge status-${claim.status}" style="padding: 3px 8px; border-radius: 12px; font-weight: 600; font-size: 0.75em; color: white; text-transform: uppercase; display: inline-block; background-color: ${claim.status === 'PENDING' ? '#F59E0B' : claim.status === 'APPROVED' ? '#10B981' : claim.status === 'REJECTED' ? '#EF4444' : '#6B7280'};">${claim.status}</span></p>`;

    if (claim.processedAt) {
        const processedByName = claim.processedBy?.name || 'N/A';
        const processedByEmail = claim.processedBy?.email || 'N/A';
        const processedByDesignation = claim.processedBy?.designation ? claim.processedBy.designation.replace(/_/g, " ") : '';
        const processorInfo = `${processedByName} (${processedByEmail})${processedByDesignation ? ` - <span style="font-style:italic; color:#4b5563;">${processedByDesignation}</span>` : ''}`;
        detailsHtml += `<p style="${pStyle}"><strong>Processed At:</strong> ${new Date(claim.processedAt).toLocaleString('en-US', dateTimeLocaleStringOptions)} (UTC)</p>`;
        detailsHtml += `<p style="${pStyle}"><strong>Processed By:</strong> ${processorInfo}</p>`;
    } else { detailsHtml += `<p style="${pStyle}"><strong>Processed Info:</strong> <span style="font-style: italic; color: #718096;">Not yet processed</span></p>`; }
    
    detailsHtml += `<hr style="margin: 1rem 0; border-color: #cbd5e1;" /><h4 style="${headingStyle}">Claim Specifics:</h4>`;
    
    if (claim.claimType === 'TEACHING') {
        detailsHtml += `<p style="${pStyle}"><strong>Course Code:</strong> ${claim.courseCode || 'N/A'}</p>`;
        detailsHtml += `<p style="${pStyle}"><strong>Course Title:</strong> ${claim.courseTitle || 'N/A'}</p>`;
        detailsHtml += `<p style="${pStyle}"><strong>Teaching Date:</strong> ${claim.teachingDate ? new Date(claim.teachingDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</p>`;
        detailsHtml += `<p style="${pStyle}"><strong>Start Time:</strong> ${claim.teachingStartTime || 'N/A'}</p>`;
        detailsHtml += `<p style="${pStyle}"><strong>End Time:</strong> ${claim.teachingEndTime || 'N/A'}</p>`;
        detailsHtml += `<p style="${pStyle}"><strong>Contact Hours:</strong> ${claim.teachingHours !== null && claim.teachingHours !== undefined ? claim.teachingHours : 'N/A'}</p>`;
        const ttFieldsPresent = [ claim.transportToTeachingInDate, claim.transportToTeachingFrom, claim.transportToTeachingTo, claim.transportToTeachingOutDate, claim.transportToTeachingReturnFrom, claim.transportToTeachingReturnTo, claim.transportToTeachingDistanceKM ].some(val => val !== null && val !== undefined && val !== "");
        if (ttFieldsPresent) {
            detailsHtml += `<h5 style="${subHeadingStyle}">Transport for this Teaching Session:</h5>`;
            if(claim.transportToTeachingInDate) detailsHtml += `<p style="${nestedPStyle}"><strong>Travel Date (To Venue):</strong> ${new Date(claim.transportToTeachingInDate).toLocaleDateString('en-US', dateLocaleStringOptions)}</p>`;
            detailsHtml += `<p style="${nestedPStyle}"><strong>Journey To Venue (From):</strong> ${claim.transportToTeachingFrom || 'N/A'}</p>`;
            detailsHtml += `<p style="${nestedPStyle}"><strong>Journey To Venue (To):</strong> ${claim.transportToTeachingTo || 'N/A'}</p>`;
            if(claim.transportToTeachingOutDate || claim.transportToTeachingReturnFrom?.trim() || claim.transportToTeachingReturnTo?.trim()) {
                 detailsHtml += `<p style="${nestedPStyle.replace('margin-bottom: 0.25rem;', 'margin-bottom: 0.25rem; margin-top: 0.6rem; font-weight:500;')}">Return Journey:</p>`;
                if(claim.transportToTeachingOutDate) detailsHtml += `<p style="${nestedPStyle}"><strong>Travel Date (Return):</strong> ${new Date(claim.transportToTeachingOutDate).toLocaleDateString('en-US', dateLocaleStringOptions)}</p>`;
                detailsHtml += `<p style="${nestedPStyle}"><strong>From (Teaching Venue):</strong> ${claim.transportToTeachingReturnFrom || 'N/A'}</p>`;
                detailsHtml += `<p style="${nestedPStyle}"><strong>To (Destination):</strong> ${claim.transportToTeachingReturnTo || 'N/A'}</p>`;
            }
            detailsHtml += `<p style="${pStyle}"><strong>Total Distance (KM):</strong> ${claim.transportToTeachingDistanceKM !== null && claim.transportToTeachingDistanceKM !== undefined ? claim.transportToTeachingDistanceKM : '(Not calculated/provided)'}</p>`;
        }
    } else if (claim.claimType === 'TRANSPORTATION') {
        detailsHtml += `<p style="${pStyle}"><strong>Transport Type:</strong> ${claim.transportType || 'N/A'}</p>`;
        detailsHtml += `<p style="${pStyle}"><strong>From:</strong> ${claim.transportDestinationFrom || 'N/A'}</p>`;
        detailsHtml += `<p style="${pStyle}"><strong>To:</strong> ${claim.transportDestinationTo || 'N/A'}</p>`;
        if (claim.transportType === 'PRIVATE') {
            detailsHtml += `<p style="${pStyle}"><strong>Reg. Number:</strong> ${claim.transportRegNumber || 'N/A'}</p>`;
            detailsHtml += `<p style="${pStyle}"><strong>Cubic Capacity (cc):</strong> ${claim.transportCubicCapacity !== null && claim.transportCubicCapacity !== undefined ? claim.transportCubicCapacity : 'N/A'}</p>`;
        }
        detailsHtml += `<p style="${pStyle}"><strong>Amount Claimed:</strong> ${claim.transportAmount !== null && claim.transportAmount !== undefined ? `GHS ${Number(claim.transportAmount).toFixed(2)}` : 'N/A'}</p>`;
    } else if (claim.claimType === 'THESIS_PROJECT') {
        detailsHtml += `<p style="${pStyle}"><strong>Thesis/Project Type:</strong> ${claim.thesisType || 'N/A'}</p>`;
        if (claim.thesisType === 'SUPERVISION') {
            detailsHtml += `<p style="${pStyle}"><strong>Supervision Rank:</strong> ${claim.thesisSupervisionRank || 'N/A'}</p>`;
            if (claim.supervisedStudents && claim.supervisedStudents.length > 0) {
                let studentsHtml = claim.supervisedStudents.map(s => `<li style="margin-bottom: 0.3rem; font-size: 0.9em; overflow-wrap: break-word; word-break: break-word;"><strong>${s.studentName || 'N/A'}</strong> - <em>${s.thesisTitle || 'N/A'}</em></li>`).join('');
                detailsHtml += `<p style="${pStyle.replace("margin-bottom: 0.5rem;", "margin-bottom: 0.2rem;")}"><strong >Supervised Students:</strong></p><ul style="margin-top: 0.1rem; padding-left: 1.75rem; list-style-type: disc; overflow-wrap: break-word; word-break: break-word;">${studentsHtml}</ul>`;
            } else { detailsHtml += `<p style="${pStyle}"><strong>Supervised Students:</strong> (None listed)</p>`;}
        } else if (claim.thesisType === 'EXAMINATION') {
            detailsHtml += `<p style="${pStyle}"><strong>Exam Course Code:</strong> ${claim.thesisExamCourseCode || 'N/A'}</p>`;
            detailsHtml += `<p style="${pStyle}"><strong>Exam Date:</strong> ${claim.thesisExamDate ? new Date(claim.thesisExamDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</p>`;
        }
    }
    return detailsHtml;
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
        const printHtml = `<html><head><title>Claim Details Report - ${claim.id}</title><style>body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;padding:0;color:${textColor};background-color:#fff;font-size:12px;}.print-container{width:100%;max-width:800px;margin:15px auto;padding:20px;background-color:#fff;}.header{text-align:center;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid ${universityBlue};}.logo{max-width:100px;margin-bottom:8px;}.university-name{font-size:20px;font-weight:700;color:${universityBlue};margin-bottom:2px;}.college-name{font-size:14px;font-weight:500;color:${universityBlue};margin-bottom:5px;}.document-title{font-size:16px;font-weight:600;color:${universityRed};margin-top:8px;text-transform:uppercase;}.section{margin-bottom:15px;padding:12px;border:1px solid ${lightGrayBorder};border-radius:5px;background-color:#f8f9fa;}.section-title{font-size:14px;font-weight:600;color:${headingColor};margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid ${universityBlue}33;}.details-grid{display:grid;grid-template-columns:150px 1fr;gap:6px 10px;font-size:12px;}.details-grid strong{font-weight:600;color:${headingColor};}.details-grid span{word-break:break-word;overflow-wrap:break-word;}.status-badge{padding:2px 7px;border-radius:10px;font-weight:500;font-size:0.7em;color:white;text-transform:uppercase;display:inline-block;}.status-PENDING{background-color:#F59E0B;}.status-APPROVED{background-color:#10B981;}.status-REJECTED{background-color:${universityRed};}.claim-specifics-content p{margin:0 0 7px 0;font-size:12px;line-height:1.5;overflow-wrap:break-word;word-break:break-word;}.claim-specifics-content ul{margin:4px 0 7px 20px;padding:0;}.claim-specifics-content li{margin-bottom:3px;overflow-wrap:break-word;word-break:break-word;}.footer{text-align:center;margin-top:25px;font-size:10px;color:#555;border-top:1px solid ${lightGrayBorder};padding-top:10px;}.signature-section{margin-top:30px;padding-top:15px;border-top:1px dashed ${lightGrayBorder};}.signature-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:20px;}.signature-box{text-align:center;}.signature-line{border-bottom:1px solid ${textColor};width:70%;margin:30px auto 5px auto;}.signature-label{font-size:11px;color:${headingColor};}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:10pt;}.print-container{width:100%;margin:0 auto;padding:8mm;box-shadow:none;border:none;}.status-badge{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style></head><body><div class="print-container"><div class="header"><img src="/uew.png" alt="University Logo" class="logo" /><div class="university-name">UNIVERSITY OF EDUCATION, WINNEBA</div><div class="college-name">COLLEGE OF DISTANCE AND e-LEARNING (CODeL)</div><div class="document-title">Claim Details Report</div></div><div class="section"><div class="section-title">General Information</div><div class="details-grid"><strong>Claim ID:</strong> <span>${claim.id}</span><strong>Submitted By:</strong> <span>${submittedByName} (${submittedByEmail}) ${submitterDesignationText}</span><strong>Center:</strong> <span>${claim.centerName||claim.center?.name||'N/A'}</span><strong>Claim Type:</strong> <span style="text-transform:capitalize;">${claim.claimType.toLowerCase().replace('_', ' ')}</span><strong>Submitted At:</strong> <span>${submittedAtPrint}</span><strong>Status:</strong> <span><span class="status-badge status-${claim.status}">${claim.status}</span></span></div></div>${claim.processedAt?`<div class="section section-alt"><div class="section-title">Processing Information</div><div class="details-grid"><strong>Processed By:</strong> <span>${processedByName} (${processedByEmail}) ${processorDesignationText}</span><strong>Processed At:</strong> <span>${processedAtPrint}</span></div></div>`:''}<div class="section"><div class="section-title">Claim Specifics</div><div class="claim-specifics-content">${specificsHtml}</div></div><div class="signature-section"><div class="signature-grid"><div class="signature-box"><div class="signature-line"></div><div class="signature-label">Claimant's Signature</div></div><div class="signature-box"><div class="signature-line"></div><div class="signature-label">Authorizing Officer's Signature</div></div></div></div><div class="footer">Printed on: ${new Date().toLocaleString('en-US', dateTimeLocaleStringOptions)} by Registry.</div></div></body></html>`;
        printWindow.document.write(printHtml);printWindow.document.close();printWindow.focus();setTimeout(()=>{try{printWindow.print();}catch(e){console.error("Print error:",e); printWindow.close();toast.error("Printing failed.");}},600);
      } else {toast.error("Could not open print window. Please check pop-up blocker.");}
  };

  const resetFilters = () => { setFilterStatus(""); setFilterCenterId(""); setFilterLecturerName(""); };

  return (
    <div className="space-y-6 p-1">
      <Card className="bg-white dark:bg-slate-800/80 shadow-xl border-slate-200 dark:border-slate-700/80 rounded-lg">
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
            <Button onClick={fetchClaims} variant="outline" size="sm" disabled={isLoadingClaims} className={`border-blue-600 text-blue-700 hover:bg-blue-100 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-700/40 self-start sm:self-center ${focusRingClass} gap-1.5 h-9 px-3 text-xs sm:text-sm`}>
              <RotateCcw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isLoadingClaims ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 space-y-5">
          <Card className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="filterStatus-sys" className="text-xs font-medium text-slate-700 dark:text-slate-300">Status</Label>
                <Select value={filterStatus || "ALL_STATUSES"} onValueChange={(value) => setFilterStatus(value === "ALL_STATUSES" ? "" : value)}>
                  <SelectTrigger id="filterStatus-sys" className={`h-9 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600/80 ${focusRingClass}`}><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800"><SelectItem value="ALL_STATUSES">All Statuses</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="APPROVED">Approved</SelectItem><SelectItem value="REJECTED">Rejected</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="filterCenter-sys" className="text-xs font-medium text-slate-700 dark:text-slate-300">Center</Label>
                <Select value={filterCenterId || "ALL_CENTERS"} onValueChange={(value) => setFilterCenterId(value === "ALL_CENTERS" ? "" : value)}>
                  <SelectTrigger id="filterCenter-sys" className={`h-9 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600/80 ${focusRingClass}`}><SelectValue placeholder="All Centers" /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800"><SelectItem value="ALL_CENTERS">All Centers</SelectItem>{allCenters.map(center => (<SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="filterLecturer-sys" className="text-xs font-medium text-slate-700 dark:text-slate-300">Lecturer Name</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input type="search" id="filterLecturer-sys" placeholder="Search by name..." value={filterLecturerName} onChange={(e) => setFilterLecturerName(e.target.value)} className={`pl-8 h-9 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600/80 ${focusRingClass}`} />
                  </div>
              </div>
              <Button onClick={resetFilters} variant="ghost" className={`w-full sm:w-auto h-9 text-xs ${focusRingClass} gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600`}> <RotateCcw className="h-3.5 w-3.5" /> Reset</Button>
            </div>
          </Card>

          <div className="mt-6">
            {isLoadingClaims ? ( <div className="space-y-4 p-4">{[...Array(5)].map((_, i) => ( <Skeleton key={i} className="h-16 w-full rounded-lg bg-slate-200 dark:bg-slate-700" /> ))}</div>
            ) : claims && claims.length > 0 ? (
              <>
                <div className="hidden md:block border dark:border-slate-700/70 rounded-lg overflow-hidden shadow-md">
                  <ScrollArea className="h-auto max-h-[calc(100vh-500px)]"> 
                    <Table className="min-w-[800px]">
                      <TableHeader className="bg-slate-100 dark:bg-slate-700/80 sticky top-0 z-10 backdrop-blur-sm"><TableRow className="border-b-slate-200 dark:border-slate-600">
                          <TableHead className="w-[110px] text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Claim ID</TableHead><TableHead className="text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Center</TableHead><TableHead className="text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Lecturer</TableHead><TableHead className="text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Type</TableHead><TableHead className="text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Status</TableHead><TableHead className="text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Submitted</TableHead><TableHead className="text-right text-blue-800 dark:text-blue-300 text-[11px] uppercase font-semibold tracking-wider px-3 py-2.5 whitespace-nowrap">Actions</TableHead>
                      </TableRow></TableHeader>
                      <TableBody className="divide-y divide-slate-100 dark:divide-slate-700/70">
                        {claims.map((claim) => (
                          <TableRow key={claim.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                            <TableCell className="font-mono text-xs px-3 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{claim.id ? claim.id.substring(0, 8) + '...' : 'N/A'}</TableCell><TableCell className="text-xs px-3 py-3 whitespace-nowrap text-slate-700 dark:text-slate-200">{claim.centerName || claim.center?.name}</TableCell><TableCell className="text-xs px-3 py-3 whitespace-nowrap text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{claim.submittedBy?.name || 'N/A'}</TableCell><TableCell className="px-3 py-3 whitespace-nowrap"><Badge variant="secondary" className="capitalize text-[10px] bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500">{claim.claimType?.toLowerCase().replace('_', ' ') || 'N/A'}</Badge></TableCell><TableCell className="px-3 py-3 whitespace-nowrap"><Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${getStatusBadgeClasses(claim.status)}`}>{claim.status.toLowerCase()}</Badge></TableCell><TableCell className="text-xs px-3 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</TableCell><TableCell className="text-right px-3 py-3 whitespace-nowrap">
                              <Button variant="ghost" size="sm" onClick={() => handleOpenDetailDialog(claim)} className={`h-8 px-2 text-xs text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-700/30 ${focusRingClass} gap-1`}> <Eye className="h-3.5 w-3.5" /> Details </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
                <div className="block md:hidden space-y-3">
                  {claims.map((claim) => (
                    <Card key={claim.id} className="bg-white dark:bg-slate-800/70 shadow-lg border border-slate-200 dark:border-slate-700/70 rounded-lg">
                      <CardHeader className="p-3"><div className="flex justify-between items-start gap-2"><div><CardTitle className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-violet-700 dark:text-violet-500"/> {claim.submittedBy?.name || 'N/A'}</CardTitle><CardDescription className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5"><Building className="w-3 h-3"/> {claim.centerName || claim.center?.name}</CardDescription></div><Badge variant="outline" className={`text-[10px] whitespace-nowrap px-1.5 py-0.5 rounded-full font-medium capitalize ${getStatusBadgeClasses(claim.status)}`}>{claim.status.toLowerCase()}</Badge></div></CardHeader>
                      <CardContent className="p-3 text-xs space-y-1 border-t border-slate-100 dark:border-slate-700"><p><strong>ID:</strong> <span className="font-mono text-slate-600 dark:text-slate-400">{claim.id ? claim.id.substring(0, 10) + '...' : 'N/A'}</span></p><p><strong>Type:</strong> <span className="capitalize text-slate-700 dark:text-slate-300">{claim.claimType?.toLowerCase().replace('_', ' ') || 'N/A'}</span></p><p><strong>Submitted:</strong> <span className="text-slate-700 dark:text-slate-300">{claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</span></p></CardContent>
                      <CardFooter className="p-3 border-t border-slate-100 dark:border-slate-700"><Button variant="outline" size="sm" onClick={() => handleOpenDetailDialog(claim)} className={`w-full h-8 text-xs border-blue-600 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-700/30 ${focusRingClass} gap-1.5`}><Eye className="h-3.5 w-3.5" /> View Details / Process</Button></CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            ) : ( <div className="text-center py-16 sm:py-20 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30"><ListFilter className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-400 dark:text-slate-500 opacity-80" /><h3 className="mt-4 text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200">No Claims Found</h3><p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Adjust filters or wait for new submissions.</p><Button onClick={resetFilters} variant="ghost" className={`mt-6 h-9 px-4 text-xs sm:text-sm ${focusRingClass} gap-1.5 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700/30`}><RotateCcw className="h-4 w-4" /> Reset Filters</Button></div>)}
          </div>
        </CardContent>
      </Card>

      {selectedClaim && (
        <>
            <Dialog open={isDetailDialogOpen} onOpenChange={(open) => { if(!open) { setSelectedClaim(null); } setIsDetailDialogOpen(open);}}>
                <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 dark:border-slate-700/80 shadow-2xl rounded-xl">
                    <DialogHeader className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                      <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl text-blue-800 dark:text-blue-300"><span className="p-2 rounded-lg inline-flex items-center justify-center bg-violet-100 dark:bg-violet-800/40"><FileText className="h-5 w-5 text-violet-700 dark:text-violet-400" /></span>Claim Details</DialogTitle>
                      <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reviewing <span className="font-semibold capitalize text-slate-700 dark:text-slate-200">{selectedClaim.claimType?.toLowerCase().replace('_', ' ') || 'N/A'}</span> claim.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
                        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between items-stretch gap-2">
                            <div className="flex gap-2.5 w-full sm:w-auto justify-center sm:justify-start flex-wrap">
                                <Button variant="outline" onClick={handlePrintClaim} disabled={!!processingStates[selectedClaim.id]} className={`gap-2 w-full xs:w-auto h-9 text-xs ${focusRingClass} border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700`}><Printer className="h-4 w-4" /> Print</Button>
                                <Button variant="outline" onClick={handleOpenDeleteConfirmDialog} disabled={!!processingStates[selectedClaim.id]} className={`gap-2 w-full xs:w-auto h-9 text-xs border-red-500 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-800/30 focus-visible:ring-red-500 ${focusRingClass}`}><Trash2 className="h-4 w-4" /> Delete</Button>
                            </div>
                            <div className="flex gap-2.5 w-full sm:w-auto justify-center sm:justify-end flex-wrap">
                                {selectedClaim.status === 'PENDING' ? (
                                <>
                                    <Button variant="default" onClick={() => handleProcessClaim(selectedClaim.id, 'REJECTED')} disabled={!!processingStates[selectedClaim.id]} className={`gap-1.5 flex-1 xs:flex-auto h-9 text-xs bg-red-700 text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 focus-visible:ring-red-500 ${focusRingClass}`}>
                                    {processingStates[selectedClaim.id] === 'rejecting' ? <Loader2 className="h-4 w-4 animate-spin"/> : <XCircle className="h-4 w-4" />}
                                    {processingStates[selectedClaim.id] === 'rejecting' ? "Rejecting..." : "Reject"}
                                    </Button>
                                    <Button variant="default" onClick={() => handleProcessClaim(selectedClaim.id, 'APPROVED')} disabled={!!processingStates[selectedClaim.id]} className={`gap-1.5 flex-1 xs:flex-auto h-9 text-xs bg-violet-700 text-white hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 focus-visible:ring-violet-500 ${focusRingClass}`}>
                                    {processingStates[selectedClaim.id] === 'approving' ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4" />}
                                    {processingStates[selectedClaim.id] === 'approving' ? "Approving..." : "Approve"}
                                    </Button>
                                </>
                                ) : ( <DialogClose asChild><Button variant="outline" className={`w-full sm:w-auto h-9 text-xs ${focusRingClass} border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700`}>Close</Button></DialogClose> )}
                            </div>
                        </div>
                    </div>
                    
                    <ScrollArea className="flex-1 min-h-0 py-2 px-1 sm:py-4 sm:px-0">
                        <div 
                            className="prose prose-sm dark:prose-invert max-w-none px-4 sm:px-6 pb-4 
                                       prose-p:mb-2 prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-200
                                       prose-strong:text-slate-900 dark:prose-strong:text-slate-50 
                                       prose-h4:text-blue-700 dark:prose-h4:text-blue-400 prose-h4:mb-2 prose-h4:mt-4 prose-h4:pb-1 prose-h4:border-b prose-h4:border-slate-300 dark:prose-h4:border-slate-700
                                       prose-h5:text-sky-700 dark:prose-h5:text-sky-400 prose-h5:mb-1.5 prose-h5:mt-3 prose-h5:font-semibold
                                       prose-hr:my-4 prose-hr:border-slate-300 dark:prose-hr:border-slate-600
                                       prose-ul:pl-5 prose-li:mb-1 prose-li:text-slate-600 dark:prose-li:text-slate-300"
                            style={{ overflowWrap: 'break-word' }} 
                            dangerouslySetInnerHTML={{ __html: formatClaimDetailsForDialog(selectedClaim) }}
                        />
                    </ScrollArea>
                </DialogContent>
            </Dialog>
            <AlertDialog open={isDeleteConfirmOpen} onOpenChange={(open) => { setIsDeleteConfirmOpen(open); if(!open && !(processingStates[selectedClaim?.id] === 'deleting')) setSelectedClaim(null);}}>
                <AlertDialogContent className="bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700"><AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2 text-red-800 dark:text-red-300 text-lg sm:text-xl"><AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-500"/>Confirm Deletion</AlertDialogTitle><AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-sm py-2">Are you sure you want to delete claim ID: <br/><span className="font-semibold text-slate-700 dark:text-slate-200 font-mono my-1 block">{selectedClaim?.id}</span> <br/>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="mt-2 gap-2 sm:gap-2.5"><AlertDialogCancel className={`h-9 text-xs sm:h-10 sm:text-sm ${focusRingClass}`} disabled={processingStates[selectedClaim?.id] === 'deleting'} onClick={() => { if (!(processingStates[selectedClaim?.id] === 'deleting')) { setProcessingStates(prev => ({ ...prev, [selectedClaim.id]: null })); setSelectedClaim(null); }}}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete} disabled={processingStates[selectedClaim?.id] === 'deleting'} className={`h-9 text-xs sm:h-10 sm:text-sm bg-red-700 text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 focus-visible:ring-red-500 ${focusRingClass}`}>{processingStates[selectedClaim?.id] === 'deleting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{processingStates[selectedClaim?.id] === 'deleting' ? 'Deleting...' : 'Confirm Delete'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </>
      )}
    </div>
  );
}