// app/(auth)/login/page.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link for the signup prompt
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
import { loginUser } from '@/lib/actions/auth.actions';
import Image from 'next/image'; // Import Next.js Image component
import { LogIn } from 'lucide-react';
import { Toaster, toast } from 'sonner'; // Import Toaster and toast

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // For general form errors
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(''); // Clear previous general errors

    if (!email || !password) {
      setError('Please enter both email and password.');
      // You can also use toast for field-specific errors if preferred
      // toast.error('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await loginUser({ email, password });

      if (result.success && result.redirectTo) {
        toast.success(result.message || "Login successful!");
        router.push(result.redirectTo);
      } else if (result.error) {
        setError(result.error); // Display error message from server action
        toast.error(result.error);
      } else {
        setError('An unexpected response was received from the server.');
        toast.error('An unexpected response was received from the server.');
      }
    } catch (err) {
      console.error('Login submission error:', err);
      setError('An unexpected error occurred during login. Please try again.');
      toast.error('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-300 via-red-100 to-blue-700 dark:from-red-800 dark:via-red-900 dark:to-blue-900 p-4 selection:bg-blue-500 selection:text-white">
      <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden">
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
            Login to ClaimSystem
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 pt-1 text-sm">
            University of Education, Winneba - CODeL Claims Portal
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-5 p-6 sm:p-8 bg-gray-50 dark:bg-gray-700">
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@uew.edu.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
                className="dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
                className="dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 text-center bg-red-100 dark:bg-red-900/30 p-3 rounded-md">
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-6 bg-gray-50 dark:bg-gray-700">
            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 rounded-lg" disabled={isLoading} size="lg">
              <LogIn className="mr-2 h-5 w-5" />
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              New Coordinator or Lecturer?{" "}
              <Link href="/signup" className="underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Request an Account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <footer className="text-center mt-8 text-xs text-white/70">
        <p>&copy; {new Date().getFullYear()} University of Education, Winneba. All rights reserved.</p>
      </footer>
      <Toaster richColors position="top-right" /> {/* For toast notifications */}
    </div>
  );
}
