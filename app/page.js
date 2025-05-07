// app/page.jsx
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn, UserPlus } from 'lucide-react'; // Icons
import Image from 'next/image'; // Import Next.js Image component for optimized images

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-300 via-red-100 to-blue-700 dark:from-red-800 dark:via-red-900 dark:to-blue-900 p-4 selection:bg-blue-500 selection:text-white">
      <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="text-center bg-white dark:bg-gray-800 p-6">
          <div className="mx-auto mb-4 h-24 w-24 relative">
            <Image
              src="/uew.png" // Ensure uew.png is in your /public folder
              alt="University of Education, Winneba Logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-800 dark:text-blue-300">
            University of Education, Winneba
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 pt-1 text-sm sm:text-base">
            College of Distance Education - Claims Portal
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-5 p-6 sm:p-8 bg-gray-50 dark:bg-gray-700">
          <p className="text-center text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            {/* Corrected unescaped apostrophe here */}
            Please log in to manage claims or request an account if you&apos;re a new Coordinator or Lecturer.
          </p>
          <Button asChild size="lg" className="w-full sm:w-4/5 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 rounded-lg">
            <Link href="/login">
              <LogIn className="mr-2 h-5 w-5" /> Login
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-4/5 border-blue-700 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out transform hover:scale-105 rounded-lg">
            <Link href="/signup">
              <UserPlus className="mr-2 h-5 w-5" /> Request Account
            </Link>
          </Button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-3">
            Account requests require approval from the Registry.
          </p>
        </CardContent>
      </Card>
      <footer className="text-center mt-8 text-xs text-white/70">
        <p>&copy; {new Date().getFullYear()} University of Education, Winneba. All rights reserved.</p>
      </footer>
    </div>
  );
}
