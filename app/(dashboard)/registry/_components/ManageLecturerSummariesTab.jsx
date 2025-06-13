// app/(dashboard)/registry/_components/ManageLecturerSummariesTab.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getLecturerMonthlyClaimSummary } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { UserSearch, CalendarSearch, Printer, BarChartHorizontalBig, AlertTriangle, Hourglass, CheckSquare, XSquare, FileOutput, Loader2, CalendarDays, Users, Palette, BookOpenCheck, FileSymlink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from "@/components/ui/badge";

const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";
const violetButtonClasses = `text-white font-medium rounded-md bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 focus-visible:ring-violet-500 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg disabled:opacity-70 ${focusRingClass}`;

const dateLocaleStringOptions = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
const dateTimeLocaleStringOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' };

const CLAIM_TYPES = [
  { value: "ALL", label: "All Claim Types" },
  { value: "TEACHING", label: "Teaching" },
  { value: "TRANSPORTATION", label: "Transportation" },
  { value: "THESIS_PROJECT", label: "Thesis/Project" },
];

const getStatusBadgeClasses = (status) => {
  switch (status) {
    case 'PENDING': return 'border-blue-500 text-blue-700 bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:bg-blue-900/40 hover:bg-blue-100/80';
    case 'APPROVED': return 'border-violet-500 text-violet-700 bg-violet-100 dark:border-violet-600 dark:text-violet-300 dark:bg-violet-900/40 hover:bg-violet-100/80';
    case 'REJECTED': return 'border-red-600 text-red-700 bg-red-100 dark:border-red-600 dark:text-red-300 dark:bg-red-900/40 hover:bg-red-100/80';
    default: return 'border-slate-400 text-slate-600 bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:bg-slate-700/30 hover:bg-slate-100/80';
  }
};

export default function ManageLecturerSummariesTab({ allUsers = [] }) {
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [selectedClaimType, setSelectedClaimType] = useState("ALL");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [summaryData, setSummaryData] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const strictLecturers = (Array.isArray(allUsers) ? allUsers : [])
      .filter(user => user.role === 'LECTURER')
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    setLecturers(strictLecturers);
    if (selectedLecturerId && !strictLecturers.find(l => l.id === selectedLecturerId)) {
      setSelectedLecturerId('');
      setSummaryData(null);
    }
  }, [allUsers, selectedLecturerId]);

  const handleGenerateSummary = async () => {
    if (!selectedLecturerId || !selectedYear || !selectedMonth) {
      toast.error("Please select a lecturer, year, and month.");
      return;
    }
    setIsLoadingSummary(true);
    setFetchError(null);
    setSummaryData(null);
    try {
      const result = await getLecturerMonthlyClaimSummary({
        lecturerId: selectedLecturerId,
        year: parseInt(String(selectedYear)),
        month: parseInt(String(selectedMonth)),
      });
      if (result.success) {
        setSummaryData(result.summary);
        if (!result.summary || result.summary.totalClaims === 0) {
          toast.info("No claims found for the selected lecturer and period.", { duration: 4000});
        } else {
          if (selectedClaimType !== "ALL" && result.summary.claims) {
            const filteredClaims = result.summary.claims.filter(claim => claim.claimType === selectedClaimType);
            if (filteredClaims.length === 0) {
              toast.info(`No '${selectedClaimType.toLowerCase().replace("_"," ")}' claims found for this period. Showing overall summary statistics.`, { duration: 5000 });
            } else {
              toast.success("Summary generated successfully.", { duration: 3000 });
            }
          } else {
            toast.success("Summary generated successfully.", { duration: 3000 });
          }
        }
      } else {
        setFetchError(result?.error || "Failed to fetch summary.");
        toast.error(result?.error || "Failed to fetch summary.");
      }
    } catch (error) {
      console.error("Error calling getLecturerMonthlyClaimSummary:", error);
      setFetchError("An unexpected client-side error occurred.");
      toast.error("An unexpected client-side error occurred.");
    }
    setIsLoadingSummary(false);
  };

  const handlePrintSummary = () => {
    if (!summaryData) { toast.info("No summary data to print."); return; }
    const claimsToPrintSource = summaryData.claims || [];
    const claimsToPrint = selectedClaimType === "ALL"
        ? claimsToPrintSource
        : claimsToPrintSource.filter(claim => claim.claimType === selectedClaimType);

    if (claimsToPrint.length === 0 && selectedClaimType !== "ALL" && summaryData.totalClaims > 0) {
        toast.info(`No claims of type '${selectedClaimType.toLowerCase().replace("_"," ")}' to print. The printout will show overall summary statistics.`, {duration: 6000});
    }

    const printWindow = window.open('', '_blank', 'height=800,width=1000,scrollbars=yes,resizable=yes');
    if (printWindow) {
        const uewDeepBlue = '#0D2C54'; const uewDeepRed = '#8C181F';
        const textColor = "#1A202C"; const headingColor = uewDeepBlue; const lightGrayBorder = "#CBD5E0";

        let teachingDetailsTableHtml = ''; let teachingTransportTableHtml = '';
        let otherClaimsHtml = `<div class="section-title">Other Claim Types (${selectedClaimType === 'ALL' ? 'Transportation & Thesis/Project' : selectedClaimType.replace("_", " ")})</div><table class="claims-table"><thead><tr><th>ID</th><th>Type</th><th>Details</th><th>Status</th><th>Submitted</th><th>Center</th></tr></thead><tbody>`;
        let hasOtherClaims = false;

        const teachingClaims = claimsToPrint.filter(c => c.claimType === 'TEACHING');
        const teachingClaimsWithTransport = teachingClaims.filter(c =>
            c.claimType === 'TEACHING' &&
            [c.transportToTeachingInDate, c.transportToTeachingFrom, c.transportToTeachingTo, c.transportToTeachingOutDate, c.transportToTeachingReturnFrom, c.transportToTeachingReturnTo, c.transportToTeachingDistanceKM].some(Boolean)
        );

        if (teachingClaims.length > 0 && (selectedClaimType === "ALL" || selectedClaimType === "TEACHING")) {
            teachingDetailsTableHtml = `<div class="section-title">Teaching Claim Details</div><table class="claims-table"><thead><tr><th>Course ID</th><th>Course Title</th><th>Hours Taught</th><th>Status</th></tr></thead><tbody>`;
            teachingClaims.forEach(claim => {
                teachingDetailsTableHtml += `<tr><td>${claim.courseCode || 'N/A'}</td><td>${claim.courseTitle || 'N/A'}</td><td>${claim.teachingHours ?? 'N/A'}</td><td><span class="status-badge status-${claim.status || 'UNKNOWN'}">${claim.status || 'N/A'}</span></td></tr>`;
            });
            teachingDetailsTableHtml += '</tbody></table>';

            if (teachingClaimsWithTransport.length > 0) {
                teachingTransportTableHtml = `<br/><div class="section-title">Optional Transportation for Teaching Sessions</div><table class="claims-table"><thead><tr><th>In-Date</th><th>From (To Venue)</th><th>To (To Venue)</th><th>Out-Date</th><th>From (Return)</th><th>To (Return)</th><th>Distance (KM)</th></tr></thead><tbody>`;
                teachingClaimsWithTransport.forEach(claim => {
                    teachingTransportTableHtml += `<tr><td>${claim.transportToTeachingInDate ? new Date(claim.transportToTeachingInDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</td><td>${claim.transportToTeachingFrom || 'N/A'}</td><td>${claim.transportToTeachingTo || 'N/A'}</td><td>${claim.transportToTeachingOutDate ? new Date(claim.transportToTeachingOutDate).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</td><td>${claim.transportToTeachingReturnFrom || 'N/A'}</td><td>${claim.transportToTeachingReturnTo || 'N/A'}</td><td>${claim.transportToTeachingDistanceKM ?? 'N/A'}</td></tr>`;
                });
                teachingTransportTableHtml += '</tbody></table>';
            }
        }

        claimsToPrint.filter(c => c.claimType !== 'TEACHING').forEach(claim => {
            hasOtherClaims = true; let detailsCellContent = 'N/A';
            if (claim.claimType === 'TRANSPORTATION') { detailsCellContent = `Type: ${claim.transportType || 'N/A'}<br/>From: ${claim.transportDestinationFrom || 'N/A'}<br/>To: ${claim.transportDestinationTo || 'N/A'}<br/>Amount: ${claim.transportAmount != null ? `GHS ${Number(claim.transportAmount).toFixed(2)}` : 'N/A'}`; }
            else if (claim.claimType === 'THESIS_PROJECT') { detailsCellContent = `Type: ${claim.thesisType || 'N/A'}<br/>`; if (claim.thesisType === 'SUPERVISION') { detailsCellContent += `Rank: ${claim.thesisSupervisionRank || 'N/A'}`; } else if (claim.thesisType === 'EXAMINATION') { detailsCellContent += `Course: ${claim.thesisExamCourseCode || 'N/A'}`; } }
            otherClaimsHtml += `<tr><td>${claim.id ? claim.id.substring(0,8) + '...' : 'N/A'}</td><td style="text-transform:capitalize;">${claim.claimType?.toLowerCase().replace("_", " ") || 'N/A'}</td><td>${detailsCellContent}</td><td><span class="status-badge status-${claim.status || 'UNKNOWN'}">${claim.status || 'N/A'}</span></td><td>${claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions) : 'N/A'}</td><td>${claim.centerName || 'N/A'}</td></tr>`;
        });
        if (!hasOtherClaims && (selectedClaimType === "ALL" || selectedClaimType === "TRANSPORTATION" || selectedClaimType === "THESIS_PROJECT")) {
            otherClaimsHtml += '<tr><td colspan="6" style="text-align:center;">No claims of this specific type for the period.</td></tr>';
        } else if (!hasOtherClaims && selectedClaimType === "ALL" && teachingClaims.length === 0) { // If "ALL" selected and no claims AT ALL (other than teaching which is handled separately)
            otherClaimsHtml = `<div class="section-title">Other Claim Types</div><p>No other claim types (Transportation, Thesis/Project) found for this period.</p>`;
        } else if (!hasOtherClaims) {
            otherClaimsHtml = ''; // Hide "Other Claims" if no other claims and teaching claims were filtered out.
        }

        const printHtml = `<html><head><title>Lecturer Claim Summary - ${summaryData.lecturerName} - ${summaryData.month} ${summaryData.year}</title><style>
            body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;padding:0;color:${textColor};background-color:#fff;font-size:11px;}
            .print-container{width:100%;max-width:900px;margin:15px auto;padding:20px;}
            .header{
                display: flex; /* Use flexbox */
                align-items: flex-start; /* Align items to the start (top) */
                justify-content: space-between; /* Push left and right parts apart */
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid ${uewDeepBlue};
                gap: 20px; /* Space between logo and text */
            }
            .header-left {
                flex-shrink: 0; /* Don't let it shrink */
            }
            .header-right {
                flex-grow: 1; /* Allow it to take remaining space */
                text-align: center; /* Keep text centered within its flexible column */
            }
            .logo{max-width:90px;height:auto;display:block;}
            .university-name{font-size:18px;font-weight:700;color:${uewDeepBlue};margin-bottom:2px;}
            .college-name{font-size:13px;font-weight:500;color:${uewDeepBlue};margin-bottom:5px;}
            .document-title{font-size:15px;font-weight:600;color:${uewDeepRed};margin-top:8px;text-transform:uppercase;}
            .section{margin-bottom:15px;padding:10px;border:1px solid ${lightGrayBorder};border-radius:5px;}
            .section-title{font-size:13px;font-weight:600;color:${headingColor};margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid ${uewDeepBlue}33;}
            .summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:12px;}
            .summary-item{padding:8px;border-radius:4px;text-align:center;border:1px solid ${lightGrayBorder};}
            .summary-item strong{display:block;font-size:16px;margin-bottom:2px;}
            .summary-item span{font-size:10px;color:#4A5568;}
            .total{background-color:${uewDeepBlue}1A;color:${uewDeepBlue};}
            .pending{background-color:#FFF8E1;color:#E65100;}
            .approved{background-color:#E8F5E9;color:#1B5E20;}
            .rejected{background-color:#FFEBEE;color:#C62828;}
            .footer{text-align:center;margin-top:30px;font-size:10px;color:#555;border-top:1px solid ${lightGrayBorder};padding-top:15px;}
            .claims-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:10px;table-layout:auto;}
            .claims-table th,.claims-table td{border:1px solid ${lightGrayBorder};padding:4px 6px;text-align:left;vertical-align:top;word-break:break-word;}
            .claims-table th{background-color:#eef2f7;font-weight:600;}
            .status-badge{padding:2px 6px;border-radius:10px;font-weight:500;font-size:0.65em;color:white;text-transform:uppercase;display:inline-block;}
            .status-PENDING{background-color:#FF8F00;}
            .status-APPROVED{background-color:#2E7D32;}
            .status-REJECTED{background-color:${uewDeepRed};}
            .signature-section{margin-top:40px;padding-top:20px;border-top:1px dashed ${lightGrayBorder};}
            .signature-area{
                display:flex;
                justify-content:space-around; /* Distribute space evenly */
                flex-wrap: wrap; /* Allow wrapping on smaller print sizes */
                gap: 25px; /* Space between signature blocks */
                margin-top:25px;
            }
            .signature-block{text-align:center;width:22%; min-width: 150px;} /* Adjusted width for 4 blocks */
            .signature-line{border-bottom:1px solid #333;height:40px;margin-bottom:5px;}
            .signature-label{font-size:10px; font-weight: 500;}
            @media print{
                body{-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:9pt;}
                .print-container{width:100%;margin:0 auto;padding:10mm;box-shadow:none;border:none;}
                .status-badge,.summary-item{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
            }
            </style></head><body>
            <div class="print-container">
                <div class="header">
                    <div class="header-left">
                        <img src="/uew.png" alt="University Logo" class="logo" />
                    </div>
                    <div class="header-right">
                        <div class="university-name">UNIVERSITY OF EDUCATION, WINNEBA</div>
                        <div class="college-name">COLLEGE OF DISTANCE AND e-LEARNING (CODeL)</div>
                        <div class="document-title">Lecturer Monthly Claim Summary</div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Summary For</div>
                    <p><strong>Lecturer:</strong> ${summaryData.lecturerName} (${summaryData.lecturerEmail || 'N/A'}) ${summaryData.lecturerDesignation ? '- ' + summaryData.lecturerDesignation.replace(/_/g, " ") : ''}</p>
                    <p><strong>Period:</b> ${summaryData.month}, ${summaryData.year}</p>
                    ${selectedClaimType !== "ALL" ? `<p><strong>Filtered by Claim Type:</strong> <span style="text-transform:capitalize;">${selectedClaimType.toLowerCase().replace("_"," ")}</span></p>` : ''}
                </div>
                <div class="section">
                    <div class="section-title">Overall Statistics for Period</div>
                    <div class="summary-grid">
                        <div class="summary-item total"><b>${summaryData.totalClaims}</b><span>Total Claims</span></div>
                        <div class="summary-item pending"><b>${summaryData.pending}</b><span>Pending</span></div>
                        <div class="summary-item approved"><b>${summaryData.approved}</b><span>Approved</span></div>
                        <div class="summary-item rejected"><b>${summaryData.rejected}</b><span>Rejected</span></div>
                    </div>
                    ${summaryData.totalTeachingHours > 0 ? `<p><b>Total Approved Teaching Hours:</b> ${summaryData.totalTeachingHours.toFixed(1)} hrs</p>` : ''}
                    ${summaryData.totalTransportAmount > 0 ? `<p><b>Total Approved Transport Amount:</b> GHS ${summaryData.totalTransportAmount.toFixed(2)}</p>` : ''}
                </div>
                ${teachingDetailsTableHtml ? `<div class="section">${teachingDetailsTableHtml}</div>` : ''}
                ${teachingTransportTableHtml ? `<div class="section">${teachingTransportTableHtml}</div>` : ''}
                ${otherClaimsHtml ? `<div class="section">${otherClaimsHtml}</div>` : ''}
                <div class="signature-section">
                    <div class="signature-area">
                        <div class="signature-block"><div class="signature-line"></div><p class="signature-label">Prepared by</p></div>
                        <div class="signature-block"><div class="signature-line"></div><p class="signature-label">Center Coordinator</p></div>
                        <div class="signature-block"><div class="signature-line"></div><p class="signature-label">Head of Department</p></div>
                        <div class="signature-block"><div class="signature-line"></div><p class="signature-label">Duty Registrar</p></div>
                    </div>
                </div>
                <div class="footer">Generated on: ${new Date().toLocaleString('en-US', dateTimeLocaleStringOptions)} by System.</div>
            </div>
            </body></html>`;
        printWindow.document.write(printHtml); printWindow.document.close(); printWindow.focus();
        setTimeout(() => { try { printWindow.print(); } catch(e) { console.error("Print failed:", e); toast.error("Printing failed."); } }, 700);
    } else { toast.error("Could not open print window."); }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('en-US', { month: 'long' }) }));
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const inputClass = `bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 ${focusRingClass} h-9 text-sm rounded-md`;
  const selectTriggerClass = `${inputClass} data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500`;
  const selectContentClass = "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md shadow-lg";
  const labelClass = "text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5";

  const summaryStatItems = summaryData ? [
    { label: "Total Claims", value: summaryData.totalClaims, icon: FileOutput, color: "text-blue-700 dark:text-blue-400", borderColor: "border-t-blue-700 dark:border-t-blue-500" },
    { label: "Pending", value: summaryData.pending, icon: Hourglass, color: "text-orange-600 dark:text-orange-400", borderColor: "border-t-orange-500 dark:border-t-orange-400" },
    { label: "Approved", value: summaryData.approved, icon: CheckSquare, color: "text-violet-700 dark:text-violet-400", borderColor: "border-t-violet-700 dark:border-t-violet-500" },
    { label: "Rejected", value: summaryData.rejected, icon: XSquare, color: "text-red-700 dark:text-red-400", borderColor: "border-t-red-700 dark:border-t-red-500" },
  ] : [];

  const displayedClaims = useMemo(() => {
    if (!summaryData || !summaryData.claims) return [];
    if (selectedClaimType === "ALL") return summaryData.claims;
    return summaryData.claims.filter(claim => claim.claimType === selectedClaimType);
  }, [summaryData, selectedClaimType]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="bg-white dark:bg-slate-800/80 shadow-xl border-slate-200 dark:border-slate-700/80 rounded-lg">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <BarChartHorizontalBig className="h-6 w-6 sm:h-7 sm:w-7 text-violet-700 dark:text-violet-500" />
                Lecturer Claim Summaries
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                Generate and view monthly claim summaries for individual lecturers.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 sm:pt-6 p-4 sm:p-5 space-y-6">
          <Card className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5 lg:col-span-1">
                <Label htmlFor="selectLecturer" className={labelClass}><UserSearch className="h-3.5 w-3.5"/>Select Lecturer <span className="text-red-600">*</span></Label>
                <Select value={selectedLecturerId} onValueChange={setSelectedLecturerId}>
                  <SelectTrigger id="selectLecturer" className={selectTriggerClass}><SelectValue placeholder="Choose a lecturer" /></SelectTrigger>
                  <SelectContent className={`${selectContentClass} max-h-60`}>
                    {lecturers.length > 0 ? lecturers.map(lecturer => (
                      <SelectItem key={lecturer.id} value={lecturer.id} className="focus:bg-slate-100 dark:focus:bg-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 cursor-pointer text-sm py-2">
                        {lecturer.name} <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">({lecturer.email})</span>
                      </SelectItem>
                    )) : <div className="p-3 text-sm text-slate-500 dark:text-slate-400">No lecturers found.</div>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="selectClaimType" className={labelClass}><FileSymlink className="h-3.5 w-3.5"/>Claim Type</Label>
                <Select value={selectedClaimType} onValueChange={setSelectedClaimType}>
                    <SelectTrigger id="selectClaimType" className={selectTriggerClass}><SelectValue /></SelectTrigger>
                    <SelectContent className={selectContentClass}>
                        {CLAIM_TYPES.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                    </SelectContent>
                </Select>
              </div>
                <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-1.5">
                        <Label htmlFor="selectMonth" className={labelClass}><CalendarDays className="h-3.5 w-3.5"/>Month <span className="text-red-600">*</span></Label>
                        <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
                            <SelectTrigger id="selectMonth" className={selectTriggerClass}><SelectValue placeholder="Month" /></SelectTrigger>
                            <SelectContent className={`${selectContentClass} max-h-60`}>{months.map(month => (<SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="selectYear" className={labelClass}><CalendarDays className="h-3.5 w-3.5"/>Year <span className="text-red-600">*</span></Label>
                        <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                            <SelectTrigger id="selectYear" className={selectTriggerClass}><SelectValue placeholder="Year" /></SelectTrigger>
                            <SelectContent className={`${selectContentClass} max-h-60`}>{yearOptions.map(year => (<SelectItem key={year} value={String(year)}>{year}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
              <div className="flex justify-end items-end pt-4 mt-2">
                <Button onClick={handleGenerateSummary} disabled={isLoadingSummary || !selectedLecturerId} className={`gap-2 w-full md:w-auto px-6 py-2.5 h-auto text-sm ${violetButtonClasses}`}>
                    {isLoadingSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarSearch className="h-4 w-4" />}
                    {isLoadingSummary ? "Generating..." : "Generate Summary"}
                </Button>
            </div>
          </Card>

          {isLoadingSummary && (
            <div className="space-y-4 p-4 sm:p-6 mt-4 bg-slate-100 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700">
              <Skeleton className="h-8 w-3/4 sm:w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
              <Skeleton className="h-6 w-1/2 sm:w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-md bg-slate-200 dark:bg-slate-700" />)}
              </div>
            </div>
          )}

          {fetchError && !isLoadingSummary && (
            <Card className="border-red-600 dark:border-red-700 bg-red-50 dark:bg-red-900/20 shadow-md rounded-lg mt-4">
              <CardHeader className="flex flex-row items-center gap-2.5 pb-2 pt-4 px-4">
                <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-400 flex-shrink-0" />
                <CardTitle className="text-red-800 dark:text-red-300 text-md sm:text-lg">Error Fetching Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1">
                <p className="text-red-700 dark:text-red-300 text-sm">{fetchError}</p>
              </CardContent>
            </Card>
          )}

          {summaryData && !isLoadingSummary && !fetchError && (
            <Card className="mt-6 bg-white dark:bg-slate-800/70 shadow-lg border-slate-200 dark:border-slate-700/70 rounded-lg">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <CardTitle className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-300">Summary for {summaryData.lecturerName}</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 text-sm mt-1">Period: {summaryData.month}, {summaryData.year} {selectedClaimType !== "ALL" ? `(Filtered by Type: ${selectedClaimType.toLowerCase().replace("_"," ")})` : ''}</CardDescription>
                        {summaryData.lecturerDesignation && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Designation: {summaryData.lecturerDesignation.replace(/_/g, " ")}</p>}
                    </div>
                    <Button onClick={handlePrintSummary} variant="outline" className={`gap-2 mt-3 sm:mt-0 ${focusRingClass} border-blue-600 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-700/30 h-9 text-xs sm:h-10 sm:text-sm`}>
                        <Printer className="h-4 w-4" /> Print Summary
                    </Button>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-5 p-4 sm:p-5 space-y-4 sm:space-y-5">
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
                            {summaryData.totalTeachingHours > 0 && <p><b>Total Approved Teaching Hours (Period):</b> <span className="font-semibold text-blue-700 dark:text-blue-300">{summaryData.totalTeachingHours.toFixed(1)} hrs</span></p>}
                            {summaryData.totalTransportAmount > 0 && <p><b>Total Approved Transport Amount (Period):</b> <span className="font-semibold text-blue-700 dark:text-blue-300">GHS {summaryData.totalTransportAmount.toFixed(2)}</span></p>}
                        </div>
                    )}
                    {displayedClaims.length > 0 ? (
                        <div className="mt-4 space-y-3">
                            <h4 className="font-medium text-md text-violet-700 dark:text-violet-400 border-b dark:border-slate-700 pb-1.5">
                                Claims in Period {selectedClaimType !== "ALL" ? `(Type: ${selectedClaimType.toLowerCase().replace("_"," ")})` : ''}:
                            </h4>
                            <ScrollArea className="max-h-80 border dark:border-slate-700 rounded-md p-3 bg-slate-50/50 dark:bg-slate-800/40">
                               <ul className="list-none pl-0 space-y-2.5">
                                {displayedClaims.map(claim => (
                                    <li key={claim.id} className="text-xs p-2.5 border-b dark:border-slate-700/60 last:border-b-0 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded">
                                        <div className="flex justify-between items-center">
                                            <span className="font-mono text-slate-500 dark:text-slate-400">{claim.id.substring(0,8)}...</span>
                                            <Badge variant="outline" className={`text-[9px] ${getStatusBadgeClasses(claim.status)}`}>{claim.status}</Badge>
                                        </div>
                                        <span className="capitalize font-medium text-slate-700 dark:text-slate-200 block mt-0.5"> {claim.claimType.toLowerCase().replace("_", " ")}</span>
                                        <span className="block text-slate-500 dark:text-slate-400 text-[11px]">
                                            Submitted: {new Date(claim.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions)}
                                            {claim.claimType === 'TEACHING' ? ` | Course: ${claim.courseCode || 'N/A'}` : ''}
                                            {claim.claimType === 'TRANSPORTATION' ? ` | Amount: GHS ${claim.transportAmount?.toFixed(2) || 'N/A'}` : ''}
                                        </span>
                                    </li>
                                ))}
                               </ul>
                            </ScrollArea>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6 italic">No claims of the selected type found for this lecturer in this period.</p>
                    )}
                </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}