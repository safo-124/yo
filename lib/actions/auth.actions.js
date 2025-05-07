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

// --- Existing Actions (loginUser, getSession, logoutUser) ---

export async function loginUser(credentials) {
  // ... (keep existing loginUser code from previous version)
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

    const cookieStore = cookies();
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
        where: { coordinatorId: user.id },
        select: { id: true },
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

export async function getSession() {
  // Use the version of getSession that worked previously (likely without await cookies())
  // If the await version worked, keep that one.
  // const cookieStore = await cookies(); // If needed based on previous error
  const cookieStore = cookies(); // Standard usage
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

export async function logoutUser() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/login');
}


// --- NEW ACTION for Signup Request ---

/**
 * Handles a new user signup request. Creates a pending request for Registry approval.
 * @param {object} signupData - Data from the signup form.
 * @param {string} signupData.name - User's full name.
 * @param {string} signupData.email - User's email (must be unique).
 * @param {string} signupData.password - User's plain text password.
 * @param {'COORDINATOR' | 'LECTURER'} signupData.role - Requested role.
 * @param {string} [signupData.requestedCenterId] - Optional center ID if role is LECTURER.
 * @returns {Promise<object>} Success/error object.
 */
export async function requestSignup({ name, email, password, role, requestedCenterId }) {
  // Basic validation
  if (!name || !email || !password || !role) {
    return { success: false, error: "Name, email, password, and role are required." };
  }
  if (role !== 'COORDINATOR' && role !== 'LECTURER') {
    return { success: false, error: "Invalid requested role." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  try {
    // 1. Check if email is already taken by an existing user OR an existing pending request
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }

    const existingRequest = await prisma.signupRequest.findFirst({
      where: {
        email: email,
        status: 'PENDING', // Only check pending requests for the same email
      }
    });
    if (existingRequest) {
      return { success: false, error: "A signup request with this email is already pending approval." };
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the signup request record
    await prisma.signupRequest.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        hashedPassword: hashedPassword,
        requestedRole: role,
        requestedCenterId: role === 'LECTURER' ? requestedCenterId || null : null,
        status: 'PENDING', // Default status
      }
    });

    return { success: true, message: "Signup request submitted successfully! Please wait for Registry approval." };

  } catch (error) {
    console.error("Signup Request Error:", error);
    // Handle potential unique constraint violation on email just in case (though checked above)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
       return { success: false, error: "This email address is already associated with a pending request." };
    }
    return { success: false, error: "An unexpected error occurred during signup request." };
  }
}
