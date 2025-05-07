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
import { getSession } from '@/lib/actions/auth.actions';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { PlusCircle, Trash2, Send } from 'lucide-react';

// --- Zod Schema for Validation ---
const supervisedStudentSchema = z.object({
  studentName: z.string().min(1, "Student name is required.").optional().or(z.literal('')), // Allow empty if not filled initially
  thesisTitle: z.string().min(1, "Thesis title is required.").optional().or(z.literal('')), // Allow empty
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
        // Make supervised students optional at the main schema level, but if provided, they must be valid
        if (data.supervisedStudents && data.supervisedStudents.length > 0) {
            data.supervisedStudents.forEach((student, index) => {
                if (!student.studentName && student.thesisTitle) { // Only error if one is filled but not the other
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
  const centerId = params?.centerId; // Make sure params and centerId are accessed safely

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      claimType: undefined,
      teachingDate: "",
      teachingStartTime: "",
      teachingEndTime: "",
      teachingHours: undefined, // Use undefined for optional numbers for Zod
      transportType: undefined,
      transportDestinationTo: "",
      transportDestinationFrom: "",
      transportRegNumber: "",
      transportCubicCapacity: undefined,
      transportAmount: undefined,
      thesisType: undefined,
      thesisSupervisionRank: undefined,
      supervisedStudents: [{ studentName: "", thesisTitle: "" }], // Start with one empty student
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

  useEffect(() => {
    const fetchUser = async () => {
      console.log("SubmitClaimPage: Fetching user session...");
      const session = await getSession();
      if (session?.userId) {
        console.log("SubmitClaimPage: User session found:", session);
        setCurrentUser(session);
      } else {
        console.error("SubmitClaimPage: No user session found, redirecting to login.");
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  // Log form errors for debugging
  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
        console.log("SubmitClaimPage: Form validation errors:", form.formState.errors);
    }
  }, [form.formState.errors]);


  const onSubmit = async (data) => {
    console.log("SubmitClaimPage: onSubmit function called.");
    console.log("SubmitClaimPage: Form data received:", data);

    if (!currentUser?.userId) {
      toast.error("User session not found. Please re-login.");
      console.error("SubmitClaimPage: Current user or user ID is missing in onSubmit.");
      return;
    }
    if (!centerId) {
      toast.error("Center information is missing. Cannot submit claim.");
      console.error("SubmitClaimPage: Center ID is missing in onSubmit.");
      return;
    }

    setIsLoading(true);
    console.log("SubmitClaimPage: setIsLoading(true)");

    const claimPayload = {
      ...data,
      submittedById: currentUser.userId,
      centerId: String(centerId), // Ensure centerId is a string
      // Ensure numeric fields are numbers or null, handle empty strings explicitly
      teachingHours: data.teachingHours !== undefined && data.teachingHours !== null && data.teachingHours !== "" ? parseFloat(data.teachingHours) : null,
      transportCubicCapacity: data.transportCubicCapacity !== undefined && data.transportCubicCapacity !== null && data.transportCubicCapacity !== "" ? parseInt(data.transportCubicCapacity) : null,
      transportAmount: data.transportAmount !== undefined && data.transportAmount !== null && data.transportAmount !== "" ? parseFloat(data.transportAmount) : null,
    };

    // Filter out supervisedStudents if not relevant or if all entries are completely empty
    if (data.claimType !== "THESIS_PROJECT" || data.thesisType !== "SUPERVISION" || !data.supervisedStudents || data.supervisedStudents.every(s => !s.studentName && !s.thesisTitle)) {
        delete claimPayload.supervisedStudents;
    } else {
        // Filter out any completely empty student entries from the array before sending
        claimPayload.supervisedStudents = data.supervisedStudents.filter(s => s.studentName || s.thesisTitle);
        if (claimPayload.supervisedStudents.length === 0) {
            delete claimPayload.supervisedStudents;
        }
    }
    
    console.log("SubmitClaimPage: Submitting claim with payload:", claimPayload);
    const result = await submitNewClaim(claimPayload);
    console.log("SubmitClaimPage: Server action result:", result);

    setIsLoading(false);
    console.log("SubmitClaimPage: setIsLoading(false)");

    if (result.success) {
      toast.success("Claim submitted successfully!");
      form.reset(); // Reset form to defaultValues
      router.push(`/lecturer/center/${centerId}/my-claims`);
    } else {
      toast.error(result.error || "Failed to submit claim.");
      console.error("SubmitClaimPage: Claim submission failed:", result.error);
    }
  };
  
  const onError = (errors) => {
    console.error("SubmitClaimPage: Form validation failed (onError callback):", errors);
    toast.error("Please correct the errors in the form.");
  };


  if (!currentUser) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Loading user session...</p></div>;
  }
  if (!centerId) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Loading center information...</p></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Submit New Claim</CardTitle>
          <CardDescription>Fill out the form below to submit your claim. Ensure all details are accurate.</CardDescription>
        </CardHeader>
        {/* Pass onError to handleSubmit to see validation errors that prevent onSubmit */}
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="claimType">Claim Type <span className="text-red-500">*</span></Label>
              <Controller
                name="claimType"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined} required>
                    <SelectTrigger id="claimType" className={form.formState.errors.claimType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select claim type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEACHING">Teaching</SelectItem>
                      <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
                      <SelectItem value="THESIS_PROJECT">Thesis/Project</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.claimType && <p className="text-sm text-red-500 mt-1">{form.formState.errors.claimType.message}</p>}
            </div>

            {watchClaimType === "TEACHING" && (
              <div className="space-y-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-800/30">
                <h3 className="font-semibold text-lg">Teaching Details</h3>
                <div>
                  <Label htmlFor="teachingDate">Date of Teaching <span className="text-red-500">*</span></Label>
                  <Input type="date" id="teachingDate" {...form.register("teachingDate")} className={form.formState.errors.teachingDate ? "border-red-500" : ""} />
                  {form.formState.errors.teachingDate && <p className="text-sm text-red-500 mt-1">{form.formState.errors.teachingDate.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="teachingStartTime">Start Time</Label><Input type="time" id="teachingStartTime" {...form.register("teachingStartTime")} /></div>
                  <div><Label htmlFor="teachingEndTime">End Time</Label><Input type="time" id="teachingEndTime" {...form.register("teachingEndTime")} /></div>
                </div>
                <div>
                  <Label htmlFor="teachingHours">Contact Hours <span className="text-red-500">*</span></Label>
                  <Input type="number" step="0.1" id="teachingHours" {...form.register("teachingHours")} placeholder="e.g., 2.5" className={form.formState.errors.teachingHours ? "border-red-500" : ""} />
                  {form.formState.errors.teachingHours && <p className="text-sm text-red-500 mt-1">{form.formState.errors.teachingHours.message}</p>}
                </div>
              </div>
            )}

            {watchClaimType === "TRANSPORTATION" && (
              <div className="space-y-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-800/30">
                <h3 className="font-semibold text-lg">Transportation Details</h3>
                <div>
                  <Label htmlFor="transportType">Transport Type <span className="text-red-500">*</span></Label>
                  <Controller name="transportType" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <SelectTrigger id="transportType" className={form.formState.errors.transportType ? "border-red-500" : ""}><SelectValue placeholder="Select transport type" /></SelectTrigger>
                      <SelectContent><SelectItem value="PUBLIC">Public</SelectItem><SelectItem value="PRIVATE">Private</SelectItem></SelectContent>
                    </Select>
                  )} />
                  {form.formState.errors.transportType && <p className="text-sm text-red-500 mt-1">{form.formState.errors.transportType.message}</p>}
                </div>
                <div>
                  <Label htmlFor="transportDestinationFrom">From <span className="text-red-500">*</span></Label>
                  <Input id="transportDestinationFrom" {...form.register("transportDestinationFrom")} placeholder="Origin location" className={form.formState.errors.transportDestinationFrom ? "border-red-500" : ""} />
                   {form.formState.errors.transportDestinationFrom && <p className="text-sm text-red-500 mt-1">{form.formState.errors.transportDestinationFrom.message}</p>}
                </div>
                <div>
                  <Label htmlFor="transportDestinationTo">To <span className="text-red-500">*</span></Label>
                  <Input id="transportDestinationTo" {...form.register("transportDestinationTo")} placeholder="Destination location" className={form.formState.errors.transportDestinationTo ? "border-red-500" : ""} />
                  {form.formState.errors.transportDestinationTo && <p className="text-sm text-red-500 mt-1">{form.formState.errors.transportDestinationTo.message}</p>}
                </div>
                {form.watch("transportType") === "PRIVATE" && (
                  <>
                    <div>
                      <Label htmlFor="transportRegNumber">Vehicle Registration No. <span className="text-red-500">*</span></Label>
                      <Input id="transportRegNumber" {...form.register("transportRegNumber")} className={form.formState.errors.transportRegNumber ? "border-red-500" : ""} />
                      {form.formState.errors.transportRegNumber && <p className="text-sm text-red-500 mt-1">{form.formState.errors.transportRegNumber.message}</p>}
                    </div>
                    <div><Label htmlFor="transportCubicCapacity">Cubic Capacity (cc)</Label><Input type="number" id="transportCubicCapacity" {...form.register("transportCubicCapacity")} placeholder="e.g., 1500" /></div>
                  </>
                )}
                <div><Label htmlFor="transportAmount">Amount Claimed (Optional)</Label><Input type="number" step="0.01" id="transportAmount" {...form.register("transportAmount")} placeholder="e.g., 50.75" /></div>
              </div>
            )}

            {watchClaimType === "THESIS_PROJECT" && (
              <div className="space-y-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-800/30">
                <h3 className="font-semibold text-lg">Thesis/Project Details</h3>
                <div>
                  <Label htmlFor="thesisType">Type <span className="text-red-500">*</span></Label>
                  <Controller name="thesisType" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <SelectTrigger id="thesisType" className={form.formState.errors.thesisType ? "border-red-500" : ""}><SelectValue placeholder="Select thesis/project type" /></SelectTrigger>
                      <SelectContent><SelectItem value="SUPERVISION">Supervision</SelectItem><SelectItem value="EXAMINATION">Examination</SelectItem></SelectContent>
                    </Select>
                  )} />
                  {form.formState.errors.thesisType && <p className="text-sm text-red-500 mt-1">{form.formState.errors.thesisType.message}</p>}
                </div>

                {watchThesisType === "SUPERVISION" && (
                  <>
                    <div>
                      <Label htmlFor="thesisSupervisionRank">Supervision Rank <span className="text-red-500">*</span></Label>
                       <Controller name="thesisSupervisionRank" control={form.control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <SelectTrigger id="thesisSupervisionRank" className={form.formState.errors.thesisSupervisionRank ? "border-red-500" : ""}><SelectValue placeholder="Select rank" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PHD">PhD</SelectItem><SelectItem value="MPHIL">MPhil</SelectItem>
                            <SelectItem value="MA">MA</SelectItem><SelectItem value="MSC">MSc</SelectItem>
                            <SelectItem value="BED">BEd</SelectItem><SelectItem value="BSC">BSc</SelectItem>
                            <SelectItem value="BA">BA</SelectItem><SelectItem value="ED">Ed</SelectItem>
                          </SelectContent>
                        </Select>
                       )} />
                       {form.formState.errors.thesisSupervisionRank && <p className="text-sm text-red-500 mt-1">{form.formState.errors.thesisSupervisionRank.message}</p>}
                    </div>
                    <div className="space-y-3">
                      <Label>Supervised Students (Optional: add if any)</Label>
                      {fields.map((item, index) => (
                        <div key={item.id} className="flex items-start gap-2 p-3 border rounded-md bg-white dark:bg-slate-700/50">
                          <div className="flex-grow space-y-2">
                            <Input {...form.register(`supervisedStudents.${index}.studentName`)} placeholder="Student Name" className={form.formState.errors.supervisedStudents?.[index]?.studentName ? "border-red-500" : ""} />
                            {form.formState.errors.supervisedStudents?.[index]?.studentName && <p className="text-sm text-red-500">{form.formState.errors.supervisedStudents[index].studentName.message}</p>}
                            <Textarea {...form.register(`supervisedStudents.${index}.thesisTitle`)} placeholder="Thesis/Project Title" className={form.formState.errors.supervisedStudents?.[index]?.thesisTitle ? "border-red-500" : ""} />
                            {form.formState.errors.supervisedStudents?.[index]?.thesisTitle && <p className="text-sm text-red-500">{form.formState.errors.supervisedStudents[index].thesisTitle.message}</p>}
                          </div>
                          {/* Only show remove button if more than one student entry OR if the single entry is not empty, to allow clearing the first one */}
                          {(fields.length > 1 || (fields.length === 1 && (form.getValues(`supervisedStudents.${index}.studentName`) || form.getValues(`supervisedStudents.${index}.thesisTitle`)))) && (
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="mt-1">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => append({ studentName: "", thesisTitle: "" })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Student
                      </Button>
                       {form.formState.errors.supervisedStudents?.message && !form.formState.errors.supervisedStudents?.[0] && <p className="text-sm text-red-500 mt-1">{form.formState.errors.supervisedStudents.message}</p>}
                    </div>
                  </>
                )}

                {watchThesisType === "EXAMINATION" && (
                  <>
                    <div>
                      <Label htmlFor="thesisExamCourseCode">Course Code <span className="text-red-500">*</span></Label>
                      <Input id="thesisExamCourseCode" {...form.register("thesisExamCourseCode")} className={form.formState.errors.thesisExamCourseCode ? "border-red-500" : ""} />
                      {form.formState.errors.thesisExamCourseCode && <p className="text-sm text-red-500 mt-1">{form.formState.errors.thesisExamCourseCode.message}</p>}
                    </div>
                    <div><Label htmlFor="thesisExamDate">Date of Examination</Label><Input type="date" id="thesisExamDate" {...form.register("thesisExamDate")} /></div>
                  </>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? "Submitting..." : "Submit Claim"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Toaster richColors position="top-right" />
    </div>
  );
}
