// lib/actions/auth.actions.js
"use server"; // Defines this as a server action module

import prisma from '@/lib/prisma'; // Assuming your Prisma client is exported from here
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers'; // To set cookies for session management
import { redirect } from 'next/navigation'; // To redirect after successful login

// Define a session cookie name and options
const SESSION_COOKIE_NAME = 'app_session';
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/',
  sameSite: 'lax', // Or 'strict'
};

export async function loginUser(credentials) {
  const { email, password } = credentials;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    // 1. Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // 2. Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // 3. Create a session payload (excluding sensitive information like password)
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // 4. Set the session cookie
    cookies().set(
      SESSION_COOKIE_NAME,
      JSON.stringify(sessionPayload), // Store session data as a JSON string
      SESSION_COOKIE_OPTIONS
    );

    // 5. Determine redirect path based on role (optional, can be handled by middleware too)
    let redirectTo = '/'; // Default redirect
    if (user.role === 'REGISTRY') {
      redirectTo = '/registry';
    } else if (user.role === 'COORDINATOR') {
      // You might need to fetch the coordinator's centerId to redirect correctly
      // For now, a generic coordinator path or their first center
      redirectTo = `/coordinator`; // Or /coordinator/dashboard or /coordinator/[centerId]
    } else if (user.role === 'LECTURER') {
      // Similar for lecturer, might need centerId
      redirectTo = `/lecturer`; // Or /lecturer/dashboard or /lecturer/[centerId]
    }

    // Instead of returning a redirect path, we can directly call redirect() from next/navigation
    // This is often preferred in server actions that should cause a navigation.
    // However, for the form to handle success/error messages, returning an object is also fine.
    // For this iteration, we'll let the client-side handle the redirect based on the response.
    // If you want the server action to force a redirect, uncomment the next line and adjust the return.
    // redirect(redirectTo);

    return {
      success: true,
      message: 'Login successful!',
      user: sessionPayload, // Send back user info (excluding password)
      redirectTo: redirectTo
    };

  } catch (error) {
    console.error('Login Action Error:', error);
    // In a real app, you might want to log this error more robustly
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

// Optional: Action to get current session (can be used in layouts/middleware)
export async function getSession() {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    return null;
  }
  try {
    return JSON.parse(sessionCookie.value);
  } catch (error) {
    console.error('Failed to parse session cookie:', error);
    return null;
  }
}

// Action to log out
export async function logoutUser() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login'); // Redirect to login page after logout
}
