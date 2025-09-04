// app/api/users/[userId]/details/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/actions/auth.actions';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const timestamp = new Date().toISOString();
  const session = await getSession();
  
  // Ensure the user is authenticated
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = params.userId;
  
  // Ensure the user is requesting their own data or has appropriate role
  if (session.userId !== userId && !['REGISTRY', 'STAFF_REGISTRY'].includes(session.role)) {
    console.error(`[${timestamp}] [getUserDetails] Unauthorized access attempt: ${session.userId} trying to access ${userId}`);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        bankName: true,
        bankBranch: true,
        accountName: true,
        accountNumber: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(`[${timestamp}] [getUserDetails] Error:`, error.message, error.stack);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
