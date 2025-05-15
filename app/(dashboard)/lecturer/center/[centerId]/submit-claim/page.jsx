// app/(dashboard)/lecturer/center/[centerId]/submit-claim/page.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitNewClaim } from '@/lib/actions/lecturer.actions.js';
import { getSession } from '@/lib/actions/auth.actions';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { 
    PlusCircle, Trash2, Send, Loader2, 
    CalendarClock, BookText, Hash, Car, Users, FileText, MapPin, Palette, DollarSign, Clock4, 
    CalendarDays, Info, User, ArrowRightLeft, AlertCircle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Zod Schema for Validation
const supervisedStudentSchema = z.object({
  studentName: z.string().min(1, "Student name is required if a student entry is made.").optional().or(z.literal('')),
  thesisTitle: z.string().min(1, "Thesis title is required if a student entry is made.").optional().or(z.literal('')),
});

const claimFormSchema = z.object({
  claimType: z.enum(["TEACHING", "TRANSPORTATION", "THESIS_PROJECT"], {
    required_error: "Claim type is required.",
  }),
  // Teaching fields
  courseCode: z.string().optional(),      
  courseTitle: z.string().optional(),     
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
  
  // Transportation fields
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

  // Thesis/Project fields
  thesisType: z.enum(["SUPERVISION", "EXAMINATION"]).optional(),
  thesisSupervisionRank: z.enum(["PHD", "MPHIL", "MA", "MSC", "BED", "BSC", "BA", "ED"]).optional(),
  supervisedStudents: z.array(supervisedStudentSchema).optional(),
  thesisExamCourseCode: z.string().optional(),
  thesisExamDate: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.claimType === "TEACHING") {
    if (!data.courseCode?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Course code is required.", path: ["courseCode"] });
    if (!data.courseTitle?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Course title is required.", path: ["courseTitle"] });
    if (!data.teachingDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teaching date is required.", path: ["teachingDate"] });
    if (!data.teachingStartTime) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start time is required.", path: ["teachingStartTime"] });
    if (!data.teachingEndTime) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End time is required.", path: ["teachingEndTime"] });
    if (data.teachingStartTime && data.teachingEndTime && data.teachingStartTime >= data.teachingEndTime) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End time must be after start time.", path: ["teachingEndTime"] });
    }
    const teachingTransportFieldsFilled = [
        data.transportToTeachingInDate, data.transportToTeachingFrom, data.transportToTeachingTo,
    ].filter(Boolean).length;
    const teachingTransportReturnFieldsFilled = [
        data.transportToTeachingOutDate, data.transportToTeachingReturnFrom, data.transportToTeachingReturnTo
    ].filter(Boolean).length;

    if (teachingTransportFieldsFilled > 0 && teachingTransportFieldsFilled < 3) { 
        if (!data.transportToTeachingInDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "In-Date for teaching transport (to venue) is required if other 'to venue' details are filled.", path: ["transportToTeachingInDate"] });
        if (!data.transportToTeachingFrom?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Origin (From) for teaching transport (to venue) is required if other 'to venue' details are filled.", path: ["transportToTeachingFrom"] });
        if (!data.transportToTeachingTo?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Destination (To) for teaching transport (to venue) is required if other 'to venue' details are filled.", path: ["transportToTeachingTo"] });
    }
    if (teachingTransportReturnFieldsFilled > 0 && teachingTransportReturnFieldsFilled < 3) { 
        if (!data.transportToTeachingOutDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Out-Date for teaching transport (return) is required if other return details are filled.", path: ["transportToTeachingOutDate"] });
        if (!data.transportToTeachingReturnFrom?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Return From location for teaching transport is required if other return details are filled.", path: ["transportToTeachingReturnFrom"] });
        if (!data.transportToTeachingReturnTo?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Return To location for teaching transport is required if other return details are filled.", path: ["transportToTeachingReturnTo"] });
    }

  } else if (data.claimType === "TRANSPORTATION") {
    if (!data.transportType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Transport type is required.", path: ["transportType"] });
    if (!data.transportDestinationFrom?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Origin is required.", path: ["transportDestinationFrom"] });
    if (!data.transportDestinationTo?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Destination is required.", path: ["transportDestinationTo"] });
    if (data.transportType === "PRIVATE" && !data.transportRegNumber?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vehicle registration number is required for private transport.", path: ["transportRegNumber"]});
    }
  } else if (data.claimType === "THESIS_PROJECT") {
    if (!data.thesisType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thesis/Project type is required.", path: ["thesisType"] });
    if (data.thesisType === "SUPERVISION") {
        if (!data.thesisSupervisionRank) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Supervision rank is required.", path: ["thesisSupervisionRank"] });
        }
        if (data.supervisedStudents && data.supervisedStudents.length > 0) {
            data.supervisedStudents.forEach((student, index) => {
                const studentNameProvided = student.studentName && student.studentName.trim() !== "";
                const thesisTitleProvided = student.thesisTitle && student.thesisTitle.trim() !== "";
                if (studentNameProvided !== thesisTitleProvided && (studentNameProvided || thesisTitleProvided) ) { 
                    if (!studentNameProvided) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Student name is required if thesis title is provided.", path: [`supervisedStudents.${index}.studentName`] });
                    if (!thesisTitleProvided) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thesis title is required if student name is provided.", path: [`supervisedStudents.${index}.thesisTitle`] });
                }
            });
        }
    }
    if (data.thesisType === "EXAMINATION" && !data.thesisExamCourseCode?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Exam course code is required.", path: ["thesisExamCourseCode"] });
    }
  }
});

const inputBaseClass = "mt-1 bg-white dark:bg-slate-800 text-sm border-slate-300 dark:border-slate-700";
const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";
const errorBorderClass = "border-red-500 dark:border-red-600 focus-visible:ring-red-500";
const normalBorderClass = "border-gray-300 dark:border-gray-700";

const FieldWrapper = ({ children, label, htmlFor, required, error, icon: Icon, description }) => (
  <div className="space-y-1.5">
    <Label htmlFor={htmlFor} className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center">
      {Icon && <Icon className="mr-2 h-4 w-4 text-violet-600 dark:text-violet-500 flex-shrink-0" />}
      {label} {required && <span className="text-red-600 dark:text-red-500 ml-1">*</span>}
    </Label>
    {description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">{description}</p>}
    {children}
    {error && <p className="text-xs text-red-600 dark:text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5"/>{error.message}</p>}
  </div>
);

const parseTime = (timeStr) => {
  if (!timeStr || !timeStr.match(/^\d{2}:\d{2}$/)) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
    return { hours, minutes };
  }
  return null;
};

export default function SubmitClaimPage() {
  const router = useRouter();
  const params = useParams();
  const centerId = params?.centerId;

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      claimType: undefined,
      courseCode: "", courseTitle: "", 
      teachingDate: "", teachingStartTime: "", teachingEndTime: "", teachingHours: undefined,
      transportToTeachingInDate: "", transportToTeachingFrom: "", transportToTeachingTo: "",
      transportToTeachingOutDate: "", transportToTeachingReturnFrom: "", transportToTeachingReturnTo: "",
      transportType: undefined, transportDestinationTo: "", transportDestinationFrom: "", transportRegNumber: "", 
      transportCubicCapacity: undefined, transportAmount: undefined,
      thesisType: undefined, thesisSupervisionRank: undefined, supervisedStudents: [{ studentName: "", thesisTitle: "" }], 
      thesisExamCourseCode: "", thesisExamDate: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "supervisedStudents" });
  const { watch, setValue, getValues, register, control, handleSubmit, formState: { errors } } = form;

  const watchClaimType = watch("claimType");
  const watchThesisType = watch("thesisType");
  const watchTransportType = watch("transportType");
  const watchTeachingDate = watch("teachingDate");
  const watchTeachingStartTime = watch("teachingStartTime");
  const watchTeachingEndTime = watch("teachingEndTime");
  const displayTeachingHours = watch("teachingHours");

  useEffect(() => {
    if (watchClaimType === "TEACHING" && watchTeachingDate && watchTeachingStartTime && watchTeachingEndTime) {
      const datePart = new Date(watchTeachingDate); 
      const parsedStartTime = parseTime(watchTeachingStartTime);
      const parsedEndTime = parseTime(watchTeachingEndTime);
      if (!isNaN(datePart.getTime()) && parsedStartTime && parsedEndTime) {
        const startDateTime = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), parsedStartTime.hours, parsedStartTime.minutes);
        const endDateTime = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), parsedEndTime.hours, parsedEndTime.minutes);
        if (endDateTime.getTime() > startDateTime.getTime()) {
          const durationMs = endDateTime.getTime() - startDateTime.getTime();
          const hours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
          setValue('teachingHours', hours, { shouldValidate: false, shouldDirty: true }); // Mark as dirty for display
        } else { setValue('teachingHours', undefined, { shouldValidate: false, shouldDirty: true }); }
      } else { setValue('teachingHours', undefined, { shouldValidate: false, shouldDirty: true }); }
    } else if (getValues('teachingHours') !== undefined && watchClaimType !== "TEACHING") {
      setValue('teachingHours', undefined, { shouldValidate: false, shouldDirty: true });
    }
  }, [watchTeachingDate, watchTeachingStartTime, watchTeachingEndTime, watchClaimType, setValue, getValues]);

  useEffect(() => {
    async function fetchAndSetUser() {
      setIsSessionLoading(true);
      try {
        const session = await (async () => getSession())();
        if (session?.userId && (session?.role === 'LECTURER' || session?.role === 'COORDINATOR')) { // Allow Coordinators to submit too
          setCurrentUser(session);
        } else if (session?.userId) {
            toast.error("Access Denied: Only Lecturers or Coordinators can submit claims.");
            router.replace('/dashboard'); 
        } else {
          toast.error("Session not found. Please login.");
          router.replace('/login');
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Session error. Please try logging in again.");
        router.replace('/login');
      } finally {
        setIsSessionLoading(false);
      }
    }
    if (centerId) { fetchAndSetUser(); } 
    else { toast.error("Center information is missing from URL."); setIsSessionLoading(false); }
  }, [router, centerId]);

  const onSubmit = async (data) => {
    if (!currentUser?.userId || !centerId) { toast.error("User or Center information is missing."); return; }
    setIsLoading(true);
    const claimPayload = {
      ...data, submittedById: currentUser.userId, centerId: String(centerId),
      transportCubicCapacity: data.transportCubicCapacity !== undefined && data.transportCubicCapacity !== null && String(data.transportCubicCapacity).trim() !== "" ? parseInt(String(data.transportCubicCapacity)) : null,
      transportAmount: data.transportAmount !== undefined && data.transportAmount !== null && String(data.transportAmount).trim() !== "" ? parseFloat(String(data.transportAmount)) : null,
    };
    if (data.claimType !== "THESIS_PROJECT" || data.thesisType !== "SUPERVISION" || !data.supervisedStudents) {
        delete claimPayload.supervisedStudents;
    } else {
        claimPayload.supervisedStudents = data.supervisedStudents.filter(s => s.studentName?.trim() || s.thesisTitle?.trim());
        if (claimPayload.supervisedStudents.length === 0) delete claimPayload.supervisedStudents;
    }
    // teachingHours is part of 'data' and will be sent; server action recalculates for TEACHING claims
    const result = await submitNewClaim(claimPayload);
    setIsLoading(false);
    if (result.success) {
      toast.success("Claim submitted successfully!");
      form.reset(); // Reset to defaultValues
      router.push(`/lecturer/center/${centerId}/my-claims`);
    } else { toast.error(result.error || "Failed to submit claim."); }
  };
  
  const onError = (formErrors) => { /* ... same as before ... */ };

  if (isSessionLoading) { return ( <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-blue-700 dark:text-blue-300 p-4"> <Loader2 className="h-10 w-10 animate-spin mb-4" /> <p className="text-lg font-medium">Loading your session...</p> </div> ); }
  if (!centerId && !isSessionLoading) { return ( <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-red-700 dark:text-red-400 p-4"> <p className="text-lg font-medium text-center">Center information missing from URL.<br/>Please navigate from your dashboard.</p><Button onClick={() => router.push('/dashboard')} className="mt-4 bg-blue-700 hover:bg-blue-800 text-white">Go to Dashboard</Button></div> ); }
  if (!currentUser && !isSessionLoading) { return ( <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-red-700 dark:text-red-400 p-4"> <p className="text-lg font-medium">User session not available. Please login.</p><Button onClick={() => router.push('/login')} className="mt-4 bg-blue-700 hover:bg-blue-800 text-white">Login</Button> </div> ); }

  return (
    <div className="space-y-8 pb-20 max-w-3xl mx-auto px-3 sm:px-0">
      <Card className="border-slate-200 dark:border-slate-700/70 shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-blue-700 via-violet-700 to-indigo-700 dark:from-blue-800 dark:via-violet-800 dark:to-indigo-800 text-white rounded-none p-5 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2.5"><Send className="h-5 w-5 sm:h-6 sm:w-6" /> Submit New Claim</CardTitle>
          <CardDescription className="text-blue-100/80 text-sm mt-1.5">Fill the form accurately. Fields marked <span className="text-red-300 font-semibold">*</span> are required for the selected claim type.</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <CardContent className="p-5 sm:p-6 lg:p-8 space-y-8">
            <FieldWrapper label="Claim Type" htmlFor="claimType" required error={errors.claimType} icon={Palette}>
              <Controller name="claimType" control={control} render={({ field }) => (
                <Select 
                  onValueChange={(value) => { 
                    field.onChange(value); 
                    const defaultFormValues = form.formState.defaultValues;
                    form.reset({ ...defaultFormValues, claimType: value }); 
                  }} 
                  value={field.value || ""}
                >
                  <SelectTrigger id="claimType" className={`${inputBaseClass} ${focusRingClass} ${errors.claimType ? errorBorderClass : normalBorderClass}`}><SelectValue placeholder="Select claim type" /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"><SelectItem value="TEACHING">Teaching</SelectItem><SelectItem value="TRANSPORTATION">Transportation</SelectItem><SelectItem value="THESIS_PROJECT">Thesis/Project</SelectItem></SelectContent>
                </Select>
              )} />
            </FieldWrapper>

            {watchClaimType && (
              <div className="space-y-8 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                {watchClaimType === "TEACHING" && (
                  <>
                    <div className="space-y-5 p-5 border border-blue-200 dark:border-blue-800/60 rounded-xl bg-blue-50/30 dark:bg-slate-800/40 shadow-sm">
                      <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2.5 border-b border-blue-200 dark:border-blue-700 pb-3 mb-5">
                        <CalendarClock className="h-5 w-5"/> Teaching Session Details
                      </h3>
                      <FieldWrapper label="Course Code" htmlFor="courseCode" required error={errors.courseCode} icon={Hash}>
                        <Input id="courseCode" {...register("courseCode")} placeholder="e.g., EDTE 401" className={`${inputBaseClass} ${focusRingClass} ${errors.courseCode ? errorBorderClass : normalBorderClass}`} />
                      </FieldWrapper>
                      <FieldWrapper label="Course Title" htmlFor="courseTitle" required error={errors.courseTitle} icon={BookText}>
                        <Input id="courseTitle" {...register("courseTitle")} placeholder="e.g., Advanced Programming" className={`${inputBaseClass} ${focusRingClass} ${errors.courseTitle ? errorBorderClass : normalBorderClass}`} />
                      </FieldWrapper>
                      <FieldWrapper label="Date of Teaching" htmlFor="teachingDate" required error={errors.teachingDate} icon={CalendarDays}>
                        <Input type="date" id="teachingDate" {...register("teachingDate")} className={`${inputBaseClass} ${focusRingClass} ${errors.teachingDate ? errorBorderClass : normalBorderClass}`} />
                      </FieldWrapper>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FieldWrapper label="Start Time" htmlFor="teachingStartTime" required error={errors.teachingStartTime} icon={Clock4}>
                          <Input type="time" id="teachingStartTime" {...register("teachingStartTime")} className={`${inputBaseClass} ${focusRingClass} ${errors.teachingStartTime ? errorBorderClass : normalBorderClass}`} />
                        </FieldWrapper>
                        <FieldWrapper label="End Time" htmlFor="teachingEndTime" required error={errors.teachingEndTime} icon={Clock4}>
                          <Input type="time" id="teachingEndTime" {...register("teachingEndTime")} className={`${inputBaseClass} ${focusRingClass} ${errors.teachingEndTime ? errorBorderClass : normalBorderClass}`} />
                        </FieldWrapper>
                      </div>
                      <FieldWrapper label="Calculated Contact Hours" htmlFor="displayTeachingHours" icon={Info} description="Auto-calculated from start/end times.">
                          <Input type="text" id="displayTeachingHours" value={displayTeachingHours !== undefined && displayTeachingHours !== null ? `${displayTeachingHours} hours` : (watchTeachingStartTime && watchTeachingEndTime ? 'Calculating...' : 'N/A (Provide times)')} readOnly className={`${inputBaseClass} ${focusRingClass} ${normalBorderClass} text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 cursor-default`}/>
                      </FieldWrapper>
                    </div>

                    <div className="space-y-5 p-5 mt-6 border border-sky-200 dark:border-sky-800/60 rounded-xl bg-sky-50/30 dark:bg-slate-800/40 shadow-sm">
                        <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-2.5 border-b border-sky-200 dark:border-sky-700 pb-3 mb-5">
                            <Car className="h-5 w-5"/> Transportation for Teaching (Optional)
                        </h3>
                        <FieldWrapper label="Travel Date (To Venue)" htmlFor="transportToTeachingInDate" icon={CalendarDays} error={errors.transportToTeachingInDate}>
                            <Input type="date" id="transportToTeachingInDate" {...register("transportToTeachingInDate")} className={`${inputBaseClass} ${focusRingClass} ${errors.transportToTeachingInDate ? errorBorderClass : normalBorderClass}`} />
                        </FieldWrapper>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FieldWrapper label="From (Origin)" htmlFor="transportToTeachingFrom" icon={MapPin} error={errors.transportToTeachingFrom}><Input id="transportToTeachingFrom" {...register("transportToTeachingFrom")} placeholder="e.g., Home Address" className={`${inputBaseClass} ${focusRingClass} ${errors.transportToTeachingFrom ? errorBorderClass : normalBorderClass}`} /></FieldWrapper>
                            <FieldWrapper label="To (Teaching Venue)" htmlFor="transportToTeachingTo" icon={MapPin} error={errors.transportToTeachingTo}><Input id="transportToTeachingTo" {...register("transportToTeachingTo")} placeholder="e.g., Campus Hall A" className={`${inputBaseClass} ${focusRingClass} ${errors.transportToTeachingTo ? errorBorderClass : normalBorderClass}`} /></FieldWrapper>
                        </div>
                        <Separator className="my-5 dark:bg-slate-700"/>
                        <FieldWrapper label="Travel Date (Return)" htmlFor="transportToTeachingOutDate" icon={CalendarDays} error={errors.transportToTeachingOutDate}>
                            <Input type="date" id="transportToTeachingOutDate" {...register("transportToTeachingOutDate")} className={`${inputBaseClass} ${focusRingClass} ${errors.transportToTeachingOutDate ? errorBorderClass : normalBorderClass}`} />
                        </FieldWrapper>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FieldWrapper label="Return From (Teaching Venue)" htmlFor="transportToTeachingReturnFrom" icon={MapPin} error={errors.transportToTeachingReturnFrom}><Input id="transportToTeachingReturnFrom" {...register("transportToTeachingReturnFrom")} placeholder="e.g., Campus Hall A" className={`${inputBaseClass} ${focusRingClass} ${errors.transportToTeachingReturnFrom ? errorBorderClass : normalBorderClass}`} /></FieldWrapper>
                            <FieldWrapper label="Return To (Destination)" htmlFor="transportToTeachingReturnTo" icon={MapPin} error={errors.transportToTeachingReturnTo}><Input id="transportToTeachingReturnTo" {...register("transportToTeachingReturnTo")} placeholder="e.g., Home Address" className={`${inputBaseClass} ${focusRingClass} ${errors.transportToTeachingReturnTo ? errorBorderClass : normalBorderClass}`} /></FieldWrapper>
                        </div>
                        <FieldWrapper label="Distance (KM)" htmlFor="displayTransportToTeachingDistanceKM" icon={ArrowRightLeft} description="Distance will be calculated by the system.">
                            <Input type="text" id="displayTransportToTeachingDistanceKM" value="System Calculated" readOnly className={`${inputBaseClass} ${focusRingClass} ${normalBorderClass} text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 cursor-default`}/>
                        </FieldWrapper>
                    </div>
                  </>
                )}

                {watchClaimType === "TRANSPORTATION" && ( <div className="space-y-5 p-5 border border-green-200 dark:border-green-800/60 rounded-xl bg-green-50/30 dark:bg-slate-800/40 shadow"> <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 flex items-center gap-2.5 border-b border-green-200 dark:border-green-700 pb-3 mb-5"> <Car className="h-5 w-5"/> Transportation Details </h3> {/* ... Transportation fields using FieldWrapper ... */} </div> )}
                {watchClaimType === "THESIS_PROJECT" && ( <div className="space-y-5 p-5 border border-purple-200 dark:border-purple-800/60 rounded-xl bg-purple-50/30 dark:bg-slate-800/40 shadow"> <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2.5 border-b border-purple-200 dark:border-purple-700 pb-3 mb-5"> <FileText className="h-5 w-5"/> Thesis/Project Details </h3> {/* ... Thesis/Project fields using FieldWrapper ... */} </div> )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end p-5 sm:p-6 border-t border-slate-200 dark:border-slate-700/70 rounded-b-xl bg-slate-50/70 dark:bg-slate-800/60">
            <Button type="submit" disabled={isLoading || isSessionLoading} className={`bg-violet-700 text-white hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 focus-visible:ring-violet-500 px-8 py-3 text-base font-semibold ${focusRingClass} flex items-center gap-2.5 shadow-md hover:shadow-lg transition-shadow`}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {isLoading ? "Submitting..." : "Submit Claim"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Toaster richColors position="top-center" duration={4000} />
    </div>
  );
}