// app/(dashboard)/lecturer/center/[centerId]/submit-claim/page.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { submitNewClaim, getAssignedCoursesForLecturer } from '@/lib/actions/lecturer.actions.js';
import { getSession } from '@/lib/actions/auth.actions';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  PlusCircle, Trash2, Send, Loader2,
  CalendarClock, BookText, Hash, Car, Users, FileText, MapPin, DollarSign, Clock4,
  CalendarDays, Info, User, ArrowRightLeft, AlertCircle,
  ChevronLeft, ChevronRight, Check, GraduationCap, BookOpen,
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ZOD SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const supervisedStudentSchema = z.object({
  studentName: z.string().min(1, "Student name is required if a student entry is made.").optional().or(z.literal('')),
  thesisTitle: z.string().min(1, "Thesis title is required if a student entry is made.").optional().or(z.literal('')),
});

const claimFormSchema = z.object({
  claimType: z.enum(["TEACHING", "TRANSPORTATION", "THESIS_PROJECT"], { required_error: "Claim type is required." }),
  courseId: z.string().optional(),
  teachingDate: z.string().optional(),
  teachingStartTime: z.string().optional(),
  teachingEndTime: z.string().optional(),
  teachingHours: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.number({ invalid_type_error: "Hours must be a number." }).positive("Hours must be positive.").optional()
  ),
  transportToTeachingInDate: z.string().optional(),
  transportToTeachingFrom: z.string().optional(),
  transportToTeachingTo: z.string().optional(),
  transportToTeachingOutDate: z.string().optional(),
  transportToTeachingReturnFrom: z.string().optional(),
  transportToTeachingReturnTo: z.string().optional(),
  transportType: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  transportDestinationTo: z.string().optional(),
  transportDestinationFrom: z.string().optional(),
  transportRegNumber: z.string().optional(),
  transportCubicCapacity: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseInt(String(val), 10)),
    z.number({ invalid_type_error: "Cubic capacity must be a number." }).int("Capacity must be a whole number.").positive("Capacity must be positive.").optional()
  ),
  transportAmount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.number({ invalid_type_error: "Amount must be a number." }).positive("Amount must be positive.").optional()
  ),
  thesisType: z.enum(["SUPERVISION", "EXAMINATION"]).optional(),
  thesisSupervisionRank: z.enum(["PHD", "MPHIL", "MA", "MSC", "BED", "BSC", "BA", "ED"]).optional(),
  supervisedStudents: z.array(supervisedStudentSchema).optional(),
  thesisExamCourseCode: z.string().optional(),
  thesisExamDate: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.claimType === "TEACHING") {
    if (!data.courseId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "An assigned course must be selected.", path: ["courseId"] });
    if (!data.teachingDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teaching date is required.", path: ["teachingDate"] });
    if (!data.teachingStartTime) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start time is required.", path: ["teachingStartTime"] });
    if (!data.teachingEndTime) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End time is required.", path: ["teachingEndTime"] });
    if (data.teachingStartTime && data.teachingEndTime && data.teachingStartTime >= data.teachingEndTime) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End time must be after start time.", path: ["teachingEndTime"] });
    }
    const tFilled = [data.transportToTeachingInDate, data.transportToTeachingFrom, data.transportToTeachingTo].filter(Boolean).length;
    const rFilled = [data.transportToTeachingOutDate, data.transportToTeachingReturnFrom, data.transportToTeachingReturnTo].filter(Boolean).length;
    if (tFilled > 0 && tFilled < 3) {
      if (!data.transportToTeachingInDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "In-Date is required if other 'to venue' details are filled.", path: ["transportToTeachingInDate"] });
      if (!data.transportToTeachingFrom?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Origin is required if other 'to venue' details are filled.", path: ["transportToTeachingFrom"] });
      if (!data.transportToTeachingTo?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Destination is required if other 'to venue' details are filled.", path: ["transportToTeachingTo"] });
    }
    if (rFilled > 0 && rFilled < 3) {
      if (!data.transportToTeachingOutDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Out-Date for return is required.", path: ["transportToTeachingOutDate"] });
      if (!data.transportToTeachingReturnFrom?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Return From location is required.", path: ["transportToTeachingReturnFrom"] });
      if (!data.transportToTeachingReturnTo?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Return To location is required.", path: ["transportToTeachingReturnTo"] });
    }
  } else if (data.claimType === "TRANSPORTATION") {
    if (!data.transportType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Transport type is required.", path: ["transportType"] });
    if (!data.transportDestinationFrom?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Origin is required.", path: ["transportDestinationFrom"] });
    if (!data.transportDestinationTo?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Destination is required.", path: ["transportDestinationTo"] });
    if (data.transportType === "PRIVATE" && !data.transportRegNumber?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vehicle registration number is required for private transport.", path: ["transportRegNumber"] });
    }
  } else if (data.claimType === "THESIS_PROJECT") {
    if (!data.thesisType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thesis/Project type is required.", path: ["thesisType"] });
    if (data.thesisType === "SUPERVISION") {
      if (!data.thesisSupervisionRank) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Supervision rank is required.", path: ["thesisSupervisionRank"] });
      if (data.supervisedStudents?.length > 0) {
        data.supervisedStudents.forEach((student, index) => {
          const nameOk = student.studentName?.trim();
          const titleOk = student.thesisTitle?.trim();
          if (nameOk !== titleOk && (nameOk || titleOk)) {
            if (!nameOk) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Student name is required if thesis title is provided.", path: [`supervisedStudents.${index}.studentName`] });
            if (!titleOk) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thesis title is required if student name is provided.", path: [`supervisedStudents.${index}.thesisTitle`] });
          }
        });
      }
    }
    if (data.thesisType === "EXAMINATION" && !data.thesisExamCourseCode?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Exam course code is required.", path: ["thesisExamCourseCode"] });
    }
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS & HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";
const inputClass = "h-11 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg";
const errorBorderClass = "border-red-500 dark:border-red-600 focus-visible:ring-red-500";

const CLAIM_TYPES = [
  {
    value: "TEACHING",
    label: "Teaching",
    description: "Submit a claim for a teaching session at your assigned center",
    icon: CalendarClock,
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    ring: "ring-blue-500",
  },
  {
    value: "TRANSPORTATION",
    label: "Transportation",
    description: "Claim expenses for travel between campuses or study centers",
    icon: Car,
    gradient: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    ring: "ring-emerald-500",
  },
  {
    value: "THESIS_PROJECT",
    label: "Thesis / Project",
    description: "Submit claims for thesis supervision or examination activities",
    icon: GraduationCap,
    gradient: "from-violet-500 to-purple-600",
    lightBg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    ring: "ring-violet-500",
  },
];

const SUPERVISION_RANKS = [
  { value: "PHD", label: "PhD" }, { value: "MPHIL", label: "MPhil" },
  { value: "MA", label: "MA" }, { value: "MSC", label: "MSc" },
  { value: "BED", label: "BEd" }, { value: "BSC", label: "BSc" },
  { value: "BA", label: "BA" }, { value: "ED", label: "Ed" },
];

const getSteps = (claimType) => {
  const base = { 0: { label: "Claim Type", icon: BookOpen } };
  if (claimType === "TEACHING") return { ...base, 1: { label: "Teaching Details", icon: CalendarClock }, 2: { label: "Travel Info", icon: Car }, 3: { label: "Review & Submit", icon: Send } };
  if (claimType === "TRANSPORTATION") return { ...base, 1: { label: "Trip Details", icon: MapPin }, 2: { label: "Vehicle & Amount", icon: DollarSign }, 3: { label: "Review & Submit", icon: Send } };
  if (claimType === "THESIS_PROJECT") return { ...base, 1: { label: "Thesis Type", icon: FileText }, 2: { label: "Details", icon: Users }, 3: { label: "Review & Submit", icon: Send } };
  return { ...base, 1: { label: "Details", icon: Info }, 2: { label: "Additional", icon: Info }, 3: { label: "Review", icon: Send } };
};

const parseTime = (timeStr) => {
  if (!timeStr || !timeStr.match(/^\d{2}:\d{2}$/)) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return (h >= 0 && h <= 23 && m >= 0 && m <= 59) ? { hours: h, minutes: m } : null;
};

const fmtDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB-COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FieldWrapper({ children, label, htmlFor, required, error, icon: Icon }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        <span>{label}</span>
        {required && <span className="text-red-500 font-bold">*</span>}
      </Label>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ currentStep, steps, claimType }) {
  const typeConfig = CLAIM_TYPES.find(t => t.value === claimType);
  const accentGradient = typeConfig ? `bg-gradient-to-r ${typeConfig.gradient}` : "bg-gradient-to-r from-blue-500 to-indigo-600";
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto px-2">
      {Object.entries(steps).map(([idx, step], i) => {
        const stepNum = parseInt(idx);
        const isActive = currentStep === stepNum;
        const isCompleted = currentStep > stepNum;
        const StepIcon = step.icon;
        return (
          <div key={idx} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center">
              <div className={cn(
                "h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2",
                isCompleted && `${accentGradient} text-white border-transparent shadow-lg`,
                isActive && "bg-white dark:bg-slate-800 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20",
                !isActive && !isCompleted && "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500"
              )}>
                {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </div>
              <span className={cn(
                "text-[10px] sm:text-xs font-medium mt-2 text-center max-w-[70px] sm:max-w-[90px] leading-tight",
                isActive && "text-blue-600 dark:text-blue-400 font-semibold",
                isCompleted && "text-slate-600 dark:text-slate-300",
                !isActive && !isCompleted && "text-slate-400 dark:text-slate-500"
              )}>
                {step.label}
              </span>
            </div>
            {i < Object.entries(steps).length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2 sm:mx-4 rounded-full mb-6 transition-all duration-500",
                currentStep > stepNum ? accentGradient : "bg-slate-200 dark:bg-slate-700"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReviewItem({ label, value, icon: Icon }) {
  if (!value || value === 'N/A') return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      {Icon && <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />}
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-words">{value}</p>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function SubmitClaimPage() {
  const router = useRouter();
  const params = useParams();
  const centerId = params?.centerId;

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      claimType: undefined,
      courseId: undefined,
      teachingDate: "", teachingStartTime: "", teachingEndTime: "", teachingHours: undefined,
      transportToTeachingInDate: "", transportToTeachingFrom: "", transportToTeachingTo: "",
      transportToTeachingOutDate: "", transportToTeachingReturnFrom: "", transportToTeachingReturnTo: "",
      transportType: undefined, transportDestinationTo: "", transportDestinationFrom: "", transportRegNumber: "",
      transportCubicCapacity: undefined, transportAmount: undefined,
      thesisType: undefined, thesisSupervisionRank: undefined,
      supervisedStudents: [{ studentName: "", thesisTitle: "" }],
      thesisExamCourseCode: "", thesisExamDate: "",
    },
  });

  const { fields: supervisedStudentsFields, append: appendStudent, remove: removeStudent } = useFieldArray({ control: form.control, name: "supervisedStudents" });
  const { watch, setValue, getValues, register, control, handleSubmit, formState: { errors }, trigger } = form;

  const watchClaimType = watch("claimType");
  const watchThesisType = watch("thesisType");
  const watchTransportType = watch("transportType");
  const watchTeachingStartTime = watch("teachingStartTime");
  const watchTeachingEndTime = watch("teachingEndTime");
  const displayTeachingHours = watch("teachingHours");

  const steps = getSteps(watchClaimType);
  const typeConfig = CLAIM_TYPES.find(t => t.value === watchClaimType);

  // ── Auto-calculate teaching hours ──────────────────────────────────────
  const watchTeachingDate = watch("teachingDate");
  useEffect(() => {
    if (watchClaimType === "TEACHING" && watchTeachingDate && watchTeachingStartTime && watchTeachingEndTime) {
      const datePart = new Date(watchTeachingDate);
      const parsedStart = parseTime(watchTeachingStartTime);
      const parsedEnd = parseTime(watchTeachingEndTime);
      if (!isNaN(datePart.getTime()) && parsedStart && parsedEnd) {
        const startDT = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), parsedStart.hours, parsedStart.minutes);
        const endDT = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), parsedEnd.hours, parsedEnd.minutes);
        if (endDT > startDT) {
          setValue('teachingHours', parseFloat(((endDT - startDT) / 3600000).toFixed(2)), { shouldValidate: false, shouldDirty: true });
        } else { setValue('teachingHours', undefined, { shouldValidate: false, shouldDirty: true }); }
      } else { setValue('teachingHours', undefined, { shouldValidate: false, shouldDirty: true }); }
    } else if (getValues('teachingHours') !== undefined && watchClaimType !== "TEACHING") {
      setValue('teachingHours', undefined, { shouldValidate: false, shouldDirty: true });
    }
  }, [watchTeachingDate, watchTeachingStartTime, watchTeachingEndTime, watchClaimType, setValue, getValues]);

  // ── Fetch session + courses ────────────────────────────────────────────
  useEffect(() => {
    async function fetchInitialData() {
      setIsSessionLoading(true);
      try {
        const session = await getSession();
        if (session?.userId && (session?.role === 'LECTURER' || session?.role === 'COORDINATOR')) {
          setCurrentUser(session);
          try {
            const response = await fetch(`/api/users/${session.userId}/details`);
            if (response.ok) {
              const userData = await response.json();
              if (userData) {
                setCurrentUser(prev => ({ ...prev, bankName: userData.bankName, bankBranch: userData.bankBranch, accountName: userData.accountName, accountNumber: userData.accountNumber, phoneNumber: userData.phoneNumber }));
              }
            }
          } catch (e) { console.error("Error fetching user details:", e); }
          setIsCoursesLoading(true);
          const courseResult = await getAssignedCoursesForLecturer(session.userId);
          if (courseResult.success) { setAssignedCourses(courseResult.courses); }
          else { toast.error("Could not load your assigned courses."); setAssignedCourses([]); }
          setIsCoursesLoading(false);
        } else if (session?.userId) {
          toast.error("Access Denied: Only Lecturers or Coordinators can submit claims.");
          router.replace('/dashboard');
        } else { toast.error("Session not found. Please login."); router.replace('/login'); }
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Session error. Please try logging in again.");
        router.replace('/login');
      } finally { setIsSessionLoading(false); }
    }
    if (centerId) fetchInitialData();
    else { toast.error("Center information is missing from URL."); setIsSessionLoading(false); }
  }, [router, centerId]);

  // ── Step validation ────────────────────────────────────────────────────
  const validateCurrentStep = useCallback(async () => {
    if (currentStep === 0) return !!watchClaimType;
    if (currentStep === 1) {
      if (watchClaimType === "TEACHING") return await trigger(["courseId", "teachingDate", "teachingStartTime", "teachingEndTime"]);
      if (watchClaimType === "TRANSPORTATION") return await trigger(["transportType", "transportDestinationFrom", "transportDestinationTo"]);
      if (watchClaimType === "THESIS_PROJECT") return await trigger(["thesisType"]);
    }
    if (currentStep === 2) {
      if (watchClaimType === "TEACHING") {
        return await trigger(["transportToTeachingInDate", "transportToTeachingFrom", "transportToTeachingTo", "transportToTeachingOutDate", "transportToTeachingReturnFrom", "transportToTeachingReturnTo"]);
      }
      if (watchClaimType === "TRANSPORTATION") {
        const fields = ["transportAmount"];
        if (watchTransportType === "PRIVATE") fields.push("transportRegNumber");
        return await trigger(fields);
      }
      if (watchClaimType === "THESIS_PROJECT") {
        if (watchThesisType === "SUPERVISION") return await trigger(["thesisSupervisionRank"]);
        if (watchThesisType === "EXAMINATION") return await trigger(["thesisExamCourseCode"]);
      }
    }
    return true;
  }, [currentStep, watchClaimType, watchThesisType, watchTransportType, trigger]);

  const goNext = useCallback(async () => {
    const valid = await validateCurrentStep();
    if (valid) setCurrentStep(s => Math.min(s + 1, 3));
    else toast.error("Please fill in all required fields before proceeding.");
  }, [validateCurrentStep]);

  const goBack = useCallback(() => setCurrentStep(s => Math.max(s - 1, 0)), []);

  // ── Submit handler ─────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    if (!currentUser?.userId || !centerId) { toast.error("User or Center information is missing."); return; }
    setIsLoading(true);
    const claimPayload = {
      ...data, submittedById: currentUser.userId, centerId: String(centerId),
      transportCubicCapacity: data.transportCubicCapacity != null && String(data.transportCubicCapacity).trim() !== "" ? parseInt(String(data.transportCubicCapacity)) : null,
      transportAmount: data.transportAmount != null && String(data.transportAmount).trim() !== "" ? parseFloat(String(data.transportAmount)) : null,
    };
    if (data.claimType !== "THESIS_PROJECT" || data.thesisType !== "SUPERVISION" || !data.supervisedStudents) {
      delete claimPayload.supervisedStudents;
    } else {
      claimPayload.supervisedStudents = data.supervisedStudents.filter(s => s.studentName?.trim() || s.thesisTitle?.trim());
      if (claimPayload.supervisedStudents.length === 0) delete claimPayload.supervisedStudents;
    }
    const result = await submitNewClaim(claimPayload);
    setIsLoading(false);
    if (result.success) {
      toast.success("Claim submitted successfully!");
      form.reset();
      if (currentUser.role === 'COORDINATOR') router.push(`/coordinator/${centerId}/claims`);
      else router.push(`/lecturer/center/${centerId}/my-claims`);
    } else { toast.error(result.error || "Failed to submit claim."); }
  };

  const onError = () => toast.error("Please correct the errors in the form before submitting.");

  // ── Loading / error states ─────────────────────────────────────────────
  if (isSessionLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Loading your session...</p>
      </div>
    );
  }
  if (!centerId && !isSessionLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4 text-center p-6">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-red-700 dark:text-red-400">Center information missing from URL.</p>
        <Button onClick={() => router.push('/dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white">Go to Dashboard</Button>
      </div>
    );
  }
  if (!currentUser && !isSessionLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4 text-center p-6">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-red-700 dark:text-red-400">User session not available.</p>
        <Button onClick={() => router.push('/login')} className="bg-blue-600 hover:bg-blue-700 text-white">Login</Button>
      </div>
    );
  }

  const getSelectedCourse = () => assignedCourses.find(c => c.id === getValues("courseId"));

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg mb-3">
            <Send className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Submit New Claim</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Follow the steps below to submit your claim. All required fields must be filled.
          </p>
        </div>

        {/* ── Step Indicator ────────────────────────────────────────────── */}
        <StepIndicator currentStep={currentStep} steps={steps} claimType={watchClaimType} />

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit, onError)}>

          {/* ░░░ STEP 0 — Claim Type Picker ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="text-center mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200">What type of claim are you submitting?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select one to continue</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {CLAIM_TYPES.map((type) => {
                  const isSelected = watchClaimType === type.value;
                  const TypeIcon = type.icon;
                  return (
                    <button
                      type="button"
                      key={type.value}
                      onClick={() => {
                        const prev = getValues("claimType");
                        if (prev !== type.value) {
                          const defaults = form.formState.defaultValues;
                          form.reset({ ...defaults, claimType: type.value });
                        }
                      }}
                      className={cn(
                        "relative group text-left rounded-2xl p-5 sm:p-6 border-2 transition-all duration-300 cursor-pointer",
                        "hover:shadow-lg hover:-translate-y-0.5",
                        isSelected
                          ? `${type.border} ${type.lightBg} ring-2 ${type.ring} shadow-lg -translate-y-0.5`
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      {isSelected && (
                        <div className={cn("absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center text-white bg-gradient-to-br", type.gradient)}>
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div className={cn(
                        "inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4 transition-all",
                        isSelected ? `bg-gradient-to-br ${type.gradient} shadow-lg` : "bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                      )}>
                        <TypeIcon className={cn("h-6 w-6", isSelected ? "text-white" : "text-slate-500 dark:text-slate-400")} />
                      </div>
                      <h3 className={cn(
                        "text-base sm:text-lg font-bold mb-1.5",
                        isSelected ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"
                      )}>{type.label}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{type.description}</p>
                    </button>
                  );
                })}
              </div>
              {errors.claimType && (
                <div className="flex items-center justify-center gap-1.5 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" /><span>{errors.claimType.message}</span>
                </div>
              )}
            </div>
          )}

          {/* ░░░ STEP 1 — Core Details ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}
          {currentStep === 1 && (
            <Card className="border-slate-200 dark:border-slate-700 shadow-lg rounded-2xl overflow-hidden animate-fade-in-up">
              <div className={cn("h-1.5 w-full bg-gradient-to-r", typeConfig?.gradient || "from-blue-500 to-indigo-600")} />
              <CardContent className="p-5 sm:p-8 space-y-6">

                {/* ── TEACHING ─────────────────────────────────────────── */}
                {watchClaimType === "TEACHING" && (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                        <CalendarClock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Teaching Session Details</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Select your course and enter the session schedule</p>
                      </div>
                    </div>

                    <FieldWrapper label="Assigned Course" htmlFor="courseId" required error={errors.courseId} icon={BookText}>
                      <Controller name="courseId" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={isCoursesLoading}>
                          <SelectTrigger id="courseId" className={cn(inputClass, focusRingClass, errors.courseId ? errorBorderClass : "")}>
                            <SelectValue placeholder={isCoursesLoading ? "Loading courses..." : "Select a course"} />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            {assignedCourses.length > 0 ? assignedCourses.map(c => (
                              <SelectItem key={c.id} value={c.id} className="py-2.5">
                                <span className="font-medium">{c.courseCode}</span> &mdash; {c.courseTitle}
                              </SelectItem>
                            )) : (
                              <div className="px-3 py-2 text-sm text-slate-500">{isCoursesLoading ? "Loading..." : "No courses assigned."}</div>
                            )}
                          </SelectContent>
                        </Select>
                      )} />
                    </FieldWrapper>

                    <FieldWrapper label="Date of Teaching" htmlFor="teachingDate" required error={errors.teachingDate} icon={CalendarDays}>
                      <Input type="date" id="teachingDate" {...register("teachingDate")} className={cn(inputClass, focusRingClass, errors.teachingDate ? errorBorderClass : "")} />
                    </FieldWrapper>

                    <div className="grid grid-cols-2 gap-4">
                      <FieldWrapper label="Start Time" htmlFor="teachingStartTime" required error={errors.teachingStartTime} icon={Clock4}>
                        <Input type="time" id="teachingStartTime" {...register("teachingStartTime")} className={cn(inputClass, focusRingClass, errors.teachingStartTime ? errorBorderClass : "")} />
                      </FieldWrapper>
                      <FieldWrapper label="End Time" htmlFor="teachingEndTime" required error={errors.teachingEndTime} icon={Clock4}>
                        <Input type="time" id="teachingEndTime" {...register("teachingEndTime")} className={cn(inputClass, focusRingClass, errors.teachingEndTime ? errorBorderClass : "")} />
                      </FieldWrapper>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock4 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Contact Hours</span>
                        </div>
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {displayTeachingHours != null ? `${displayTeachingHours} hrs` : (watchTeachingStartTime && watchTeachingEndTime ? '...' : '\u2014')}
                        </div>
                      </div>
                      <p className="text-[11px] text-blue-600/70 dark:text-blue-400/70 mt-1">Auto-calculated from start and end times</p>
                    </div>
                  </>
                )}

                {/* ── TRANSPORTATION ───────────────────────────────────── */}
                {watchClaimType === "TRANSPORTATION" && (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
                        <Car className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Trip Details</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Enter the route and transport type</p>
                      </div>
                    </div>

                    <FieldWrapper label="Transport Type" htmlFor="transportType" required error={errors.transportType} icon={Car}>
                      <Controller name="transportType" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger id="transportType" className={cn(inputClass, focusRingClass, errors.transportType ? errorBorderClass : "")}>
                            <SelectValue placeholder="Select transport type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            <SelectItem value="PUBLIC">Public Transport</SelectItem>
                            <SelectItem value="PRIVATE">Private Vehicle</SelectItem>
                          </SelectContent>
                        </Select>
                      )} />
                    </FieldWrapper>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldWrapper label="Origin (From)" htmlFor="transportDestinationFrom" required error={errors.transportDestinationFrom} icon={MapPin}>
                        <Input id="transportDestinationFrom" placeholder="e.g., UEW Main Campus" {...register("transportDestinationFrom")} className={cn(inputClass, focusRingClass, errors.transportDestinationFrom ? errorBorderClass : "")} />
                      </FieldWrapper>
                      <FieldWrapper label="Destination (To)" htmlFor="transportDestinationTo" required error={errors.transportDestinationTo} icon={MapPin}>
                        <Input id="transportDestinationTo" placeholder="e.g., Kumasi Study Center" {...register("transportDestinationTo")} className={cn(inputClass, focusRingClass, errors.transportDestinationTo ? errorBorderClass : "")} />
                      </FieldWrapper>
                    </div>
                  </>
                )}

                {/* ── THESIS ──────────────────────────────────────────── */}
                {watchClaimType === "THESIS_PROJECT" && (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-md">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Thesis / Project Type</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Select the nature of your thesis activity</p>
                      </div>
                    </div>

                    <FieldWrapper label="Activity Type" htmlFor="thesisType" required error={errors.thesisType} icon={FileText}>
                      <Controller name="thesisType" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger id="thesisType" className={cn(inputClass, focusRingClass, errors.thesisType ? errorBorderClass : "")}>
                            <SelectValue placeholder="Select thesis/project type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            <SelectItem value="SUPERVISION">Thesis Supervision</SelectItem>
                            <SelectItem value="EXAMINATION">Thesis Examination</SelectItem>
                          </SelectContent>
                        </Select>
                      )} />
                    </FieldWrapper>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ░░░ STEP 2 — Additional Info ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}
          {currentStep === 2 && (
            <Card className="border-slate-200 dark:border-slate-700 shadow-lg rounded-2xl overflow-hidden animate-fade-in-up">
              <div className={cn("h-1.5 w-full bg-gradient-to-r", typeConfig?.gradient || "from-blue-500 to-indigo-600")} />
              <CardContent className="p-5 sm:p-8 space-y-6">

                {/* ── TEACHING — Travel ────────────────────────────────── */}
                {watchClaimType === "TEACHING" && (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl shadow-md">
                        <Car className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Travel Information</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Optional &mdash; fill in if you traveled to the teaching venue</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 space-y-4 border border-slate-200/60 dark:border-slate-700/60">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4 text-sky-500" /> Trip to Venue
                      </h4>
                      <FieldWrapper label="Travel Date" htmlFor="transportToTeachingInDate" error={errors.transportToTeachingInDate} icon={CalendarDays}>
                        <Input type="date" id="transportToTeachingInDate" {...register("transportToTeachingInDate")} className={cn(inputClass, focusRingClass, errors.transportToTeachingInDate ? errorBorderClass : "")} />
                      </FieldWrapper>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldWrapper label="From (Origin)" htmlFor="transportToTeachingFrom" error={errors.transportToTeachingFrom} icon={MapPin}>
                          <Input id="transportToTeachingFrom" placeholder="e.g., Home Address" {...register("transportToTeachingFrom")} className={cn(inputClass, focusRingClass, errors.transportToTeachingFrom ? errorBorderClass : "")} />
                        </FieldWrapper>
                        <FieldWrapper label="To (Venue)" htmlFor="transportToTeachingTo" error={errors.transportToTeachingTo} icon={MapPin}>
                          <Input id="transportToTeachingTo" placeholder="e.g., Campus Hall A" {...register("transportToTeachingTo")} className={cn(inputClass, focusRingClass, errors.transportToTeachingTo ? errorBorderClass : "")} />
                        </FieldWrapper>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 space-y-4 border border-slate-200/60 dark:border-slate-700/60">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4 text-sky-500" /> Return Trip
                      </h4>
                      <FieldWrapper label="Return Date" htmlFor="transportToTeachingOutDate" error={errors.transportToTeachingOutDate} icon={CalendarDays}>
                        <Input type="date" id="transportToTeachingOutDate" {...register("transportToTeachingOutDate")} className={cn(inputClass, focusRingClass, errors.transportToTeachingOutDate ? errorBorderClass : "")} />
                      </FieldWrapper>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldWrapper label="From (Venue)" htmlFor="transportToTeachingReturnFrom" error={errors.transportToTeachingReturnFrom} icon={MapPin}>
                          <Input id="transportToTeachingReturnFrom" placeholder="e.g., Campus Hall A" {...register("transportToTeachingReturnFrom")} className={cn(inputClass, focusRingClass, errors.transportToTeachingReturnFrom ? errorBorderClass : "")} />
                        </FieldWrapper>
                        <FieldWrapper label="To (Destination)" htmlFor="transportToTeachingReturnTo" error={errors.transportToTeachingReturnTo} icon={MapPin}>
                          <Input id="transportToTeachingReturnTo" placeholder="e.g., Home Address" {...register("transportToTeachingReturnTo")} className={cn(inputClass, focusRingClass, errors.transportToTeachingReturnTo ? errorBorderClass : "")} />
                        </FieldWrapper>
                      </div>
                    </div>

                    <div className="bg-sky-50 dark:bg-sky-950/20 rounded-xl p-4 border border-sky-100 dark:border-sky-900/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4 text-sky-500" />
                        <span className="text-sm font-medium text-sky-800 dark:text-sky-300">Distance (KM)</span>
                      </div>
                      <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">System Calculated</span>
                    </div>
                  </>
                )}

                {/* ── TRANSPORTATION — Vehicle & Amount ────────────────── */}
                {watchClaimType === "TRANSPORTATION" && (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Vehicle Details & Amount</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {watchTransportType === "PRIVATE" ? "Enter your vehicle information and claim amount" : "Enter the amount you are claiming"}
                        </p>
                      </div>
                    </div>

                    {watchTransportType === "PRIVATE" && (
                      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 space-y-4 border border-slate-200/60 dark:border-slate-700/60">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Car className="h-4 w-4 text-emerald-500" /> Private Vehicle Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FieldWrapper label="Registration Number" htmlFor="transportRegNumber" required error={errors.transportRegNumber} icon={Hash}>
                            <Input id="transportRegNumber" placeholder="e.g., GR-1234-20" {...register("transportRegNumber")} className={cn(inputClass, focusRingClass, errors.transportRegNumber ? errorBorderClass : "")} />
                          </FieldWrapper>
                          <FieldWrapper label="Engine Capacity (cc)" htmlFor="transportCubicCapacity" error={errors.transportCubicCapacity} icon={Info}>
                            <Input id="transportCubicCapacity" type="number" placeholder="e.g., 1500" {...register("transportCubicCapacity")} className={cn(inputClass, focusRingClass, errors.transportCubicCapacity ? errorBorderClass : "")} />
                          </FieldWrapper>
                        </div>
                      </div>
                    )}

                    <FieldWrapper label="Amount Claimed (GHS)" htmlFor="transportAmount" error={errors.transportAmount} icon={DollarSign}>
                      <Input id="transportAmount" type="number" step="0.01" placeholder="e.g., 150.00" {...register("transportAmount")} className={cn(inputClass, focusRingClass, errors.transportAmount ? errorBorderClass : "")} />
                    </FieldWrapper>
                  </>
                )}

                {/* ── THESIS — Supervision / Examination ──────────────── */}
                {watchClaimType === "THESIS_PROJECT" && (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-md">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                          {watchThesisType === "SUPERVISION" ? "Supervision Details" : watchThesisType === "EXAMINATION" ? "Examination Details" : "Details"}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {watchThesisType === "SUPERVISION" ? "Select rank and add supervised students" : "Enter examination course information"}
                        </p>
                      </div>
                    </div>

                    {watchThesisType === "SUPERVISION" && (
                      <>
                        <FieldWrapper label="Academic Level" htmlFor="thesisSupervisionRank" required error={errors.thesisSupervisionRank} icon={GraduationCap}>
                          <Controller name="thesisSupervisionRank" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <SelectTrigger id="thesisSupervisionRank" className={cn(inputClass, focusRingClass, errors.thesisSupervisionRank ? errorBorderClass : "")}>
                                <SelectValue placeholder="Select academic level" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                {SUPERVISION_RANKS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )} />
                        </FieldWrapper>

                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <Users className="h-4 w-4 text-violet-500" /> Supervised Students
                            </h4>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendStudent({ studentName: "", thesisTitle: "" })}
                              className="text-violet-600 border-violet-300 hover:bg-violet-50 dark:text-violet-400 dark:border-violet-700 dark:hover:bg-violet-900/20 gap-1.5 text-xs">
                              <PlusCircle className="h-3.5 w-3.5" /> Add Student
                            </Button>
                          </div>
                          {supervisedStudentsFields.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">No students added. Click &quot;Add Student&quot; above.</p>
                          )}
                          <div className="space-y-3">
                            {supervisedStudentsFields.map((field, index) => (
                              <div key={field.id} className="bg-white dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Student {index + 1}</span>
                                  <Button type="button" variant="ghost" size="sm" onClick={() => removeStudent(index)}
                                    className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <FieldWrapper label="Student Name" htmlFor={`supervisedStudents.${index}.studentName`} error={errors.supervisedStudents?.[index]?.studentName} icon={User}>
                                    <Input id={`supervisedStudents.${index}.studentName`} placeholder="Full name" {...register(`supervisedStudents.${index}.studentName`)} className={cn(inputClass, focusRingClass, errors.supervisedStudents?.[index]?.studentName ? errorBorderClass : "")} />
                                  </FieldWrapper>
                                  <FieldWrapper label="Thesis Title" htmlFor={`supervisedStudents.${index}.thesisTitle`} error={errors.supervisedStudents?.[index]?.thesisTitle} icon={BookText}>
                                    <Input id={`supervisedStudents.${index}.thesisTitle`} placeholder="Thesis/project title" {...register(`supervisedStudents.${index}.thesisTitle`)} className={cn(inputClass, focusRingClass, errors.supervisedStudents?.[index]?.thesisTitle ? errorBorderClass : "")} />
                                  </FieldWrapper>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {watchThesisType === "EXAMINATION" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldWrapper label="Course Code" htmlFor="thesisExamCourseCode" required error={errors.thesisExamCourseCode} icon={Hash}>
                          <Input id="thesisExamCourseCode" placeholder="e.g., EDUC 650" {...register("thesisExamCourseCode")} className={cn(inputClass, focusRingClass, errors.thesisExamCourseCode ? errorBorderClass : "")} />
                        </FieldWrapper>
                        <FieldWrapper label="Examination Date" htmlFor="thesisExamDate" error={errors.thesisExamDate} icon={CalendarDays}>
                          <Input id="thesisExamDate" type="date" {...register("thesisExamDate")} className={cn(inputClass, focusRingClass, errors.thesisExamDate ? errorBorderClass : "")} />
                        </FieldWrapper>
                      </div>
                    )}

                    {!watchThesisType && (
                      <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Please go back and select a thesis/project type first.</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ░░░ STEP 3 — Review & Submit ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in-up">
              <div className="text-center mb-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">Review Your Claim</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Please verify all details before submitting</p>
              </div>

              {typeConfig && (
                <div className={cn("rounded-2xl overflow-hidden border shadow-lg", typeConfig.border)}>
                  <div className={cn("bg-gradient-to-r p-4 sm:p-5 flex items-center gap-3", typeConfig.gradient)}>
                    <typeConfig.icon className="h-6 w-6 text-white" />
                    <div>
                      <h3 className="text-white font-bold text-lg">{typeConfig.label} Claim</h3>
                      <p className="text-white/80 text-xs">{typeConfig.description}</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 divide-y divide-slate-100 dark:divide-slate-700/50">
                    {/* TEACHING Review */}
                    {watchClaimType === "TEACHING" && (() => {
                      const course = getSelectedCourse();
                      const vals = getValues();
                      return (
                        <>
                          <ReviewItem label="Course" value={course ? `${course.courseCode} \u2014 ${course.courseTitle}` : null} icon={BookText} />
                          <ReviewItem label="Teaching Date" value={fmtDate(vals.teachingDate)} icon={CalendarDays} />
                          <ReviewItem label="Time" value={vals.teachingStartTime && vals.teachingEndTime ? `${vals.teachingStartTime} \u2014 ${vals.teachingEndTime}` : null} icon={Clock4} />
                          <ReviewItem label="Contact Hours" value={displayTeachingHours != null ? `${displayTeachingHours} hours` : null} icon={Info} />
                          {(vals.transportToTeachingFrom || vals.transportToTeachingTo) && (
                            <>
                              <div className="pt-3 pb-1"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Travel to Venue</span></div>
                              <ReviewItem label="Travel Date" value={fmtDate(vals.transportToTeachingInDate)} icon={CalendarDays} />
                              <ReviewItem label="Route" value={vals.transportToTeachingFrom && vals.transportToTeachingTo ? `${vals.transportToTeachingFrom} \u2192 ${vals.transportToTeachingTo}` : null} icon={MapPin} />
                            </>
                          )}
                          {(vals.transportToTeachingReturnFrom || vals.transportToTeachingReturnTo) && (
                            <>
                              <div className="pt-3 pb-1"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Return Trip</span></div>
                              <ReviewItem label="Return Date" value={fmtDate(vals.transportToTeachingOutDate)} icon={CalendarDays} />
                              <ReviewItem label="Route" value={vals.transportToTeachingReturnFrom && vals.transportToTeachingReturnTo ? `${vals.transportToTeachingReturnFrom} \u2192 ${vals.transportToTeachingReturnTo}` : null} icon={MapPin} />
                            </>
                          )}
                        </>
                      );
                    })()}

                    {/* TRANSPORTATION Review */}
                    {watchClaimType === "TRANSPORTATION" && (() => {
                      const vals = getValues();
                      return (
                        <>
                          <ReviewItem label="Transport Type" value={vals.transportType === "PRIVATE" ? "Private Vehicle" : vals.transportType === "PUBLIC" ? "Public Transport" : null} icon={Car} />
                          <ReviewItem label="Route" value={vals.transportDestinationFrom && vals.transportDestinationTo ? `${vals.transportDestinationFrom} \u2192 ${vals.transportDestinationTo}` : null} icon={MapPin} />
                          {vals.transportType === "PRIVATE" && (
                            <>
                              <ReviewItem label="Reg. Number" value={vals.transportRegNumber} icon={Hash} />
                              <ReviewItem label="Engine Capacity" value={vals.transportCubicCapacity ? `${vals.transportCubicCapacity} cc` : null} icon={Info} />
                            </>
                          )}
                          <ReviewItem label="Amount Claimed" value={vals.transportAmount ? `GHS ${parseFloat(vals.transportAmount).toFixed(2)}` : null} icon={DollarSign} />
                        </>
                      );
                    })()}

                    {/* THESIS Review */}
                    {watchClaimType === "THESIS_PROJECT" && (() => {
                      const vals = getValues();
                      return (
                        <>
                          <ReviewItem label="Activity Type" value={vals.thesisType === "SUPERVISION" ? "Thesis Supervision" : vals.thesisType === "EXAMINATION" ? "Thesis Examination" : null} icon={FileText} />
                          {vals.thesisType === "SUPERVISION" && (
                            <>
                              <ReviewItem label="Academic Level" value={SUPERVISION_RANKS.find(r => r.value === vals.thesisSupervisionRank)?.label} icon={GraduationCap} />
                              {vals.supervisedStudents?.filter(s => s.studentName?.trim()).length > 0 && (
                                <div className="py-3">
                                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Supervised Students</p>
                                  <div className="space-y-2">
                                    {vals.supervisedStudents.filter(s => s.studentName?.trim()).map((s, i) => (
                                      <div key={i} className="bg-violet-50 dark:bg-violet-950/20 rounded-lg px-3 py-2 border border-violet-100 dark:border-violet-900/30">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.studentName}</p>
                                        {s.thesisTitle && <p className="text-xs text-slate-500 dark:text-slate-400">{s.thesisTitle}</p>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          {vals.thesisType === "EXAMINATION" && (
                            <>
                              <ReviewItem label="Course Code" value={vals.thesisExamCourseCode} icon={Hash} />
                              <ReviewItem label="Exam Date" value={fmtDate(vals.thesisExamDate)} icon={CalendarDays} />
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {currentUser && (
                <Card className="border-amber-200 dark:border-amber-800/50 rounded-2xl overflow-hidden shadow-md">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-3.5 flex items-center gap-2.5">
                    <DollarSign className="h-5 w-5 text-white" />
                    <h3 className="text-white font-bold">Payment Information</h3>
                  </div>
                  <CardContent className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                      <ReviewItem label="Bank Name" value={currentUser.bankName || "Not provided"} icon={Info} />
                      <ReviewItem label="Bank Branch" value={currentUser.bankBranch || "Not provided"} icon={Info} />
                      <ReviewItem label="Account Name" value={currentUser.accountName || "Not provided"} icon={User} />
                      <ReviewItem label="Account Number" value={currentUser.accountNumber || "Not provided"} icon={Hash} />
                      <ReviewItem label="Phone Number" value={currentUser.phoneNumber || "Not provided"} icon={Info} />
                    </div>
                    {(!currentUser.bankName || !currentUser.accountNumber || !currentUser.phoneNumber) && (
                      <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/40">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">Some payment details are missing. Update your profile for faster processing.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── Navigation Buttons ───────────────────────────────────── */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-200 dark:border-slate-700">
            {currentStep > 0 ? (
              <Button type="button" variant="outline" onClick={goBack}
                className="gap-2 h-11 px-5 rounded-xl text-sm font-medium border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              currentUser?.role === 'COORDINATOR' ? (
                <Button type="button" variant="outline" onClick={() => router.push(`/coordinator/${centerId}`)}
                  className="gap-2 h-11 px-5 rounded-xl text-sm font-medium border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <ChevronLeft className="h-4 w-4" /> Dashboard
                </Button>
              ) : <div />
            )}

            {currentStep < 3 ? (
              <Button type="button" onClick={goNext}
                disabled={currentStep === 0 && !watchClaimType}
                className={cn(
                  "gap-2 h-11 px-6 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all",
                  typeConfig ? `bg-gradient-to-r ${typeConfig.gradient} hover:brightness-110` : "bg-gradient-to-r from-blue-600 to-indigo-700"
                )}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || isSessionLoading}
                className="gap-2.5 h-11 px-8 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all min-w-[180px] justify-center">
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="h-4 w-4" /> Submit Claim</>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
      <Toaster richColors position="top-center" duration={4000} />
    </div>
  );
}
