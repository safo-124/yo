// app/(dashboard)/staff-registry/summaries/_components/StaffRegistrySummariesView.jsx
"use client";

import { useState, useEffect } from 'react'; // useEffect might not be strictly needed if all data is from props/derived
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getLecturerMonthlyClaimSummary, getMonthlyClaimsSummaryByGrouping } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { CalendarSearch, Printer, UserSearch, Loader2, BarChartHorizontalBig, AlertTriangle, FileOutput, Hourglass, CheckSquare, XSquare, Building2, CalendarDays, User, FileText, BarChart3 } from "lucide-react"; // Added more icons
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from '@/components/ui/scroll-area'; // For potentially long summary display

const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";
const violetButtonClasses = `text-white font-medium rounded-md bg-violet-800 hover:bg-violet-900 dark:bg-violet-700 dark:hover:bg-violet-600 focus-visible:ring-violet-500 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg disabled:opacity-70 ${focusRingClass}`;

const dateLocaleStringOptions = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
const dateTimeLocaleStringOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' };

// Simplified Print Logic for this component
const handlePrintGenericSummary = (title, contentElementId) => {
    const contentElement = document.getElementById(contentElementId);
    if (!contentElement) {
        toast.error("Content to print not found.");
        return;
    }
    const contentToPrint = contentElement.innerHTML;
    const printWindow = window.open('', '_blank', 'height=800,width=800,scrollbars=yes,resizable=yes');
    if (printWindow) {
        printWindow.document.write(`<html><head><title>${title}</title><style>body{font-family:sans-serif;margin:20px;} table{width:100%; border-collapse:collapse; margin-bottom: 1em;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background-color:#f2f2f2;} h1,h2,h3,h4{color:#333;} .print-card{border:1px solid #eee; padding:15px; margin-bottom:15px; border-radius:5px;} .print-card-title{font-size:1.1em; font-weight:bold; margin-bottom:10px;} .print-grid{display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:10px;} .print-stat{border:1px solid #eee; padding:10px; text-align:center;} .print-stat-value{font-size:1.5em; font-weight:bold;} .print-stat-label{font-size:0.9em; color: #555;} </style></head><body>`);
        printWindow.document.write(`<h1>${title}</h1>`);
        printWindow.document.write(contentToPrint);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { try { printWindow.print(); } catch (e) { console.error("Print error:", e); toast.error("Printing failed."); } }, 600);
    } else {
        toast.error("Could not open print window.");
    }
};

export default function StaffRegistrySummariesView({ staffRegistryUserId, assignedCenters = [], lecturersInAssignedCenters = [] }) {
  const [summaryType, setSummaryType] = useState("grouped_monthly"); 
  
  const [groupedYear, setGroupedYear] = useState(new Date().getFullYear());
  const [groupedMonth, setGroupedMonth] = useState(new Date().getMonth() + 1);
  const [groupedSelectedCenterId, setGroupedSelectedCenterId] = useState(""); 

  const [lecturerSelectedLecturerId, setLecturerSelectedLecturerId] = useState('');
  const [lecturerYear, setLecturerYear] = useState(new Date().getFullYear());
  const [lecturerMonth, setLecturerMonth] = useState(new Date().getMonth() + 1);
  
  const [summaryData, setSummaryData] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('en-US', { month: 'long' }) }));
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const inputClass = `bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 ${focusRingClass} h-9 text-sm rounded-md`;
  const selectTriggerClass = `${inputClass} data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500`;
  const selectContentClass = "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md shadow-lg";
  const labelClass = "text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5";

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
        filterCenterId: groupedSelectedCenterId || undefined, // Send undefined if empty, action handles it
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
      const noDataMessage = summaryType === "grouped_monthly" 
        ? (!result.summary || (Array.isArray(result.summary) && result.summary.length === 0) || Object.keys(result.summary).length === 0)
        : (!result.summary || result.summary.totalClaims === 0);
      if (noDataMessage) toast.info("No data found for the selected criteria.", { duration: 4000});
      else toast.success("Summary generated successfully.", { duration: 3000 });
    } else {
      setFetchError(result?.error || "Failed to fetch summary.");
      toast.error(result?.error || "Failed to fetch summary.");
    }
    setIsLoadingSummary(false);
  };
  
  const renderGroupedSummary = () => {
    if (!summaryData || !Array.isArray(summaryData) || summaryData.length === 0) return <p className="text-slate-500 dark:text-slate-400 p-4 text-center">No grouped summary data to display for the selected criteria.</p>;
    
    const periodInfo = summaryData[0]?.period || summaryData.period; // Handle if summary is array or object
    const contextInfo = summaryData[0]?.filterContext || summaryData.filterContext;

    return (
        <div id="groupedSummaryContent" className="space-y-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300">Grouped Claim Summary</h3>
                {periodInfo && <p className="text-sm">Period: {periodInfo.month}, {periodInfo.year}</p>}
                {contextInfo && <p className="text-sm">Scope: {contextInfo}</p>}
            </div>
            {summaryData.map((centerData, index) => (
                <Card key={centerData.centerId || index} className="bg-white dark:bg-slate-800/50">
                    <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-base font-medium text-violet-700 dark:text-violet-400">{centerData.centerName}</CardTitle>
                        <CardDescription className="text-xs">Total Claims: {centerData.totalClaims}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 text-xs space-y-1">
                        <p><strong>Teaching Hours (Approved):</strong> {centerData.totalTeachingHours?.toFixed(1) || 0} hrs</p>
                        <p><strong>Transport Amount (Approved):</strong> GHS {centerData.totalTransportAmount?.toFixed(2) || '0.00'}</p>
                        <p><strong>Thesis Supervision Units:</strong> {centerData.totalThesisSupervisionUnits || 0}</p>
                        <p><strong>Thesis Examination Units:</strong> {centerData.totalThesisExaminationUnits || 0}</p>
                        {/* Further breakdown by department and lecturer can be added here with more detailed rendering */}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  };

  const renderLecturerSummary = () => {
    if (!summaryData || summaryData.totalClaims === undefined) return <p className="text-slate-500 dark:text-slate-400 p-4 text-center">No lecturer summary data to display for the selected criteria.</p>;
    const statItems = [
        { label: "Total Claims", value: summaryData.totalClaims, icon: FileOutput, color: "text-blue-700 dark:text-blue-400", borderColor: "border-t-blue-700 dark:border-t-blue-500" },
        { label: "Pending", value: summaryData.pending, icon: Hourglass, color: "text-orange-600 dark:text-orange-400", borderColor: "border-t-orange-500 dark:border-t-orange-400" },
        { label: "Approved", value: summaryData.approved, icon: CheckSquare, color: "text-violet-700 dark:text-violet-400", borderColor: "border-t-violet-700 dark:border-t-violet-500" },
        { label: "Rejected", value: summaryData.rejected, icon: XSquare, color: "text-red-700 dark:text-red-400", borderColor: "border-t-red-700 dark:border-t-red-500" },
    ];
    return (
        <div id="lecturerSummaryContent" className="space-y-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300">Summary for {summaryData.lecturerName}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Period: {summaryData.month}, {summaryData.year}</p>
                {summaryData.lecturerDesignation && <p className="text-xs text-slate-500 dark:text-slate-400">Designation: {summaryData.lecturerDesignation.replace("_", " ")}</p>}
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              {statItems.map(stat => (
                <Card key={stat.label} className={`bg-slate-50 dark:bg-slate-700/40 p-3 rounded-lg shadow-md border-t-4 ${stat.borderColor} hover:shadow-lg transition-shadow`}>
                  <stat.icon className={`h-7 w-7 mx-auto mb-1.5 ${stat.color} opacity-90`} />
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{stat.label}</p>
                </Card>
              ))}
            </div>
            {(summaryData.totalTeachingHours > 0 || summaryData.totalTransportAmount > 0) && (
                <div className="p-3 bg-slate-100 dark:bg-slate-700/60 rounded-md space-y-1.5 text-slate-700 dark:text-slate-200 text-sm border border-slate-200 dark:border-slate-600">
                    {summaryData.totalTeachingHours > 0 && <p><strong>Total Approved Teaching Hours:</strong> <span className="font-semibold text-blue-800 dark:text-blue-300">{summaryData.totalTeachingHours.toFixed(1)} hrs</span></p>}
                    {summaryData.totalTransportAmount > 0 && <p><strong>Total Approved Transport Amount:</strong> <span className="font-semibold text-blue-800 dark:text-blue-300">GHS {summaryData.totalTransportAmount.toFixed(2)}</span></p>}
                </div>
            )}
            {/* Table for individual claims could be added here if needed, for now keeping it brief for on-screen view */}
        </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="bg-white dark:bg-slate-800/80 shadow-xl border-slate-200 dark:border-slate-700/80 rounded-lg">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-4 sm:p-5">
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <BarChartHorizontalBig className="h-6 w-6 sm:h-7 sm:w-7 text-violet-700 dark:text-violet-500" />
            Generate Claim Summaries
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Select summary type and parameters for your assigned centers.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 sm:pt-6 p-4 sm:p-5 space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="summaryType" className={`${labelClass} mb-1`}><BarChart3 className="h-4 w-4"/>Select Summary Type <span className="text-red-600">*</span></Label>
            <Select value={summaryType} onValueChange={(value) => { setSummaryType(value); setSummaryData(null); setFetchError(null); }}>
              <SelectTrigger id="summaryType" className={selectTriggerClass}><SelectValue /></SelectTrigger>
              <SelectContent className={selectContentClass}>
                <SelectItem value="grouped_monthly">Grouped Monthly Summary (by Center)</SelectItem>
                <SelectItem value="lecturer_monthly">Individual Lecturer Monthly Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {summaryType === "grouped_monthly" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700/70">
              <div className="space-y-1.5">
                <Label htmlFor="groupedMonth" className={labelClass}><CalendarDays className="h-3.5 w-3.5"/>Month <span className="text-red-600">*</span></Label>
                <Select value={String(groupedMonth)} onValueChange={(val) => setGroupedMonth(Number(val))}>
                  <SelectTrigger id="groupedMonth" className={selectTriggerClass}><SelectValue /></SelectTrigger>
                  <SelectContent className={selectContentClass}>{months.map(m => (<SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="groupedYear" className={labelClass}><CalendarDays className="h-3.5 w-3.5"/>Year <span className="text-red-600">*</span></Label>
                <Select value={String(groupedYear)} onValueChange={(val) => setGroupedYear(Number(val))}>
                  <SelectTrigger id="groupedYear" className={selectTriggerClass}><SelectValue /></SelectTrigger>
                  <SelectContent className={selectContentClass}>{yearOptions.map(y => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="groupedSelectedCenterId" className={labelClass}><Building2 className="h-3.5 w-3.5"/>Filter by Assigned Center (Optional)</Label>
                <Select value={groupedSelectedCenterId} onValueChange={setGroupedSelectedCenterId} disabled={assignedCenters.length === 0}>
                  <SelectTrigger id="groupedSelectedCenterId" className={selectTriggerClass}><SelectValue placeholder="All My Assigned Centers" /></SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {/* REMOVED: <SelectItem value="">All My Assigned Centers</SelectItem> - placeholder handles this */}
                    {assignedCenters.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {summaryType === "lecturer_monthly" && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700/70">
                <div className="space-y-1.5">
                    <Label htmlFor="lecturerSelect" className={labelClass}><UserSearch className="h-3.5 w-3.5"/>Lecturer <span className="text-red-600">*</span></Label>
                    <Select value={lecturerSelectedLecturerId} onValueChange={setLecturerSelectedLecturerId} disabled={lecturersInAssignedCenters.length === 0}>
                        <SelectTrigger id="lecturerSelect" className={selectTriggerClass}><SelectValue placeholder="Select a lecturer" /></SelectTrigger>
                        <SelectContent className={`${selectContentClass} max-h-60`}> {/* Added max-h */}
                            {lecturersInAssignedCenters.length > 0 ? 
                                lecturersInAssignedCenters.map(l => (<SelectItem key={l.id} value={l.id}>{l.name} ({l.email})</SelectItem>)) :
                                <div className="p-2 text-xs text-slate-500">No lecturers found in your assigned centers.</div>
                            }
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="lecturerMonth" className={labelClass}><CalendarDays className="h-3.5 w-3.5"/>Month <span className="text-red-600">*</span></Label>
                    <Select value={String(lecturerMonth)} onValueChange={(val) => setLecturerMonth(Number(val))}>
                        <SelectTrigger id="lecturerMonth" className={selectTriggerClass}><SelectValue /></SelectTrigger>
                        <SelectContent className={selectContentClass}>{months.map(m => (<SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="lecturerYear" className={labelClass}><CalendarDays className="h-3.5 w-3.5"/>Year <span className="text-red-600">*</span></Label>
                    <Select value={String(lecturerYear)} onValueChange={(val) => setLecturerYear(Number(val))}>
                        <SelectTrigger id="lecturerYear" className={selectTriggerClass}><SelectValue /></SelectTrigger>
                        <SelectContent className={selectContentClass}>{yearOptions.map(y => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
             </div>
          )}
          
          <div className="flex justify-end pt-2">
            <Button onClick={handleGenerateSummary} disabled={isLoadingSummary} className={`gap-2 px-6 py-2.5 h-auto text-sm ${violetButtonClasses}`}>
                {isLoadingSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarSearch className="h-4 w-4" />}
                {isLoadingSummary ? "Generating..." : "Generate Summary"}
            </Button>
          </div>
          
          {isLoadingSummary && ( <div className="space-y-3 p-4 sm:p-6 mt-4 bg-slate-100 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700"><Skeleton className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700" /><Skeleton className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700" /><div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-md bg-slate-200 dark:bg-slate-700" />)}</div></div> )}
          {fetchError && !isLoadingSummary && ( <Card className="border-red-600 dark:border-red-700 bg-red-50 dark:bg-red-900/20 mt-4"><CardHeader className="flex flex-row items-center gap-2.5 pb-2 pt-4 px-4"><AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-400 flex-shrink-0" /> <CardTitle className="text-red-800 dark:text-red-300 text-md sm:text-lg">Error</CardTitle></CardHeader><CardContent className="px-4 pb-4 pt-1"><p className="text-red-700 dark:text-red-300 text-sm">{fetchError}</p></CardContent></Card> )}
          
          {summaryData && !isLoadingSummary && !fetchError && (
            <Card className="mt-6 bg-white dark:bg-slate-800/60 shadow-lg border-slate-200 dark:border-slate-700/80 rounded-lg">
                <CardHeader className="p-4 sm:p-5 flex justify-between items-center border-b dark:border-slate-700">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-300">Generated Summary</CardTitle>
                    <Button onClick={() => handlePrintGenericSummary(
                        summaryType === "grouped_monthly" ? "Grouped Claim Summary" : `Lecturer Claim Summary - ${summaryData.lecturerName}`,
                        summaryType === "grouped_monthly" ? "groupedSummaryContent" : "lecturerSummaryContent"
                        )} 
                        variant="outline" size="sm" className={`gap-1.5 ${focusRingClass}`}>
                        <Printer className="h-4 w-4" /> Print
                    </Button>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-5 p-4 sm:p-5">
                    {summaryType === "grouped_monthly" && renderGroupedSummary()}
                    {summaryType === "lecturer_monthly" && renderLecturerSummary()}
                </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}