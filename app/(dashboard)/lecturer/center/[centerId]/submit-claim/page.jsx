// app/(dashboard)/lecturer/center/[centerId]/submit-claim/page.jsx
"use client";

import { useState, useEffect } from 'react';
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
import { submitNewClaim, getAssignedCoursesForLecturer } from '@/lib/actions/lecturer.actions.js';
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
  courseId: z.string().optional(), // CHANGED: Replaced courseCode and courseTitle with courseId
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
    if (!data.courseId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "An assigned course must be selected.", path: ["courseId"] });
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
  <div className="space-y-2">
    <Label htmlFor={htmlFor} className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
      {Icon && (
        <div className="p-1 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-md">
          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        </div>
      )}
      <span>{label}</span>
      {required && <span className="text-red-600 dark:text-red-500 ml-1 font-bold">*</span>}
    </Label>
    {description && (
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
        {description}
      </p>
    )}
    {children}
    {error && (
      <div className="flex items-start gap-2 p-2 bg-red-50/80 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-800/50">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"/>
        <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{error.message}</p>
      </div>
    )}
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
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);

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
      thesisType: undefined, thesisSupervisionRank: undefined, supervisedStudents: [{ studentName: "", thesisTitle: "" }], 
      thesisExamCourseCode: "", thesisExamDate: "",
    },
  });

  const { fields: supervisedStudentsFields, append: appendStudent, remove: removeStudent } = useFieldArray({ control: form.control, name: "supervisedStudents" });
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
          setValue('teachingHours', hours, { shouldValidate: false, shouldDirty: true });
        } else { setValue('teachingHours', undefined, { shouldValidate: false, shouldDirty: true }); }
      } else { setValue('teachingHours', undefined, { shouldValidate: false, shouldDirty: true }); }
    } else if (getValues('teachingHours') !== undefined && watchClaimType !== "TEACHING") {
      setValue('teachingHours', undefined, { shouldValidate: false, shouldDirty: true });
    }
  }, [watchTeachingDate, watchTeachingStartTime, watchTeachingEndTime, watchClaimType, setValue, getValues]);

  useEffect(() => {
    async function fetchInitialData() {
      setIsSessionLoading(true);
      try {
        const session = await getSession();
        if (session?.userId && (session?.role === 'LECTURER' || session?.role === 'COORDINATOR')) {
          setCurrentUser(session);
          
          // Fetch user's bank details and contact information
          try {
            const response = await fetch(`/api/users/${session.userId}/details`);
            if (response.ok) {
              const userData = await response.json();
              if (userData) {
                // Update the user data with bank and contact details
                setCurrentUser(prevUser => ({
                  ...prevUser,
                  bankName: userData.bankName,
                  bankBranch: userData.bankBranch,
                  accountName: userData.accountName,
                  accountNumber: userData.accountNumber,
                  phoneNumber: userData.phoneNumber
                }));
              }
            }
          } catch (userDataError) {
            console.error("Error fetching user details:", userDataError);
            // We don't show an error toast here as it's not critical for the form
          }
          
          setIsCoursesLoading(true);
          const courseResult = await getAssignedCoursesForLecturer(session.userId);
          if (courseResult.success) {
            setAssignedCourses(courseResult.courses);
          } else {
            toast.error("Could not load your assigned courses.");
            setAssignedCourses([]);
          }
          setIsCoursesLoading(false);
          
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
    if (centerId) { fetchInitialData(); } 
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
    const result = await submitNewClaim(claimPayload);
    setIsLoading(false);
    if (result.success) {
      toast.success("Claim submitted successfully!");
      form.reset();
      // Check user role to determine redirect path
      if (currentUser.role === 'COORDINATOR') {
        router.push(`/coordinator/${centerId}/claims`);
      } else {
        router.push(`/lecturer/center/${centerId}/my-claims`);
      }
    } else { toast.error(result.error || "Failed to submit claim."); }
  };
  
  const onError = (formErrors) => {
      console.log("Form validation errors:", formErrors);
      toast.error("Please correct the errors in the form before submitting.");
  };

  if (isSessionLoading) { return ( <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-blue-700 dark:text-blue-300 p-4"> <Loader2 className="h-10 w-10 animate-spin mb-4" /> <p className="text-lg font-medium">Loading your session...</p> </div> ); }
  if (!centerId && !isSessionLoading) { return ( <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-red-700 dark:text-red-400 p-4"> <p className="text-lg font-medium text-center">Center information missing from URL.<br/>Please navigate from your dashboard.</p><Button onClick={() => router.push('/dashboard')} className="mt-4 bg-blue-700 hover:bg-blue-800 text-white">Go to Dashboard</Button></div> ); }
  if (!currentUser && !isSessionLoading) { return ( <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)] text-red-700 dark:text-red-400 p-4"> <p className="text-lg font-medium">User session not available. Please login.</p><Button onClick={() => router.push('/login')} className="mt-4 bg-blue-700 hover:bg-blue-800 text-white">Login</Button> </div> ); }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white/20 via-slate-50/40 to-blue-50/20 dark:from-slate-800/20 dark:via-slate-700/30 dark:to-blue-900/10 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Enhanced Header Section */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/5 dark:shadow-blue-500/10 border border-white/20 dark:border-slate-700/50 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800 text-white p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Send className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Submit New Claim</h1>
                <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
                  Fill out the form accurately to submit your claim. Fields marked with 
                  <span className="inline-flex items-center mx-1 px-2 py-0.5 bg-red-500/20 rounded text-red-200 text-xs font-semibold">
                    * Required
                  </span> 
                  are mandatory for the selected claim type.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Form */}
          <form onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="p-6 sm:p-8 space-y-8">
              {/* Claim Type Selection */}
              <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/60 dark:from-slate-800/50 dark:to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
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
                      <SelectTrigger id="claimType" className={`${inputBaseClass} ${focusRingClass} ${errors.claimType ? errorBorderClass : normalBorderClass} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 h-12`}>
                        <SelectValue placeholder="Select claim type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-xl">
                        <SelectItem value="TEACHING" className="flex items-center gap-2 py-3">
                          <CalendarClock className="h-4 w-4 text-blue-600" />
                          Teaching
                        </SelectItem>
                        <SelectItem value="TRANSPORTATION" className="flex items-center gap-2 py-3">
                          <Car className="h-4 w-4 text-green-600" />
                          Transportation
                        </SelectItem>
                        <SelectItem value="THESIS_PROJECT" className="flex items-center gap-2 py-3">
                          <FileText className="h-4 w-4 text-purple-600" />
                          Thesis/Project
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </FieldWrapper>
              </div>

              {watchClaimType && (
                <div className="space-y-8 mt-8">
                  {/* Teaching Section */}
                  {watchClaimType === "TEACHING" && (
                    <>
                      <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-200/50 dark:border-blue-800/50 shadow-lg shadow-blue-500/5">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-200/50 dark:border-blue-700/50">
                          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md">
                            <CalendarClock className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-300">
                            Teaching Session Details
                          </h3>
                        </div>
                        
                        <div className="space-y-6">
                          <FieldWrapper label="Select an Assigned Course" htmlFor="courseId" required error={errors.courseId} icon={BookText}>
                            <Controller
                              name="courseId"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isCoursesLoading}>
                                  <SelectTrigger id="courseId" className={`${inputBaseClass} ${focusRingClass} ${errors.courseId ? errorBorderClass : normalBorderClass} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-12`}>
                                    <SelectValue placeholder={isCoursesLoading ? "Loading courses..." : "Select a course"} />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-xl">
                                    {assignedCourses.length > 0 ? (
                                      assignedCourses.map(course => (
                                        <SelectItem key={course.id} value={course.id} className="py-3">
                                          <div className="flex items-center gap-2">
                                            <BookText className="h-4 w-4 text-blue-600" />
                                            <span>{course.courseCode} - {course.courseTitle}</span>
                                          </div>
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <div className="px-3 py-2 text-sm text-muted-foreground">
                                        {isCoursesLoading ? "Loading..." : "No courses assigned to you."}
                                      </div>
                                    )}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </FieldWrapper>
                          
                          <FieldWrapper label="Date of Teaching" htmlFor="teachingDate" required error={errors.teachingDate} icon={CalendarDays}>
                            <Input 
                              type="date" 
                              id="teachingDate" 
                              {...register("teachingDate")} 
                              className={`${inputBaseClass} ${focusRingClass} ${errors.teachingDate ? errorBorderClass : normalBorderClass} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-12`} 
                            />
                          </FieldWrapper>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FieldWrapper label="Start Time" htmlFor="teachingStartTime" required error={errors.teachingStartTime} icon={Clock4}>
                              <Input 
                                type="time" 
                                id="teachingStartTime" 
                                {...register("teachingStartTime")} 
                                className={`${inputBaseClass} ${focusRingClass} ${errors.teachingStartTime ? errorBorderClass : normalBorderClass} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-12`} 
                              />
                            </FieldWrapper>
                            <FieldWrapper label="End Time" htmlFor="teachingEndTime" required error={errors.teachingEndTime} icon={Clock4}>
                              <Input 
                                type="time" 
                                id="teachingEndTime" 
                                {...register("teachingEndTime")} 
                                className={`${inputBaseClass} ${focusRingClass} ${errors.teachingEndTime ? errorBorderClass : normalBorderClass} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-12`} 
                              />
                            </FieldWrapper>
                          </div>

                          <FieldWrapper label="Calculated Contact Hours" htmlFor="displayTeachingHours" icon={Info} description="Auto-calculated from start/end times.">
                            <div className="relative">
                              <Input 
                                type="text" 
                                id="displayTeachingHours" 
                                value={displayTeachingHours !== undefined && displayTeachingHours !== null ? `${displayTeachingHours} hours` : (watchTeachingStartTime && watchTeachingEndTime ? 'Calculating...' : 'N/A (Provide times)')} 
                                readOnly 
                                className={`${inputBaseClass} ${focusRingClass} ${normalBorderClass} bg-gradient-to-r from-slate-100 to-blue-50 dark:from-slate-700/60 dark:to-blue-900/30 cursor-default h-12 font-medium`}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-blue-100 dark:bg-blue-900/50 rounded">
                                <Clock4 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                          </FieldWrapper>
                        </div>
                      </div>

                      {/* Transportation for Teaching Section */}
                      <div className="bg-gradient-to-br from-sky-50/80 to-cyan-50/60 dark:from-sky-900/20 dark:to-cyan-900/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-sky-200/50 dark:border-sky-800/50 shadow-lg shadow-sky-500/5">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-sky-200/50 dark:border-sky-700/50">
                          <div className="p-2 bg-gradient-to-br from-sky-600 to-cyan-700 rounded-xl shadow-md">
                            <Car className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold bg-gradient-to-r from-sky-800 to-cyan-700 bg-clip-text text-transparent dark:from-sky-300 dark:to-cyan-300">
                            Transportation for Teaching <span className="text-sm font-normal text-slate-500 dark:text-slate-400">(Optional)</span>
                          </h3>
                        </div>

                        <div className="space-y-6">
                          <FieldWrapper label="Travel Date (To Venue)" htmlFor="transportToTeachingInDate" icon={CalendarDays} error={errors.transportToTeachingInDate}>
                            <Input 
                              type="date" 
                              id="transportToTeachingInDate" 
                              {...register("transportToTeachingInDate")} 
                              className={`${inputBaseClass} ${focusRingClass} ${errors.transportToTeachingInDate ? errorBorderClass : normalBorderClass} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-12`} 
                            />
                          </FieldWrapper>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FieldWrapper label="From (Origin)" htmlFor="transportToTeachingFrom" icon={MapPin} error={errors.transportToTeachingFrom}>
                              <Input 
                                id="transportToTeachingFrom" 
                                {...register("transportToTeachingFrom")} 
                                placeholder="e.g., Home Address" 
                                className={`${inputBaseClass} ${focusRingClass} ${errors.transportToTeachingFrom ? errorBorderClass : normalBorderClass} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-12`} 
                              />
                            </FieldWrapper>
                            <FieldWrapper label="To (Teaching Venue)" htmlFor="transportToTeachingTo" icon={MapPin} error={errors.transportToTeachingTo}>
                              <Input 
                                id="transportToTeachingTo" 
                                {...register("transportToTeachingTo")} 
                                placeholder="e.g., Campus Hall A" 
                                className={`${inputBaseClass} ${focusRingClass} ${errors.transportToTeachingTo ? errorBorderClass : normalBorderClass} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-12`} 
                              />
                            </FieldWrapper>
                          </div>

                          <div className="border-t border-sky-200/50 dark:border-sky-700/50 pt-6">
                            <FieldWrapper label="Travel Date (Return)" htmlFor="transportToTeachingOutDate" icon={CalendarDays} error={errors.transportToTeachingOutDate}>
                              <Input 
                                type="date" 
                                id="transportToTeachingOutDate" 
                                {...register("transportToTeachingOutDate")} 
                                className={`${inputBaseClass} ${focusRingClass} ${errors.transportToTeachingOutDate ? errorBorderClass : normalBorderClass} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-12`} 
                              />
                            </FieldWrapper>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                              <FieldWrapper label="Return From (Teaching Venue)" htmlFor="transportToTeachingReturnFrom" icon={MapPin} error={errors.transportToTeachingReturnFrom}>
                                <Input 
                                  id="transportToTeachingReturnFrom" 
                                  {...register("transportToTeachingReturnFrom")} 
                                  placeholder="e.g., Campus Hall A" 
                                  className={`${inputBaseClass} ${focusRingClass} ${errors.transportToTeachingReturnFrom ? errorBorderClass : normalBorderClass} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-12`} 
                                />
                              </FieldWrapper>
                              <FieldWrapper label="Return To (Destination)" htmlFor="transportToTeachingReturnTo" icon={MapPin} error={errors.transportToTeachingReturnTo}>
                                <Input 
                                  id="transportToTeachingReturnTo" 
                                  {...register("transportToTeachingReturnTo")} 
                                  placeholder="e.g., Home Address" 
                                  className={`${inputBaseClass} ${focusRingClass} ${errors.transportToTeachingReturnTo ? errorBorderClass : normalBorderClass} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-12`} 
                                />
                              </FieldWrapper>
                            </div>
                          </div>

                          <FieldWrapper label="Distance (KM)" htmlFor="displayTransportToTeachingDistanceKM" icon={ArrowRightLeft} description="Distance will be calculated by the system.">
                            <div className="relative">
                              <Input 
                                type="text" 
                                id="displayTransportToTeachingDistanceKM" 
                                value="System Calculated" 
                                readOnly 
                                className={`${inputBaseClass} ${focusRingClass} ${normalBorderClass} bg-gradient-to-r from-slate-100 to-sky-50 dark:from-slate-700/60 dark:to-sky-900/30 cursor-default h-12 font-medium`}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-sky-100 dark:bg-sky-900/50 rounded">
                                <ArrowRightLeft className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                              </div>
                            </div>
                          </FieldWrapper>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Placeholder for Transportation and Thesis sections */}
                  {watchClaimType === "TRANSPORTATION" && ( 
                    <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-green-200/50 dark:border-green-800/50 shadow-lg shadow-green-500/5"> 
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-green-200/50 dark:border-green-700/50">
                        <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl shadow-md">
                          <Car className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent dark:from-green-300 dark:to-emerald-300">
                          Transportation Details
                        </h3>
                      </div>
                      {/* Transportation Form Fields */}
                      <div className="grid gap-6 md:gap-8">
                        {/* Transport Type */}
                        <FieldWrapper 
                          label="Transport Type" 
                          htmlFor="transportType" 
                          required 
                          error={errors.transportType} 
                          icon={Car}
                          description="Select whether you used public or private transportation"
                        >
                          <Controller
                            name="transportType"
                            control={control}
                            render={({ field }) => (
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value || ""}
                              >
                                <SelectTrigger 
                                  id="transportType"
                                  className={`${inputBaseClass} ${focusRingClass} ${errors.transportType ? errorBorderClass : normalBorderClass}`}
                                >
                                  <SelectValue placeholder="Select transport type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PUBLIC">Public Transport</SelectItem>
                                  <SelectItem value="PRIVATE">Private Vehicle</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FieldWrapper>

                        {/* Origin and Destination */}
                        <div className="grid gap-6 md:grid-cols-2">
                          <FieldWrapper 
                            label="Origin (From)" 
                            htmlFor="transportDestinationFrom" 
                            required 
                            error={errors.transportDestinationFrom} 
                            icon={MapPin}
                            description="Starting location of your journey"
                          >
                            <Input
                              id="transportDestinationFrom"
                              placeholder="e.g., UEW Main Campus"
                              {...register("transportDestinationFrom")}
                              className={`${inputBaseClass} ${focusRingClass} ${errors.transportDestinationFrom ? errorBorderClass : normalBorderClass}`}
                            />
                          </FieldWrapper>

                          <FieldWrapper 
                            label="Destination (To)" 
                            htmlFor="transportDestinationTo" 
                            required 
                            error={errors.transportDestinationTo} 
                            icon={MapPin}
                            description="Final destination of your journey"
                          >
                            <Input
                              id="transportDestinationTo"
                              placeholder="e.g., Kumasi Study Center"
                              {...register("transportDestinationTo")}
                              className={`${inputBaseClass} ${focusRingClass} ${errors.transportDestinationTo ? errorBorderClass : normalBorderClass}`}
                            />
                          </FieldWrapper>
                        </div>

                        {/* Private Vehicle Fields */}
                        {watchTransportType === "PRIVATE" && (
                          <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                              <Car className="h-4 w-4 text-green-600" />
                              Private Vehicle Details
                            </h4>
                            <div className="grid gap-6 md:grid-cols-2">
                              <FieldWrapper 
                                label="Vehicle Registration Number" 
                                htmlFor="transportRegNumber" 
                                required 
                                error={errors.transportRegNumber} 
                                icon={Hash}
                                description="License plate number of the vehicle"
                              >
                                <Input
                                  id="transportRegNumber"
                                  placeholder="e.g., GR-1234-20"
                                  {...register("transportRegNumber")}
                                  className={`${inputBaseClass} ${focusRingClass} ${errors.transportRegNumber ? errorBorderClass : normalBorderClass}`}
                                />
                              </FieldWrapper>

                              <FieldWrapper 
                                label="Engine Cubic Capacity (cc)" 
                                htmlFor="transportCubicCapacity" 
                                error={errors.transportCubicCapacity} 
                                icon={Users}
                                description="Engine size in cubic centimeters"
                              >
                                <Input
                                  id="transportCubicCapacity"
                                  type="number"
                                  placeholder="e.g., 1500"
                                  {...register("transportCubicCapacity")}
                                  className={`${inputBaseClass} ${focusRingClass} ${errors.transportCubicCapacity ? errorBorderClass : normalBorderClass}`}
                                />
                              </FieldWrapper>
                            </div>
                          </div>
                        )}

                        {/* Amount Claimed */}
                        <FieldWrapper 
                          label="Amount Claimed (GHS)" 
                          htmlFor="transportAmount" 
                          error={errors.transportAmount} 
                          icon={DollarSign}
                          description="Total amount being claimed for this transportation"
                        >
                          <Input
                            id="transportAmount"
                            type="number"
                            step="0.01"
                            placeholder="e.g., 150.00"
                            {...register("transportAmount")}
                            className={`${inputBaseClass} ${focusRingClass} ${errors.transportAmount ? errorBorderClass : normalBorderClass}`}
                          />
                        </FieldWrapper>
                      </div>
                    </div> 
                  )}
                  
                  {watchClaimType === "THESIS_PROJECT" && ( 
                    <div className="bg-gradient-to-br from-purple-50/80 to-violet-50/60 dark:from-purple-900/20 dark:to-violet-900/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-500/5"> 
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-200/50 dark:border-purple-700/50">
                        <div className="p-2 bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl shadow-md">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-800 to-violet-700 bg-clip-text text-transparent dark:from-purple-300 dark:to-violet-300">
                          Thesis/Project Details
                        </h3>
                      </div>
                      {/* Thesis/Project Form Fields */}
                      <div className="grid gap-6 md:gap-8">
                        {/* Thesis Type */}
                        <FieldWrapper 
                          label="Thesis/Project Type" 
                          htmlFor="thesisType" 
                          required 
                          error={errors.thesisType} 
                          icon={FileText}
                          description="Select whether this is for supervision or examination"
                        >
                          <Controller
                            name="thesisType"
                            control={control}
                            render={({ field }) => (
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value || ""}
                              >
                                <SelectTrigger 
                                  id="thesisType"
                                  className={`${inputBaseClass} ${focusRingClass} ${errors.thesisType ? errorBorderClass : normalBorderClass}`}
                                >
                                  <SelectValue placeholder="Select thesis/project type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SUPERVISION">Thesis Supervision</SelectItem>
                                  <SelectItem value="EXAMINATION">Thesis Examination</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FieldWrapper>

                        {/* Supervision Fields */}
                        {watchThesisType === "SUPERVISION" && (
                          <div className="space-y-6">
                            {/* Supervision Rank */}
                            <FieldWrapper 
                              label="Academic Level" 
                              htmlFor="thesisSupervisionRank" 
                              required 
                              error={errors.thesisSupervisionRank} 
                              icon={Users}
                              description="Select the academic level of the thesis/project"
                            >
                              <Controller
                                name="thesisSupervisionRank"
                                control={control}
                                render={({ field }) => (
                                  <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value || ""}
                                  >
                                    <SelectTrigger 
                                      id="thesisSupervisionRank"
                                      className={`${inputBaseClass} ${focusRingClass} ${errors.thesisSupervisionRank ? errorBorderClass : normalBorderClass}`}
                                    >
                                      <SelectValue placeholder="Select academic level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PHD">PhD</SelectItem>
                                      <SelectItem value="MPHIL">MPhil</SelectItem>
                                      <SelectItem value="MA">MA</SelectItem>
                                      <SelectItem value="MSC">MSc</SelectItem>
                                      <SelectItem value="BED">BEd</SelectItem>
                                      <SelectItem value="BSC">BSc</SelectItem>
                                      <SelectItem value="BA">BA</SelectItem>
                                      <SelectItem value="ED">Ed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </FieldWrapper>

                            {/* Supervised Students */}
                            <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                  <Users className="h-4 w-4 text-purple-600" />
                                  Supervised Students
                                </h4>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => appendStudent({ studentName: "", thesisTitle: "" })}
                                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                >
                                  <PlusCircle className="h-4 w-4 mr-1" />
                                  Add Student
                                </Button>
                              </div>
                              
                              {supervisedStudentsFields.length === 0 && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
                                  No students added yet. Click "Add Student" to get started.
                                </p>
                              )}

                              {supervisedStudentsFields.map((field, index) => (
                                <div key={field.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 mb-4 border border-slate-200 dark:border-slate-600">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                      Student {index + 1}
                                    </h5>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeStudent(index)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <FieldWrapper 
                                      label="Student Name" 
                                      htmlFor={`supervisedStudents.${index}.studentName`}
                                      error={errors.supervisedStudents?.[index]?.studentName} 
                                      icon={User}
                                    >
                                      <Input
                                        id={`supervisedStudents.${index}.studentName`}
                                        placeholder="Enter student's full name"
                                        {...register(`supervisedStudents.${index}.studentName`)}
                                        className={`${inputBaseClass} ${focusRingClass} ${errors.supervisedStudents?.[index]?.studentName ? errorBorderClass : normalBorderClass}`}
                                      />
                                    </FieldWrapper>

                                    <FieldWrapper 
                                      label="Thesis Title" 
                                      htmlFor={`supervisedStudents.${index}.thesisTitle`}
                                      error={errors.supervisedStudents?.[index]?.thesisTitle} 
                                      icon={BookText}
                                    >
                                      <Input
                                        id={`supervisedStudents.${index}.thesisTitle`}
                                        placeholder="Enter thesis/project title"
                                        {...register(`supervisedStudents.${index}.thesisTitle`)}
                                        className={`${inputBaseClass} ${focusRingClass} ${errors.supervisedStudents?.[index]?.thesisTitle ? errorBorderClass : normalBorderClass}`}
                                      />
                                    </FieldWrapper>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Examination Fields */}
                        {watchThesisType === "EXAMINATION" && (
                          <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50 space-y-4">
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                              <BookText className="h-4 w-4 text-purple-600" />
                              Examination Details
                            </h4>
                            
                            <div className="grid gap-6 md:grid-cols-2">
                              <FieldWrapper 
                                label="Course Code" 
                                htmlFor="thesisExamCourseCode" 
                                required 
                                error={errors.thesisExamCourseCode} 
                                icon={Hash}
                                description="Enter the course code for the examination"
                              >
                                <Input
                                  id="thesisExamCourseCode"
                                  placeholder="e.g., EDUC 650"
                                  {...register("thesisExamCourseCode")}
                                  className={`${inputBaseClass} ${focusRingClass} ${errors.thesisExamCourseCode ? errorBorderClass : normalBorderClass}`}
                                />
                              </FieldWrapper>

                              <FieldWrapper 
                                label="Examination Date" 
                                htmlFor="thesisExamDate" 
                                error={errors.thesisExamDate} 
                                icon={CalendarDays}
                                description="Date when the examination took place"
                              >
                                <Input
                                  id="thesisExamDate"
                                  type="date"
                                  {...register("thesisExamDate")}
                                  className={`${inputBaseClass} ${focusRingClass} ${errors.thesisExamDate ? errorBorderClass : normalBorderClass}`}
                                />
                              </FieldWrapper>
                            </div>
                          </div>
                        )}
                      </div>
                    </div> 
                  )}
                </div>
              )}

              {/* Payment Information Section */}
              {watchClaimType && currentUser && (
                <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50/60 dark:from-amber-900/20 dark:to-yellow-900/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-amber-200/50 dark:border-amber-800/50 shadow-lg shadow-amber-500/5">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-200/50 dark:border-amber-700/50">
                    <div className="p-2 bg-gradient-to-br from-amber-600 to-yellow-700 rounded-xl shadow-md">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-amber-800 to-yellow-700 bg-clip-text text-transparent dark:from-amber-300 dark:to-yellow-300">
                      Payment Information
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <h4 className="font-semibold text-amber-800 dark:text-amber-300">Your Bank Details</h4>
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl border border-amber-200/50 dark:border-amber-800/40 space-y-3">
                        <div className="grid grid-cols-[auto_1fr] gap-3 items-center text-sm">
                          <div className="text-slate-600 dark:text-slate-400 font-medium">Bank Name:</div>
                          <div className="text-slate-900 dark:text-slate-200 font-semibold truncate">{currentUser.bankName || "Not provided"}</div>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-3 items-center text-sm">
                          <div className="text-slate-600 dark:text-slate-400 font-medium">Bank Branch:</div>
                          <div className="text-slate-900 dark:text-slate-200 font-semibold truncate">{currentUser.bankBranch || "Not provided"}</div>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-3 items-center text-sm">
                          <div className="text-slate-600 dark:text-slate-400 font-medium">Account Name:</div>
                          <div className="text-slate-900 dark:text-slate-200 font-semibold truncate">{currentUser.accountName || "Not provided"}</div>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-3 items-center text-sm">
                          <div className="text-slate-600 dark:text-slate-400 font-medium">Account Number:</div>
                          <div className="text-slate-900 dark:text-slate-200 font-semibold font-mono">{currentUser.accountNumber || "Not provided"}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <h4 className="font-semibold text-amber-800 dark:text-amber-300">Contact Information</h4>
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl border border-amber-200/50 dark:border-amber-800/40 space-y-3">
                        <div className="grid grid-cols-[auto_1fr] gap-3 items-center text-sm">
                          <div className="text-slate-600 dark:text-slate-400 font-medium">Phone Number:</div>
                          <div className="text-slate-900 dark:text-slate-200 font-semibold font-mono">{currentUser.phoneNumber || "Not provided"}</div>
                        </div>
                        {!currentUser.bankName || !currentUser.accountNumber || !currentUser.phoneNumber ? (
                          <div className="mt-4 p-3 bg-amber-100/80 dark:bg-amber-900/40 rounded-lg border border-amber-300/50 dark:border-amber-700/50">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-300 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                                Some of your payment or contact details are missing. Please update your profile for faster claim processing.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 p-3 bg-green-100/80 dark:bg-green-900/40 rounded-lg border border-green-300/50 dark:border-green-700/50">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-green-600 rounded-full">
                                <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                  <path d="M6.5 0l-.5.5L2.5 4 .5 2 0 2.5 2.5 5z"/>
                                </svg>
                              </div>
                              <p className="text-xs text-green-800 dark:text-green-200 font-medium">
                                All payment details are complete
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Footer */}
            <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/60 dark:from-slate-800/50 dark:to-blue-900/30 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700/50 p-6 sm:p-8 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {currentUser?.role === 'COORDINATOR' && (
                  <Button 
                    type="button"
                    onClick={() => router.push(`/coordinator/${centerId}`)}
                    variant="outline"
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300/50 dark:border-slate-600/50 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 focus-visible:ring-slate-500 px-6 py-3 rounded-xl"
                  >
                    Return to Coordinator Dashboard
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isLoading || isSessionLoading} 
                  className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white focus-visible:ring-indigo-500 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 min-w-[180px] justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Submit Claim</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Toaster richColors position="top-center" duration={4000} />
    </div>
  );
}