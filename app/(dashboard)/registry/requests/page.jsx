// app/(dashboard)/registry/requests/page.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import {
  getPendingSignupRequests,
  getCenters // For passing to the tab for center name resolution
} from '@/lib/actions/registry.actions.js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileWarning, Users } from "lucide-react"; // Users icon for page title
import ManageSignupRequestsTab from '../_components/ManageSignupRequestsTab';
import { Toaster } from "@/components/ui/sonner";

export default async function RegistryManageSignupRequestsPage() {
  const session = await getSession();

  if (!session || session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }

  const requestsDataPromise = getPendingSignupRequests();
  const centersDataPromise = getCenters(); // Fetch all centers

  const [
    requestsResult,
    centersResult
  ] = await Promise.all([
    requestsDataPromise,
    centersDataPromise
  ]);

  const initialRequestsData = {
    requests: requestsResult.success ? requestsResult.requests : [],
    error: requestsResult.error || null
  };
  
  if (!centersResult.success) {
      console.error("Failed to load centers for signup requests page:", centersResult.error);
      // Can still proceed, but center names might not resolve in the tab
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" />
            Manage Signup Requests
          </h1>
          <p className="text-muted-foreground">
            Approve or reject new user account requests.
          </p>
        </div>
      </div>

      <ManageSignupRequestsTab
        initialRequestsData={initialRequestsData}
        registryUserId={session.userId}
        allCenters={centersResult.success ? centersResult.centers : []}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}
