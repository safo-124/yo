// lib/actions/auth.actions.js
"use server"; // Defines this as a server action module

import prisma from '@/lib/prisma'; // Your Prisma client instance
import bcrypt from 'bcryptjs'; // For password hashing and comparison
import { cookies } from 'next/headers'; // To manage HTTP-only cookies for sessions
import { redirect } from 'next/navigation'; // For server-side redirects

// Define a session cookie name and options
const SESSION_COOKIE_NAME = 'app_session';
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/',
  sameSite: 'lax',
};

/**
 * Logs in a user.
 * @param {object} credentials - The user's credentials.
 * @param {string} credentials.email - The user's email.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<object>} An object indicating success or failure,
 * with user data and redirect path on success, or an error message on failure.
 */
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

    cookies().set(
      SESSION_COOKIE_NAME,
      JSON.stringify(sessionPayload),
      SESSION_COOKIE_OPTIONS
    );

    let redirectTo = '/'; // Default redirect path

    if (user.role === 'REGISTRY') {
      redirectTo = '/registry';
    } else if (user.role === 'COORDINATOR') {
      // Dynamically find the centerId for the coordinator
      const centerManagedByCoordinator = await prisma.center.findUnique({
        where: {
          coordinatorId: user.id, // Find the center this user coordinates
        },
        select: {
          id: true, // We only need the ID of the center
        },
      });

      if (centerManagedByCoordinator) {
        redirectTo = `/coordinator/${centerManagedByCoordinator.id}`;
      } else {
        // This coordinator is not assigned to any center.
        // This might be an edge case or an error in data setup.
        // Redirect to a generic page or an error/info page.
        console.warn(`Coordinator ${user.email} (ID: ${user.id}) is not assigned to any center. Redirecting to default.`);
        redirectTo = '/'; // Or a specific "assignment pending" page, or '/unauthorized'
        // You might want to return an informational message to the user in this case too.
        // For now, we'll just redirect to a default page.
      }
    } else if (user.role === 'LECTURER') {
      // For LECTURER, if they must belong to a center to access their dashboard:
      if (user.lecturerCenterId) {
        redirectTo = `/lecturer/${user.lecturerCenterId}`; // Assuming a similar dynamic route for lecturers
      } else {
        console.warn(`Lecturer ${user.email} (ID: ${user.id}) is not assigned to any center. Redirecting to default.`);
        redirectTo = '/'; // Or a specific "assignment pending" page
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
 * @returns {Promise<object|null>} The session payload object if a valid session exists, otherwise null.
 */
export async function getSession() {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    return null;
  }
  try {
    return JSON.parse(sessionCookie.value);
  } catch (error) {
    console.error('Get Session Error: Failed to parse session cookie:', error);
    return null;
  }
}

/**
 * Logs out the current user by deleting the session cookie and redirecting to the login page.
 */
export async function logoutUser() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}
