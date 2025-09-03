// app/(dashboard)/registry/settings/page.jsx
import { getSession } from '@/lib/actions/auth.actions';
import { redirect } from 'next/navigation';
import { getAllSettings } from '@/lib/settings';
import { Toaster } from "@/components/ui/sonner";
import RegistrySettingsClient from './_components/RegistrySettingsClient';
import { Settings } from 'lucide-react';

export default async function RegistrySettingsPage() {
  // Check if the user is authorized
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  if (session.role !== 'REGISTRY') {
    redirect(session ? '/unauthorized' : '/login');
  }
  
  // Fetch all system settings
  const { success, settings, error } = await getAllSettings();
  
  if (!success) {
    console.error('Failed to fetch settings:', error);
    // We'll still render the page but display an error message
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="h-8 w-8 text-blue-700 dark:text-blue-400 mr-3" />
            System Settings
          </h1>
          <p className="text-muted-foreground">
            Configure system-wide settings for the application
          </p>
        </div>
      </div>
      
      <RegistrySettingsClient initialSettings={settings || {}} />
      <Toaster />
    </div>
  );
}
