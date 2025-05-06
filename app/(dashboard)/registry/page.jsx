// app/(dashboard)/registry/page.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function RegistryPage() {
  const session = await getSession();

  // Additional role check specific to this page (optional, as layout might handle general auth)
  if (!session || session.role !== 'REGISTRY') {
    // If not registry, redirect to a generic dashboard or login
    // This provides an extra layer of security for role-specific pages
    console.warn("Unauthorized access attempt to /registry by user:", session?.email, "with role:", session?.role);
    redirect(session ? '/' : '/login'); // Redirect to home if logged in but wrong role, else to login
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Registry Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Registry Administrator!</CardTitle>
          <CardDescription>
            This is your central hub for managing the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">From here, you will be able to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Create and manage Centers.</li>
            <li>Assign Coordinators to Centers.</li>
            <li>Oversee the overall system.</li>
            {/* Add more items as functionality is built */}
          </ul>
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            Current User: {session.name} ({session.email})
          </p>
        </CardContent>
      </Card>
      {/* More components and functionality will be added here */}
    </div>
  );
}
