// app/(dashboard)/coordinator/[centerId]/layout.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import prisma from '@/lib/prisma';
import CoordinatorLayoutClient from './_components/CoordinatorLayoutClient';

export default async function CoordinatorLayout({ children, params }) {
  const session = await getSession();
  const { centerId } = await params;

  if (!session?.userId) {
    redirect('/login');
  }

  if (session.role !== 'COORDINATOR') {
    redirect('/unauthorized');
  }

  let centerDetails = null;
  try {
    centerDetails = await prisma.center.findUnique({
      where: { id: centerId, coordinatorId: session.userId },
      select: { id: true, name: true },
    });
  } catch (error) {
    console.error('Error fetching center details for coordinator layout:', error);
    redirect('/?error=center_fetch_failed');
  }

  if (!centerDetails) {
    redirect('/unauthorized?error=center_mismatch');
  }

  return (
    <CoordinatorLayoutClient session={session} centerDetails={centerDetails}>
      {children}
    </CoordinatorLayoutClient>
  );
}
