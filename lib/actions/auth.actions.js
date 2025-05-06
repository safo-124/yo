// lib/actions/auth.actions.js
"use server"; // Defines this as a server action module

import prisma from '@/lib/prisma'; // Your Prisma client instance
import bcrypt from 'bcryptjs'; // For password hashing and comparison
import { cookies } from 'next/headers'; // To manage HTTP-only cookies for sessions
import { redirect } from 'next/navigation'; // For server-side redirects

// Define a session cookie name and options
// Ensure SESSION_COOKIE_NAME is consistent if read by other parts (like middleware)
const SESSION_COOKIE_NAME = 'app_session';
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
  secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
  maxAge: 60 * 60 * 24 * 7, // Cookie expiry: 1 week in seconds
  path: '/', // Cookie is available on all paths
  sameSite: 'lax', // CSRF protection: 'lax' is a good default, 'strict' is more restrictive
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

  // Basic validation
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    // 1. Find the user by email in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If user not found, return an error
    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // 2. Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If passwords don't match, return an error
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // 3. Create a session payload (do NOT include the password)
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      // Add any other non-sensitive user data needed for the session
    };

    // 4. Set the session cookie
    // The `cookies()` function from `next/headers` is used to manage cookies in Server Actions
    cookies().set(
      SESSION_COOKIE_NAME,
      JSON.stringify(sessionPayload), // Store session data as a JSON string
      SESSION_COOKIE_OPTIONS
    );

    // 5. Determine redirect path based on user role
    let redirectTo = '/'; // Default redirect path
    if (user.role === 'REGISTRY') {
      redirectTo = '/registry';
    } else if (user.role === 'COORDINATOR') {
      // For COORDINTOR and LECTURER, you might later want to redirect to a specific center's dashboard
      // e.g., `/coordinator/${user.coordinatedCenterId}` if that data is available or fetched.
      // For now, a generic path is fine.
      redirectTo = `/coordinator`; // Adjust if you have a generic coordinator dashboard
    } else if (user.role === 'LECTURER') {
      redirectTo = `/lecturer`; // Adjust if you have a generic lecturer dashboard
    }

    // Return a success response with user data and redirect path
    // The client-side form will use this information to redirect the user.
    return {
      success: true,
      message: 'Login successful!',
      user: sessionPayload,
      redirectTo: redirectTo
    };

  } catch (error) {
    console.error('Login Action Error:', error);
    // In a real application, you might want to log this error to a monitoring service
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Retrieves the current user session from the session cookie.
 * This function is intended for use in Server Components or other Server Actions.
 * @returns {Promise<object|null>} The session payload object if a valid session exists, otherwise null.
 */
export async function getSession() {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME);

  // If no session cookie is found, return null
  if (!sessionCookie?.value) {
    return null;
  }

  try {
    // Parse the JSON string from the cookie value to get the session object
    const sessionData = JSON.parse(sessionCookie.value);
    return sessionData;
  } catch (error) {
    console.error('Get Session Error: Failed to parse session cookie:', error);
    // If parsing fails (e.g., corrupted cookie), treat as no session
    return null;
  }
}

/**
 * Logs out the current user by deleting the session cookie and redirecting to the login page.
 * This is a Server Action.
 */
export async function logoutUser() {
  // Delete the session cookie
  cookies().delete(SESSION_COOKIE_NAME);

  // Redirect the user to the login page
  // The `redirect()` function from `next/navigation` is used for server-side redirects.
  // When called in a Server Action, Next.js handles this by throwing a special error
  // that it catches to perform the redirect.
  redirect('/login');
}
