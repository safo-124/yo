// app/(dashboard)/registry/page.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import { getCenters, getAllUsers, getPotentialCoordinators } from '@/lib/actions/registry.actions.js'; // Corrected import path

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card,CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner"; // For notifications
import ManageCentersTab from './_components/ManageCentersTab';
import ManageUsersTab from './_components/ManageUsersTab';

// We will create these client components next


export default async function RegistryPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    console.warn("Unauthorized access attempt to /registry by user:", session?.email, "with role:", session?.role);
    redirect(session ? '/' : '/login');
  }

  // Fetch initial data on the server
  const centersData = await getCenters();
  const usersData = await getAllUsers();
  const potentialCoordinatorsData = await getPotentialCoordinators(); // For the "Create Center" form

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Registry Dashboard</h1>
        <p className="text-muted-foreground">
          Manage centers, users, and system settings.
        </p>
      </div>

      <Tabs defaultValue="centers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="centers">Manage Centers</TabsTrigger>
          <TabsTrigger value="users">Manage Users</TabsTrigger>
        </TabsList>

        <TabsContent value="centers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Centers</CardTitle>
              <CardDescription>
                View, create, and manage academic centers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ManageCentersTab
                initialCenters={centersData.centers || []}
                potentialCoordinators={potentialCoordinatorsData.users || []}
                fetchError={centersData.error || potentialCoordinatorsData.error}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                View, create, and manage user accounts (Coordinators, Lecturers).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ManageUsersTab
                initialUsers={usersData.users || []}
                centers={centersData.centers || []} // Pass centers for assigning lecturers
                fetchError={usersData.error}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster richColors position="top-right" /> {/* For displaying toast notifications */}
    </div>
  );
}
