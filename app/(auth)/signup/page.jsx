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
import Image from 'next/image'; // Import Next.js Image component
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-300 via-red-100 to-blue-700 dark:from-red-800 dark:via-red-900 dark:to-blue-900 p-4 selection:bg-blue-500 selection:text-white">
      <Card className="w-full max-w-lg shadow-2xl rounded-xl overflow-hidden"> {/* Increased max-width for signup form */}
        <CardHeader className="text-center bg-white dark:bg-gray-800 p-6">
          <div className="mx-auto mb-4 h-20 w-20 sm:h-24 sm:w-24 relative">
            <Image
              src="/uew.png" // IMPORTANT: Replace with your actual logo file name in /public
              alt="University of Education, Winneba Logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-800 dark:text-blue-300">
            Request Account
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 pt-1 text-sm">
            UEW CODeL Claims Portal - New User Signup
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <CardContent className="grid gap-5 p-6 sm:p-8 bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...form.register("name")} disabled={isLoading} className={form.formState.errors.name ? "border-red-500" : "dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"}/>
                {form.formState.errors.name && <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...form.register("email")} disabled={isLoading} className={form.formState.errors.email ? "border-red-500" : "dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"}/>
                 {form.formState.errors.email && <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} disabled={isLoading} className={form.formState.errors.password ? "border-red-500" : "dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"}/>
                {form.formState.errors.password && <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} disabled={isLoading} className={form.formState.errors.confirmPassword ? "border-red-500" : "dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"}/>
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
                    <SelectTrigger id="role" className={form.formState.errors.role ? "border-red-500" : "dark:bg-gray-600 dark:text-white"}>
                      <SelectValue placeholder="Select the role you are applying for" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:text-white">
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
                <Label htmlFor="requestedCenterId">Requested Center {availableCenters.length > 0 ? "" : "(Optional for now)"}</Label>
                <Controller
                  name="requestedCenterId"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading || !!fetchCentersError || availableCenters.length === 0}>
                      <SelectTrigger id="requestedCenterId" className={form.formState.errors.requestedCenterId ? "border-red-500" : "dark:bg-gray-600 dark:text-white"}>
                        <SelectValue placeholder={fetchCentersError ? "Error loading centers" : (availableCenters.length === 0 ? "No centers available" : "Select the center you wish to join")} />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:text-white">
                        {/* No explicit "None" item needed; placeholder handles it */}
                        {availableCenters.length > 0 &&
                          availableCenters.map((center) => (
                            <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                 {form.formState.errors.requestedCenterId && <p className="text-sm text-red-500 mt-1">{form.formState.errors.requestedCenterId.message}</p>}
              </div>
            )}
             {form.formState.errors.root?.serverError && <p className="text-sm text-red-600 text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{form.formState.errors.root.serverError.message}</p>}

          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-6 bg-gray-50 dark:bg-gray-700">
            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 rounded-lg" disabled={isLoading} size="lg">
              <UserPlus className="mr-2 h-5 w-5" />
              {isLoading ? "Submitting Request..." : "Request Signup"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Login here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <footer className="text-center mt-8 text-xs text-white/70">
        <p>&copy; {new Date().getFullYear()} University of Education, Winneba. All rights reserved.</p>
      </footer>
      <Toaster richColors position="top-right" />
    </div>
  );
}
