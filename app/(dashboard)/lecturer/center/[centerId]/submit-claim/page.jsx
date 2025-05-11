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
import { submitNewClaim } from '@/lib/actions/lecturer.actions.js';
import { getSession } from '@/lib/actions/auth.actions'; // getSession is a server action, careful with client-side calls if not wrapped
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { PlusCircle, Trash2, Send, Loader2 } from 'lucide-react'; // Added Loader2

// --- Zod Schema for Validation (remains unchanged) ---
const supervisedStudentSchema = z.object({
  studentName: z.string().min(1, "Student name is required.").optional().or(z.literal('')),
  thesisTitle: z.string().min(1, "Thesis title is required.").optional().or(z.literal('')),
});

const claimFormSchema = z.object({
  claimType: z.enum(["TEACHING", "TRANSPORTATION", "THESIS_PROJECT"], {
    required_error: "Claim type is required.",
  }),
  teachingDate: z.string().optional(),
  teachingStartTime: z.string().optional(),
  teachingEndTime: z.string().optional(),
  teachingHours: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.number({ invalid_type_error: "Hours must be a number." }).positive("Hours must be positive.").optional()
  ),
  transportType: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  transportDestinationTo: z.string().optional(),
  transportDestinationFrom: z.string().optional(),
  transportRegNumber: z.string().optional(),
  transportCubicCapacity: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseInt(String(val), 10)),
    z.number({ invalid_type_error: "Cubic capacity must be a number." }).positive().optional()
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
    if (!data.teachingDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teaching date is required.", path: ["teachingDate"] });
    if (data.teachingHours === undefined || data.teachingHours === null) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teaching hours are required.", path: ["teachingHours"] });
  } else if (data.claimType === "TRANSPORTATION") {
    if (!data.transportType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Transport type is required.", path: ["transportType"] });
    if (!data.transportDestinationFrom) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Origin is required.", path: ["transportDestinationFrom"] });
    if (!data.transportDestinationTo) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Destination is required.", path: ["transportDestinationTo"] });
    if (data.transportType === "PRIVATE" && !data.transportRegNumber) {
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
                if (!student.studentName && student.thesisTitle) {
                     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Student name is required if thesis title is provided.", path: [`supervisedStudents.${index}.studentName`] });
                }
                if (student.studentName && !student.thesisTitle) {
                     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thesis title is required if student name is provided.", path: [`supervisedStudents.${index}.thesisTitle`] });
                }
            });
        }
    }
    if (data.thesisType === "EXAMINATION" && !data.thesisExamCourseCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Exam course code is required.", path: ["thesisExamCourseCode"] });
    }
  }
});


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
  const watchTransportType = form.watch("transportType"); // Watch transportType for conditional rendering

  useEffect(() => {
    // getSession is problematic in client components if not handled correctly.
    // Assuming it's designed to be callable from client, or you'd wrap it.
    async function fetchAndSetUser() {
      try {
        // This is a trick to call server actions from client components in some setups.
        // Or, you'd have an API route. For now, assuming getSession() is callable here.
        const session = await (async () => getSession())();
        if (session?.userId) {
          setCurrentUser(session);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Session error. Please try logging in again.");
        router.push('/login');
      } finally {
        setIsSessionLoading(false);
      }
    }
    fetchAndSetUser();
  }, [router]);

  const onSubmit = async (data) => {
    if (!currentUser?.userId || !centerId) {
      toast.error("User or Center information is missing. Please re-login or contact support.");
      return;
    }
    setIsLoading(true);
    const claimPayload = {
      ...data,
      submittedById: currentUser.userId,
      centerId: String(centerId),
      teachingHours: data.teachingHours !== undefined && data.teachingHours !== null && data.teachingHours !== "" ? parseFloat(data.teachingHours) : null,
      transportCubicCapacity: data.transportCubicCapacity !== undefined && data.transportCubicCapacity !== null && data.transportCubicCapacity !== "" ? parseInt(data.transportCubicCapacity) : null,
      transportAmount: data.transportAmount !== undefined && data.transportAmount !== null && data.transportAmount !== "" ? parseFloat(data.transportAmount) : null,
    };

    if (data.claimType !== "THESIS_PROJECT" || data.thesisType !== "SUPERVISION" || !data.supervisedStudents || data.supervisedStudents.every(s => !s.studentName && !s.thesisTitle)) {
        delete claimPayload.supervisedStudents;
    } else {
        claimPayload.supervisedStudents = data.supervisedStudents.filter(s => s.studentName || s.thesisTitle);
        if (claimPayload.supervisedStudents.length === 0) {
            delete claimPayload.supervisedStudents;
        }
    }
    
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
    // Find the first error message to display more specific feedback
    const firstErrorMessage = Object.values(errors)[0]?.message || "Please correct the errors in the form.";
    toast.error(String(firstErrorMessage)); // Ensure message is a string
  };

  if (isSessionLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-blue-800 dark:text-blue-300">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-lg font-medium">Loading user session...</p>
      </div>
    );
  }
  if (!currentUser) { // Should be caught by redirect in useEffect, but as a fallback
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-red-700 dark:text-red-400">
        <p className="text-lg font-medium">User session not found. Redirecting to login...</p>
      </div>
    );
  }
   if (!centerId) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-red-700 dark:text-red-400">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-lg font-medium">Loading center information...</p>
        <p className="text-sm">If this persists, please check the URL or go back.</p>
      </div>
    );
  }

  // Helper function to apply focus ring styles
  const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

  return (
    <div className="space-y-6 pb-12"> {/* Added pb-12 for spacing at the bottom */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
        <CardHeader className="bg-blue-800 text-white rounded-t-lg p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-semibold">Submit New Claim</CardTitle>
          <CardDescription className="text-blue-100 text-sm sm:text-base">
            Fill out the form below to submit your claim. Ensure all details are accurate.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Claim Type Selector */}
            <div>
              <Label htmlFor="claimType" className="font-semibold text-gray-700 dark:text-gray-300">
                Claim Type <span className="text-red-700">*</span>
              </Label>
              <Controller
                name="claimType"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined} required>
                    <SelectTrigger 
                      id="claimType" 
                      className={`${focusRingClass} ${form.formState.errors.claimType ? "border-red-600 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} mt-1 bg-white dark:bg-slate-900`}
                    >
                      <SelectValue placeholder="Select claim type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700">
                      <SelectItem value="TEACHING">Teaching</SelectItem>
                      <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
                      <SelectItem value="THESIS_PROJECT">Thesis/Project</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.claimType && <p className="text-sm text-red-700 mt-1">{form.formState.errors.claimType.message}</p>}
            </div>

            {/* Conditional Sections */}
            {watchClaimType && (
              <div className="space-y-6 pt-4">
                {watchClaimType === "TEACHING" && (
                  <div className="space-y-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20 shadow-sm">
                    <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300 border-b border-blue-200 dark:border-blue-700 pb-2 mb-4">Teaching Details</h3>
                    <div>
                      <Label htmlFor="teachingDate" className="font-medium text-gray-700 dark:text-gray-300">Date of Teaching <span className="text-red-700">*</span></Label>
                      <Input type="date" id="teachingDate" {...form.register("teachingDate")} className={`${focusRingClass} mt-1 ${form.formState.errors.teachingDate ? "border-red-600 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-slate-800`} />
                      {form.formState.errors.teachingDate && <p className="text-sm text-red-700 mt-1">{form.formState.errors.teachingDate.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="teachingStartTime" className="font-medium text-gray-700 dark:text-gray-300">Start Time</Label><Input type="time" id="teachingStartTime" {...form.register("teachingStartTime")} className={`${focusRingClass} mt-1 border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800`} /></div>
                      <div><Label htmlFor="teachingEndTime" className="font-medium text-gray-700 dark:text-gray-300">End Time</Label><Input type="time" id="teachingEndTime" {...form.register("teachingEndTime")} className={`${focusRingClass} mt-1 border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800`} /></div>
                    </div>
                    <div>
                      <Label htmlFor="teachingHours" className="font-medium text-gray-700 dark:text-gray-300">Contact Hours <span className="text-red-700">*</span></Label>
                      <Input type="number" step="0.1" id="teachingHours" {...form.register("teachingHours")} placeholder="e.g., 2.5" className={`${focusRingClass} mt-1 ${form.formState.errors.teachingHours ? "border-red-600 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-slate-800`} />
                      {form.formState.errors.teachingHours && <p className="text-sm text-red-700 mt-1">{form.formState.errors.teachingHours.message}</p>}
                    </div>
                  </div>
                )}

                {watchClaimType === "TRANSPORTATION" && (
                  <div className="space-y-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20 shadow-sm">
                    <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300 border-b border-blue-200 dark:border-blue-700 pb-2 mb-4">Transportation Details</h3>
                    <div>
                      <Label htmlFor="transportType" className="font-medium text-gray-700 dark:text-gray-300">Transport Type <span className="text-red-700">*</span></Label>
                      <Controller name="transportType" control={form.control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <SelectTrigger id="transportType" className={`${focusRingClass} mt-1 ${form.formState.errors.transportType ? "border-red-600 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-slate-900`}><SelectValue placeholder="Select transport type" /></SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700"><SelectItem value="PUBLIC">Public</SelectItem><SelectItem value="PRIVATE">Private</SelectItem></SelectContent>
                        </Select>
                      )} />
                      {form.formState.errors.transportType && <p className="text-sm text-red-700 mt-1">{form.formState.errors.transportType.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="transportDestinationFrom" className="font-medium text-gray-700 dark:text-gray-300">From <span className="text-red-700">*</span></Label>
                      <Input id="transportDestinationFrom" {...form.register("transportDestinationFrom")} placeholder="Origin location" className={`${focusRingClass} mt-1 ${form.formState.errors.transportDestinationFrom ? "border-red-600 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-slate-800`} />
                       {form.formState.errors.transportDestinationFrom && <p className="text-sm text-red-700 mt-1">{form.formState.errors.transportDestinationFrom.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="transportDestinationTo" className="font-medium text-gray-700 dark:text-gray-300">To <span className="text-red-700">*</span></Label>
                      <Input id="transportDestinationTo" {...form.register("transportDestinationTo")} placeholder="Destination location" className={`${focusRingClass} mt-1 ${form.formState.errors.transportDestinationTo ? "border-red-600 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-slate-800`} />
                      {form.formState.errors.transportDestinationTo && <p className="text-sm text-red-700 mt-1">{form.formState.errors.transportDestinationTo.message}</p>}
                    </div>
                    {watchTransportType === "PRIVATE" && (
                      <>
                        <div>
                          <Label htmlFor="transportRegNumber" className="font-medium text-gray-700 dark:text-gray-300">Vehicle Registration No. <span className="text-red-700">*</span></Label>
                          <Input id="transportRegNumber" {...form.register("transportRegNumber")} className={`${focusRingClass} mt-1 ${form.formState.errors.transportRegNumber ? "border-red-600 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-slate-800`} />
                          {form.formState.errors.transportRegNumber && <p className="text-sm text-red-700 mt-1">{form.formState.errors.transportRegNumber.message}</p>}
                        </div>
                        <div><Label htmlFor="transportCubicCapacity" className="font-medium text-gray-700 dark:text-gray-300">Cubic Capacity (cc)</Label><Input type="number" id="transportCubicCapacity" {...form.register("transportCubicCapacity")} placeholder="e.g., 1500" className={`${focusRingClass} mt-1 border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800`} /></div>
                      </>
                    )}
                    <div><Label htmlFor="transportAmount" className="font-medium text-gray-700 dark:text-gray-300">Amount Claimed (Optional)</Label><Input type="number" step="0.01" id="transportAmount" {...form.register("transportAmount")} placeholder="e.g., 50.75" className={`${focusRingClass} mt-1 border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800`} /></div>
                  </div>
                )}

                {watchClaimType === "THESIS_PROJECT" && (
                  <div className="space-y-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20 shadow-sm">
                    <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300 border-b border-blue-200 dark:border-blue-700 pb-2 mb-4">Thesis/Project Details</h3>
                    <div>
                      <Label htmlFor="thesisType" className="font-medium text-gray-700 dark:text-gray-300">Type <span className="text-red-700">*</span></Label>
                      <Controller name="thesisType" control={form.control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <SelectTrigger id="thesisType" className={`${focusRingClass} mt-1 ${form.formState.errors.thesisType ? "border-red-600 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-slate-900`}><SelectValue placeholder="Select thesis/project type" /></SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700"><SelectItem value="SUPERVISION">Supervision</SelectItem><SelectItem value="EXAMINATION">Examination</SelectItem></SelectContent>
                        </Select>
                      )} />
                      {form.formState.errors.thesisType && <p className="text-sm text-red-700 mt-1">{form.formState.errors.thesisType.message}</p>}
                    </div>

                    {watchThesisType === "SUPERVISION" && (
                      <>
                        <div>
                          <Label htmlFor="thesisSupervisionRank" className="font-medium text-gray-700 dark:text-gray-300">Supervision Rank <span className="text-red-700">*</span></Label>
                            <Controller name="thesisSupervisionRank" control={form.control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <SelectTrigger id="thesisSupervisionRank" className={`${focusRingClass} mt-1 ${form.formState.errors.thesisSupervisionRank ? "border-red-600 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-slate-900`}><SelectValue placeholder="Select rank" /></SelectTrigger>
                              <SelectContent className="bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700">
                                <SelectItem value="PHD">PhD</SelectItem><SelectItem value="MPHIL">MPhil</SelectItem>
                                <SelectItem value="MA">MA</SelectItem><SelectItem value="MSC">MSc</SelectItem>
                                <SelectItem value="BED">BEd</SelectItem><SelectItem value="BSC">BSc</SelectItem>
                                <SelectItem value="BA">BA</SelectItem><SelectItem value="ED">Ed</SelectItem>
                              </SelectContent>
                            </Select>
                            )} />
                            {form.formState.errors.thesisSupervisionRank && <p className="text-sm text-red-700 mt-1">{form.formState.errors.thesisSupervisionRank.message}</p>}
                        </div>
                        <div className="space-y-3 pt-2">
                          <Label className="font-medium text-gray-700 dark:text-gray-300">Supervised Students <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Optional: Add if any)</span></Label>
                          {fields.map((item, index) => (
                            <div key={item.id} className="flex items-start gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800/50">
                              <div className="flex-grow space-y-2">
                                <Input {...form.register(`supervisedStudents.${index}.studentName`)} placeholder="Student Name" className={`${focusRingClass} ${form.formState.errors.supervisedStudents?.[index]?.studentName ? "border-red-600 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-slate-800`} />
                                {form.formState.errors.supervisedStudents?.[index]?.studentName && <p className="text-sm text-red-700">{form.formState.errors.supervisedStudents[index].studentName.message}</p>}
                                <Textarea {...form.register(`supervisedStudents.${index}.thesisTitle`)} placeholder="Thesis/Project Title" rows={2} className={`${focusRingClass} ${form.formState.errors.supervisedStudents?.[index]?.thesisTitle ? "border-red-600 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-slate-800`} />
                                {form.formState.errors.supervisedStudents?.[index]?.thesisTitle && <p className="text-sm text-red-700">{form.formState.errors.supervisedStudents[index].thesisTitle.message}</p>}
                              </div>
                              {(fields.length > 1 || (fields.length === 1 && (form.getValues(`supervisedStudents.${index}.studentName`) || form.getValues(`supervisedStudents.${index}.thesisTitle`)))) && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-1 text-red-700 hover:bg-red-100 dark:hover:bg-red-700/20 dark:text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => append({ studentName: "", thesisTitle: "" })}
                            className="text-violet-700 border-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:border-violet-600 dark:hover:bg-violet-700/20 dark:hover:text-violet-300"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Student
                          </Button>
                           {form.formState.errors.supervisedStudents?.message && !form.formState.errors.supervisedStudents?.[0] && <p className="text-sm text-red-700 mt-1">{form.formState.errors.supervisedStudents.message}</p>}
                        </div>
                      </>
                    )}

                    {watchThesisType === "EXAMINATION" && (
                      <>
                        <div>
                          <Label htmlFor="thesisExamCourseCode" className="font-medium text-gray-700 dark:text-gray-300">Course Code <span className="text-red-700">*</span></Label>
                          <Input id="thesisExamCourseCode" {...form.register("thesisExamCourseCode")} className={`${focusRingClass} mt-1 ${form.formState.errors.thesisExamCourseCode ? "border-red-600 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-slate-800`} />
                          {form.formState.errors.thesisExamCourseCode && <p className="text-sm text-red-700 mt-1">{form.formState.errors.thesisExamCourseCode.message}</p>}
                        </div>
                        <div><Label htmlFor="thesisExamDate" className="font-medium text-gray-700 dark:text-gray-300">Date of Examination</Label><Input type="date" id="thesisExamDate" {...form.register("thesisExamDate")} className={`${focusRingClass} mt-1 border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800`} /></div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 rounded-b-lg">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-violet-700 text-white hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 focus-visible:ring-violet-500 px-6 py-2.5 text-sm font-medium"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Submitting..." : "Submit Claim"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Toaster richColors position="top-right" />
    </div>
  );
}