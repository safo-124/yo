// app/(dashboard)/registry/layout.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import RegistryLayoutClient from './RegistryLayoutClient';

export default async function RegistryLayout({ children }) {
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }

  if (session.role !== 'REGISTRY') {
    console.warn(`Unauthorized access attempt to registry section by role: ${session.role}`);
    redirect('/unauthorized');
  }

  return <RegistryLayoutClient session={session} className="flex-1 w-full overflow-y-auto">{children}</RegistryLayoutClient>;
}
