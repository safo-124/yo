"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getLecturerMonthlyClaimSummary } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { UserSearch, CalendarSearch, Printer, BarChartHorizontalBig, AlertTriangle, Hourglass, CheckSquare, XSquare, FileOutput, Loader2 } from "lucide-react"; // Added Loader2
import { Skeleton } from "@/components/ui/skeleton";

// New Palette: Red-800, Blue-800, Violet-800, White
const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

const violetButtonClasses = `
  text-white font-medium rounded-md
  bg-violet-800 hover:bg-violet-900 dark:bg-violet-700 dark:hover:bg-violet-600
  focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 focus-visible:ring-violet-500
  transition-all duration-200 ease-in-out shadow-md hover:shadow-lg disabled:opacity-70
`;


export default function ManageLecturerSummariesTab({ allUsers = [] }) {
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [summaryData, setSummaryData] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const potentialClaimSubmitters = allUsers.filter(
      user => user.role === 'LECTURER' || user.role === 'COORDINATOR'
    ).sort((a, b) => a.name.localeCompare(b.name));
    setLecturers(potentialClaimSubmitters);
  }, [allUsers]);

  const handleGenerateSummary = async () => {
    if (!selectedLecturerId || !selectedYear || !selectedMonth) {
      toast.error("Please select a lecturer, year, and month.");
      return;
    }
    setIsLoadingSummary(true);
    setFetchError(null);
    setSummaryData(null);

    const result = await getLecturerMonthlyClaimSummary({
      lecturerId: selectedLecturerId,
      year: parseInt(String(selectedYear)),
      month: parseInt(String(selectedMonth)),
    });

    if (result.success) {
      setSummaryData(result.summary);
      if (result.summary.totalClaims === 0) {
        toast.info("No claims found for the selected lecturer and period.", { duration: 4000});
      } else {
        toast.success("Summary generated successfully.", { duration: 3000 });
      }
    } else {
      setFetchError(result.error || "Failed to fetch summary.");
      toast.error(result.error || "Failed to fetch summary.");
    }
    setIsLoadingSummary(false);
  };

  const handlePrintSummary = () => {
    if (!summaryData) {
      toast.info("No summary data to print. Please generate a summary first.");
      return;
    }
    // Print logic remains unchanged as it generates separate HTML/CSS for printing
    const printWindow = window.open('', '_blank', 'height=800,width=800');
    if (printWindow) {
        const uewDeepBlue = '#0D2C54'; // Kept for print consistency
        const uewDeepRed = '#8C181F'; // Kept for print consistency
        const textColor = "#1A202C";
        const headingColor = uewDeepBlue;
        const lightGrayBorder = "#CBD5E0"; 

        let claimsDetailsHtml = '<div class="section-title">Detailed Claims in Period</div>';
        if (summaryData.claims && summaryData.claims.length > 0) {
            claimsDetailsHtml += `<table class="claims-table"><thead><tr><th>Claim ID</th><th>Type</th><th>Status</th><th>Submitted At</th><th>Center</th></tr></thead><tbody>`;
            summaryData.claims.forEach(claim => {
                claimsDetailsHtml += `<tr><td>${claim.id ? claim.id.substring(0,12) + '...' : 'N/A'}</td><td>${claim.claimType || 'N/A'}</td><td><span class="status-badge status-${claim.status || 'UNKNOWN'}">${claim.status || 'N/A'}</span></td><td>${claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : 'N/A'}</td><td>${claim.centerName || 'N/A'}</td></tr>`;
            });
            claimsDetailsHtml += '</tbody></table>';
        } else { claimsDetailsHtml += '<p>No claims submitted by this lecturer in this period.</p>'; }
        const printHtml = `<html><head><title>Lecturer Claim Summary - ${summaryData.lecturerName} - ${summaryData.month} ${summaryData.year}</title><style>body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;padding:0;color:${textColor};background-color:#fff;}.print-container{width:100%;max-width:800px;margin:20px auto;padding:25px;background-color:#fff;}.header{text-align:center;margin-bottom:25px;padding-bottom:20px;border-bottom:3px solid ${uewDeepBlue};}.logo{max-width:120px;max-height:80px;margin-bottom:10px;}.university-name{font-size:22px;font-weight:700;color:${uewDeepBlue};margin-bottom:3px;}.college-name{font-size:16px;font-weight:500;color:${uewDeepBlue};margin-bottom:8px;}.document-title{font-size:18px;font-weight:600;color:${uewDeepRed};margin-top:10px;text-transform:uppercase;}.section{margin-bottom:20px;padding:15px;border:1px solid ${lightGrayBorder};border-radius:6px;background-color:#f8f9fa;}.section-title{font-size:16px;font-weight:600;color:${headingColor};margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid ${uewDeepBlue}33;}.summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-bottom:20px;}.summary-item{padding:12px;border-radius:4px;text-align:center;border:1px solid ${lightGrayBorder};}.summary-item strong{display:block;font-size:20px;margin-bottom:3px;}.summary-item span{font-size:13px;color:#4A5568;}.total{background-color:${uewDeepBlue}1A;color:${uewDeepBlue};}.pending{background-color:#FFF8E1;color:#E65100;}.approved{background-color:#E8F5E9;color:#1B5E20;}.rejected{background-color:#FFEBEE;color:#C62828;}.footer{text-align:center;margin-top:30px;font-size:11px;color:#555;border-top:1px solid ${lightGrayBorder};padding-top:15px;}.claims-table{width:100%;border-collapse:collapse;margin-top:10px;font-size:12px;}.claims-table th,.claims-table td{border:1px solid ${lightGrayBorder};padding:6px 8px;text-align:left;}.claims-table th{background-color:#eef2f7;font-weight:600;}.status-badge{padding:2px 7px;border-radius:10px;font-weight:500;font-size:0.7em;color:white;text-transform:uppercase;display:inline-block;}.status-PENDING{background-color:#FF8F00;}.status-APPROVED{background-color:#2E7D32;}.status-REJECTED{background-color:${uewDeepRed};}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.print-container{width:100%;margin:0 auto;padding:10mm;box-shadow:none;border:none;}.status-badge,.summary-item{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style></head><body><div class="print-container"><div class="header"><img src="/uew.png" alt="University Logo" class="logo" /><div class="university-name">UNIVERSITY OF EDUCATION, WINNEBA</div><div class="college-name">COLLEGE OF DISTANCE AND e-LEARNING (CODeL)</div><div class="document-title">Lecturer Claim Summary</div></div><div class="section"><div class="section-title">Summary For</div><p><strong>Lecturer:</strong> ${summaryData.lecturerName} (${summaryData.lecturerEmail})</p><p><strong>Period:</strong> ${summaryData.month}, ${summaryData.year}</p></div><div class="section"><div class="section-title">Overall Statistics</div><div class="summary-grid"><div class="summary-item total"><strong>${summaryData.totalClaims}</strong><span>Total Claims</span></div><div class="summary-item pending"><strong>${summaryData.pending}</strong><span>Pending</span></div><div class="summary-item approved"><strong>${summaryData.approved}</strong><span>Approved</span></div><div class="summary-item rejected"><strong>${summaryData.rejected}</strong><span>Rejected</span></div></div>${summaryData.totalTeachingHours > 0 ? `<p><strong>Total Teaching Hours Claimed (Approved):</strong> ${summaryData.totalTeachingHours.toFixed(1)} hrs</p>` : ''}${summaryData.totalTransportAmount > 0 ? `<p><strong>Total Transport Amount Claimed (Approved):</strong> GHS ${summaryData.totalTransportAmount.toFixed(2)}</p>` : ''}</div><div class="section">${claimsDetailsHtml}</div><div class="footer">Generated on: ${new Date().toLocaleString()} by Registry System.</div></div></body></html>`;
        printWindow.document.write(printHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 500);
    } else {
        toast.error("Could not open print window. Please check your browser's pop-up settings.");
    }
  };
  
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Reusable input/select classes for light theme
  const inputClass = `bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 ${focusRingClass} h-9 text-sm`;
  const selectTriggerClass = `${inputClass} data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500`;
  const selectContentClass = "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100";
  const labelClass = "text-xs font-medium text-slate-700 dark:text-slate-300";

  // Summary Stat Card Data (using new palette for light theme)
  const summaryStatItems = summaryData ? [
    { label: "Total Claims", value: summaryData.totalClaims, icon: FileOutput, borderColor: "border-t-blue-800", iconColor: "text-blue-800 dark:text-blue-400" },
    { label: "Pending", value: summaryData.pending, icon: Hourglass, borderColor: "border-t-orange-500", iconColor: "text-orange-600 dark:text-orange-400" }, // Using Orange for Pending as it's common
    { label: "Approved", value: summaryData.approved, icon: CheckSquare, borderColor: "border-t-violet-800", iconColor: "text-violet-800 dark:text-violet-400" },
    { label: "Rejected", value: summaryData.rejected, icon: XSquare, borderColor: "border-t-red-800", iconColor: "text-red-800 dark:text-red-400" },
  ] : [];


  return (
    // This component's root assumes parent provides overall page background (white) and horizontal padding.
    // It adds vertical spacing and its own content structure.
    <div className="space-y-6 sm:space-y-8">
      <Card className="bg-white dark:bg-slate-800/60 shadow-xl border-slate-200 dark:border-slate-700 rounded-lg">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <BarChartHorizontalBig className="h-6 w-6 sm:h-7 sm:w-7 text-violet-700 dark:text-violet-500" />
                Lecturer Claim Summaries
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                Generate monthly claim summaries for individual lecturers.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 sm:pt-6 p-4 sm:p-5 space-y-6">
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/40 rounded-md border border-slate-200 dark:border-slate-700">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="selectLecturer" className={labelClass}>Select Lecturer <span className="text-red-700">*</span></Label>
              <Select value={selectedLecturerId} onValueChange={setSelectedLecturerId}>
                <SelectTrigger id="selectLecturer" className={selectTriggerClass}><SelectValue placeholder="Choose a lecturer" /></SelectTrigger>
                <SelectContent className={selectContentClass}>
                  {lecturers.length > 0 ? lecturers.map(lecturer => (
                    <SelectItem key={lecturer.id} value={lecturer.id} className="focus:bg-slate-100 dark:focus:bg-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 cursor-pointer text-sm">
                      {lecturer.name} ({lecturer.email})
                    </SelectItem>
                  )) : <SelectItem value="no-lecturers" disabled className="text-sm">No lecturers found</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="selectMonth" className={labelClass}>Month <span className="text-red-700">*</span></Label>
              <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
                <SelectTrigger id="selectMonth" className={selectTriggerClass}><SelectValue placeholder="Select month" /></SelectTrigger>
                <SelectContent className={selectContentClass}>
                  {months.map(month => (<SelectItem key={month.value} value={String(month.value)} className="focus:bg-slate-100 dark:focus:bg-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 cursor-pointer text-sm">{month.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="selectYear" className={labelClass}>Year <span className="text-red-700">*</span></Label>
              <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                 <SelectTrigger id="selectYear" className={selectTriggerClass}><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent className={selectContentClass}>
                  {yearOptions.map(year => (<SelectItem key={year} value={String(year)} className="focus:bg-slate-100 dark:focus:bg-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 cursor-pointer text-sm">{year}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4 flex justify-end items-end pt-2">
                <Button 
                  onClick={handleGenerateSummary} 
                  disabled={isLoadingSummary || !selectedLecturerId} 
                  className={`gap-1.5 sm:gap-2 w-full md:w-auto px-5 py-2 h-9 sm:h-10 text-xs sm:text-sm ${violetButtonClasses}`}
                >
                  {isLoadingSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarSearch className="h-4 w-4" />}
                  {isLoadingSummary ? "Generating..." : "Generate Summary"}
                </Button>
            </div>
          </div>

          {/* Summary Display Area */}
          {isLoadingSummary && (
            <div className="space-y-3 p-4 sm:p-6 bg-slate-100 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700">
              <Skeleton className="h-7 w-3/4 sm:w-1/2 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-5 w-1/2 sm:w-1/3 bg-slate-200 dark:bg-slate-700" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-md bg-slate-200 dark:bg-slate-700" />)}
              </div>
            </div>
          )}

          {fetchError && !isLoadingSummary && (
            <Card className="border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-800/20 shadow-md rounded-lg">
              <CardHeader className="flex flex-row items-center gap-2 pb-2 pt-4 px-4">
                <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-400" /> 
                <CardTitle className="text-red-800 dark:text-red-300 text-base sm:text-lg">Error Fetching Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-red-700 dark:text-red-300 text-sm">{fetchError}</p>
              </CardContent>
            </Card>
          )}

          {summaryData && !isLoadingSummary && !fetchError && (
            <Card className="bg-white dark:bg-slate-800/50 shadow-lg border-slate-200 dark:border-slate-700 rounded-lg">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-4 sm:p-5">
                <CardTitle className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-300">
                  Summary for {summaryData.lecturerName}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">
                  Period: {months.find(m => m.value === summaryData.month)?.label || summaryData.month}, {summaryData.year}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-5 p-4 sm:p-5 space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
                  {summaryStatItems.map(stat => (
                    <Card key={stat.label} className={`bg-slate-50 dark:bg-slate-700/30 p-3 sm:p-4 rounded-md shadow-sm border-t-4 ${stat.borderColor} dark:border-opacity-80`}>
                      <stat.icon className={`h-6 w-6 sm:h-7 sm:w-7 mx-auto mb-1.5 ${stat.iconColor} opacity-80`} />
                      <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{stat.label}</p>
                    </Card>
                  ))}
                </div>
                {(summaryData.totalTeachingHours > 0 || summaryData.totalTransportAmount > 0) && (
                    <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-700/50 rounded-md space-y-1 text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-600">
                        {summaryData.totalTeachingHours > 0 && <p><strong>Total Teaching Hours (Approved):</strong> <span className="font-semibold">{summaryData.totalTeachingHours.toFixed(1)} hrs</span></p>}
                        {summaryData.totalTransportAmount > 0 && <p><strong>Total Transport Amount (Approved):</strong> <span className="font-semibold">GHS {summaryData.totalTransportAmount.toFixed(2)}</span></p>}
                    </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex justify-end">
                <Button 
                  onClick={handlePrintSummary} 
                  variant="default"
                  className={`gap-1.5 sm:gap-2 w-full sm:w-auto px-5 py-2 h-9 sm:h-10 text-xs sm:text-sm ${violetButtonClasses}`}
                >
                  <Printer className="h-4 w-4" /> Print Summary
                </Button>
              </CardFooter>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}