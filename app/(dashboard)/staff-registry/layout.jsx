// app/(dashboard)/staff-registry/layout.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import StaffRegistryLayoutClient from './StaffRegistryLayoutClient';

export default async function StaffRegistryLayout({ children }) {
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }

  if (session.role !== 'STAFF_REGISTRY') {
    redirect('/unauthorized');
  }

  return <StaffRegistryLayoutClient session={session}>{children}</StaffRegistryLayoutClient>;
}
