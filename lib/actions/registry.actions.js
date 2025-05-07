// lib/actions/registry.actions.js
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

// --- Existing Actions (getPotentialCoordinators, createCenter, getCenters, createUserByRegistry, getAllUsers, getAllClaimsSystemWide, processClaimByRegistry, updateUserRoleAndAssignmentsByRegistry, updateUserPasswordByRegistry, getPublicCenters) ---

export async function getPotentialCoordinators() {
  try {
    const users = await prisma.user.findMany({
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
        Center_Center_coordinatorIdToUser: {
          select: { id: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
    const availableUsers = users.filter(user => !user.Center_Center_coordinatorIdToUser);
    return { success: true, users: availableUsers };
  } catch (error) {
    console.error("Error fetching potential coordinators:", error);
    return { success: false, error: "Failed to fetch users." };
  }
}

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
      }
      const center = await tx.center.create({
        data: { name, coordinatorId },
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

export async function getCenters() {
  try {
    const centers = await prisma.center.findMany({
      include: {
        coordinator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, centers: centers };
  } catch (error) {
    console.error("Error fetching centers:", error);
    return { success: false, error: "Failed to fetch centers." };
  }
}

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
        name, email, password: hashedPassword, role,
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

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        lecturerCenterId: true, departmentId: true,
        Center_Center_coordinatorIdToUser: { select: { id: true, name: true } },
        Center_User_lecturerCenterIdToCenter: { select: { id: true, name: true } },
        Department: { select: { id: true, name: true } },
        createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    const formattedUsers = users.map(user => ({
      ...user,
      coordinatedCenter: user.Center_Center_coordinatorIdToUser,
      lecturerCenter: user.Center_User_lecturerCenterIdToCenter,
    }));
    return { success: true, users: formattedUsers };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return { success: false, error: "Failed to fetch users." };
  }
}

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
        submittedBy: { select: { id: true, name: true, email: true } },
        processedBy: { select: { id: true, name: true, email: true } },
        center: { select: { id: true, name: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
    const formattedClaims = claims.map(claim => ({
      ...claim,
      centerName: claim.center.name,
    }));
    return { success: true, claims: formattedClaims };
  } catch (error) {
    console.error("Error fetching all claims system-wide:", error);
    return { success: false, error: "Failed to fetch system-wide claims." };
  }
}

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
        processedById: registryUserId,
        processedAt: new Date(),
      },
    });
    revalidatePath('/registry/claims');
    revalidatePath(`/coordinator/${updatedClaim.centerId}/claims`);
    revalidatePath(`/lecturer/center/${updatedClaim.centerId}/my-claims`);
    return { success: true, claim: updatedClaim };
  } catch (error) {
    console.error("Error processing claim by Registry:", error);
    return { success: false, error: "Failed to process claim." };
  }
}

export async function updateUserRoleAndAssignmentsByRegistry({ userId, newRole, newCenterId, newDepartmentId }) {
  if (!userId || !newRole) {
    return { success: false, error: "User ID and new role are required." };
  }
  if (!['REGISTRY', 'COORDINATOR', 'LECTURER'].includes(newRole)) {
      return { success: false, error: "Invalid role specified." };
  }
  try {
    const updateData = { role: newRole };
    if (newRole === 'LECTURER') {
      updateData.lecturerCenterId = newCenterId || null;
      updateData.departmentId = newDepartmentId || null;
    } else if (newRole === 'COORDINATOR' || newRole === 'REGISTRY') {
      updateData.lecturerCenterId = null;
      updateData.departmentId = null;
    }
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
    revalidatePath('/registry/users');
    return { success: true, message: "User password updated successfully." };
  } catch (error) {
    console.error("Error updating user password by Registry:", error);
    return { success: false, error: "Failed to update user password." };
  }
}

export async function getPublicCenters() {
  try {
    const centers = await prisma.center.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return { success: true, centers };
  } catch (error) {
    console.error("Error fetching public centers:", error);
    return { success: false, error: "Failed to fetch centers list." };
  }
}

// --- NEW ACTIONS FOR SIGNUP REQUEST MANAGEMENT ---

/**
 * Fetches all signup requests with 'PENDING' status.
 * @returns {Promise<object>} Object with 'success' and 'requests' (array) or 'error'.
 */
export async function getPendingSignupRequests() {
  try {
    const requests = await prisma.signupRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { submittedAt: 'asc' },
      // Include requested center details if ID is present
      // This requires adding a relation from SignupRequest to Center if you want to show center name directly
      // For now, we'll just have requestedCenterId
    });
    return { success: true, requests };
  } catch (error) {
    console.error("Error fetching pending signup requests:", error);
    return { success: false, error: "Failed to fetch pending requests." };
  }
}

/**
 * Approves a signup request: creates a new user and updates the request status.
 * @param {object} data - Approval data.
 * @param {string} data.requestId - The ID of the signup request.
 * @param {string} data.registryUserId - The ID of the Registry user approving.
 * @returns {Promise<object>} Success/error object with new user data or error message.
 */
export async function approveSignupRequest({ requestId, registryUserId }) {
  if (!requestId || !registryUserId) {
    return { success: false, error: "Request ID and Registry User ID are required." };
  }

  try {
    const request = await prisma.signupRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return { success: false, error: "Signup request not found." };
    }
    if (request.status !== 'PENDING') {
      return { success: false, error: `Request is already ${request.status.toLowerCase()}.` };
    }

    // Check if email is already taken by an existing user (double check)
    const existingUser = await prisma.user.findUnique({ where: { email: request.email } });
    if (existingUser) {
      // Reject the request if user now exists (e.g. created manually in the meantime)
      await prisma.signupRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          processedAt: new Date(),
          processedByRegistryId: registryUserId,
        },
      });
      revalidatePath('/registry/requests'); // Assuming this path for requests
      return { success: false, error: "A user with this email already exists. Request has been rejected." };
    }

    // Use a transaction to ensure both user creation and request update succeed or fail together
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: request.name,
          email: request.email,
          password: request.hashedPassword, // Use the pre-hashed password from the request
          role: request.requestedRole,
          lecturerCenterId: request.requestedRole === 'LECTURER' ? request.requestedCenterId : null,
          approvedSignupRequestId: request.id, // Link user to the signup request
        },
        select: { id: true, name: true, email: true, role: true } // Return minimal info
      });

      await tx.signupRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          processedAt: new Date(),
          processedByRegistryId: registryUserId,
          // approvedUserId: createdUser.id, // This relation is implicit via approvedSignupRequestId on User
        },
      });
      return createdUser;
    });

    revalidatePath('/registry/requests');
    revalidatePath('/registry/users'); // New user added to the users list
    return { success: true, user: newUser, message: "Signup request approved and user created." };

  } catch (error) {
    console.error("Error approving signup request:", error);
    return { success: false, error: "Failed to approve signup request. " + error.message };
  }
}

/**
 * Rejects a signup request.
 * @param {object} data - Rejection data.
 * @param {string} data.requestId - The ID of the signup request.
 * @param {string} data.registryUserId - The ID of the Registry user rejecting.
 * @returns {Promise<object>} Success/error object.
 */
export async function rejectSignupRequest({ requestId, registryUserId }) {
  if (!requestId || !registryUserId) {
    return { success: false, error: "Request ID and Registry User ID are required." };
  }

  try {
    const request = await prisma.signupRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return { success: false, error: "Signup request not found." };
    }
    if (request.status !== 'PENDING') {
      return { success: false, error: `Request is already ${request.status.toLowerCase()}.` };
    }

    await prisma.signupRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
        processedByRegistryId: registryUserId,
      },
    });

    revalidatePath('/registry/requests');
    return { success: true, message: "Signup request rejected successfully." };

  } catch (error) {
    console.error("Error rejecting signup request:", error);
    return { success: false, error: "Failed to reject signup request. " + error.message };
  }
}
