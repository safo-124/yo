// app/(auth)/signup/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestSignup } from "@/lib/actions/auth.actions";
import { getPublicCenters } from "@/lib/actions/registry.actions.js";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  UserPlus, AlertCircle, ArrowRight, Mail, Lock, User, Eye, EyeOff,
  Building2, Phone, Landmark, CreditCard, BadgeCheck
} from "lucide-react";

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
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
}).superRefine((data, ctx) => {
  if (data.role === "LECTURER") {
    if (data.isCentersAvailable && !data.requestedCenterId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a center for the lecturer role.", path: ["requestedCenterId"] });
    }
    if (!data.bankName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bank name is required for lecturers.", path: ["bankName"] });
    }
    if (!data.bankBranch?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bank branch is required for lecturers.", path: ["bankBranch"] });
    }
    if (!data.accountName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Account name is required for lecturers.", path: ["accountName"] });
    }
    if (!data.accountNumber?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Account number is required for lecturers.", path: ["accountNumber"] });
    } else if (!/^\d+$/.test(data.accountNumber.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Account number must be numeric.", path: ["accountNumber"] });
    }
    if (!data.phoneNumber?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Phone number is required for lecturers.", path: ["phoneNumber"] });
    } else if (!/^\+?\d{10,15}$/.test(data.phoneNumber.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid phone number format.", path: ["phoneNumber"] });
    }
  }
});

export default function SignupRequestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableCenters, setAvailableCenters] = useState([]);
  const [fetchCentersError, setFetchCentersError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(signupRequestSchema),
    defaultValues: {
      name: "", email: "", password: "", confirmPassword: "",
      role: undefined, requestedCenterId: "",
      bankName: "", bankBranch: "", accountName: "", accountNumber: "", phoneNumber: "",
    },
  });

  const watchRole = form.watch("role");

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const result = await getPublicCenters();
        if (result.success) {
          setAvailableCenters(result.centers || []);
          form.setValue("isCentersAvailable", (result.centers || []).length > 0, { shouldValidate: true });
        } else {
          setFetchCentersError(result.error || "Could not load centers list.");
          toast.error("Could not load centers list.");
          form.setValue("isCentersAvailable", false, { shouldValidate: true });
        }
      } catch (error) {
        setFetchCentersError("Failed to fetch centers.");
        toast.error("Failed to fetch centers.");
        form.setValue("isCentersAvailable", false, { shouldValidate: true });
      }
    };
    fetchCenters();
  }, [form]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const validationResult = signupRequestSchema.safeParse({ ...data, isCentersAvailable: availableCenters.length > 0 });
    if (!validationResult.success) {
      validationResult.error.errors.forEach(err => {
        form.setError(err.path.join("."), { type: "manual", message: err.message });
      });
      if (validationResult.error.errors.length > 0) toast.error(validationResult.error.errors[0].message);
      setIsLoading(false);
      return;
    }
    const v = validationResult.data;
    const signupData = {
      name: v.name, email: v.email, password: v.password, role: v.role,
      requestedCenterId: v.role === "LECTURER" ? v.requestedCenterId || null : null,
      bankName: v.role === "LECTURER" ? v.bankName?.trim() || null : null,
      bankBranch: v.role === "LECTURER" ? v.bankBranch?.trim() || null : null,
      accountName: v.role === "LECTURER" ? v.accountName?.trim() || null : null,
      accountNumber: v.role === "LECTURER" ? v.accountNumber?.trim() || null : null,
      phoneNumber: v.role === "LECTURER" ? v.phoneNumber?.trim() || null : null,
    };

    const result = await requestSignup(signupData);
    setIsLoading(false);
    if (result.success) {
      toast.success(result.message || "Signup request submitted! Awaiting approval.");
      form.reset();
      router.push("/login?status=signup_requested");
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
    for (const key in errors) {
      if (errors[key]?.message) { toast.error(errors[key].message); return; }
    }
  };

  const FieldError = ({ name }) => {
    const err = form.formState.errors[name];
    if (!err) return null;
    return (
      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        {err.message}
      </p>
    );
  };

  const inputCls = (name) =>
    `h-11 bg-white border-slate-200 focus-visible:ring-yellow-500/40 focus-visible:border-yellow-500 ${form.formState.errors[name] ? "border-red-400 focus-visible:ring-red-400/40 focus-visible:border-red-400" : ""}`;

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image & Branding (same as login) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative bg-slate-900 flex-col justify-between overflow-hidden">
        <Image
          src="/applv.jpg"
          alt="University of Education, Winneba Campus"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/40" />

        {/* Top - Logo */}
        <div className="relative z-10 p-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-yellow-500/60 shadow-lg">
              <Image src="/uew.png" alt="UEW Logo" fill className="object-contain bg-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight group-hover:text-yellow-400 transition-colors">
                University of Education
              </p>
              <p className="text-yellow-500 text-xs font-medium tracking-wider uppercase">
                College for Distance and e-Learning
              </p>
            </div>
          </Link>
        </div>

        {/* Center - Hero Text */}
        <div className="relative z-10 px-8 pb-4">
          <span className="inline-block bg-yellow-500/20 text-yellow-400 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border border-yellow-500/30 mb-4">
            New Staff Registration
          </span>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-3">
            Join the Claims
            <br />
            <span className="text-yellow-400">Management Portal</span>
          </h1>
          <p className="text-slate-300 text-base leading-relaxed max-w-md">
            Request access to submit, track, and manage your teaching claims. Your account will be verified by the Registry Office.
          </p>

          {/* Steps */}
          <div className="mt-8 space-y-3">
            {[
              { num: "1", text: "Fill in your details below" },
              { num: "2", text: "Registry verifies your identity" },
              { num: "3", text: "Access granted within 2-3 business days" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 text-xs font-bold flex-shrink-0">
                  {s.num}
                </div>
                <p className="text-slate-300 text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 p-8 pt-0">
          <div className="border-t border-white/10 pt-4">
            <p className="text-slate-400 text-xs">
              &copy; {new Date().getFullYear()} University of Education, Winneba. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col bg-slate-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900 p-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-yellow-500/60">
              <Image src="/uew.png" alt="UEW Logo" fill className="object-contain bg-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">University of Education, Winneba</p>
              <p className="text-yellow-500 text-xs">CODeL Claims Portal</p>
            </div>
          </Link>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-lg mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="lg:hidden mb-4 flex justify-center">
                <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-yellow-500/40 shadow-md">
                  <Image src="/uew.png" alt="UEW Logo" fill className="object-contain bg-white" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Request an Account</h2>
              <p className="text-slate-500 mt-1.5 text-sm">Complete the form to request portal access. All fields marked <span className="text-red-500">*</span> are required.</p>
            </div>

            {/* Server Error */}
            {form.formState.errors.root?.serverError && (
              <div role="alert" className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>{form.formState.errors.root.serverError.message}</p>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-5">
              {/* Personal Info Section */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-slate-700 font-medium text-sm">Full Name <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input id="name" {...form.register("name")} disabled={isLoading} className={`pl-10 ${inputCls("name")}`} placeholder="John Doe" />
                    </div>
                    <FieldError name="name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Email Address <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input id="email" type="email" {...form.register("email")} disabled={isLoading} className={`pl-10 ${inputCls("email")}`} placeholder="user@uew.edu.gh" />
                    </div>
                    <FieldError name="email" />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Security</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-slate-700 font-medium text-sm">Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input id="password" type={showPassword ? "text" : "password"} {...form.register("password")} disabled={isLoading} className={`pl-10 pr-10 ${inputCls("password")}`} placeholder="Min. 6 characters" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FieldError name="password" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-slate-700 font-medium text-sm">Confirm Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...form.register("confirmPassword")} disabled={isLoading} className={`pl-10 pr-10 ${inputCls("confirmPassword")}`} placeholder="Re-enter password" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FieldError name="confirmPassword" />
                  </div>
                </div>
              </div>

              {/* Role Section */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Role Assignment</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-slate-700 font-medium text-sm">Requested Role <span className="text-red-500">*</span></Label>
                  <Controller
                    name="role"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <SelectTrigger id="role" className={`h-11 bg-white border-slate-200 ${form.formState.errors.role ? "border-red-400" : ""}`}>
                          <SelectValue placeholder="Select the role you are applying for" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LECTURER">Lecturer</SelectItem>
                          <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                          <SelectItem value="STAFF_REGISTRY">Staff Registry</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError name="role" />
                </div>
              </div>

              {/* Lecturer-specific fields */}
              {watchRole === "LECTURER" && (
                <>
                  {/* Center */}
                  <div className="space-y-1.5">
                    <Label htmlFor="requestedCenterId" className="text-slate-700 font-medium text-sm">
                      Requested Center {availableCenters.length > 0 ? <span className="text-red-500">*</span> : <span className="text-slate-400 text-xs">(Optional)</span>}
                    </Label>
                    <Controller
                      name="requestedCenterId"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading || !!fetchCentersError || availableCenters.length === 0}>
                          <SelectTrigger id="requestedCenterId" className={`h-11 bg-white border-slate-200 ${form.formState.errors.requestedCenterId ? "border-red-400" : ""}`}>
                            <SelectValue placeholder={fetchCentersError ? "Error loading centers" : (availableCenters.length === 0 ? "No centers listed" : "Select your center")} />
                          </SelectTrigger>
                          <SelectContent className="max-h-48">
                            {availableCenters.map((center) => (
                              <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError name="requestedCenterId" />
                  </div>

                  {/* Bank Details */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Bank Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="bankName" className="text-slate-700 font-medium text-sm">Bank Name <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input id="bankName" {...form.register("bankName")} disabled={isLoading} className={`pl-10 ${inputCls("bankName")}`} placeholder="e.g., GCB Bank" />
                        </div>
                        <FieldError name="bankName" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="bankBranch" className="text-slate-700 font-medium text-sm">Bank Branch <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input id="bankBranch" {...form.register("bankBranch")} disabled={isLoading} className={`pl-10 ${inputCls("bankBranch")}`} placeholder="e.g., Winneba Branch" />
                        </div>
                        <FieldError name="bankBranch" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="accountName" className="text-slate-700 font-medium text-sm">Account Name <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input id="accountName" {...form.register("accountName")} disabled={isLoading} className={`pl-10 ${inputCls("accountName")}`} placeholder="Name on account" />
                        </div>
                        <FieldError name="accountName" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="accountNumber" className="text-slate-700 font-medium text-sm">Account Number <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input id="accountNumber" {...form.register("accountNumber")} disabled={isLoading} className={`pl-10 ${inputCls("accountNumber")}`} placeholder="e.g., 1234567890" />
                        </div>
                        <FieldError name="accountNumber" />
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-slate-700 font-medium text-sm">Phone Number <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input id="phoneNumber" type="tel" {...form.register("phoneNumber")} disabled={isLoading} className={`pl-10 ${inputCls("phoneNumber")}`} placeholder="e.g., +233241234567" />
                    </div>
                    <FieldError name="phoneNumber" />
                  </div>
                </>
              )}

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting Request...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Request Account
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-3 text-slate-400 font-medium">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <Link href="/login" className="block">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-yellow-500/50 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 font-semibold transition-all"
                size="lg"
              >
                <span className="flex items-center gap-2">
                  Sign In Instead
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </Link>

            <p className="lg:hidden mt-6 text-center text-xs text-slate-400">
              &copy; {new Date().getFullYear()} University of Education, Winneba
            </p>
          </div>
        </div>
      </div>

      <Toaster richColors position="top-center" />
    </div>
  );
}