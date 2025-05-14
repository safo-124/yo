// lib/actions/auth.actions.js
"use server";

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SESSION_COOKIE_NAME = 'app_session'; // Must match the name used in middleware.js
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/',
  sameSite: 'lax', // Can be 'strict', 'lax', or 'none'
};

export async function loginUser(credentials) {
  const { email, password } = credentials;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }, // Ensure email is queried in consistent case
      // Select all fields needed for the session and dashboard path logic
      select: {
        id: true,
        email: true,
        name: true,
        password: true, // Needed for bcrypt.compare
        role: true,
        lecturerCenterId: true, // For LECTURER dashboard path
        // No need to fetch Center_Center_coordinatorIdToUser here directly, will query Center model
      }
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Determine the dashboard path based on user role
    let dashboardPath = '/profile'; // Default redirect path if no specific role dashboard
    
    if (user.role === 'REGISTRY') {
      dashboardPath = '/registry';
    } else if (user.role === 'COORDINATOR') {
      // For coordinator, find the center they coordinate to build the path
      const centerManagedByCoordinator = await prisma.center.findUnique({
        where: {
          coordinatorId: user.id, // This assumes coordinatorId is unique on Center model
        },
        select: {
          id: true,
        },
      });
      if (centerManagedByCoordinator) {
        dashboardPath = `/coordinator/center/${centerManagedByCoordinator.id}/dashboard`; // More specific path
      } else {
        console.warn(`Coordinator ${user.email} (ID: ${user.id}) is not assigned to any center. Defaulting dashboard path to /profile or a generic coordinator page.`);
        dashboardPath = '/coordinator/assignment-pending'; // Or a generic coordinator landing page
      }
    } else if (user.role === 'LECTURER') {
      if (user.lecturerCenterId) {
        dashboardPath = `/lecturer/center/${user.lecturerCenterId}/dashboard`;
      } else {
        console.warn(`Lecturer ${user.email} (ID: ${user.id}) is not assigned to any center. Redirecting to assignment-pending.`);
        dashboardPath = '/lecturer/assignment-pending';
      }
    } else if (user.role === 'STAFF_REGISTRY') { // ADDED: Handle STAFF_REGISTRY role
      dashboardPath = '/staff-registry/claims'; // Or '/staff-registry' for their dashboard
    }

    // Create the session payload
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      dashboardPath: dashboardPath, // Store the determined dashboard path
      // Optionally include lecturerCenterId if frequently needed by middleware/client without DB lookup
      // lecturerCenterId: user.lecturerCenterId || null, 
    };

    cookies().set(
      SESSION_COOKIE_NAME,
      JSON.stringify(sessionPayload),
      SESSION_COOKIE_OPTIONS
    );

    console.log(`User ${user.email} logged in. Role: ${user.role}. Redirecting to: ${dashboardPath}`);
    return {
      success: true,
      message: 'Login successful!',
      user: sessionPayload, 
      redirectTo: dashboardPath 
    };

  } catch (error) {
    console.error('Login Action Error:', error.message, error.stack);
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
    return JSON.parse(sessionCookie.value);
  } catch (error) {
    console.error('Get Session Error: Failed to parse session cookie:', error);
    // Optionally delete the corrupted cookie
    // cookies().delete(SESSION_COOKIE_NAME, { path: '/' });
    return null;
  }
}

export async function logoutUser() {
  console.log("Logging out user and deleting session cookie.");
  cookies().delete(SESSION_COOKIE_NAME, { path: '/' }); // Ensure path matches setting
  redirect('/login'); // Redirect to login page after logout
}

export async function requestSignup({ name, email, password, role, requestedCenterId, requestedDesignation }) { // Added requestedDesignation
  if (!name || !email || !password || !role) {
    return { success: false, error: "Name, email, password, and role are required." };
  }
  // Updated to allow LECTURER, COORDINATOR. STAFF_REGISTRY/REGISTRY typically not self-signup.
  if (!['COORDINATOR', 'LECTURER'].includes(role)) { 
    return { success: false, error: "Invalid requested role for signup. Only Lecturer or Coordinator roles can be requested." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }
  if (role === 'LECTURER' && !requestedCenterId) {
    return { success: false, error: "Lecturers must request a center assignment." };
  }
  // Optional: Add validation for requestedDesignation if it's part of the signup form
  // const validDesignations = ["ASSISTANT_LECTURER", "LECTURER", "SENIOR_LECTURER", "PROFESSOR"]; // From your enum
  // if (requestedDesignation && !validDesignations.includes(requestedDesignation)) {
  //   return { success: false, error: "Invalid designation selected."};
  // }


  const normalizedEmail = email.trim().toLowerCase();
  try {
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }
    const existingRequest = await prisma.signupRequest.findFirst({
      where: { email: normalizedEmail, status: 'PENDING' }
    });
    if (existingRequest) {
      return { success: false, error: "A signup request with this email is already pending approval." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const signupData = {
      name: name.trim(),
      email: normalizedEmail,
      hashedPassword: hashedPassword,
      requestedRole: role,
      // requestedDesignation: requestedDesignation || null, // Store if part of signup
      status: 'PENDING',
    };

    if (role === 'LECTURER') {
      signupData.requestedCenterId = requestedCenterId || null;
    }


    await prisma.signupRequest.create({ data: signupData });
    
    return { success: true, message: "Signup request submitted successfully! Please wait for Registry approval." };
  } catch (error) {
    console.error("Signup Request Error:", error.message, error.stack);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
       return { success: false, error: "This email address is already associated with a pending request." };
    }
    // Handle error if `requestedDesignation` is not a valid enum value, Prisma might throw P2003 or validation error
    // if (error.message.includes("Argument `requestedDesignation` is invalid")) {
    //     return { success: false, error: "Invalid designation value provided for signup request."};
    // }
    return { success: false, error: "An unexpected error occurred during signup request." };
  }
}