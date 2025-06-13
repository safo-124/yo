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
        designation: true, // NEW: Select designation
        phoneNumber: true, // NEW: Select phone number
        bankName: true,     // NEW: Select bank details
        bankBranch: true,   // NEW: Select bank details
        accountName: true,  // NEW: Select bank details
        accountNumber: true,// NEW: Select bank details
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
      select: { password: true },
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

    revalidatePath('/profile'); // Revalidate the profile page

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    console.error("Error updating current user password:", error);
    return { success: false, error: "Failed to update password." };
  }
}

/**
 * Allows the currently logged-in user to update their profile details.
 * Renamed from updateCurrentUserName to reflect broader functionality.
 * @param {object} profileData - The data to update.
 * @param {string} profileData.newName - The user's new name.
 * @param {string} [profileData.newDesignation] - The user's new designation (optional).
 * @param {string} [profileData.newPhoneNumber] - The user's new phone number (optional, required for lecturers).
 * @param {string} [profileData.newBankName] - The user's new bank name (optional, required for lecturers).
 * @param {string} [profileData.newBankBranch] - The user's new bank branch (optional, required for lecturers).
 * @param {string} [profileData.newAccountName] - The user's new account name (optional, required for lecturers).
 * @param {string} [profileData.newAccountNumber] - The user's new account number (optional, required for lecturers).
 * @returns {Promise<object>} Success/error object.
 */
export async function updateCurrentUserProfile({
  newName, newDesignation, newPhoneNumber, newBankName, newBankBranch, newAccountName, newAccountNumber
}) {
  const timestamp = new Date().toISOString();
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "User not authenticated." };
  }

  if (!newName || newName.trim().length === 0) {
    return { success: false, error: "Name cannot be empty." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, role: true }, // Select role to apply conditional validation
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Conditional server-side validation based on user's role
    if (user.role === 'LECTURER') {
      if (!newPhoneNumber?.trim() || !newBankName?.trim() || !newBankBranch?.trim() || !newAccountName?.trim() || !newAccountNumber?.trim()) {
        return { success: false, error: "For lecturer role, phone number and all bank details are required." };
      }
      if (!/^\+?\d{10,15}$/.test(newPhoneNumber.trim())) { // Basic phone number regex
        return { success: false, error: "Invalid phone number format." };
      }
      if (!/^\d+$/.test(newAccountNumber.trim())) { // Basic numeric account number validation
        return { success: false, error: "Account number must be numeric." };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: newName.trim(),
        designation: newDesignation || null, // NEW: Update designation
        // Conditionally store/nullify bank/phone details based on role
        phoneNumber: user.role === 'LECTURER' ? newPhoneNumber?.trim() || null : null,
        bankName: user.role === 'LECTURER' ? newBankName?.trim() || null : null,
        bankBranch: user.role === 'LECTURER' ? newBankBranch?.trim() || null : null,
        accountName: user.role === 'LECTURER' ? newAccountName?.trim() || null : null,
        accountNumber: user.role === 'LECTURER' ? newAccountNumber?.trim() || null : null,
      },
      select: {
        id: true, name: true, email: true, role: true, designation: true,
        phoneNumber: true, bankName: true, bankBranch: true, accountName: true, accountNumber: true
      } // Return updated user fields
    });

    // Revalidate paths where user data might be displayed
    revalidatePath('/profile');
    revalidatePath('/lecturer/dashboard'); // If profile changes affect lecturer dashboard
    // Add other paths as needed, e.g., if lecturer names appear in claims tables globally.

    return { success: true, message: "Profile updated successfully.", user: updatedUser };
  } catch (error) {
    console.error(`[${timestamp}] [updateCurrentUserProfile] Error:`, error.message, error.stack);
    if (error.code === 'P2002' && error.meta?.target?.includes('accountNumber')) {
      return { success: false, error: "This bank account number is already in use by another user." };
    }
    // Handle other specific validation errors if needed.
    if (error.message.includes("Argument `designation` is invalid")) {
      return { success: false, error: "Invalid designation value provided." };
    }
    return { success: false, error: "Failed to update profile. " + (error.message || "An unexpected error occurred.") };
  }
}