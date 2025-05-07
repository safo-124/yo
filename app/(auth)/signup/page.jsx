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
import { requestSignup } from '@/lib/actions/auth.actions'; // Action to submit request
import { getPublicCenters } from '@/lib/actions/registry.actions.js'; // Action to get centers list
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { UserPlus } from 'lucide-react';

// Zod Schema for Signup Request Form
const signupRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6),
  role: z.enum(["COORDINATOR", "LECTURER"], { required_error: "Please select a role." }),
  requestedCenterId: z.string().optional(), // Optional, but becomes required for Lecturer if centers exist
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
}).superRefine((data, ctx) => {
    // If role is Lecturer and centers are available, requestedCenterId becomes required
    // Note: We can't directly check available centers here, so this validation might be better handled post-submit or based on fetched centers state.
    // For now, we make it optional in the schema and rely on the form logic.
    // if (data.role === "LECTURER" && !data.requestedCenterId) {
    //   ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a center for the lecturer role.", path: ["requestedCenterId"] });
    // }
});


export default function SignupRequestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableCenters, setAvailableCenters] = useState([]);
  const [fetchCentersError, setFetchCentersError] = useState(null);

  const form = useForm({
    resolver: zodResolver(signupRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      requestedCenterId: "",
    },
  });

  const watchRole = form.watch("role");

  // Fetch centers when the component mounts
  useEffect(() => {
    const fetchCenters = async () => {
      const result = await getPublicCenters();
      if (result.success) {
        setAvailableCenters(result.centers);
      } else {
        setFetchCentersError(result.error || "Could not load centers.");
        toast.error("Could not load centers list for selection.");
      }
    };
    fetchCenters();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);

    // Add validation: if role is Lecturer and centers exist, center must be selected
    if (data.role === "LECTURER" && availableCenters.length > 0 && !data.requestedCenterId) {
        form.setError("requestedCenterId", { type: "manual", message: "Please select a center for the lecturer role." });
        setIsLoading(false);
        return;
    }

    const signupData = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      requestedCenterId: data.role === 'LECTURER' ? data.requestedCenterId || null : null,
    };

    const result = await requestSignup(signupData);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      form.reset();
      // Optionally redirect to login or a "request submitted" page
      router.push('/login?signup=requested');
    } else {
      toast.error(result.error || "Signup request failed.");
      // Set error on specific field if possible (e.g., email exists)
      if (result.error?.toLowerCase().includes("email")) {
          form.setError("email", { type: "manual", message: result.error });
      } else {
          // Set a general form error if specific field isn't clear
          form.setError("root.serverError", { type: "manual", message: result.error });
      }
    }
  };
  
  const onError = (errors) => {
    console.error("Signup Form Validation Errors:", errors);
    // Toast maybe too noisy for validation errors, rely on field messages
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Request Account Signup</CardTitle>
          <CardDescription className="text-center">
            Enter your details below. Your request will be sent to the Registry for approval.
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...form.register("name")} disabled={isLoading} />
                {form.formState.errors.name && <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...form.register("email")} disabled={isLoading} />
                 {form.formState.errors.email && <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} disabled={isLoading} />
                {form.formState.errors.password && <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} disabled={isLoading} />
                {form.formState.errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{form.formState.errors.confirmPassword.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="role">Requested Role</Label>
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined} required>
                    <SelectTrigger id="role" className={form.formState.errors.role ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select the role you are applying for" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                      <SelectItem value="LECTURER">Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.role && <p className="text-sm text-red-500 mt-1">{form.formState.errors.role.message}</p>}
            </div>

            {/* Conditional Center Selection for Lecturers */}
            {watchRole === "LECTURER" && (
              <div className="space-y-1">
                <Label htmlFor="requestedCenterId">Requested Center {availableCenters.length > 0 ? "" : "(Optional)"}</Label>
                <Controller
                  name="requestedCenterId"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading || fetchCentersError || availableCenters.length === 0}>
                      <SelectTrigger id="requestedCenterId" className={form.formState.errors.requestedCenterId ? "border-red-500" : ""}>
                        <SelectValue placeholder={fetchCentersError ? "Error loading centers" : "Select the center you wish to join"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCenters.length > 0 ? (
                          availableCenters.map((center) => (
                            <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            {fetchCentersError ? "Could not load centers." : "No centers available for selection."}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                 {form.formState.errors.requestedCenterId && <p className="text-sm text-red-500 mt-1">{form.formState.errors.requestedCenterId.message}</p>}
              </div>
            )}
             {form.formState.errors.root?.serverError && <p className="text-sm text-red-600 text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{form.formState.errors.root.serverError.message}</p>}

          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting Request..." : "Request Signup"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline hover:text-primary">
                Login here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <Toaster richColors position="top-right" />
    </div>
  );
}
