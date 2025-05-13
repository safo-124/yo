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
import { getSession } // Assuming getSession is correctly set up as a server action
from '@/lib/actions/auth.actions';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { 
    PlusCircle, Trash2, Send, Loader2, 
    CalendarClock, BookText, Hash, Car, Users, FileText, MapPin, Palette, DollarSign, Clock4, 
    CalendarDays, Info, User // Added User icon for student name
} from 'lucide-react';

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
  teachingDate: z.string().optional(),
  teachingStartTime: z.string().optional(), // Format HH:MM
  teachingEndTime: z.string().optional(),   // Format HH:MM
  courseCode: z.string().optional(),      
  courseTitle: z.string().optional(),     
  teachingHours: z.preprocess( // Keep for display and for server to receive client-calculated value if needed
    (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.number({ invalid_type_error: "Hours must be a number." }).positive("Hours must be positive.").optional()
  ),     
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
    if (!data.teachingDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teaching date is required.", path: ["teachingDate"] });
    if (!data.teachingStartTime) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start time is required.", path: ["teachingStartTime"] });
    if (!data.teachingEndTime) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End time is required.", path: ["teachingEndTime"] });
    if (!data.courseCode?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Course code is required.", path: ["courseCode"] });
    if (!data.courseTitle?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Course title is required.", path: ["courseTitle"] });
    
    if (data.teachingStartTime && data.teachingEndTime && data.teachingStartTime >= data.teachingEndTime) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End time must be after start time.", path: ["teachingEndTime"] });
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
                // Only trigger error if one is filled and the other is not for a specific student entry
                if (studentNameProvided && !thesisTitleProvided) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thesis title is required if student name is provided.", path: [`supervisedStudents.${index}.thesisTitle`] });
                } else if (!studentNameProvided && thesisTitleProvided) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Student name is required if thesis title is provided.", path: [`supervisedStudents.${index}.studentName`] });
                }
            });
        }
    }
    if (data.thesisType === "EXAMINATION" && !data.thesisExamCourseCode?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Exam course code is required.", path: ["thesisExamCourseCode"] });
    }
  }
});

// Helper for input styling
const inputBaseClass = "mt-1 bg-white dark:bg-slate-800 text-sm";
const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";
const errorBorderClass = "border-red-500 dark:border-red-600 focus-visible:ring-red-500";
const normalBorderClass = "border-gray-300 dark:border-gray-700";

const FieldWrapper = ({ children, label, htmlFor, required, error, icon: Icon, description }) => (
  <div className="space-y-1">
    <Label htmlFor={htmlFor} className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center">
      {Icon && <Icon className="mr-2 h-4 w-4 text-violet-600 dark:text-violet-500 flex-shrink-0" />}
      {label} {required && <span className="text-red-600 dark:text-red-500 ml-1">*</span>}
    </Label>
    {description && <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5 mb-1.5">{description}</p>}
    {children}
    {error && <p className="text-xs text-red-600 dark:text-red-500 mt-1">{error.message}</p>}
  </div>
);

// Helper function to parse time string "HH:MM"
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
      teachingDate: "",
      teachingStartTime: "",
      teachingEndTime: "",
      courseCode: "", 
      courseTitle: "", 
      teachingHours: undefined,
      transportType: undefined,
      transportDestinationTo: "",
      transportDestinationFrom: "",
      transportRegNumber: "",
      transportCubicCapacity: undefined,
      transportAmount: undefined,
      thesisType: undefined,
      thesisSupervisionRank: undefined,
      supervisedStudents: [{ studentName: "", thesisTitle: "" }],
      thesisExamCourseCode: "",
      thesisExamDate: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "supervisedStudents",
  });

  const watchClaimType = form.watch("claimType");
  const watchThesisType = form.watch("thesisType");
  const watchTransportType = form.watch("transportType");
  const watchTeachingDate = form.watch("teachingDate");
  const watchTeachingStartTime = form.watch("teachingStartTime");
  const watchTeachingEndTime = form.watch("teachingEndTime");
  const displayTeachingHours = form.watch("teachingHours");

  // Effect to auto-calculate teaching hours
  useEffect(() => {
    if (watchClaimType === "TEACHING" && watchTeachingDate && watchTeachingStartTime && watchTeachingEndTime) {
      const datePart = new Date(watchTeachingDate); 
      const parsedStartTime = parseTime(watchTeachingStartTime);
      const parsedEndTime = parseTime(watchTeachingEndTime);

      if (!isNaN(datePart.getTime()) && parsedStartTime && parsedEndTime) {
        const startDateTime = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), parsedStartTime.hours, parsedStartTime.minutes);
        const endDateTime = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), parsedEndTime.hours, parsedEndTime.minutes);
        
        if (endDateTime.getTime() > startDateTime.getTime()) { // Ensure end is after start
          const durationMs = endDateTime.getTime() - startDateTime.getTime();
          const hours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
          form.setValue('teachingHours', hours, { shouldValidate: false, shouldDirty: false });
        } else {
          form.setValue('teachingHours', undefined, { shouldValidate: false, shouldDirty: false }); 
        }
      } else {
        form.setValue('teachingHours', undefined, { shouldValidate: false, shouldDirty: false });
      }
    } else {
      if(form.getValues('teachingHours') !== undefined && watchClaimType !== "TEACHING") {
          form.setValue('teachingHours', undefined, { shouldValidate: false, shouldDirty: false });
      }
    }
  }, [watchTeachingDate, watchTeachingStartTime, watchTeachingEndTime, watchClaimType, form]);


  useEffect(() => {
    async function fetchAndSetUser() {
      setIsSessionLoading(true);
      try {
        // This assumes getSession is a server action correctly invoked from client
        const session = await (async () => getSession())();
        if (session?.userId && session?.role === 'LECTURER') {
          setCurrentUser(session);
        } else if (session?.userId) {
            toast.error("Access Denied: Only lecturers can submit claims.");
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
    if (centerId) { 
        fetchAndSetUser();
    } else {
        toast.error("Center information is missing from URL.");
        setIsSessionLoading(false); 
    }
  }, [router, centerId]);

  const onSubmit = async (data) => {
    if (!currentUser?.userId || !centerId) {
      toast.error("User or Center information is missing.");
      return;
    }
    setIsLoading(true);
    const claimPayload = {
      ...data,
      submittedById: currentUser.userId,
      centerId: String(centerId),
      // teachingHours will be taken from data.teachingHours for TEACHING type (client-calculated for display)
      // server will recalculate for TEACHING claims to ensure accuracy.
      // For other claim types, if teachingHours was a relevant field, it would pass through.
      transportCubicCapacity: data.transportCubicCapacity !== undefined && data.transportCubicCapacity !== null && String(data.transportCubicCapacity).trim() !== "" ? parseInt(String(data.transportCubicCapacity)) : null,
      transportAmount: data.transportAmount !== undefined && data.transportAmount !== null && String(data.transportAmount).trim() !== "" ? parseFloat(String(data.transportAmount)) : null,
    };
    
    if (data.claimType !== "THESIS_PROJECT" || data.thesisType !== "SUPERVISION" || !data.supervisedStudents) {
        delete claimPayload.supervisedStudents;
    } else {
        claimPayload.supervisedStudents = data.supervisedStudents.filter(s => s.studentName?.trim() || s.thesisTitle?.trim());
        if (claimPayload.supervisedStudents.length === 0) {
            delete claimPayload.supervisedStudents;
        }
    }
    
    // If teachingHours is not relevant for non-TEACHING claims, ensure it's not sent or is null.
    // The server action handles setting teachingHours to null for non-teaching types.
    // So, sending data.teachingHours (which might be undefined if not TEACHING type) is fine.
    
    const result = await submitNewClaim(claimPayload);
    setIsLoading(false);

    if (result.success) {
      toast.success("Claim submitted successfully!");
      form.reset();
      router.push(`/lecturer/center/${centerId}/my-claims`);
    } else {
      toast.error(result.error || "Failed to submit claim.");
    }
  };
  
  const onError = (errors) => {
    console.error("SubmitClaimPage: Form validation failed:", errors);
    let anErrorFound = false;
    // Prioritize field-specific errors
    for (const path in errors) {
        // Check for nested errors first (e.g., supervisedStudents.0.studentName)
        if (path.includes('.')) {
            const pathParts = path.split('.');
            let currentError = errors;
            for (const part of pathParts) {
                currentError = currentError?.[part];
            }
            if (currentError?.message) {
                toast.error(String(currentError.message));
                anErrorFound = true;
                break;
            }
        } else if (errors[path]?.message) { // Top-level field errors
            toast.error(String(errors[path].message));
            anErrorFound = true;
            break; 
        }
    }
    // Fallback to root error if no specific field error was toasted
    if (!anErrorFound && errors.root?.message) {
        toast.error(String(errors.root.message));
        anErrorFound = true;
    }
    if (!anErrorFound) {
        toast.error("Please correct the errors highlighted in the form.");
    }
  };

  // Loading and Error States
  if (isSessionLoading) { 
    return ( <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-blue-800 dark:text-blue-300 p-4"> <Loader2 className="h-10 w-10 animate-spin mb-4" /> <p className="text-lg font-medium">Loading your session...</p> </div> );
  }
  if (!centerId) { 
    return ( <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-red-700 dark:text-red-400 p-4"> <p className="text-lg font-medium text-center">Center information is missing from the URL.<br/>Please navigate from your dashboard.</p><Button onClick={() => router.push('/dashboard')} className="mt-4">Go to Dashboard</Button></div> );
  }
   if (!currentUser) { 
    return ( <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-red-700 dark:text-red-400 p-4"> <p className="text-lg font-medium">User session not available. Please login.</p><Button onClick={() => router.push('/login')} className="mt-4">Login</Button> </div> );
  }

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto px-2 sm:px-0">
      <Card className="border-slate-200 dark:border-slate-700/60 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-blue-700 to-violet-700 dark:from-blue-800 dark:to-violet-800 text-white rounded-none p-5 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Send className="h-5 w-5 sm:h-6 sm:w-6" /> Submit New Claim
          </CardTitle>
          <CardDescription className="text-blue-100/90 text-sm mt-1">
            Fill out the form accurately. Fields marked with <span className="text-red-300 font-semibold">*</span> are required for the selected claim type.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <CardContent className="p-4 sm:p-6 space-y-6">
            <FieldWrapper label="Claim Type" htmlFor="claimType" required error={form.formState.errors.claimType} icon={Palette}>
              <Controller name="claimType" control={form.control} render={({ field }) => (
                <Select 
                  onValueChange={(value) => { 
                    field.onChange(value); 
                    const currentValues = form.getValues();
                    form.reset({ // Reset all conditional fields to their defaults
                        ...currentValues, // keep existing non-conditional values if any (none here)
                        claimType: value, 
                        teachingDate: "", teachingStartTime: "", teachingEndTime: "", courseCode: "", courseTitle: "", teachingHours: undefined,
                        transportType: undefined, transportDestinationTo: "", transportDestinationFrom: "", transportRegNumber: "", transportCubicCapacity: undefined, transportAmount: undefined,
                        thesisType: undefined, thesisSupervisionRank: undefined, supervisedStudents: [{ studentName: "", thesisTitle: "" }], thesisExamCourseCode: "", thesisExamDate: "",
                    }); 
                  }} 
                  value={field.value || undefined}
                >
                  <SelectTrigger id="claimType" className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.claimType ? errorBorderClass : normalBorderClass}`}>
                    <SelectValue placeholder="Select claim type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-700"><SelectItem value="TEACHING">Teaching</SelectItem><SelectItem value="TRANSPORTATION">Transportation</SelectItem><SelectItem value="THESIS_PROJECT">Thesis/Project</SelectItem></SelectContent>
                </Select>
              )} />
            </FieldWrapper>

            {watchClaimType && (
              <div className="space-y-6 pt-4 mt-6 border-t border-slate-200 dark:border-slate-700">
                {watchClaimType === "TEACHING" && (
                  <div className="space-y-4 p-4 border border-blue-200 dark:border-blue-800/50 rounded-lg bg-blue-50/30 dark:bg-blue-900/10 shadow-sm">
                    <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-400 flex items-center gap-2 border-b border-blue-200 dark:border-blue-700 pb-2 mb-4">
                      <CalendarClock className="h-5 w-5"/> Teaching Details
                    </h3>
                    <FieldWrapper label="Date of Teaching" htmlFor="teachingDate" required error={form.formState.errors.teachingDate} icon={CalendarDays}>
                      <Input type="date" id="teachingDate" {...form.register("teachingDate")} className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.teachingDate ? errorBorderClass : normalBorderClass}`} />
                    </FieldWrapper>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldWrapper label="Start Time" htmlFor="teachingStartTime" required error={form.formState.errors.teachingStartTime} icon={Clock4}>
                        <Input type="time" id="teachingStartTime" {...form.register("teachingStartTime")} className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.teachingStartTime ? errorBorderClass : normalBorderClass}`} />
                      </FieldWrapper>
                      <FieldWrapper label="End Time" htmlFor="teachingEndTime" required error={form.formState.errors.teachingEndTime} icon={Clock4}>
                        <Input type="time" id="teachingEndTime" {...form.register("teachingEndTime")} className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.teachingEndTime ? errorBorderClass : normalBorderClass}`} />
                      </FieldWrapper>
                    </div>
                    <FieldWrapper label="Calculated Contact Hours" htmlFor="displayTeachingHours" icon={Info} description="Automatically calculated from start and end times.">
                        <Input
                            type="text"
                            id="displayTeachingHours"
                            value={displayTeachingHours !== undefined && displayTeachingHours !== null ? `${displayTeachingHours} hours` : (watchTeachingStartTime && watchTeachingEndTime ? 'Calculating...' : 'N/A (Enter times)')}
                            readOnly
                            className={`${inputBaseClass} ${focusRingClass} ${normalBorderClass} text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 cursor-default`}
                        />
                    </FieldWrapper>
                    <FieldWrapper label="Course Code" htmlFor="courseCode" required error={form.formState.errors.courseCode} icon={Hash}>
                      <Input id="courseCode" {...form.register("courseCode")} placeholder="e.g., CS101" className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.courseCode ? errorBorderClass : normalBorderClass}`} />
                    </FieldWrapper>
                    <FieldWrapper label="Course Title" htmlFor="courseTitle" required error={form.formState.errors.courseTitle} icon={BookText}>
                      <Input id="courseTitle" {...form.register("courseTitle")} placeholder="e.g., Introduction to Computing" className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.courseTitle ? errorBorderClass : normalBorderClass}`} />
                    </FieldWrapper>
                  </div>
                )}

                {watchClaimType === "TRANSPORTATION" && (
                  <div className="space-y-4 p-4 border border-green-200 dark:border-green-800/50 rounded-lg bg-green-50/30 dark:bg-green-900/10 shadow-sm">
                     <h3 className="font-semibold text-lg text-green-700 dark:text-green-400 flex items-center gap-2 border-b border-green-200 dark:border-green-700 pb-2 mb-4">
                      <Car className="h-5 w-5"/> Transportation Details
                    </h3>
                    <FieldWrapper label="Transport Type" htmlFor="transportType" required error={form.formState.errors.transportType} icon={Palette}>
                      <Controller name="transportType" control={form.control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <SelectTrigger id="transportType" className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.transportType ? errorBorderClass : normalBorderClass}`}><SelectValue placeholder="Select transport type" /></SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-700"><SelectItem value="PUBLIC">Public</SelectItem><SelectItem value="PRIVATE">Private</SelectItem></SelectContent>
                        </Select>
                      )} />
                    </FieldWrapper>
                    <FieldWrapper label="From (Origin)" htmlFor="transportDestinationFrom" required error={form.formState.errors.transportDestinationFrom} icon={MapPin}>
                      <Input id="transportDestinationFrom" {...form.register("transportDestinationFrom")} placeholder="e.g., Campus A" className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.transportDestinationFrom ? errorBorderClass : normalBorderClass}`} />
                    </FieldWrapper>
                    <FieldWrapper label="To (Destination)" htmlFor="transportDestinationTo" required error={form.formState.errors.transportDestinationTo} icon={MapPin}>
                      <Input id="transportDestinationTo" {...form.register("transportDestinationTo")} placeholder="e.g., Event Venue Z" className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.transportDestinationTo ? errorBorderClass : normalBorderClass}`} />
                    </FieldWrapper>
                    {watchTransportType === "PRIVATE" && (
                      <>
                        <FieldWrapper label="Vehicle Registration No." htmlFor="transportRegNumber" required error={form.formState.errors.transportRegNumber} icon={Car}>
                          <Input id="transportRegNumber" {...form.register("transportRegNumber")} className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.transportRegNumber ? errorBorderClass : normalBorderClass}`} />
                        </FieldWrapper>
                        <FieldWrapper label="Cubic Capacity (cc)" htmlFor="transportCubicCapacity" error={form.formState.errors.transportCubicCapacity} icon={Car}>
                          <Input type="number" id="transportCubicCapacity" {...form.register("transportCubicCapacity")} placeholder="e.g., 1500" className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.transportCubicCapacity ? errorBorderClass : normalBorderClass}`} />
                        </FieldWrapper>
                      </>
                    )}
                    <FieldWrapper label="Amount Claimed (Optional)" htmlFor="transportAmount" error={form.formState.errors.transportAmount} icon={DollarSign}>
                      <Input type="number" step="0.01" id="transportAmount" {...form.register("transportAmount")} placeholder="e.g., 50.75" className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.transportAmount ? errorBorderClass : normalBorderClass}`} />
                    </FieldWrapper>
                  </div>
                )}

                {watchClaimType === "THESIS_PROJECT" && (
                  <div className="space-y-4 p-4 border border-purple-200 dark:border-purple-800/50 rounded-lg bg-purple-50/30 dark:bg-purple-900/10 shadow-sm">
                    <h3 className="font-semibold text-lg text-purple-700 dark:text-purple-400 flex items-center gap-2 border-b border-purple-200 dark:border-purple-700 pb-2 mb-4">
                      <FileText className="h-5 w-5"/> Thesis/Project Details
                    </h3>
                    <FieldWrapper label="Type" htmlFor="thesisType" required error={form.formState.errors.thesisType} icon={Palette}>
                      <Controller name="thesisType" control={form.control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <SelectTrigger id="thesisType" className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.thesisType ? errorBorderClass : normalBorderClass}`}><SelectValue placeholder="Select thesis/project type" /></SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-700"><SelectItem value="SUPERVISION">Supervision</SelectItem><SelectItem value="EXAMINATION">Examination</SelectItem></SelectContent>
                        </Select>
                      )} />
                    </FieldWrapper>

                    {watchThesisType === "SUPERVISION" && ( <>
                      <FieldWrapper label="Supervision Rank" htmlFor="thesisSupervisionRank" required error={form.formState.errors.thesisSupervisionRank} icon={Users}>
                        <Controller name="thesisSupervisionRank" control={form.control} render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <SelectTrigger id="thesisSupervisionRank" className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.thesisSupervisionRank ? errorBorderClass : normalBorderClass}`}><SelectValue placeholder="Select rank" /></SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-700"><SelectItem value="PHD">PhD</SelectItem><SelectItem value="MPHIL">MPhil</SelectItem><SelectItem value="MA">MA</SelectItem><SelectItem value="MSC">MSc</SelectItem><SelectItem value="BED">BEd</SelectItem><SelectItem value="BSC">BSc</SelectItem><SelectItem value="BA">BA</SelectItem><SelectItem value="ED">Ed</SelectItem></SelectContent>
                          </Select>
                        )} />
                      </FieldWrapper>
                      <div className="space-y-3 pt-2">
                        <Label className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><Users className="h-4 w-4 text-violet-600 dark:text-violet-500"/> Supervised Students</Label>
                        {fields.map((item, index) => (
                          <div key={item.id} className="flex items-start gap-2 p-3 border border-slate-200 dark:border-slate-700/80 rounded-md bg-slate-50/70 dark:bg-slate-800/30">
                            <div className="flex-grow space-y-2">
                              <FieldWrapper label={`Student ${index + 1} Name`} htmlFor={`studentName-${index}`} error={form.formState.errors.supervisedStudents?.[index]?.studentName} icon={User}>
                                  <Input {...form.register(`supervisedStudents.${index}.studentName`)} placeholder="Student Full Name" className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.supervisedStudents?.[index]?.studentName ? errorBorderClass : normalBorderClass}`} />
                              </FieldWrapper>
                              <FieldWrapper label={`Student ${index + 1} Thesis/Project Title`} htmlFor={`thesisTitle-${index}`} error={form.formState.errors.supervisedStudents?.[index]?.thesisTitle} icon={FileText}>
                                  <Textarea {...form.register(`supervisedStudents.${index}.thesisTitle`)} placeholder="Full Thesis/Project Title" rows={2} className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.supervisedStudents?.[index]?.thesisTitle ? errorBorderClass : normalBorderClass} min-h-[40px]`} />
                              </FieldWrapper>
                            </div>
                            {(fields.length > 0 ) && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-700/20 dark:text-red-500 hover:text-red-700 shrink-0">
                                <Trash2 className="h-4 w-4" /><span className="sr-only">Remove Student</span>
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ studentName: "", thesisTitle: "" })} className={`text-violet-700 border-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:border-violet-500 dark:hover:bg-violet-700/20 dark:hover:text-violet-300 ${focusRingClass} gap-1.5`}>
                          <PlusCircle className="h-4 w-4" /> Add Student
                        </Button>
                      </div>
                    </>)}

                    {watchThesisType === "EXAMINATION" && ( <>
                      <FieldWrapper label="Course Code for Examination" htmlFor="thesisExamCourseCode" required error={form.formState.errors.thesisExamCourseCode} icon={Hash}>
                        <Input id="thesisExamCourseCode" {...form.register("thesisExamCourseCode")} placeholder="e.g., PROJ4000" className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.thesisExamCourseCode ? errorBorderClass : normalBorderClass}`} />
                      </FieldWrapper>
                      <FieldWrapper label="Date of Examination" htmlFor="thesisExamDate" error={form.formState.errors.thesisExamDate} icon={CalendarDays}>
                        <Input type="date" id="thesisExamDate" {...form.register("thesisExamDate")} className={`${inputBaseClass} ${focusRingClass} ${form.formState.errors.thesisExamDate ? errorBorderClass : normalBorderClass}`} />
                      </FieldWrapper>
                    </>)}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700/60 rounded-b-xl">
            <Button type="submit" disabled={isLoading || isSessionLoading} className={`bg-violet-700 text-white hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 focus-visible:ring-violet-500 px-6 py-2.5 text-sm font-semibold ${focusRingClass} flex items-center gap-2`}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isLoading ? "Submitting..." : "Submit Claim"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Toaster richColors position="top-center" />
    </div>
  );
}