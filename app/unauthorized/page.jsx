// app/unauthorized/page.jsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-500">Access Denied</CardTitle>
          <CardDescription className="text-lg">
            You do not have permission to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Your current role does not grant access to the requested resource.
            If you believe this is an error, please contact an administrator.
          </p>
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
