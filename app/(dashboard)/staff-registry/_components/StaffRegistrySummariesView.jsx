// app/(dashboard)/staff-registry/summaries/_components/StaffRegistrySummariesView.jsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getLecturerMonthlyClaimSummary, getMonthlyClaimsSummaryByGrouping } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { CalendarSearch, Printer, UserSearch, Loader2, BarChartHorizontalBig, AlertTriangle, FileOutput, Hourglass, CheckSquare, XSquare, Building2, CalendarDays, User, FileText, BarChart3, FileSymlink, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from '@/components/ui/scroll-area'; 
import { Badge } from "@/components/ui/badge";

const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";
const violetButtonClasses = `text-white font-medium rounded-md bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 focus-visible:ring-violet-500 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg disabled:opacity-70 ${focusRingClass}`;

const dateLocaleStringOptions = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
const dateTimeLocaleStringOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' };

const CLAIM_TYPES_FILTER = [
    { value: "ALL", label: "All Claim Types" },
    { value: "TEACHING", label: "Teaching" },
    { value: "TRANSPORTATION", label: "Transportation" },
    { value: "THESIS_PROJECT", label: "Thesis/Project" },
];

const getStatusBadgeClasses = (status) => { 
  switch (status) {
    case 'PENDING': return 'border-blue-500 text-blue-700 bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:bg-blue-900/40';
    case 'APPROVED': return 'border-violet-500 text-violet-700 bg-violet-100 dark:border-violet-600 dark:text-violet-300 dark:bg-violet-900/40';
    case 'REJECTED': return 'border-red-600 text-red-700 bg-red-100 dark:border-red-600 dark:text-red-300 dark:bg-red-900/40';
    default: return 'border-slate-400 text-slate-600 bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:bg-slate-700/30';
  }
};

export default function StaffRegistrySummariesView({ staffRegistryUserId, assignedCenters = [], lecturersInAssignedCenters = [] }) {
  const [summaryType, setSummaryType] = useState("grouped_monthly"); 
  
  const [groupedYear, setGroupedYear] = useState(new Date().getFullYear());
  const [groupedMonth, setGroupedMonth] = useState(new Date().getMonth() + 1);
  const [groupedSelectedCenterId, setGroupedSelectedCenterId] = useState(""); 

  const [lecturerSelectedLecturerId, setLecturerSelectedLecturerId] = useState('');
  const [lecturerSelectedClaimType, setLecturerSelectedClaimType] = useState("ALL");
  const [lecturerYear, setLecturerYear] = useState(new Date().getFullYear());
  const [lecturerMonth, setLecturerMonth] = useState(new Date().getMonth() + 1);
  
  const [summaryData, setSummaryData] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (summaryType === "grouped_monthly") {
        setLecturerSelectedLecturerId(''); 
    } else {
        setGroupedSelectedCenterId(''); 
    }
    setSummaryData(null); 
    setFetchError(null);
  }, [summaryType]);

  useEffect(() => {
    if (lecturerSelectedLecturerId && !lecturersInAssignedCenters.find(l => l.id === lecturerSelectedLecturerId)) {
        setLecturerSelectedLecturerId('');
        setSummaryData(null);
    }
  }, [lecturersInAssignedCenters, lecturerSelectedLecturerId]);

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true); setFetchError(null); setSummaryData(null);
    let result;
    if (summaryType === "grouped_monthly") {
      if (!groupedYear || !groupedMonth) {
        toast.error("Please select year and month for grouped summary."); setIsLoadingSummary(false); return;
      }
      result = await getMonthlyClaimsSummaryByGrouping({
        requestingUserId: staffRegistryUserId, 
        year: parseInt(String(groupedYear)), month: parseInt(String(groupedMonth)),
        filterCenterId: groupedSelectedCenterId || undefined, 
      });
    } else if (summaryType === "lecturer_monthly") {
      if (!lecturerSelectedLecturerId || !lecturerYear || !lecturerMonth) {
        toast.error("Please select a lecturer, year, and month."); setIsLoadingSummary(false); return;
      }
      result = await getLecturerMonthlyClaimSummary({
        lecturerId: lecturerSelectedLecturerId,
        year: parseInt(String(lecturerYear)), month: parseInt(String(lecturerMonth)),
      });
    } else { toast.error("Invalid summary type."); setIsLoadingSummary(false); return; }

    if (result && result.success) {
      setSummaryData(result.summary);
      const noData = summaryType === "grouped_monthly" 
        ? (!result.summary || (Array.isArray(result.summary) && result.summary.length === 0) || Object.keys(result.summary).length === 0)
        : (!result.summary || result.summary.totalClaims === 0);
      if (noData) {
        toast.info("No data found for the selected criteria.", { duration: 4000});
      } else {
        if (summaryType === "lecturer_monthly" && lecturerSelectedClaimType !== "ALL" && result.summary.claims) {
            const filteredClaims = result.summary.claims.filter(claim => claim.claimType === lecturerSelectedClaimType);
            if (filteredClaims.length === 0) toast.info(`No claims of type '${lecturerSelectedClaimType.toLowerCase().replace("_"," ")}' found for this lecturer/period. Overall summary stats are shown.`, { duration: 5000 });
            else toast.success("Summary generated successfully.", { duration: 3000 });
        } else { toast.success("Summary generated successfully.", { duration: 3000 }); }
      }
    } else {
      setFetchError(result?.error || "Failed to fetch summary.");
      toast.error(result?.error || "Failed to fetch summary.");
    }
    setIsLoadingSummary(false);
  };
  
  const handlePrintSummary = () => {
    if (!summaryData) { toast.info("No summary data to print."); return; }
    let title = "Claim Summary Report";
    let printContentHtml = "";
    const uewDeepBlue = '#0D2C54'; const uewDeepRed = '#8C181F'; 
    const textColor = "#1A202C"; const headingColor = uewDeepBlue; const lightGrayBorder = "#CBD5E0";
    const baseStyles = `<style>body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;padding:0;color:${textColor};background-color:#fff;font-size:11px;}.print-container{width:100%;max-width:900px;margin:15px auto;padding:20px;}.header{text-align:center;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid ${uewDeepBlue};}.logo{max-width:90px;margin-bottom:8px;}.university-name{font-size:18px;font-weight:700;color:${uewDeepBlue};margin-bottom:2px;}.college-name{font-size:13px;font-weight:500;color:${uewDeepBlue};margin-bottom:5px;}.document-title{font-size:15px;font-weight:600;color:${uewDeepRed};margin-top:8px;text-transform:uppercase;}.section{margin-bottom:15px;padding:10px;border:1px solid ${lightGrayBorder};border-radius:5px;}.section-title{font-size:13px;font-weight:600;color:${headingColor};margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid ${uewDeepBlue}33;}.summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:12px;}.summary-item{padding:8px;border-radius:4px;text-align:center;border:1px solid ${lightGrayBorder};}.summary-item strong{display:block;font-size:16px;margin-bottom:2px;}.summary-item span{font-size:10px;color:#4A5568;}.footer{text-align:center;margin-top:30px;font-size:10px;color:#555;border-top:1px solid ${lightGrayBorder};padding-top:15px;}.claims-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:10px;table-layout:auto;}.claims-table th,.claims-table td{border:1px solid ${lightGrayBorder};padding:4px 6px;text-align:left;vertical-align:top;word-break:break-word;}.claims-table th{background-color:#eef2f7;font-weight:600;}.status-badge{padding:2px 6px;border-radius:10px;font-weight:500;font-size:0.65em;color:white;text-transform:uppercase;display:inline-block;}.status-PENDING{background-color:#FF8F00;}.status-APPROVED{background-color:#2E7D32;}.status-REJECTED{background-color:${uewDeepRed};}.signature-section{margin-top:40px;padding-top:20px;border-top:1px dashed ${lightGrayBorder};page-break-inside:avoid;}.signature-area{display:flex;justify-content:space-around;margin-top:25px;}.signature-block{text-align:center;width:30%;}.signature-line{border-bottom:1px solid #333;height:40px;margin-bottom:5px;}.signature-label{font-size:10px;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:9pt;}.print-container{width:100%;margin:0 auto;padding:10mm;box-shadow:none;border:none;}.status-badge,.summary-item{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>`;
    const printHeader = `<div class="header"><img src="/uew.png" alt="University Logo" class="logo" /><div class="university-name">UNIVERSITY OF EDUCATION, WINNEBA</div><div class="college-name">COLLEGE OF DISTANCE AND e-LEARNING (CODeL)</div>`;
    const printFooter = `<div class="signature-section"><div class="signature-area"><div class="signature-block"><div class="signature-line"></div><p class="signature-label">Prepared by</p></div><div class="signature-block"><div class="signature-line"></div><p class="signature-label">Authorized by</p></div><div class="signature-block"><div class="signature-line"></div><p class="signature-label">Approved by</p></div></div></div><div class="footer">Generated on: ${new Date().toLocaleString('en-US', dateTimeLocaleStringOptions)} by System.</div></div>`;

    const tempPrintWindow = window.open('', '_blank', 'height=800,width=1000,scrollbars=yes,resizable=yes');
    if (!tempPrintWindow) { toast.error("Could not open print window. Please check your browser's pop-up settings."); return; }
    
    if (summaryType === "lecturer_monthly" && summaryData.claims) {
        title = `Lecturer Claim Summary - ${summaryData.lecturerName} - ${summaryData.month} ${summaryData.year}`;
        const claimsToPrintSource = summaryData.claims || [];
        const claimsToPrint = lecturerSelectedClaimType === "ALL" ? claimsToPrintSource : claimsToPrintSource.filter(claim => claim.claimType === lecturerSelectedClaimType);
        
        let teachingDetailsTableHtml = ''; 
        let teachingTransportTableHtml = ''; 
        let otherClaimsTableHtml = `<div class="section-title">Other Claim Types (${lecturerSelectedClaimType === 'ALL' ? 'Transportation & Thesis/Project' : lecturerSelectedClaimType.replace("_", " ")})</div><table class="claims-table"><thead><tr><th>ID</th><th>Type</th><th>Details</th><th>Status</th><th>Submitted</th><th>Center</th></tr></thead><tbody>`;
        let hasOtherClaims = false;

        const teachingClaims = claimsToPrint.filter(c => c.claimType === 'TEACHING');
        if (teachingClaims.length > 0) {
            teachingDetailsTableHtml = `<div class="section-title">Teaching Claim Details</div><table class="claims-table"><thead><tr><th>Course ID</th><th>Course Title</th><th>Hours Taught</th><th>Status</th><th>Date</th><th>Center</th></tr></thead><tbody>`;
            teachingClaims.forEach(claim => { 
                teachingDetailsTableHtml += `<tr><td>${claim.courseCode || 'N/A'}</td><td>${claim.courseTitle || 'N/A'}</td><td>${claim.teachingHours ?? 'N/A'}</td><td><span class="status-badge status-${claim.status || 'UNKNOWN'}">${claim.status || 'N/A'}</span></td><td>${claim.teachingDate ? new Date(claim.teachingDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</td><td>${claim.centerName || 'N/A'}</td></tr>`; 
            });
            teachingDetailsTableHtml += '</tbody></table>';

            const teachingClaimsWithTransport = teachingClaims.filter(c => 
                [c.transportToTeachingInDate, c.transportToTeachingFrom, c.transportToTeachingTo, c.transportToTeachingOutDate, c.transportToTeachingReturnFrom, c.transportToTeachingReturnTo, c.transportToTeachingDistanceKM].some(Boolean)
            );
            if (teachingClaimsWithTransport.length > 0) {
                teachingTransportTableHtml = `<br/><div class="section-title">Optional Transportation for Teaching Sessions</div><table class="claims-table"><thead><tr><th>Course</th><th>In-Date</th><th>From</th><th>To</th><th>Out-Date</th><th>Return From</th><th>Return To</th><th>Distance (KM)</th></tr></thead><tbody>`;
                teachingClaimsWithTransport.forEach(claim => { 
                    teachingTransportTableHtml += `<tr><td>${claim.courseCode || 'N/A'}</td><td>${claim.transportToTeachingInDate ? new Date(claim.transportToTeachingInDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</td><td>${claim.transportToTeachingFrom || 'N/A'}</td><td>${claim.transportToTeachingTo || 'N/A'}</td><td>${claim.transportToTeachingOutDate ? new Date(claim.transportToTeachingOutDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</td><td>${claim.transportToTeachingReturnFrom || 'N/A'}</td><td>${claim.transportToTeachingReturnTo || 'N/A'}</td><td>${claim.transportToTeachingDistanceKM ?? 'N/A'}</td></tr>`; 
                });
                teachingTransportTableHtml += '</tbody></table>';
            }
        }
        
        claimsToPrint.filter(c => c.claimType !== 'TEACHING').forEach(claim => {
            hasOtherClaims = true; 
            let detailsCellContent = 'N/A';
            if (claim.claimType === 'TRANSPORTATION') { 
                detailsCellContent = `Type: ${claim.transportType || 'N/A'}<br/>From: ${claim.transportDestinationFrom || 'N/A'}<br/>To: ${claim.transportDestinationTo || 'N/A'}<br/>Amount: ${claim.transportAmount!=null ? `GHS ${Number(claim.transportAmount).toFixed(2)}`:'N/A'}`;
                if(claim.transportType === 'PRIVATE') {
                     detailsCellContent += `<br/>Reg No: ${claim.transportRegNumber || 'N/A'}<br/>CC: ${claim.transportCubicCapacity ?? 'N/A'}`;
                }
            } else if (claim.claimType === 'THESIS_PROJECT') { 
                detailsCellContent = `Type: ${claim.thesisType || 'N/A'}<br/>`; 
                if(claim.thesisType === 'SUPERVISION'){
                    detailsCellContent += `Rank: ${claim.thesisSupervisionRank||'N/A'}`;
                    if (claim.supervisedStudents && claim.supervisedStudents.length > 0) {
                        detailsCellContent += `<br/>Students:<ul>${claim.supervisedStudents.map(s => `<li>${s.studentName}: ${s.thesisTitle}</li>`).join('')}</ul>`;
                    }
                } else if (claim.thesisType === 'EXAMINATION'){
                    detailsCellContent += `Course: ${claim.thesisExamCourseCode||'N/A'}<br/>Date: ${claim.thesisExamDate ? new Date(claim.thesisExamDate).toLocaleDateString('en-US',dateLocaleStringOptions) : 'N/A'}`;
                }
            }
            otherClaimsTableHtml += `<tr><td>${claim.id.substring(0,8)}...</td><td style="text-transform:capitalize;">${claim.claimType?.toLowerCase().replace("_", " ") || 'N/A'}</td><td>${detailsCellContent}</td><td><span class="status-badge status-${claim.status}">${claim.status}</span></td><td>${new Date(claim.submittedAt).toLocaleDateString('en-US',dateLocaleStringOptions)}</td><td>${claim.centerName||'N/A'}</td></tr>`;
        });

        if (!hasOtherClaims && (lecturerSelectedClaimType === "ALL" || lecturerSelectedClaimType === "TRANSPORTATION" || lecturerSelectedClaimType === "THESIS_PROJECT")) {
             otherClaimsTableHtml += '<tr><td colspan="6" style="text-align:center;">No claims of this specific type for the period.</td></tr>';
        }
        otherClaimsTableHtml += '</tbody></table>';
        
        if (!hasOtherClaims && lecturerSelectedClaimType !== "ALL" && lecturerSelectedClaimType !== "TEACHING") { 
            otherClaimsTableHtml = `<div class="section-title">${lecturerSelectedClaimType.toLowerCase().replace("_"," ")} Claims</div><p>No ${lecturerSelectedClaimType.toLowerCase().replace("_"," ")} claims found for this period.</p>`;
        } else if (!hasOtherClaims && !(teachingClaims.length > 0 && lecturerSelectedClaimType === "TEACHING")) { // If no other claims and either ALL was selected (but no teaching) or a non-teaching type with no claims
            otherClaimsTableHtml = (lecturerSelectedClaimType === "ALL" && teachingClaims.length > 0) ? '' : `<div class="section-title">Other Claim Types</div><p>No other claim types (Transportation, Thesis/Project) found for this period.</p>`;
        } else if (!hasOtherClaims && teachingClaims.length === 0 && lecturerSelectedClaimType === "TEACHING") { // Specifically if teaching was filtered and no teaching claims
             otherClaimsTableHtml = ''; // No "other" section needed if specifically filtering for teaching and no teaching claims.
        }


        printContentHtml = `${printHeader}<div class="document-title">Lecturer Monthly Claim Summary</div></div>
            <div class="section"><div class="section-title">Summary For</div><p><strong>Lecturer:</strong> ${summaryData.lecturerName} (${summaryData.lecturerEmail || 'N/A'}) ${summaryData.lecturerDesignation ? '- ' + summaryData.lecturerDesignation.replace(/_/g, " ") : ''}</p><p><strong>Period:</strong> ${summaryData.month}, ${summaryData.year}</p>${lecturerSelectedClaimType !== "ALL" ? `<p><strong>Filtered by Claim Type:</strong> <span style="text-transform:capitalize;">${lecturerSelectedClaimType.toLowerCase().replace("_"," ")}</span></p>` : ''}</div>
            <div class="section"><div class="section-title">Overall Statistics for Period</div><div class="summary-grid"><div class="summary-item total"><strong>${summaryData.totalClaims}</strong><span>Total Claims</span></div><div class="summary-item pending"><strong>${summaryData.pending}</strong><span>Pending</span></div><div class="summary-item approved"><strong>${summaryData.approved}</strong><span>Approved</span></div><div class="summary-item rejected"><strong>${summaryData.rejected}</strong><span>Rejected</span></div></div>
            ${summaryData.totalTeachingHours > 0 ? `<p><strong>Total Approved Teaching Hours:</strong> ${summaryData.totalTeachingHours.toFixed(1)} hrs</p>` : ''}
            ${summaryData.totalTransportAmount > 0 ? `<p><strong>Total Approved Transport Amount:</strong> GHS ${summaryData.totalTransportAmount.toFixed(2)}</p>` : ''}</div>
            ${teachingDetailsTableHtml ? `<div class="section">${teachingDetailsTableHtml}</div>` : ''}
            ${teachingTransportTableHtml ? `<div class="section">${teachingTransportTableHtml}</div>` : ''}
            ${otherClaimsTableHtml ? `<div class="section">${otherClaimsTableHtml}</div>` : ''}
            ${printFooter}`;
    } else if (summaryType === "grouped_monthly" && Array.isArray(summaryData)) {
        const period = Array.isArray(summaryData) ? summaryData[0]?.period : summaryData?.period;
        const context = Array.isArray(summaryData) ? summaryData[0]?.filterContext : summaryData?.filterContext;
        title = `Grouped Monthly Claim Summary - ${period?.month || ''} ${period?.year || ''}`;
        printContentHtml = `${printHeader}<div class="document-title">Grouped Monthly Claim Summary</div></div><div class="section"><div class="section-title">Summary For</div><p><strong>Period:</strong> ${period?.month || 'N/A'}, ${period?.year || 'N/A'}</p><p><strong>Scope:</strong> ${context || 'All Assigned Centers'}</p></div>`;
        if (summaryData.length > 0) {
            summaryData.forEach(centerData => {
                printContentHtml += `<div class="section"><div class="section-title">${centerData.centerName} (Total Approved Claims: ${centerData.totalClaims})</div>
                    <p><strong>Teaching Hours:</strong> ${centerData.totalTeachingHours?.toFixed(1) || 0} hrs</p>
                    <p><strong>Transport Amount:</strong> GHS ${centerData.totalTransportAmount?.toFixed(2) || '0.00'}</p>
                    <p><strong>Thesis Supervision Units:</strong> ${centerData.totalThesisSupervisionUnits || 0}</p>
                    <p><strong>Thesis Examination Units:</strong> ${centerData.totalThesisExaminationUnits || 0}</p></div>`;
            });
        } else {
            printContentHtml += `<div class="section"><p>No data available for the selected criteria.</p></div>`;
        }
        printContentHtml += printFooter;
    } else { toast.error("Cannot print this summary type or data is invalid."); tempPrintWindow.close(); return; }

    tempPrintWindow.document.write(`<html><head><title>${title}</title>${baseStyles}</head><body><div class="print-container">${printContentHtml}</div></body></html>`);
    tempPrintWindow.document.close(); tempPrintWindow.focus();
    setTimeout(() => { 
      try { 
        if (tempPrintWindow && !tempPrintWindow.closed) { tempPrintWindow.print(); } 
        else { console.warn("Print window was closed before print command could be issued.");}
      } catch(e) { console.error("Print failed:", e); toast.error("Printing failed."); if (tempPrintWindow && !tempPrintWindow.closed) tempPrintWindow.close(); } 
    }, 700);
  };
  
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('en-US', { month: 'long' }) }));
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const inputClass = `bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 ${focusRingClass} h-9 text-sm rounded-md`;
  const selectTriggerClass = `${inputClass} data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500`;
  const selectContentClass = "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md shadow-lg";
  const labelClass = "text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5";

  const summaryStatItems = (summaryType === "lecturer_monthly" && summaryData) ? [
    { label: "Total Claims", value: summaryData.totalClaims, icon: FileOutput, color: "text-blue-700 dark:text-blue-400", borderColor: "border-t-blue-700 dark:border-t-blue-500" },
    { label: "Pending", value: summaryData.pending, icon: Hourglass, color: "text-orange-600 dark:text-orange-400", borderColor: "border-t-orange-500 dark:border-t-orange-400" },
    { label: "Approved", value: summaryData.approved, icon: CheckSquare, color: "text-violet-700 dark:text-violet-400", borderColor: "border-t-violet-700 dark:border-t-violet-500" },
    { label: "Rejected", value: summaryData.rejected, icon: XSquare, color: "text-red-700 dark:text-red-400", borderColor: "border-t-red-700 dark:border-t-red-500" },
  ] : [];

  const displayedClaimsForLecturerSummary = useMemo(() => {
    if (summaryType !== "lecturer_monthly" || !summaryData || !summaryData.claims) return [];
    if (lecturerSelectedClaimType === "ALL") return summaryData.claims;
    return summaryData.claims.filter(claim => claim.claimType === lecturerSelectedClaimType);
  }, [summaryData, summaryType, lecturerSelectedClaimType]);

  const renderGroupedSummary = () => {
    if (!summaryData || !Array.isArray(summaryData) || summaryData.length === 0) return <p className="text-slate-500 dark:text-slate-400 p-4 text-center">No grouped summary data for the selected criteria.</p>;
    const period = Array.isArray(summaryData) ? summaryData[0]?.period : summaryData?.period;
    const context = Array.isArray(summaryData) ? summaryData[0]?.filterContext : summaryData?.filterContext;
    return (
        <div id="groupedSummaryContentOnScreen" className="space-y-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md shadow">
              <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300">Grouped Claim Summary</h3>
              {period && <p className="text-sm text-slate-600 dark:text-slate-300">Period: {period.month}, {period.year}</p>}
              {context && <p className="text-sm text-slate-500 dark:text-slate-400">Scope: {context}</p>}
            </div>
            <ScrollArea className="max-h-[30rem] border dark:border-slate-700 rounded-md p-1">
                <div className="p-3 space-y-3">
                {summaryData.map((centerData, index) => (
                    <Card key={centerData.centerId || index} className="bg-white dark:bg-slate-800/60 shadow-sm">
                        <CardHeader className="pb-2 pt-3 px-4 border-b dark:border-slate-700"><CardTitle className="text-base font-semibold text-violet-700 dark:text-violet-300">{centerData.centerName}</CardTitle><CardDescription className="text-xs text-slate-500 dark:text-slate-400">Total Approved Claims: {centerData.totalClaims}</CardDescription></CardHeader>
                        <CardContent className="px-4 py-3 text-xs space-y-1.5 text-slate-700 dark:text-slate-200">
                            <p><strong>Teaching Hours:</strong> {centerData.totalTeachingHours?.toFixed(1) || 0} hrs</p>
                            <p><strong>Transport Amount:</strong> GHS {centerData.totalTransportAmount?.toFixed(2) || '0.00'}</p>
                            <p><strong>Thesis Supervision Units:</strong> {centerData.totalThesisSupervisionUnits || 0}</p>
                            <p><strong>Thesis Examination Units:</strong> {centerData.totalThesisExaminationUnits || 0}</p>
                        </CardContent>
                    </Card>
                ))}
                </div>
            </ScrollArea>
        </div>
    );
  };

  const renderLecturerSummary = () => {
    if (!summaryData || summaryData.totalClaims === undefined) return <p className="text-slate-500 dark:text-slate-400 p-4 text-center">No lecturer summary data for the selected criteria.</p>;
    return (
        <div id="lecturerSummaryContentOnScreen" className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            {summaryStatItems.map(stat => (
              <Card key={stat.label} className={`bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg shadow-md border-t-4 ${stat.borderColor} hover:shadow-lg transition-shadow`}>
                <stat.icon className={`h-7 w-7 mx-auto mb-1.5 ${stat.color} opacity-90`} />
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{stat.label}</p>
              </Card>
            ))}
          </div>
          {(summaryData.totalTeachingHours > 0 || summaryData.totalTransportAmount > 0) && (
              <div className="p-3 bg-slate-100 dark:bg-slate-700/70 rounded-md space-y-1 text-slate-700 dark:text-slate-200 text-sm border border-slate-200 dark:border-slate-600">
                  {summaryData.totalTeachingHours > 0 && <p><strong>Total Approved Teaching Hours (Period):</strong> <span className="font-semibold text-blue-700 dark:text-blue-300">{summaryData.totalTeachingHours.toFixed(1)} hrs</span></p>}
                  {summaryData.totalTransportAmount > 0 && <p><strong>Total Approved Transport Amount (Period):</strong> <span className="font-semibold text-blue-700 dark:text-blue-300">GHS {summaryData.totalTransportAmount.toFixed(2)}</span></p>}
              </div>
          )}
          {displayedClaimsForLecturerSummary.length > 0 ? (
            <div className="mt-4 space-y-3">
                <h4 className="font-medium text-md text-violet-700 dark:text-violet-400 border-b dark:border-slate-700 pb-1.5">
                    Claims in Period {lecturerSelectedClaimType !== "ALL" ? `(Type: ${lecturerSelectedClaimType.toLowerCase().replace("_"," ")})` : ''}:
                </h4>
                <ScrollArea className="max-h-80 border dark:border-slate-700 rounded-md p-3 bg-slate-50/50 dark:bg-slate-800/40">
                   <ul className="list-none pl-0 space-y-2.5">
                    {displayedClaimsForLecturerSummary.map(claim => (
                        <li key={claim.id} className="text-xs p-2.5 border-b dark:border-slate-700/60 last:border-b-0 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded">
                            <div className="flex justify-between items-center"><span className="font-mono text-slate-500 dark:text-slate-400">{claim.id.substring(0,8)}...</span><Badge variant="outline" className={`text-[9px] ${getStatusBadgeClasses(claim.status)}`}>{claim.status}</Badge></div>
                            <span className="capitalize font-medium text-slate-700 dark:text-slate-200 block mt-0.5"> {claim.claimType.toLowerCase().replace("_", " ")}</span>
                            <span className="block text-slate-500 dark:text-slate-400 text-[11px]">Submitted: {new Date(claim.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions)} {claim.claimType === 'TEACHING' ? ` | Course: ${claim.courseCode || 'N/A'}` : ''}{claim.claimType === 'TRANSPORTATION' ? ` | Amount: GHS ${claim.transportAmount?.toFixed(2) || 'N/A'}` : ''}</span>
                        </li>
                    ))}
                   </ul>
                </ScrollArea>
            </div>
          ) : (<p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6 italic">No claims of the selected type found for this lecturer in this period.</p>)}
        </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="bg-white dark:bg-slate-800/80 shadow-xl border-slate-200 dark:border-slate-700/80 rounded-lg">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-4 sm:p-5">
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 text-blue-800 dark:text-blue-300"><BarChartHorizontalBig className="h-6 w-6 sm:h-7 sm:w-7 text-violet-700 dark:text-violet-500" /> Claim Summaries</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Generate and view claim summaries for your assigned centers or specific lecturers within them.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5 sm:pt-6 p-4 sm:p-5 space-y-6">
          <Card className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 p-4 rounded-lg shadow">
            {/* --- FILTERS UI --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-4">
                <div className="space-y-1.5">
                    <Label htmlFor="summaryType-staff" className={`${labelClass} mb-1`}><BarChart3 className="h-4 w-4"/>Select Summary Type <span className="text-red-600">*</span></Label>
                    <Select value={summaryType} onValueChange={(value) => { setSummaryType(value); setSummaryData(null); setFetchError(null); }}>
                      <SelectTrigger id="summaryType-staff" className={selectTriggerClass}><SelectValue placeholder="Select summary type" /></SelectTrigger>
                      <SelectContent className={selectContentClass}><SelectItem value="grouped_monthly">Grouped Monthly Summary (by Center)</SelectItem><SelectItem value="lecturer_monthly">Individual Lecturer Monthly Summary</SelectItem></SelectContent>
                    </Select>
                </div>
                <div></div>
            </div>

            {summaryType === "grouped_monthly" && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <Label htmlFor="groupedMonth-staff" className={labelClass}><CalendarDays className="h-3.5 w-3.5"/>Month <span className="text-red-600">*</span></Label>
                  <Select value={String(groupedMonth)} onValueChange={(val) => setGroupedMonth(Number(val))}>
                    <SelectTrigger id="groupedMonth-staff" className={selectTriggerClass}><SelectValue placeholder="Month"/></SelectTrigger>
                    <SelectContent className={`${selectContentClass} max-h-60`}>{months.map(m => (<SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="groupedYear-staff" className={labelClass}><CalendarDays className="h-3.5 w-3.5"/>Year <span className="text-red-600">*</span></Label>
                  <Select value={String(groupedYear)} onValueChange={(val) => setGroupedYear(Number(val))}>
                    <SelectTrigger id="groupedYear-staff" className={selectTriggerClass}><SelectValue placeholder="Year"/></SelectTrigger>
                    <SelectContent className={`${selectContentClass} max-h-60`}>{yearOptions.map(y => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="groupedSelectedCenterId-staff" className={labelClass}><Building2 className="h-3.5 w-3.5"/>Filter by Your Assigned Center</Label>
                  <Select value={groupedSelectedCenterId} onValueChange={setGroupedSelectedCenterId} disabled={!assignedCenters || assignedCenters.length === 0}>
                    <SelectTrigger id="groupedSelectedCenterId-staff" className={selectTriggerClass}>
                      <SelectValue placeholder="All Your Assigned Centers" />
                    </SelectTrigger>
                    <SelectContent className={`${selectContentClass} max-h-60`}>
                      {(assignedCenters || []).map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {summaryType === "lecturer_monthly" && (
               <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5 md:col-span-1">
                      <Label htmlFor="lecturerSelect-staff" className={labelClass}><UserSearch className="h-3.5 w-3.5"/>Lecturer (in your Centers) <span className="text-red-600">*</span></Label>
                      <Select value={lecturerSelectedLecturerId} onValueChange={setLecturerSelectedLecturerId} disabled={!lecturersInAssignedCenters || lecturersInAssignedCenters.length === 0}>
                          <SelectTrigger id="lecturerSelect-staff" className={selectTriggerClass}><SelectValue placeholder="Select a lecturer" /></SelectTrigger>
                          <SelectContent className={`${selectContentClass} max-h-60`}>
                              {lecturersInAssignedCenters && lecturersInAssignedCenters.length > 0 ? 
                                  lecturersInAssignedCenters.map(l => (<SelectItem key={l.id} value={l.id}>{l.name} ({l.email})</SelectItem>)) :
                                  <div className="p-2 text-xs text-slate-500 dark:text-slate-400">No lecturers found in your assigned centers.</div>
                              }
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-1.5">
                        <Label htmlFor="lecturerClaimType-staff" className={labelClass}><FileSymlink className="h-3.5 w-3.5"/>Claim Type</Label>
                        <Select value={lecturerSelectedClaimType} onValueChange={setLecturerSelectedClaimType}>
                            <SelectTrigger id="lecturerClaimType-staff" className={selectTriggerClass}><SelectValue placeholder="All Claim Types" /></SelectTrigger>
                            <SelectContent className={selectContentClass}>
                                {CLAIM_TYPES_FILTER.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                            </SelectContent>
                        </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-1.5">
                        <Label htmlFor="lecturerMonth-staff" className={labelClass}><CalendarDays className="h-3.5 w-3.5"/>Month <span className="text-red-600">*</span></Label>
                        <Select value={String(lecturerMonth)} onValueChange={(val) => setLecturerMonth(Number(val))}>
                            <SelectTrigger id="lecturerMonth-staff" className={selectTriggerClass}><SelectValue placeholder="Month"/></SelectTrigger>
                            <SelectContent className={`${selectContentClass} max-h-60`}>{months.map(m => (<SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="lecturerYear-staff" className={labelClass}><CalendarDays className="h-3.5 w-3.5"/>Year <span className="text-red-600">*</span></Label>
                        <Select value={String(lecturerYear)} onValueChange={(val) => setLecturerYear(Number(val))}>
                            <SelectTrigger id="lecturerYear-staff" className={selectTriggerClass}><SelectValue placeholder="Year"/></SelectTrigger>
                            <SelectContent className={`${selectContentClass} max-h-60`}>{yearOptions.map(y => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                  </div>
               </div>
            )}
            <div className="flex justify-end pt-4 mt-2">
              <Button onClick={handleGenerateSummary} disabled={isLoadingSummary || (summaryType === 'lecturer_monthly' && !lecturerSelectedLecturerId)} className={`gap-2 w-full md:w-auto px-6 py-2.5 h-auto text-sm ${violetButtonClasses}`}>{isLoadingSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarSearch className="h-4 w-4" />}{isLoadingSummary ? "Generating..." : "Generate Summary"}</Button>
            </div>
          </Card>

          {/* --- SKELETON LOADER --- */}
          {isLoadingSummary && ( <div className="space-y-4 p-4 sm:p-6 mt-4 bg-slate-100 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700"><Skeleton className="h-8 w-3/4 sm:w-1/2 bg-slate-200 dark:bg-slate-700 rounded" /><Skeleton className="h-6 w-1/2 sm:w-1/3 bg-slate-200 dark:bg-slate-700 rounded" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-md bg-slate-200 dark:bg-slate-700" />)}</div></div> )}
          
          {/* --- ERROR DISPLAY CARD --- */}
          {fetchError && !isLoadingSummary && ( <Card className="border-red-600 dark:border-red-700 bg-red-50 dark:bg-red-900/20 mt-4 shadow-md rounded-lg"><CardHeader className="flex flex-row items-center gap-2.5 pb-2 pt-4 px-4"><AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-400 flex-shrink-0" /> <CardTitle className="text-red-800 dark:text-red-300 text-md sm:text-lg">Error Fetching Summary</CardTitle></CardHeader><CardContent className="px-4 pb-4 pt-1"><p className="text-red-700 dark:text-red-300 text-sm">{fetchError}</p></CardContent></Card> )}
          
          {/* --- SUMMARY DATA DISPLAY CARD --- */}
          {summaryData && !isLoadingSummary && !fetchError && (
            <Card className="mt-6 bg-white dark:bg-slate-800/70 shadow-lg border-slate-200 dark:border-slate-700/70 rounded-lg">
                <CardHeader className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b dark:border-slate-700">
                  {summaryType === "lecturer_monthly" && summaryData.lecturerName ? (
                    <div>
                        <CardTitle className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-300">Summary for {summaryData.lecturerName}</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 text-sm mt-1">Period: {summaryData.month}, {summaryData.year} {lecturerSelectedClaimType !== "ALL" ? `(Filtered by Type: ${lecturerSelectedClaimType.toLowerCase().replace("_"," ")})` : ''}</CardDescription>
                        {summaryData.lecturerDesignation && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Designation: {summaryData.lecturerDesignation.replace(/_/g, " ")}</p>}
                    </div>
                  ) : summaryType === "grouped_monthly" && (Array.isArray(summaryData) ? summaryData[0]?.period : summaryData?.period) ? (
                    <div>
                        <CardTitle className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-300">Grouped Claims Summary</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 text-sm mt-1">Period: {Array.isArray(summaryData) ? summaryData[0]?.period?.month : summaryData?.period?.month}, {Array.isArray(summaryData) ? summaryData[0]?.period?.year : summaryData?.period?.year}</CardDescription>
                         <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Scope: {Array.isArray(summaryData) ? summaryData[0]?.filterContext : summaryData?.filterContext || 'Selected Scope'}</p>
                    </div>
                  ) :  <CardTitle className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-300">Generated Summary</CardTitle> }
                    <Button onClick={handlePrintSummary} variant="outline" className={`gap-2 mt-3 sm:mt-0 ${focusRingClass} border-blue-600 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-700/30 h-9 text-xs sm:h-10 sm:text-sm`}>
                        <Printer className="h-4 w-4" /> Print Summary
                    </Button>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-5 p-4 sm:p-5 space-y-4 sm:space-y-5">
                  {summaryType === "lecturer_monthly" && summaryData.totalClaims !== undefined && renderLecturerSummary()}
                  {summaryType === "grouped_monthly" && renderGroupedSummary()}
                </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}