// app/(auth)/login/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/actions/auth.actions";
import { LogIn, ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await loginUser({ email, password });
      if (result.success && result.redirectTo) {
        toast.success(result.message || "Login successful!");
        router.push(result.redirectTo);
      } else if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setError("An unexpected response was received.");
        toast.error("An unexpected response was received.");
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-between overflow-hidden">
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
            <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-red-500/60 shadow-lg">
              <Image src="/uew.png" alt="UEW Logo" fill className="object-contain bg-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight group-hover:text-red-400 transition-colors">
                University of Education
              </p>
              <p className="text-white/80 text-xs font-medium tracking-wider uppercase">
                College for Distance and e-Learning
              </p>
            </div>
          </Link>
        </div>

        {/* Center - Hero */}
        <div className="relative z-10 px-8 pb-4">
          <span className="inline-block bg-white/10 text-white text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border border-white/20 mb-4">
            Staff Portal
          </span>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-3">
            Academic Claims
            <br />
            <span className="text-white">Management System</span>
          </h1>
          <p className="text-slate-300 text-base leading-relaxed max-w-md">
            Submit, track, and manage teaching claims with the centralized digital platform for CODeL academic staff.
          </p>
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

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-slate-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900 p-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-red-500/60">
              <Image src="/uew.png" alt="UEW Logo" fill className="object-contain bg-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">University of Education, Winneba</p>
              <p className="text-red-500 text-xs">CODeL Claims Portal</p>
            </div>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <div className="lg:hidden mb-6 flex justify-center">
                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-red-500/40 shadow-md">
                  <Image src="/uew.png" alt="UEW Logo" fill className="object-contain bg-white" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 mt-2">Sign in to access your claims dashboard</p>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" aria-live="assertive" className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
                <p>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@uew.edu.gh"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                    className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-red-500/40 focus-visible:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-700 font-medium text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                    className="pl-10 pr-10 h-11 bg-white border-slate-200 focus-visible:ring-red-500/40 focus-visible:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

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
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-3 text-slate-400 font-medium">New to the portal?</span>
              </div>
            </div>

            {/* Signup Link */}
            <Link href="/signup" className="block">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 font-semibold transition-all"
                size="lg"
              >
                <span className="flex items-center gap-2">
                  Request Staff Account
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </Link>

            <p className="lg:hidden mt-8 text-center text-xs text-slate-400">
              &copy; {new Date().getFullYear()} University of Education, Winneba
            </p>
          </div>
        </div>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
