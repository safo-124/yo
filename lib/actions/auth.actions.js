// lib/actions/auth.actions.js
"use server";

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SESSION_COOKIE_NAME = 'app_session';
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/',
  sameSite: 'lax',
};

export async function loginUser(credentials) {
  const { email, password } = credentials;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Get the cookies object
    const cookieStore = cookies(); // No await here for cookies() itself generally
    cookieStore.set(
      SESSION_COOKIE_NAME,
      JSON.stringify(sessionPayload),
      SESSION_COOKIE_OPTIONS
    );

    let redirectTo = '/';

    if (user.role === 'REGISTRY') {
      redirectTo = '/registry';
    } else if (user.role === 'COORDINATOR') {
      const centerManagedByCoordinator = await prisma.center.findUnique({
        where: {
          coordinatorId: user.id,
        },
        select: {
          id: true,
        },
      });

      if (centerManagedByCoordinator) {
        redirectTo = `/coordinator/${centerManagedByCoordinator.id}`;
      } else {
        console.warn(`Coordinator ${user.email} (ID: ${user.id}) is not assigned to any center. Redirecting to default.`);
        redirectTo = '/';
      }
    } else if (user.role === 'LECTURER') {
      if (user.lecturerCenterId) {
        redirectTo = `/lecturer/center/${user.lecturerCenterId}/dashboard`;
      } else {
        console.warn(`Lecturer ${user.email} (ID: ${user.id}) is not assigned to any center. Redirecting to assignment-pending.`);
        redirectTo = '/lecturer/assignment-pending';
      }
    }

    return {
      success: true,
      message: 'Login successful!',
      user: sessionPayload,
      redirectTo: redirectTo
    };

  } catch (error) {
    console.error('Login Action Error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Retrieves the current user session from the session cookie.
 * This function is intended for use in Server Components or other Server Actions.
 * @returns {Promise<object|null>} The session payload object if a valid session exists, otherwise null.
 */
export async function getSession() {
  // According to the error, Next.js wants cookies() to be awaited in this dynamic context.
  // This is unusual, as cookies() itself typically returns an object synchronously.
  // However, we will follow the error's suggestion.
  const cookieStore = await cookies(); // Attempting to await cookies() as per error
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);
    return sessionData;
  } catch (error) {
    console.error('Get Session Error: Failed to parse session cookie:', error);
    return null;
  }
}

/**
 * Logs out the current user by deleting the session cookie and redirecting to the login page.
 */
export async function logoutUser() {
  const cookieStore = cookies(); // No await here for cookies() itself generally
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/login');
}
