// app/(auth)/signup/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
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
import { requestSignup } from '@/lib/actions/auth.actions'; 
import { getPublicCenters } from '@/lib/actions/registry.actions.js'; 
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Image from 'next/image';
import { UserPlus, AlertCircle } from 'lucide-react';

const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-600 dark:focus-visible:ring-violet-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";
const errorBorderClass = "border-red-500 dark:border-red-600 focus-visible:ring-red-500";
const normalBorderClass = "border-slate-300 dark:border-slate-700"; // Adjusted dark border

const signupRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6),
  role: z.enum(["COORDINATOR", "LECTURER", "STAFF_REGISTRY"], { 
    required_error: "Please select a role.",
    invalid_type_error: "Please select a valid role.",
  }),
  requestedCenterId: z.string().optional(),
  isCentersAvailable: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
}).superRefine((data, ctx) => {
    if (data.role === "LECTURER" && data.isCentersAvailable && !data.requestedCenterId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select a center for the lecturer role.",
            path: ["requestedCenterId"],
        });
    }
});

export default function SignupRequestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableCenters, setAvailableCenters] = useState([]);
  const [fetchCentersError, setFetchCentersError] = useState(null);

  const form = useForm({
    resolver: zodResolver(signupRequestSchema),
    defaultValues: {
      name: "", email: "", password: "", confirmPassword: "",
      role: undefined, requestedCenterId: "",
    },
  });

  const watchRole = form.watch("role");

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const result = await getPublicCenters();
        if (result.success) {
          setAvailableCenters(result.centers || []);
        } else {
          setFetchCentersError(result.error || "Could not load centers list.");
          toast.error("Could not load centers list. You may proceed without selecting if applying as Lecturer and no centers are listed.");
        }
      } catch (error) {
        setFetchCentersError("Failed to fetch centers. Check connection.");
        toast.error("Failed to fetch centers. Please check connection or try again.");
      }
    };
    fetchCenters();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const validationResult = signupRequestSchema.safeParse({
        ...data, isCentersAvailable: availableCenters.length > 0
    });

    if (!validationResult.success) {
        validationResult.error.errors.forEach(err => {
            form.setError(err.path.join('.'), { type: "manual", message: err.message });
        });
        if (validationResult.error.errors.length > 0) {
            toast.error(validationResult.error.errors[0].message);
        }
        setIsLoading(false); return;
    }
    const validatedData = validationResult.data;
    const signupData = {
      name: validatedData.name, email: validatedData.email, password: validatedData.password,
      role: validatedData.role,
      requestedCenterId: validatedData.role === 'LECTURER' ? validatedData.requestedCenterId || null : null,
    };
    const result = await requestSignup(signupData);
    setIsLoading(false);
    if (result.success) {
      toast.success(result.message || "Signup request submitted successfully! Please wait for approval.");
      form.reset();
      router.push('/login?status=signup_requested');
    } else {
      toast.error(result.error || "Signup request failed.");
      if (result.error?.toLowerCase().includes("email")) {
          form.setError("email", { type: "manual", message: result.error });
      } else {
          form.setError("root.serverError", { type: "manual", message: result.error });
      }
    }
  };
  
  const onError = (errors) => {
    console.error("Signup Form Validation Errors:", errors);
    for (const key in errors) {
        if (errors[key]?.message) { toast.error(errors[key].message); return; }
    }
  };

  const inputClasses = (fieldName) =>
    `h-10 text-sm bg-white dark:bg-slate-700/80 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 ${focusRingClass} ${form.formState.errors[fieldName] ? errorBorderClass : normalBorderClass}`;
  
  const selectTriggerClasses = (fieldName) => 
    `h-10 text-sm bg-white dark:bg-slate-700/80 text-slate-900 dark:text-slate-50 data-[placeholder]:text-slate-500 dark:data-[placeholder]:text-slate-400 ${focusRingClass} ${form.formState.errors[fieldName] ? errorBorderClass : normalBorderClass}`;

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 selection:bg-violet-500 selection:text-white 
                     bg-gradient-to-br from-red-500 via-purple-500 to-blue-500 
                     dark:from-red-800 dark:via-purple-800 dark:to-blue-800`}>
      <Card className="w-full max-w-md sm:max-w-lg shadow-2xl rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/30 dark:border-slate-700/50">
        <CardHeader className="text-center p-6 sm:p-8 bg-white dark:bg-slate-800">
          <div className="mx-auto mb-4 sm:mb-5 h-20 w-20 sm:h-24 sm:w-24 relative">
            <Image src="/uew.png" alt="University Logo" layout="fill" objectFit="contain" priority />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300">
            Request Account
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 pt-1 text-sm">
            UEW CODeL Claims Portal - New User Signup
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <CardContent className="grid gap-5 p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-700/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Full Name <span className="text-red-500">*</span></Label>
                <Input id="name" {...form.register("name")} disabled={isLoading} className={inputClasses("name")} placeholder="Enter your full name"/>
                {form.formState.errors.name && <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5"/>{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">Email Address <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" {...form.register("email")} disabled={isLoading} className={inputClasses("email")} placeholder="your.email@example.com"/>
                {form.formState.errors.email && <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5"/>{form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-200">Password <span className="text-red-500">*</span></Label>
                <Input id="password" type="password" {...form.register("password")} disabled={isLoading} className={inputClasses("password")} placeholder="Min. 6 characters"/>
                {form.formState.errors.password && <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5"/>{form.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-200">Confirm Password <span className="text-red-500">*</span></Label>
                <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} disabled={isLoading} className={inputClasses("confirmPassword")} placeholder="Re-enter password"/>
                {form.formState.errors.confirmPassword && <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5"/>{form.formState.errors.confirmPassword.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-slate-700 dark:text-slate-200">Requested Role <span className="text-red-500">*</span></Label>
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined} >
                    <SelectTrigger id="role" className={selectTriggerClasses("role")}>
                      <SelectValue placeholder="Select the role you are applying for" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 dark:text-white">
                      <SelectItem value="LECTURER">Lecturer</SelectItem>
                      <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                      <SelectItem value="STAFF_REGISTRY">Staff Registry</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.role && <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5"/>{form.formState.errors.role.message}</p>}
            </div>

            {watchRole === "LECTURER" && (
              <div className="space-y-1.5">
                <Label htmlFor="requestedCenterId" className="text-slate-700 dark:text-slate-200">Requested Center {availableCenters.length > 0 ? <span className="text-red-500">*</span> : "(Optional for now)"}</Label>
                <Controller
                  name="requestedCenterId"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading || !!fetchCentersError || availableCenters.length === 0}>
                      <SelectTrigger id="requestedCenterId" className={selectTriggerClasses("requestedCenterId")}>
                        <SelectValue placeholder={fetchCentersError ? "Error loading centers" : (availableCenters.length === 0 ? "No centers listed" : "Select your center")} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 dark:text-white max-h-48">
                        {availableCenters.length > 0 &&
                          availableCenters.map((center) => (
                            <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.requestedCenterId && <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5"/>{form.formState.errors.requestedCenterId.message}</p>}
              </div>
            )}
            {form.formState.errors.root?.serverError && <p className="text-sm text-red-600 dark:text-red-400 text-center bg-red-100 dark:bg-red-900/40 p-3 rounded-md flex items-center gap-2 justify-center"><AlertCircle className="h-4 w-4"/>{form.formState.errors.root.serverError.message}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-6 sm:p-8 bg-slate-100 dark:bg-slate-700/60 border-t dark:border-slate-700">
            <Button type="submit" className={`w-full text-white transition-all duration-300 ease-in-out transform hover:scale-[1.02] rounded-lg h-11 text-base font-semibold
                                             bg-gradient-to-r from-blue-600 via-violet-600 to-red-600 
                                             hover:from-blue-700 hover:via-violet-700 hover:to-red-700
                                             dark:from-blue-500 dark:via-violet-500 dark:to-red-500
                                             dark:hover:from-blue-600 dark:hover:via-violet-600 dark:hover:to-red-600
                                             disabled:opacity-70 ${focusRingClass}`} 
                    disabled={isLoading}>
              <UserPlus className="mr-2 h-5 w-5" />
              {isLoading ? "Submitting Request..." : "Request Account"}
            </Button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-300">
              Already have an account?{" "}
              <Link href="/login" className="underline text-violet-700 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 font-medium">
                Login here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <footer className="text-center mt-8 text-xs text-white/80 dark:text-slate-300/70">
        <p>&copy; {new Date().getFullYear()} University of Education, Winneba. All rights reserved.</p>
      </footer>
      <Toaster richColors position="top-center" />
    </div>
  );
}