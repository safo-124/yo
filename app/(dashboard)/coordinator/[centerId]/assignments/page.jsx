// app/(dashboard)/coordinator/[centerId]/assignments/page.jsx
import { getSession } from "@/lib/actions/auth.actions";
import { getAssignmentPageData } from "@/lib/actions/coordinator.actions.js";
import { redirect } from "next/navigation";
import { AssignmentForm } from "../_components/AssignmentForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export default async function AssignmentPage({ params }) {
  const { centerId } = await params;
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }

  const result = await getAssignmentPageData(centerId);

  if (!result.success) {
    return (
      <div className="w-full py-6 px-4">
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="font-semibold text-red-800 dark:text-red-300">Error Loading Data</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400">
            {result.error}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                <Link href={`/coordinator/${centerId}`}>Back to Overview</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 py-2">
      <AssignmentForm
        lecturers={result.lecturers}
        courses={result.courses}
        coordinatorId={session.userId}
        maxCoursesAllowed={result.maxCoursesAllowed}
        centerId={centerId}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}
