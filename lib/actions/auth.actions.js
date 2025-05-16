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
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        designation: true, // Ensure designation is fetched
        lecturerCenterId: true,
      }
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    let dashboardPath = '/profile'; 
    
    if (user.role === 'REGISTRY') {
      dashboardPath = '/registry';
    } else if (user.role === 'STAFF_REGISTRY') {
      dashboardPath = '/staff-registry/claims'; 
    } else if (user.role === 'COORDINATOR') {
      const centerManagedByCoordinator = await prisma.center.findUnique({
        where: { coordinatorId: user.id },
        select: { id: true },
      });
      if (centerManagedByCoordinator) {
        dashboardPath = `/coordinator/center/${centerManagedByCoordinator.id}/dashboard`;
      } else {
        console.warn(`Coordinator ${user.email} (ID: ${user.id}) is not assigned to any center. Defaulting dashboard path.`);
        dashboardPath = '/coordinator/assignment-pending'; 
      }
    } else if (user.role === 'LECTURER') {
      if (user.lecturerCenterId) {
        dashboardPath = `/lecturer/center/${user.lecturerCenterId}/dashboard`;
      } else {
        console.warn(`Lecturer ${user.email} (ID: ${user.id}) is not assigned to any center. Redirecting to assignment-pending.`);
        dashboardPath = '/lecturer/assignment-pending';
      }
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      designation: user.designation, // Include designation in the session
      dashboardPath: dashboardPath,
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
    return null;
  }
}

export async function logoutUser() {
  console.log("Logging out user and deleting session cookie.");
  cookies().delete(SESSION_COOKIE_NAME, { path: '/' });
  redirect('/login');
}

export async function requestSignup({ name, email, password, role, requestedCenterId, requestedDesignation }) {
  if (!name || !email || !password || !role) {
    return { success: false, error: "Name, email, password, and role are required." };
  }
  // UPDATED: Allow STAFF_REGISTRY in signup request role validation
  if (!['COORDINATOR', 'LECTURER', 'STAFF_REGISTRY'].includes(role)) { 
    return { success: false, error: "Invalid requested role. Only Lecturer, Coordinator, or Staff Registry roles can be requested." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }
  
  // For STAFF_REGISTRY and COORDINATOR requested via signup, requestedCenterId is not primarily applicable here.
  // Center assignment for STAFF_REGISTRY (multiple) and COORDINATOR (single, usually tied to Center creation/update)
  // is typically an admin function post-approval.
  if (role === 'LECTURER' && !requestedCenterId) {
    // This implies that if centers are available, a lecturer should select one.
    // The UI handles making it conditionally required based on availableCenters.length.
    // Server can enforce if needed by checking center validity if ID is passed.
    return { success: false, error: "Lecturers must request a center assignment if centers are available." };
  }

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
      // requestedDesignation: requestedDesignation || null, // Store if SignupRequest schema has this field
      status: 'PENDING',
    };

    if (role === 'LECTURER' && requestedCenterId) {
      signupData.requestedCenterId = requestedCenterId;
    }
    // If role is STAFF_REGISTRY or COORDINATOR, requestedCenterId is not set here.

    await prisma.signupRequest.create({ data: signupData });
    
    return { success: true, message: "Signup request submitted successfully! Please wait for Registry approval." };
  } catch (error) {
    console.error("Signup Request Error:", error.message, error.stack);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
       return { success: false, error: "This email address is already associated with a pending request." };
    }
    // if (error.message.includes("Argument `requestedDesignation` is invalid")) { // Example if designation was on SignupRequest
    //     return { success: false, error: "Invalid designation value provided for signup request."};
    // }
    return { success: false, error: "An unexpected error occurred during signup request." };
  }
}