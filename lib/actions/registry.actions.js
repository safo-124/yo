// lib/actions/registry.actions.js
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

/**
 * Fetches a list of users who can potentially be assigned as Coordinators.
 * @returns {Promise<object>} An object with 'success' (boolean) and 'users' (array) or 'error' (string).
 */
export async function getPotentialCoordinators() {
  try {
    const users = await prisma.user.findMany({
      // Exclude users who are already REGISTRY or already coordinating a center
      // This requires checking the 'coordinatedCenter' relation.
      // A more complex query or multiple queries might be needed for perfect filtering.
      // For now, let's fetch users who are not REGISTRY.
      where: {
        role: {
          not: 'REGISTRY'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // Include to see if they are already coordinating a center
        Center_Center_coordinatorIdToUser: { // Relation from User to Center they coordinate
          select: { id: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Filter out users who are already coordinating a center
    const availableUsers = users.filter(user => !user.Center_Center_coordinatorIdToUser);

    return { success: true, users: availableUsers };
  } catch (error) {
    console.error("Error fetching potential coordinators:", error);
    return { success: false, error: "Failed to fetch users." };
  }
}

/**
 * Creates a new Center and assigns an existing User as a Coordinator.
 * If the selected user is not already a COORDINATOR, their role will be updated.
 * @param {object} data - The data for the new center.
 * @param {string} data.name - The name of the center.
 * @param {string} data.coordinatorId - The ID of the user to be assigned as coordinator.
 * @returns {Promise<object>} An object with 'success' (boolean) and 'center' (object) or 'error' (string).
 */
export async function createCenter({ name, coordinatorId }) {
  if (!name || !coordinatorId) {
    return { success: false, error: "Center name and Coordinator ID are required." };
  }

  try {
    const coordinator = await prisma.user.findUnique({
      where: { id: coordinatorId },
    });

    if (!coordinator) {
      return { success: false, error: "Selected coordinator not found." };
    }

    const newCenter = await prisma.$transaction(async (tx) => {
      if (coordinator.role !== 'COORDINATOR') {
        await tx.user.update({
          where: { id: coordinatorId },
          data: { role: 'COORDINATOR' },
        });
        console.log(`User ${coordinator.name || coordinator.email}'s role updated to COORDINATOR.`);
      }
      const center = await tx.center.create({
        data: {
          name,
          coordinatorId,
        },
      });
      return center;
    });

    revalidatePath('/registry');
    revalidatePath('/registry/users');
    return { success: true, center: newCenter };

  } catch (error) {
    console.error("Error creating center:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return { success: false, error: "A center with this name already exists." };
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('coordinatorId')) {
      return { success: false, error: "This user is already assigned as a coordinator for another center." };
    }
    return { success: false, error: "Failed to create center. " + (error.message || "Unknown error") };
  }
}

/**
 * Fetches all Centers with their Coordinator's details.
 * @returns {Promise<object>} An object with 'success' (boolean) and 'centers' (array) or 'error' (string).
 */
export async function getCenters() {
  try {
    const centers = await prisma.center.findMany({
      include: {
        User_Center_coordinatorIdToUser: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const formattedCenters = centers.map(center => ({
      ...center,
      coordinator: center.User_Center_coordinatorIdToUser,
    }));
    return { success: true, centers: formattedCenters };
  } catch (error) {
    console.error("Error fetching centers:", error);
    return { success: false, error: "Failed to fetch centers." };
  }
}

/**
 * Creates a new User (Coordinator or Lecturer) by the Registry.
 * @param {object} userData - User data.
 * @returns {Promise<object>} Success/error object.
 */
export async function createUserByRegistry({ name, email, password, role, lecturerCenterId }) {
  if (!name || !email || !password || !role) {
    return { success: false, error: "Name, email, password, and role are required." };
  }
  if (role !== 'COORDINATOR' && role !== 'LECTURER') {
    return { success: false, error: "Invalid role specified. Must be COORDINATOR or LECTURER." };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        lecturerCenterId: role === 'LECTURER' ? lecturerCenterId : null,
      },
      select: { id: true, name: true, email: true, role: true, lecturerCenterId: true, createdAt: true }
    });
    revalidatePath('/registry/users');
    return { success: true, user: newUser };
  } catch (error) {
    console.error("Error creating user by registry:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { success: false, error: "A user with this email already exists." };
    }
    return { success: false, error: "Failed to create user. " + (error.message || "Unknown error") };
  }
}

/**
 * Fetches all users with related center/department info.
 * @returns {Promise<object>} Success/error object.
 */
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        lecturerCenterId: true, departmentId: true,
        Center_Center_coordinatorIdToUser: { select: { id: true, name: true } }, // Center they coordinate
        Center_User_lecturerCenterIdToCenter: { select: { id: true, name: true } }, // Center they lecture in
        Department: { select: { id: true, name: true } }, // Department they belong to
        createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    const formattedUsers = users.map(user => ({
      ...user,
      coordinatedCenter: user.Center_Center_coordinatorIdToUser,
      lecturerCenter: user.Center_User_lecturerCenterIdToCenter,
      department: user.Department, // Already named 'Department' from select
    }));
    return { success: true, users: formattedUsers };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return { success: false, error: "Failed to fetch users." };
  }
}

// --- NEW REGISTRY ACTIONS ---

/**
 * Fetches all claims across the system, with optional filters.
 * @param {object} [filters] - Optional filters.
 * @param {string} [filters.centerId] - Filter by center ID.
 * @param {ClaimStatus} [filters.status] - Filter by claim status.
 * @param {string} [filters.lecturerId] - Filter by lecturer ID.
 * @returns {Promise<object>} Object with 'success' and 'claims' or 'error'.
 */
export async function getAllClaimsSystemWide(filters = {}) {
  const { centerId, status, lecturerId } = filters;
  try {
    const claims = await prisma.claim.findMany({
      where: {
        ...(centerId && { centerId }),
        ...(status && { status }),
        ...(lecturerId && { submittedById: lecturerId }),
      },
      include: {
        User_Claim_submittedByIdToUser: { select: { id: true, name: true, email: true } }, // Submitted by (Lecturer)
        User_Claim_processedByIdToUser: { select: { id: true, name: true, email: true } }, // Processed by (Coordinator/Registry)
        Center: { select: { id: true, name: true } }, // Center claim belongs to
      },
      orderBy: { submittedAt: 'desc' },
    });

    const formattedClaims = claims.map(claim => ({
      ...claim,
      submittedBy: claim.User_Claim_submittedByIdToUser,
      processedBy: claim.User_Claim_processedByIdToUser,
      centerName: claim.Center.name,
    }));
    return { success: true, claims: formattedClaims };
  } catch (error) {
    console.error("Error fetching all claims system-wide:", error);
    return { success: false, error: "Failed to fetch system-wide claims." };
  }
}

/**
 * Allows Registry to process (approve/reject) any claim.
 * @param {object} data - Claim processing data.
 * @param {string} data.claimId - The ID of the claim.
 * @param {'APPROVED' | 'REJECTED'} data.status - The new status.
 * @param {string} data.registryUserId - The ID of the Registry user processing.
 * @returns {Promise<object>} Success/error object.
 */
export async function processClaimByRegistry({ claimId, status, registryUserId }) {
  if (!claimId || !status || !registryUserId) {
    return { success: false, error: "Claim ID, status, and Registry User ID are required." };
  }
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return { success: false, error: "Invalid status." };
  }

  try {
    const claimToUpdate = await prisma.claim.findUnique({ where: {id: claimId }});
    if (!claimToUpdate) {
        return { success: false, error: "Claim not found." };
    }

    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        status: status,
        processedById: registryUserId, // Mark as processed by Registry
        processedAt: new Date(),
      },
    });
    revalidatePath('/registry/claims'); // Assuming a new page for system-wide claims
    revalidatePath(`/coordinator/${updatedClaim.centerId}/claims`); // Revalidate specific coordinator view
    revalidatePath(`/lecturer/center/${updatedClaim.centerId}/my-claims`); // Revalidate specific lecturer view
    return { success: true, claim: updatedClaim };
  } catch (error) {
    console.error("Error processing claim by Registry:", error);
    return { success: false, error: "Failed to process claim." };
  }
}

/**
 * Updates a user's role and optionally their center/department assignments.
 * @param {object} data - User update data.
 * @param {string} data.userId - The ID of the user to update.
 * @param {User_role} data.newRole - The new role for the user.
 * @param {string} [data.newCenterId] - New center ID (if applicable, e.g., for Lecturer or new Coordinator).
 * @param {string} [data.newDepartmentId] - New department ID (if applicable, e.g., for Lecturer).
 * @returns {Promise<object>} Success/error object.
 */
export async function updateUserRoleAndAssignmentsByRegistry({ userId, newRole, newCenterId, newDepartmentId }) {
  if (!userId || !newRole) {
    return { success: false, error: "User ID and new role are required." };
  }
  if (!['REGISTRY', 'COORDINATOR', 'LECTURER'].includes(newRole)) {
      return { success: false, error: "Invalid role specified." };
  }

  try {
    const updateData = { role: newRole };

    // Handle assignments based on new role
    if (newRole === 'LECTURER') {
      updateData.lecturerCenterId = newCenterId || null; // Can be null if not immediately assigned
      updateData.departmentId = newDepartmentId || null; // Can be null
      // If changing to lecturer, ensure they are not a coordinator of any center
      // This might require removing them as coordinator from 'Center' table if they were one.
      // This logic can get complex depending on business rules (e.g., demoting a coordinator).
      // For now, we assume if they become a lecturer, any coordinator assignment is handled separately or invalid.
    } else if (newRole === 'COORDINATOR') {
      // If becoming a coordinator, they should ideally be assigned to a center.
      // This action doesn't assign them as a center's coordinatorId directly,
      // that's done via createCenter or an updateCenter action.
      // This just sets their role. Clear lecturer-specific fields.
      updateData.lecturerCenterId = null;
      updateData.departmentId = null;
    } else if (newRole === 'REGISTRY') {
      // Clear center/department specific fields if becoming REGISTRY
      updateData.lecturerCenterId = null;
      updateData.departmentId = null;
    }

    // Important: If a user is being changed FROM a Coordinator role,
    // you need to handle the `coordinatorId` on the `Center` they might be managing.
    // This might involve setting it to null or reassigning. This action doesn't do that automatically.
    // This is a complex part of role changes. A simple role update is done here.
    // For a robust system, you'd check if the user is currently a coordinator and handle that.

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    revalidatePath('/registry/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user role by Registry:", error);
    return { success: false, error: "Failed to update user role." };
  }
}

/**
 * Allows Registry to change a user's password.
 * @param {object} data - Password update data.
 * @param {string} data.userId - The ID of the user.
 * @param {string} data.newPassword - The new plain text password.
 * @returns {Promise<object>} Success/error object.
 */
export async function updateUserPasswordByRegistry({ userId, newPassword }) {
  if (!userId || !newPassword) {
    return { success: false, error: "User ID and new password are required." };
  }
  if (newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    revalidatePath('/registry/users'); // Or a specific user profile page if it exists
    return { success: true, message: "User password updated successfully." };
  } catch (error) {
    console.error("Error updating user password by Registry:", error);
    return { success: false, error: "Failed to update user password." };
  }
}
