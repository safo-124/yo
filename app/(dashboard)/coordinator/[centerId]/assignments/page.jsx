// app/(dashboard)/coordinator/[centerId]/assignments/page.jsx

import { getSession } from "@/lib/actions/auth.actions";
import { getAssignmentPageData } from "@/lib/actions/coordinator.actions.js";
import { redirect } from "next/navigation";
import { AssignmentForm } from "../_components/AssignmentForm";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, BookUser } from "lucide-react";

export default async function AssignmentPage({ params }) {
  const { centerId } = params;
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }

  // Fetch the data on the server
  const result = await getAssignmentPageData(centerId);

  if (!result.success) {
    return (
      <Card className="border-red-600 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle /> Error Loading Data
          </CardTitle>
          <CardDescription className="text-red-700">
            {result.error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookUser className="h-6 w-6 text-blue-700" />
            Course Assignments
          </CardTitle>
          <CardDescription>
            Assign courses to lecturers within your center. Select a lecturer to see and modify their assigned courses.
          </CardDescription>
        </CardHeader>
      </Card>

      <AssignmentForm
        lecturers={result.lecturers}
        courses={result.courses}
        coordinatorId={session.userId}
        maxCoursesAllowed={result.maxCoursesAllowed}
      />
    </div>
  );
}