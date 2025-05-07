// lib/actions/user.actions.js
"use server";

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/actions/auth.actions'; // To get current user's ID
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

/**
 * Fetches the profile details for the currently logged-in user.
 * @returns {Promise<object>} Object with 'success' and 'user' data or 'error'.
 */
export async function getCurrentUserProfile() {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "User not authenticated." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lecturerCenterId: true,
        departmentId: true,
        // Include related center/department names
        Center_User_lecturerCenterIdToCenter: { // Center they lecture in
          select: { id: true, name: true }
        },
        Department: { // Department they belong to
          select: { id: true, name: true }
        },
        Center_Center_coordinatorIdToUser: { // Center they coordinate
            select: {id: true, name: true}
        }
      }
    });

    if (!user) {
      return { success: false, error: "User profile not found." };
    }

    // Format data slightly for easier consumption
    const formattedUser = {
      ...user,
      centerName: user.Center_User_lecturerCenterIdToCenter?.name || user.Center_Center_coordinatorIdToUser?.name || null,
      departmentName: user.Department?.name || null,
    };
    // Remove redundant nested objects after extracting names
    delete formattedUser.Center_User_lecturerCenterIdToCenter;
    delete formattedUser.Department;
    delete formattedUser.Center_Center_coordinatorIdToUser;


    return { success: true, user: formattedUser };
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    return { success: false, error: "Failed to fetch user profile." };
  }
}

/**
 * Allows the currently logged-in user to update their own password.
 * @param {object} data - Password update data.
 * @param {string} data.currentPassword - The user's current password.
 * @param {string} data.newPassword - The new desired password.
 * @returns {Promise<object>} Success/error object.
 */
export async function updateCurrentUserPassword({ currentPassword, newPassword }) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "User not authenticated." };
  }

  if (!currentPassword || !newPassword) {
    return { success: false, error: "Current and new passwords are required." };
  }
  if (newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }
  if (newPassword === currentPassword) {
    return { success: false, error: "New password cannot be the same as the current password." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return { success: false, error: "Incorrect current password." };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.userId },
      data: { password: hashedNewPassword },
    });

    // Consider revalidating paths or forcing re-login if session structure changes due to password
    // For now, just a success message.
    revalidatePath('/profile'); // Revalidate the profile page

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    console.error("Error updating current user password:", error);
    return { success: false, error: "Failed to update password." };
  }
}

/**
 * Allows the currently logged-in user to update their own name.
 * @param {object} data - Name update data.
 * @param {string} data.newName - The new name for the user.
 * @returns {Promise<object>} Success/error object.
 */
export async function updateCurrentUserName({ newName }) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "User not authenticated." };
  }

  if (!newName || newName.trim().length === 0) {
    return { success: false, error: "Name cannot be empty." };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: { name: newName.trim() },
      select: { id: true, name: true, email: true, role: true } // Return updated basic info
    });

    // Revalidate paths where user name might be displayed (e.g., layouts, profile)
    revalidatePath('/profile');
    // You might need to revalidate other paths if the name is shown in headers globally.
    // Forcing a session update might also be needed if the name in the session cookie is now stale.
    // This can be done by re-setting the cookie with updated info, or prompting re-login for critical changes.

    return { success: true, message: "Name updated successfully.", user: updatedUser };
  } catch (error) {
    console.error("Error updating current user name:", error);
    return { success: false, error: "Failed to update name." };
  }
}
