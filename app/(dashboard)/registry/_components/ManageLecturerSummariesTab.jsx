// app/(dashboard)/registry/_components/ManageLecturerSummariesTab.jsx
"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getLecturerMonthlyClaimSummary } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { UserSearch, CalendarSearch, Printer, BarChartHorizontalBig, AlertTriangle, CheckSquare, XSquare, FileOutput, Loader2, CalendarDays, FileSymlink, Clock, BookOpen, Banknote, Filter, ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

const dateLocaleStringOptions = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
const dateTimeLocaleStringOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' };

const CLAIM_TYPES = [
  { value: "ALL", label: "All Claim Types" },
  { value: "TEACHING", label: "Teaching" },
  { value: "TRANSPORTATION", label: "Transportation" },
  { value: "THESIS_PROJECT", label: "Thesis/Project" },
];

const getStatusConfig = (status) => {
  switch (status) {
    case 'PENDING': return { dot: 'bg-amber-500 animate-pulse', text: 'text-amber-700 dark:text-amber-300' };
    case 'APPROVED': return { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' };
    case 'REJECTED': return { dot: 'bg-red-500', text: 'text-red-700 dark:text-red-300' };
    default: return { dot: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400' };
  }
};

const getTypeBadgeClasses = (type) => {
  switch(type) {
    case 'TEACHING': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700';
    case 'TRANSPORTATION': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700';
    case 'THESIS_PROJECT': return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700';
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  }
};

export default function ManageLecturerSummariesTab({ allUsers = [] }) {
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [lecturerPopoverOpen, setLecturerPopoverOpen] = useState(false);
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
      toast.info(`No claims of type '${selectedClaimType.toLowerCase().replace("_", " ")}' to print. The printout will show overall summary statistics.`, { duration: 6000 });
    }

    const printWindow = window.open('', '_blank', 'height=800,width=1000,scrollbars=yes,resizable=yes');
    if (!printWindow) { toast.error("Could not open print window."); return; }

    const uewDeepBlue = '#0D2C54';
    const uewDeepRed = '#8C181F';

    const teachingClaims = claimsToPrint.filter(c => c.claimType === 'TEACHING');
    const teachingClaimsWithTransport = teachingClaims.filter(c => [
      c.transportToTeachingInDate,
      c.transportToTeachingFrom,
      c.transportToTeachingTo,
      c.transportToTeachingOutDate,
      c.transportToTeachingReturnFrom,
      c.transportToTeachingReturnTo,
      c.transportToTeachingDistanceKM,
    ].some(Boolean));

    const refNumber = `UEW/CODeL/CMS/${summaryData.year}/${String(summaryData.monthNumber || new Date().getMonth() + 1).padStart(2, '0')}/${Date.now().toString(36).toUpperCase().slice(-6)}`;

    const printHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lecturer Claim Summary - ${summaryData.lecturerName} - ${summaryData.month} ${summaryData.year}</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Times New Roman', 'Georgia', 'Cambria', serif;
        color: #1a202c;
        background: white;
        font-size: 11pt;
        line-height: 1.6;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      @page { size: A4; margin: 18mm 20mm 20mm 20mm; }

      .print-container { max-width: 210mm; margin: 0 auto; }

      /* ── Header ── */
      .header { text-align: center; padding-bottom: 14px; margin-bottom: 18px; border-bottom: 3px double ${uewDeepBlue}; }
      .header-top { display: flex; align-items: center; justify-content: center; gap: 18px; margin-bottom: 8px; }
      .logo { height: 72px; width: auto; }
      .header-text { text-align: center; }
      .university-name { font-size: 18pt; font-weight: 700; color: ${uewDeepBlue}; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
      .college-name { font-size: 11pt; font-weight: 600; color: #374151; letter-spacing: 0.5px; margin-bottom: 0; }
      .doc-title-bar { margin-top: 10px; padding: 7px 0; background: ${uewDeepBlue}; }
      .doc-title { font-size: 13pt; font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 2px; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; }
      .ref-line { font-size: 8pt; color: #6b7280; margin-top: 8px; font-family: 'Segoe UI', Arial, sans-serif; }

      /* ── Sections ── */
      .section { margin-bottom: 16px; page-break-inside: avoid; }
      .section-heading { font-size: 11pt; font-weight: 700; color: ${uewDeepBlue}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid ${uewDeepBlue}; font-family: 'Segoe UI', Arial, sans-serif; }

      /* ── Info Grid ── */
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 40px; }
      .info-block { padding: 8px 0; }
      .info-block-title { font-size: 9pt; font-weight: 700; color: ${uewDeepBlue}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; font-family: 'Segoe UI', Arial, sans-serif; }
      .info-table { width: 100%; border-collapse: collapse; }
      .info-table td { padding: 3px 0; font-size: 10pt; vertical-align: top; }
      .info-table td:first-child { font-weight: 600; color: #374151; width: 130px; white-space: nowrap; padding-right: 12px; }
      .info-table td:last-child { color: #1a202c; }

      /* ── Statistics ── */
      .stats-row { display: flex; gap: 0; margin: 12px 0; border: 1.5px solid ${uewDeepBlue}; border-radius: 0; overflow: hidden; }
      .stat-cell { flex: 1; text-align: center; padding: 10px 8px; border-right: 1px solid #d1d5db; }
      .stat-cell:last-child { border-right: none; }
      .stat-cell .stat-num { font-size: 22pt; font-weight: 700; line-height: 1.1; margin-bottom: 2px; font-family: 'Segoe UI', Arial, sans-serif; }
      .stat-cell .stat-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; font-family: 'Segoe UI', Arial, sans-serif; }
      .stat-total { background: ${uewDeepBlue}; color: white; }
      .stat-total .stat-num, .stat-total .stat-label { color: white; }
      .stat-pending .stat-num { color: #b45309; }
      .stat-pending .stat-label { color: #92400e; }
      .stat-pending { background: #fef9ee; }
      .stat-approved .stat-num { color: #047857; }
      .stat-approved .stat-label { color: #065f46; }
      .stat-approved { background: #f0fdf8; }
      .stat-rejected .stat-num { color: ${uewDeepRed}; }
      .stat-rejected .stat-label { color: ${uewDeepRed}; }
      .stat-rejected { background: #fef7f7; }

      .totals-strip { display: flex; gap: 12px; margin: 8px 0 0 0; }
      .total-badge { flex: 1; padding: 6px 10px; font-size: 9pt; font-weight: 600; border-left: 3px solid; font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; }
      .total-badge.teaching { border-color: #059669; color: #065f46; }
      .total-badge.transport { border-color: #d97706; color: #92400e; }

      /* ── Tables ── */
      .data-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9.5pt; }
      .data-table th { background: ${uewDeepBlue}; color: white; font-weight: 600; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px; padding: 7px 8px; text-align: left; border: 1px solid ${uewDeepBlue}; font-family: 'Segoe UI', Arial, sans-serif; white-space: nowrap; }
      .data-table td { padding: 7px 8px; border: 1px solid #d1d5db; vertical-align: top; }
      .data-table tbody tr:nth-child(even) { background: #f8fafc; }
      .data-table tbody tr:hover { background: #f1f5f9; }

      .badge { display: inline-block; padding: 3px 10px; border-radius: 3px; font-weight: 700; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Segoe UI', Arial, sans-serif; }
      .badge-approved { background: #059669; color: white; }
      .badge-pending { background: #d97706; color: white; }
      .badge-rejected { background: ${uewDeepRed}; color: white; }

      /* ── Signature ── */
      .signature-section { margin-top: 36px; padding-top: 16px; border-top: 2px solid ${uewDeepBlue}; page-break-inside: avoid; }
      .signature-heading { font-size: 10pt; font-weight: 700; color: ${uewDeepBlue}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 30px; font-family: 'Segoe UI', Arial, sans-serif; }
      .sig-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
      .sig-block { text-align: center; }
      .sig-line { border-bottom: 1.5px solid #1a202c; margin: 0 4px 5px 4px; height: 40px; }
      .sig-name { font-size: 8pt; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.4px; font-family: 'Segoe UI', Arial, sans-serif; }
      .sig-role { font-size: 7pt; color: #6b7280; margin-top: 1px; font-family: 'Segoe UI', Arial, sans-serif; }

      /* ── Footer ── */
      .doc-footer { text-align: center; margin-top: 24px; padding-top: 10px; border-top: 1px solid #d1d5db; font-size: 8pt; color: #6b7280; font-family: 'Segoe UI', Arial, sans-serif; }
      .doc-footer .system { font-style: italic; }
      .doc-footer .confidential { font-weight: 600; color: ${uewDeepRed}; text-transform: uppercase; letter-spacing: 1px; font-size: 7pt; margin-top: 4px; }

      @media print {
        .data-table { page-break-inside: auto; }
        .data-table tr { page-break-inside: avoid; }
        .section { page-break-inside: avoid; }
      }
    </style></head><body>
      <div class="print-container">

        <!-- Header -->
        <div class="header">
          <div class="header-top">
            <img src="/uew.png" alt="UEW Logo" class="logo" />
            <div class="header-text">
              <div class="university-name">University of Education, Winneba</div>
              <div class="college-name">College of Distance and e-Learning (CODeL)</div>
            </div>
          </div>
          <div class="doc-title-bar">
            <div class="doc-title">Lecturer Monthly Claim Summary</div>
          </div>
          <div class="ref-line">Ref: ${refNumber} &nbsp;&bull;&nbsp; Period: ${summaryData.month} ${summaryData.year}</div>
        </div>

        <!-- Summary & Payment Info Side by Side -->
        <div class="info-grid">
          <div class="info-block">
            <div class="info-block-title">Lecturer Information</div>
            <table class="info-table">
              <tr><td>Full Name</td><td><strong>${summaryData.lecturerName}</strong></td></tr>
              <tr><td>Email</td><td>${summaryData.lecturerEmail || 'N/A'}</td></tr>
              <tr><td>Designation</td><td>${summaryData.lecturerDesignation ? summaryData.lecturerDesignation.replace(/_/g, ' ') : 'N/A'}</td></tr>
              <tr><td>Claim Period</td><td><strong>${summaryData.month}, ${summaryData.year}</strong></td></tr>
              ${selectedClaimType !== 'ALL' ? `<tr><td>Type Filter</td><td style="font-weight:600;color:${uewDeepRed};text-transform:capitalize;">${selectedClaimType.toLowerCase().replace("_", " ")}</td></tr>` : ''}
            </table>
          </div>
          <div class="info-block">
            <div class="info-block-title">Payment Details</div>
            <table class="info-table">
              <tr><td>Bank Name</td><td>${summaryData.lecturerBankName || 'N/A'}</td></tr>
              <tr><td>Branch</td><td>${summaryData.lecturerBankBranch || 'N/A'}</td></tr>
              <tr><td>Account Name</td><td>${summaryData.lecturerAccountName || 'N/A'}</td></tr>
              <tr><td>Account No.</td><td><strong>${summaryData.lecturerAccountNumber || 'N/A'}</strong></td></tr>
            </table>
          </div>
        </div>

        <!-- Statistics -->
        <div class="section" style="margin-top: 6px;">
          <div class="section-heading">Claim Statistics</div>
          <div class="stats-row">
            <div class="stat-cell stat-total"><div class="stat-num">${summaryData.totalClaims}</div><div class="stat-label">Total Claims</div></div>
            <div class="stat-cell stat-pending"><div class="stat-num">${summaryData.pending}</div><div class="stat-label">Pending</div></div>
            <div class="stat-cell stat-approved"><div class="stat-num">${summaryData.approved}</div><div class="stat-label">Approved</div></div>
            <div class="stat-cell stat-rejected"><div class="stat-num">${summaryData.rejected}</div><div class="stat-label">Rejected</div></div>
          </div>
          ${(summaryData.totalTeachingHours > 0 || summaryData.totalTransportAmount > 0) ? `<div class="totals-strip">
            ${summaryData.totalTeachingHours > 0 ? `<div class="total-badge teaching">Approved Teaching Hours: <strong>${summaryData.totalTeachingHours.toFixed(1)} hrs</strong></div>` : ''}
            ${summaryData.totalTransportAmount > 0 ? `<div class="total-badge transport">Approved Transport Amount: <strong>GHS ${summaryData.totalTransportAmount.toFixed(2)}</strong></div>` : ''}
          </div>` : ''}
        </div>

        <!-- Teaching Claims -->
        ${teachingClaims.length > 0 && (selectedClaimType === 'ALL' || selectedClaimType === 'TEACHING') ? `
        <div class="section">
          <div class="section-heading">Teaching Claim Details</div>
          <table class="data-table">
            <thead><tr><th style="width:15%">Course Code</th><th style="width:40%">Course Title</th><th style="width:20%">Hours Taught</th><th style="width:25%">Status</th></tr></thead>
            <tbody>${teachingClaims.map(c => `<tr><td>${c.courseCode || 'N/A'}</td><td>${c.courseTitle || 'N/A'}</td><td>${c.teachingHours ?? 'N/A'}</td><td><span class="badge badge-${(c.status || 'UNKNOWN').toLowerCase()}">${c.status || 'N/A'}</span></td></tr>`).join('')}</tbody>
          </table>
        </div>` : ''}

        <!-- Teaching Transportation -->
        ${teachingClaimsWithTransport.length > 0 ? `
        <div class="section">
          <div class="section-heading">Transportation for Teaching Sessions</div>
          <table class="data-table">
            <thead><tr><th>Date (In)</th><th>From</th><th>To (Venue)</th><th>Date (Out)</th><th>From (Return)</th><th>To (Return)</th><th>Dist. (KM)</th></tr></thead>
            <tbody>${teachingClaimsWithTransport.map(c => `<tr><td>${c.transportToTeachingInDate ? new Date(c.transportToTeachingInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</td><td>${c.transportToTeachingFrom || 'N/A'}</td><td>${c.transportToTeachingTo || 'N/A'}</td><td>${c.transportToTeachingOutDate ? new Date(c.transportToTeachingOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</td><td>${c.transportToTeachingReturnFrom || 'N/A'}</td><td>${c.transportToTeachingReturnTo || 'N/A'}</td><td>${c.transportToTeachingDistanceKM ?? 'N/A'}</td></tr>`).join('')}</tbody>
          </table>
        </div>` : ''}

        <!-- Other Claims (Transport / Thesis) -->
        ${(() => {
          const otherClaims = claimsToPrint.filter(c => c.claimType !== 'TEACHING');
          if (otherClaims.length === 0) return '';
          return `<div class="section">
            <div class="section-heading">Other Claims (Transportation &amp; Thesis/Project)</div>
            <table class="data-table">
              <thead><tr><th>ID</th><th>Type</th><th>Details</th><th>Student</th><th>Topic</th><th>Status</th><th>Submitted</th></tr></thead>
              <tbody>${otherClaims.map(claim => {
                let details = 'N/A', student = '-', topic = '-';
                if (claim.claimType === 'TRANSPORTATION') {
                  details = [claim.transportType, claim.transportDestinationFrom && claim.transportDestinationTo ? claim.transportDestinationFrom + ' → ' + claim.transportDestinationTo : null, claim.transportAmount != null ? 'GHS ' + Number(claim.transportAmount).toFixed(2) : null].filter(Boolean).join('<br/>');
                } else if (claim.claimType === 'THESIS_PROJECT') {
                  details = (claim.thesisType || 'N/A') + (claim.thesisSupervisionRank ? ' (' + claim.thesisSupervisionRank + ')' : '');
                  if (claim.thesisType === 'SUPERVISION' && claim.supervisedStudents?.length) {
                    student = claim.supervisedStudents.map(s => s.studentName || 'N/A').join(', ');
                    topic = claim.supervisedStudents.map(s => s.thesisTitle || 'N/A').join(', ');
                  } else if (claim.thesisType === 'EXAMINATION') {
                    details += '<br/>Course: ' + (claim.thesisExamCourseCode || 'N/A');
                  }
                }
                return '<tr><td style="font-family:monospace;font-size:8pt;">' + (claim.id ? claim.id.substring(0,8) : 'N/A') + '</td><td style="text-transform:capitalize;">' + (claim.claimType?.toLowerCase().replace("_"," ") || 'N/A') + '</td><td>' + details + '</td><td>' + student + '</td><td style="font-style:italic;">' + topic + '</td><td><span class="badge badge-' + (claim.status || 'unknown').toLowerCase() + '">' + (claim.status || 'N/A') + '</span></td><td>' + (claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A') + '</td></tr>';
              }).join('')}</tbody>
            </table>
          </div>`;
        })()}

        <!-- Authorization Signatures -->
        <div class="signature-section">
          <div class="signature-heading">Authorization &amp; Approval</div>
          <div class="sig-grid">
            <div class="sig-block"><div class="sig-line"></div><div class="sig-name">Prepared By</div><div class="sig-role">Registry Officer</div></div>
            <div class="sig-block"><div class="sig-line"></div><div class="sig-name">Center Coordinator</div><div class="sig-role">Verification</div></div>
            <div class="sig-block"><div class="sig-line"></div><div class="sig-name">Head of Department</div><div class="sig-role">Endorsement</div></div>
            <div class="sig-block"><div class="sig-line"></div><div class="sig-name">Duty Registrar</div><div class="sig-role">Final Approval</div></div>
          </div>
        </div>

        <!-- Footer -->
        <div class="doc-footer">
          <div class="system">Generated on ${new Date().toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })} &mdash; UEW Claims Management System</div>
          <div class="confidential">This document is confidential and intended for official use only</div>
        </div>

      </div>
    </body></html>`;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      try { printWindow.print(); }
      catch (e) { console.error('Print failed:', e); toast.error('Printing failed.'); }
    }, 700);
  };

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('en-US', { month: 'long' }) }));
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const selectContentClass = "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg shadow-lg";
  const labelClass = "text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5";

  const summaryStatItems = summaryData ? [
    { label: 'Total Claims', value: summaryData.totalClaims, icon: FileOutput, gradient: 'from-violet-600 to-indigo-600', lightBg: 'bg-violet-50 dark:bg-violet-950/30', iconBg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300' },
    { label: 'Pending', value: summaryData.pending, icon: Clock, gradient: 'from-amber-500 to-orange-500', lightBg: 'bg-amber-50 dark:bg-amber-950/30', iconBg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
    { label: 'Approved', value: summaryData.approved, icon: CheckSquare, gradient: 'from-emerald-500 to-teal-500', lightBg: 'bg-emerald-50 dark:bg-emerald-950/30', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
    { label: 'Rejected', value: summaryData.rejected, icon: XSquare, gradient: 'from-red-500 to-rose-500', lightBg: 'bg-red-50 dark:bg-red-950/30', iconBg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
  ] : [];

  const displayedClaims = useMemo(() => {
    if (!summaryData || !summaryData.claims) return [];
    if (selectedClaimType === "ALL") return summaryData.claims;
    return summaryData.claims.filter(claim => claim.claimType === selectedClaimType);
  }, [summaryData, selectedClaimType]);

  return (
    <div className="space-y-5">

      {/* ── B) Redesigned Filter/Form Card ── */}
      <Card className="bg-white dark:bg-slate-800/80 shadow-xl border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-700 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <CalendarSearch className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">Generate Summary</h3>
              <p className="text-white/70 text-xs">Select a lecturer and period to generate their claim report.</p>
            </div>
          </div>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="selectLecturer" className={labelClass}><UserSearch className="h-3.5 w-3.5"/>Lecturer <span className="text-red-500">*</span></Label>
              <Popover open={lecturerPopoverOpen} onOpenChange={setLecturerPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={lecturerPopoverOpen} className="w-full h-9 justify-between text-sm font-normal bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600/80 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-violet-500 focus:border-violet-500">
                    {selectedLecturerId
                      ? <span className="truncate">{lecturers.find(l => l.id === selectedLecturerId)?.name || "Choose a lecturer"}</span>
                      : <span className="text-muted-foreground">Choose a lecturer</span>}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search by name or email..." />
                    <CommandList>
                      <CommandEmpty>No lecturer found.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-y-auto">
                        {lecturers.map(lecturer => (
                          <CommandItem
                            key={lecturer.id}
                            value={`${lecturer.name} ${lecturer.email}`}
                            onSelect={() => {
                              setSelectedLecturerId(lecturer.id === selectedLecturerId ? "" : lecturer.id);
                              setLecturerPopoverOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <Check className={`mr-2 h-4 w-4 ${selectedLecturerId === lecturer.id ? "opacity-100" : "opacity-0"}`} />
                            <div className="flex flex-col">
                              <span className="text-sm">{lecturer.name}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{lecturer.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="selectClaimType" className={labelClass}><FileSymlink className="h-3.5 w-3.5"/>Claim Type</Label>
              <Select value={selectedClaimType} onValueChange={setSelectedClaimType}>
                <SelectTrigger id="selectClaimType" className="h-9 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600/80 rounded-lg focus:ring-violet-500 focus:border-violet-500"><SelectValue /></SelectTrigger>
                <SelectContent className={selectContentClass}>
                  {CLAIM_TYPES.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="selectMonth" className={labelClass}><CalendarDays className="h-3.5 w-3.5"/>Month <span className="text-red-500">*</span></Label>
              <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
                <SelectTrigger id="selectMonth" className="h-9 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600/80 rounded-lg focus:ring-violet-500 focus:border-violet-500"><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent className={`${selectContentClass} max-h-60`}>{months.map(month => (<SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="selectYear" className={labelClass}><CalendarDays className="h-3.5 w-3.5"/>Year <span className="text-red-500">*</span></Label>
              <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                <SelectTrigger id="selectYear" className="h-9 text-sm bg-white dark:bg-slate-700/80 border-slate-300 dark:border-slate-600/80 rounded-lg focus:ring-violet-500 focus:border-violet-500"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent className={`${selectContentClass} max-h-60`}>{yearOptions.map(year => (<SelectItem key={year} value={String(year)}>{year}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleGenerateSummary} disabled={isLoadingSummary || !selectedLecturerId} className="gap-2 w-full sm:w-auto px-6 h-10 text-sm font-medium rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg disabled:opacity-60 transition-all">
              {isLoadingSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarSearch className="h-4 w-4" />}
              {isLoadingSummary ? "Generating..." : "Generate Summary"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading Skeleton */}
      {isLoadingSummary && (
        <div className="space-y-4 p-5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <Skeleton className="h-8 w-3/4 sm:w-1/2 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <Skeleton className="h-5 w-1/2 sm:w-1/3 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-700" />)}
          </div>
        </div>
      )}

      {/* Error State */}
      {fetchError && !isLoadingSummary && (
        <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 shadow-md rounded-xl">
          <CardHeader className="flex flex-row items-center gap-2.5 pb-2 pt-4 px-5">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <CardTitle className="text-red-800 dark:text-red-300 text-base">Error Fetching Summary</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-1">
            <p className="text-red-700 dark:text-red-300 text-sm">{fetchError}</p>
          </CardContent>
        </Card>
      )}

      {/* ── C+D+E+F) Summary Results ── */}
      {summaryData && !isLoadingSummary && !fetchError && (
        <Card className="bg-white dark:bg-slate-800/70 shadow-xl border-slate-200 dark:border-slate-700/70 rounded-xl overflow-hidden">

          {/* ── C) Gradient Results Header ── */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-700 px-5 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-white font-semibold text-lg">{summaryData.lecturerName}</h3>
                <p className="text-white/70 text-sm mt-0.5">
                  {summaryData.month}, {summaryData.year}
                  {selectedClaimType !== "ALL" && <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">Filtered: {selectedClaimType.toLowerCase().replace("_"," ")}</span>}
                </p>
                {summaryData.lecturerDesignation && <p className="text-white/50 text-xs mt-0.5">{summaryData.lecturerDesignation.replace(/_/g, " ")}</p>}
              </div>
              <Button onClick={handlePrintSummary} variant="ghost" className="gap-2 h-9 text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 border border-white/30 rounded-lg px-3.5">
                <Printer className="h-3.5 w-3.5" /> Print Summary
              </Button>
            </div>
          </div>

          <CardContent className="p-5 space-y-5">

            {/* ── D) Enhanced Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {summaryStatItems.map((stat) => (
                <div key={stat.label} className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/70 ${stat.lightBg} p-4 transition-all hover:shadow-md group`}>
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${stat.text}`}>{stat.value}</p>
                    </div>
                    <div className={`h-10 w-10 rounded-xl ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-5 w-5 ${stat.text}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── E) Highlights Strip ── */}
            {(summaryData.totalTeachingHours > 0 || summaryData.totalTransportAmount > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {summaryData.totalTeachingHours > 0 && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Approved Teaching Hours</p>
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{summaryData.totalTeachingHours.toFixed(1)} hrs</p>
                    </div>
                  </div>
                )}
                {summaryData.totalTransportAmount > 0 && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                      <Banknote className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">Approved Transport Amount</p>
                      <p className="text-lg font-bold text-amber-700 dark:text-amber-300">GHS {summaryData.totalTransportAmount.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── F) Claims List Upgrade ── */}
            {displayedClaims.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Claims in Period {selectedClaimType !== "ALL" ? `— ${selectedClaimType.toLowerCase().replace("_"," ")}` : ''} ({displayedClaims.length})
                  </h4>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {displayedClaims.map((claim, idx) => {
                      const sc = getStatusConfig(claim.status);
                      return (
                        <div key={claim.id} className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-violet-50/50 dark:hover:bg-violet-900/10 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900/20' : 'bg-slate-50/50 dark:bg-slate-800/30'} ${idx > 0 ? 'border-t border-slate-100 dark:border-slate-700/50' : ''}`}>
                          {/* Left border accent */}
                          <div className={`w-1 h-10 rounded-full self-stretch flex-shrink-0 ${claim.claimType === 'TEACHING' ? 'bg-blue-500' : claim.claimType === 'TRANSPORTATION' ? 'bg-amber-500' : 'bg-violet-500'}`} />
                          {/* Main content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`capitalize text-[10px] px-1.5 py-0 rounded-md font-medium border ${getTypeBadgeClasses(claim.claimType)}`}>
                                {claim.claimType?.toLowerCase().replace('_', ' ')}
                              </Badge>
                              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 truncate">{claim.id.substring(0,10)}...</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                              {new Date(claim.submittedAt).toLocaleDateString('en-US', dateLocaleStringOptions)}
                              {claim.claimType === 'TEACHING' && claim.courseCode ? ` • ${claim.courseCode}${claim.courseTitle ? ' — ' + claim.courseTitle : ''}` : ''}
                              {claim.claimType === 'TRANSPORTATION' && claim.transportAmount != null ? ` • GHS ${Number(claim.transportAmount).toFixed(2)}` : ''}
                              {claim.claimType === 'THESIS_PROJECT' && claim.thesisType ? ` • ${claim.thesisType}` : ''}
                            </p>
                          </div>
                          {/* Status */}
                          <span className="inline-flex items-center gap-1.5 flex-shrink-0">
                            <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
                            <span className={`text-xs font-medium capitalize ${sc.text}`}>{claim.status.toLowerCase()}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                <BarChartHorizontalBig className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 opacity-80" />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No claims of the selected type found for this period.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}