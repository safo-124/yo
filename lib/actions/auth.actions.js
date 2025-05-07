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

    // Determine the dashboard path first
    let dashboardPath = '/'; // Default redirect path
    if (user.role === 'REGISTRY') {
      dashboardPath = '/registry';
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
        dashboardPath = `/coordinator/${centerManagedByCoordinator.id}`;
      } else {
        console.warn(`Coordinator ${user.email} (ID: ${user.id}) is not assigned to any center. Defaulting dashboard path.`);
        // dashboardPath remains '/' or you can set a specific "assignment pending" page for coordinators too
      }
    } else if (user.role === 'LECTURER') {
      if (user.lecturerCenterId) {
        dashboardPath = `/lecturer/center/${user.lecturerCenterId}/dashboard`;
      } else {
        console.warn(`Lecturer ${user.email} (ID: ${user.id}) is not assigned to any center. Redirecting to assignment-pending.`);
        dashboardPath = '/lecturer/assignment-pending';
      }
    }

    // Now create the session payload including the dashboardPath
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      dashboardPath: dashboardPath, // Store the determined dashboard path
      // If lecturerCenterId is needed frequently in session for other checks, add it here:
      // lecturerCenterId: user.lecturerCenterId || null,
    };

    cookies().set(
      SESSION_COOKIE_NAME,
      JSON.stringify(sessionPayload),
      SESSION_COOKIE_OPTIONS
    );

    return {
      success: true,
      message: 'Login successful!',
      user: sessionPayload, // Contains dashboardPath
      redirectTo: dashboardPath // This is what the client-side login form uses
    };

  } catch (error) {
    console.error('Login Action Error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getSession() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }
  try {
    return JSON.parse(sessionCookie.value); // This will now include dashboardPath
  } catch (error) {
    console.error('Get Session Error: Failed to parse session cookie:', error);
    return null;
  }
}

export async function logoutUser() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}

// requestSignup action remains the same as in 
// ... (ensure requestSignup action is here if it was part of the latest version of this file)
export async function requestSignup({ name, email, password, role, requestedCenterId }) {
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
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }
    const existingRequest = await prisma.signupRequest.findFirst({
      where: { email: email, status: 'PENDING' }
    });
    if (existingRequest) {
      return { success: false, error: "A signup request with this email is already pending approval." };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.signupRequest.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        hashedPassword: hashedPassword,
        requestedRole: role,
        requestedCenterId: role === 'LECTURER' ? requestedCenterId || null : null,
        status: 'PENDING',
      }
    });
    return { success: true, message: "Signup request submitted successfully! Please wait for Registry approval." };
  } catch (error) {
    console.error("Signup Request Error:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
       return { success: false, error: "This email address is already associated with a pending request." };
    }
    return { success: false, error: "An unexpected error occurred during signup request." };
  }
}
