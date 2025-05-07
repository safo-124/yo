// app/(dashboard)/registry/page.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getCenters,
  getAllUsers,
  getPotentialCoordinators,
  getAllClaimsSystemWide // Import the new action
} from '@/lib/actions/registry.actions.js';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";

import ManageCentersTab from './_components/ManageCentersTab';
import ManageUsersTab from './_components/ManageUsersTab';
import ManageSystemClaimsTab from './_components/ManageSystemClaimsTab'; // Import the new tab component
import { FileText, Users, Building } from 'lucide-react'; // Icons for tabs

export default async function RegistryPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    console.warn("Unauthorized access attempt to /registry by user:", session?.email, "with role:", session?.role);
    redirect(session ? '/' : '/login');
  }

  // Fetch initial data on the server for all tabs
  const centersDataPromise = getCenters();
  const usersDataPromise = getAllUsers();
  const potentialCoordinatorsDataPromise = getPotentialCoordinators();
  const systemClaimsDataPromise = getAllClaimsSystemWide(); // Fetch all claims initially (no filters)

  const [
    centersData,
    usersData,
    potentialCoordinatorsData,
    systemClaimsData
  ] = await Promise.all([
    centersDataPromise,
    usersDataPromise,
    potentialCoordinatorsDataPromise,
    systemClaimsDataPromise
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Registry Dashboard</h1>
        <p className="text-muted-foreground">
          Manage centers, users, claims, and system settings.
        </p>
      </div>

      <Tabs defaultValue="centers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 md:w-auto md:inline-grid">
          <TabsTrigger value="centers"><Building className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Manage Centers</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Manage Users</TabsTrigger>
          <TabsTrigger value="system-claims"><FileText className="mr-2 h-4 w-4 sm:hidden md:inline-block" />System Claims</TabsTrigger>
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

        <TabsContent value="system-claims" className="mt-4">
          {/* Content for the new System Claims Tab */}
          <ManageSystemClaimsTab
            initialClaimsData={{ claims: systemClaimsData.claims || [], error: systemClaimsData.error }}
            allCenters={centersData.centers || []} // For the center filter dropdown
            registryUserId={session.userId} // Pass the logged-in registry user's ID
          />
          {/* Note: The Card wrapper is now inside ManageSystemClaimsTab for better encapsulation */}
        </TabsContent>
      </Tabs>
      <Toaster richColors position="top-right" />
    </div>
  );
}
