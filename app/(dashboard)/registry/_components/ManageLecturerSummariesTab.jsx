// app/(dashboard)/registry/_components/ManageLecturerSummariesTab.jsx
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
import { UserSearch, CalendarSearch, Printer, BarChartHorizontalBig, AlertTriangle, Hourglass, CheckSquare, XSquare, FileOutput } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define UEW-inspired colors
const uewDeepRed = '#8C181F';
// const uewLightRed = 'red-500'; // No longer needed for buttonGradientClasses
const uewDeepBlue = '#0D2C54';
// const uewLightBlue = 'blue-500'; // No longer needed for buttonGradientClasses
const uewAccentGold = '#F9A602';

// Text colors for light backgrounds (main page theme)
const textPrimaryBlue = `text-[${uewDeepBlue}]`;
const textSecondarySlate = 'text-slate-600 dark:text-slate-400';
const textAccentRed = `text-[${uewDeepRed}]`;

// Backgrounds for elements on white background (main page theme)
const cardBgLight = `bg-white dark:bg-slate-900`;
const sectionBgLight = `bg-slate-50 dark:bg-slate-800/50`;
const inputBgLight = `bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus-visible:ring-[${uewDeepBlue}] placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-50`;
const selectContentBgLight = `bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50`;

// Gradient classes for stat cards (Generate/Print buttons will have new classes)
const statCardGradientClasses = `
  text-white font-semibold rounded-lg shadow-lg
  bg-gradient-to-br from-[${uewDeepRed}] via-red-500 to-[${uewDeepBlue}] 
  dark:from-[${uewDeepRed}] dark:via-red-600 dark:to-[${uewDeepBlue}]
  p-4 
`;

// New classes for Violet buttons
const violetButtonClasses = `
  text-white font-semibold rounded-md
  bg-violet-700 hover:bg-violet-800 dark:bg-violet-700 dark:hover:bg-violet-600
  focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 focus:ring-violet-500
  transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg
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
      year: parseInt(selectedYear),
      month: parseInt(selectedMonth),
    });

    if (result.success) {
      setSummaryData(result.summary);
      if (result.summary.totalClaims === 0) {
        toast.info("No claims found for the selected lecturer and period.");
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

    const printWindow = window.open('', '_blank', 'height=800,width=800');
    if (printWindow) {
        const universityBlue = uewDeepBlue; 
        const universityRed = uewDeepRed;
        const textColor = "#1A202C";
        const headingColor = uewDeepBlue;
        const lightGrayBorder = "#CBD5E0"; 

        let claimsDetailsHtml = '<div class="section-title">Detailed Claims in Period</div>';
        if (summaryData.claims && summaryData.claims.length > 0) {
            claimsDetailsHtml += `
                <table class="claims-table">
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Submitted At</th>
                            <th>Center</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            summaryData.claims.forEach(claim => {
                claimsDetailsHtml += `
                    <tr>
                        <td>${claim.id ? claim.id.substring(0,12) + '...' : 'N/A'}</td>
                        <td>${claim.claimType || 'N/A'}</td>
                        <td><span class="status-badge status-${claim.status || 'UNKNOWN'}">${claim.status || 'N/A'}</span></td>
                        <td>${claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : 'N/A'}</td>
                        <td>${claim.centerName || 'N/A'}</td>
                    </tr>
                `;
            });
            claimsDetailsHtml += '</tbody></table>';
        } else {
            claimsDetailsHtml += '<p>No claims submitted by this lecturer in this period.</p>';
        }

        const printHtml = `
            <html>
            <head>
                <title>Lecturer Claim Summary - ${summaryData.lecturerName} - ${summaryData.month} ${summaryData.year}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; color: ${textColor}; background-color: #fff; }
                    .print-container { width: 100%; max-width: 800px; margin: 20px auto; padding: 25px; background-color: #fff; }
                    .header { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid ${universityBlue}; }
                    .logo { max-width: 120px; max-height: 80px; margin-bottom: 10px; }
                    .university-name { font-size: 22px; font-weight: 700; color: ${universityBlue}; margin-bottom: 3px; }
                    .college-name { font-size: 16px; font-weight: 500; color: ${universityBlue}; margin-bottom: 8px; }
                    .document-title { font-size: 18px; font-weight: 600; color: ${universityRed}; margin-top: 10px; text-transform: uppercase; }
                    .section { margin-bottom: 20px; padding: 15px; border: 1px solid ${lightGrayBorder}; border-radius: 6px; background-color: #f8f9fa; }
                    .section-title { font-size: 16px; font-weight: 600; color: ${headingColor}; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid ${universityBlue}33; }
                    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
                    .summary-item { padding: 12px; border-radius: 4px; text-align: center; border: 1px solid ${lightGrayBorder}; }
                    .summary-item strong { display: block; font-size: 20px; margin-bottom: 3px; }
                    .summary-item span { font-size: 13px; color: #4A5568; }
                    .total { background-color: ${universityBlue}1A; color: ${universityBlue};}
                    .pending { background-color: #FFF8E1; color: #E65100; }
                    .approved { background-color: #E8F5E9; color: #1B5E20; }
                    .rejected { background-color: #FFEBEE; color: #C62828; }
                    .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #555; border-top: 1px solid ${lightGrayBorder}; padding-top: 15px; }
                    .claims-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                    .claims-table th, .claims-table td { border: 1px solid ${lightGrayBorder}; padding: 6px 8px; text-align: left; }
                    .claims-table th { background-color: #eef2f7; font-weight: 600; }
                    .status-badge { padding: 2px 7px; border-radius: 10px; font-weight: 500; font-size: 0.7em; color: white; text-transform: uppercase; display: inline-block; }
                    .status-PENDING { background-color: #FF8F00; }
                    .status-APPROVED { background-color: #2E7D32; }
                    .status-REJECTED { background-color: ${universityRed}; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .print-container { width: 100%; margin: 0 auto; padding: 10mm; box-shadow: none; border: none; }
                        .status-badge, .summary-item { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <div class="header">
                        <img src="/uew.png" alt="University Logo" class="logo" />
                        <div class="university-name">UNIVERSITY OF EDUCATION, WINNEBA</div>
                        <div class="college-name">COLLEGE OF DISTANCE AND e-LEARNING (CODeL)</div>
                        <div class="document-title">Lecturer Claim Summary</div>
                    </div>
                    <div class="section">
                        <div class="section-title">Summary For</div>
                        <p><strong>Lecturer:</strong> ${summaryData.lecturerName} (${summaryData.lecturerEmail})</p>
                        <p><strong>Period:</strong> ${summaryData.month}, ${summaryData.year}</p>
                    </div>
                    <div class="section">
                        <div class="section-title">Overall Statistics</div>
                        <div class="summary-grid">
                            <div class="summary-item total"><strong>${summaryData.totalClaims}</strong><span>Total Claims</span></div>
                            <div class="summary-item pending"><strong>${summaryData.pending}</strong><span>Pending</span></div>
                            <div class="summary-item approved"><strong>${summaryData.approved}</strong><span>Approved</span></div>
                            <div class="summary-item rejected"><strong>${summaryData.rejected}</strong><span>Rejected</span></div>
                        </div>
                        ${summaryData.totalTeachingHours > 0 ? `<p><strong>Total Teaching Hours Claimed (Approved):</strong> ${summaryData.totalTeachingHours.toFixed(1)} hrs</p>` : ''}
                        ${summaryData.totalTransportAmount > 0 ? `<p><strong>Total Transport Amount Claimed (Approved):</strong> GHS ${summaryData.totalTransportAmount.toFixed(2)}</p>` : ''}
                    </div>
                    <div class="section">
                        ${claimsDetailsHtml}
                    </div>
                    <div class="footer">
                        Generated on: ${new Date().toLocaleString()} by Registry System.
                    </div>
                </div>
            </body>
            </html>
        `;
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

  return (
    <div className={`space-y-8 min-h-full bg-white dark:bg-slate-950 p-4 sm:p-6 lg:p-8`}>
      <Card className={`${cardBgLight} shadow-xl border-slate-200 dark:border-slate-800`}>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className={`text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-3 ${textPrimaryBlue}`}>
                <BarChartHorizontalBig className={`h-7 w-7 text-[${uewDeepBlue}]`} />
                Lecturer Claim Summaries
              </CardTitle>
              <CardDescription className={`${textSecondarySlate} mt-1`}>Generate monthly claim summaries for individual lecturers.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Selection Controls */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-4 ${sectionBgLight} rounded-lg border border-slate-200 dark:border-slate-800`}>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="selectLecturer" className={`${textPrimaryBlue}`}>Select Lecturer</Label>
              <Select value={selectedLecturerId} onValueChange={setSelectedLecturerId}>
                <SelectTrigger id="selectLecturer" className={inputBgLight}><SelectValue placeholder="Choose a lecturer" /></SelectTrigger>
                <SelectContent className={selectContentBgLight}>
                  {lecturers.length > 0 ? lecturers.map(lecturer => (
                    <SelectItem key={lecturer.id} value={lecturer.id} className={`focus:bg-slate-100 dark:focus:bg-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-700/70`}>
                      {lecturer.name} ({lecturer.email})
                    </SelectItem>
                  )) : <SelectItem value="no-lecturers" disabled>No lecturers found</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="selectMonth" className={`${textPrimaryBlue}`}>Month</Label>
              <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
                <SelectTrigger id="selectMonth" className={inputBgLight}><SelectValue placeholder="Select month" /></SelectTrigger>
                <SelectContent className={selectContentBgLight}>
                  {months.map(month => (
                    <SelectItem key={month.value} value={String(month.value)} className={`focus:bg-slate-100 dark:focus:bg-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-700/70`}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="selectYear" className={`${textPrimaryBlue}`}>Year</Label>
              <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                 <SelectTrigger id="selectYear" className={inputBgLight}><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent className={selectContentBgLight}>
                  {yearOptions.map(year => (
                    <SelectItem key={year} value={String(year)} className={`focus:bg-slate-100 dark:focus:bg-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-700/70`}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4 flex justify-end items-end pt-2">
                <Button 
                  onClick={handleGenerateSummary} 
                  disabled={isLoadingSummary || !selectedLecturerId} 
                  className={`gap-2 w-full md:w-auto px-6 py-2.5 ${violetButtonClasses}`}
                >
                    <CalendarSearch className="h-5 w-5 mr-2" />
                    {isLoadingSummary ? "Generating..." : "Generate Summary"}
                </Button>
            </div>
          </div>

          {/* Summary Display Area */}
          {isLoadingSummary && (
            <div className="space-y-3 p-6 bg-slate-100 dark:bg-slate-800/40 rounded-lg">
              <Skeleton className="h-8 w-1/2 bg-slate-300 dark:bg-slate-700/50" />
              <Skeleton className="h-6 w-3/4 bg-slate-300 dark:bg-slate-700/50" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-md bg-slate-300 dark:bg-slate-700/50" />)}
              </div>
            </div>
          )}

          {fetchError && !isLoadingSummary && (
            <Card className={`border-red-400 dark:border-red-600 bg-red-50 dark:bg-[${uewDeepRed}]/20 shadow-md`}>
              <CardHeader>
                <CardTitle className={`${textAccentRed} dark:text-red-300 flex items-center gap-2`}>
                  <AlertTriangle className="h-5 w-5" /> Error Fetching Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`${textAccentRed} dark:text-red-200`}>{fetchError}</p>
              </CardContent>
            </Card>
          )}

          {summaryData && !isLoadingSummary && !fetchError && (
            <Card className={`${cardBgLight} shadow-lg border-slate-200 dark:border-slate-800`}>
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <CardTitle className={`text-xl font-semibold ${textPrimaryBlue}`}>
                  Summary for {summaryData.lecturerName}
                </CardTitle>
                <CardDescription className={`${textSecondarySlate}`}>
                  {summaryData.month}, {summaryData.year}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    { label: "Total Claims", value: summaryData.totalClaims, icon: FileOutput, color: `text-[${uewAccentGold}]` },
                    { label: "Pending", value: summaryData.pending, icon: Hourglass, color: "text-amber-500 dark:text-amber-400" },
                    { label: "Approved", value: summaryData.approved, icon: CheckSquare, color: "text-green-600 dark:text-green-400" },
                    { label: "Rejected", value: summaryData.rejected, icon: XSquare, color: textAccentRed },
                  ].map(stat => (
                    <div key={stat.label} className={`${statCardGradientClasses}`}>
                      <stat.icon className={`h-7 w-7 mx-auto mb-2 ${stat.color}`} />
                      <p className={`text-2xl font-bold text-white`}>{stat.value}</p>
                      <p className={`text-xs text-slate-200`}>{stat.label}</p>
                    </div>
                  ))}
                </div>
                {(summaryData.totalTeachingHours > 0 || summaryData.totalTransportAmount > 0) && (
                    <div className={`p-4 ${sectionBgLight} rounded-md space-y-1 ${textSecondarySlate} text-sm border border-slate-200 dark:border-slate-800`}>
                        {summaryData.totalTeachingHours > 0 && <p><strong>Total Teaching Hours Claimed (Approved):</strong> {summaryData.totalTeachingHours.toFixed(1)} hrs</p>}
                        {summaryData.totalTransportAmount > 0 && <p><strong>Total Transport Amount Claimed (Approved):</strong> GHS {summaryData.totalTransportAmount.toFixed(2)}</p>}
                    </div>
                )}
              </CardContent>
              <CardFooter className={`border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end`}>
                <Button 
                  onClick={handlePrintSummary} 
                  variant="default"
                  className={`gap-2 w-full sm:w-auto px-5 py-2.5 ${violetButtonClasses}`}
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
