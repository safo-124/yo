// app/(dashboard)/registry/courses/page.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import { getPrograms, getDepartments, getCourses, getLecturersForAssignment } from '@/lib/actions/registry.actions'; // Import all necessary actions
import {
  Alert, AlertDescription, AlertTitle
} from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, BookOpenCheck } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import ManageCoursesTab from '../_components/ManageCoursesTab';

export default async function RegistryCoursesPage() {
  const session = await getSession();

  // Authorization check: Only Registry users can access this page
  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  // Fetch all initial data in parallel
  const [programsResult, departmentsResult, coursesResult, lecturersResult] = await Promise.all([
    getPrograms(),             // Fetches all programs
    getDepartments(),           // Fetches all departments
    getCourses(),               // Fetches all courses
    getLecturersForAssignment() // Fetches all lecturers for assignment dropdowns
  ]);

  // Handle data fetching errors
  if (!programsResult.success || !departmentsResult.success || !coursesResult.success || !lecturersResult.success) {
    const errorMsg =
      programsResult.error ||
      departmentsResult.error ||
      coursesResult.error ||
      lecturersResult.error ||
      "Could not load necessary data for managing courses and programs.";
    return (
      <div className="w-full py-6 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-300 dark:bg-red-800/20 dark:border-red-700/50 text-red-700 dark:text-red-300 shadow-md rounded-lg max-w-2xl w-full"
        >
          <FileWarning className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="font-semibold text-lg text-red-800 dark:text-red-200">Error Loading Course Data</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">
            {errorMsg} Please try again later or contact support.
            <div className="mt-6">
              <Button
                asChild
                variant="outline"
                className="border-red-600 text-red-700 hover:bg-red-100 focus-visible:ring-red-500 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-700/30"
              >
                <Link href="/registry">Back to Registry Overview</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-right" theme="light" />
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      {/* Page Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 dark:text-blue-300 flex items-center mb-1">
            <BookOpenCheck className="mr-3 h-6 w-6 sm:h-7 sm:w-7 text-violet-700 dark:text-violet-500 flex-shrink-0" />
            Course & Program Management
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage academic programs and courses offered by departments.
          </p>
        </div>
      </div>

      {/* The Main Content of this page is the ManageCoursesTab component */}
      <ManageCoursesTab
        initialPrograms={programsResult.programs || []}
        initialDepartments={departmentsResult.departments || []}
        initialCourses={coursesResult.courses || []} // Pass initial courses
        initialLecturers={lecturersResult.lecturers || []} // Pass initial lecturers
      />

      <Toaster richColors position="top-right" theme="light" />
    </div>
  );
}