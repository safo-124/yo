// lib/actions/registry.actions.js
"use server";

import prisma from '@/lib/prisma'; // Ensure your Prisma client instance is correctly exported from here
import { revalidatePath } from 'next/cache'; // To update cached data after mutations
import bcrypt from 'bcryptjs'; // For hashing passwords

/**
 * Fetches a list of users who can potentially be assigned as Coordinators.
 * Filters out REGISTRY users and those already coordinating a center.
 * @returns {Promise<object>} An object with 'success' (boolean) and 'users' (array) or 'error' (string).
 */
export async function getPotentialCoordinators() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: 'REGISTRY' // Exclude Registry users
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // Relation from User to Center they coordinate (used for filtering)
        Center_Center_coordinatorIdToUser: {
          select: { id: true } // Select only ID to check for existence
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
    // Verify the selected coordinator exists
    const coordinator = await prisma.user.findUnique({
      where: { id: coordinatorId },
    });
    if (!coordinator) {
      return { success: false, error: "Selected coordinator not found." };
    }

    // Use transaction to ensure atomicity
    const newCenter = await prisma.$transaction(async (tx) => {
      // Update user role if necessary
      if (coordinator.role !== 'COORDINATOR') {
        await tx.user.update({
          where: { id: coordinatorId },
          data: { role: 'COORDINATOR' },
        });
        console.log(`User ${coordinator.name || coordinator.email}'s role updated to COORDINATOR.`);
      }
      // Create the center
      const center = await tx.center.create({
        data: {
          name: name.trim(),
          coordinatorId, // Links to the User model via the relation
        },
      });
      return center;
    });

    // Revalidate relevant paths
    revalidatePath('/registry'); // Overview page
    revalidatePath('/registry/centers'); // Centers list page
    revalidatePath('/registry/users'); // Users list page (role might have changed)
    return { success: true, center: newCenter };

  } catch (error) {
    console.error("Error creating center:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return { success: false, error: "A center with this name already exists." };
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('coordinatorId')) {
      // This error occurs due to the @unique constraint on coordinatorId in the Center model.
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
        coordinator: { // Use the field name from Center model that points to User
          select: { id: true, name: true, email: true },
        },
        // Optionally include counts
        // _count: { select: { lecturers: true, departments: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    // The 'coordinator' field is now directly available due to the include
    // Add counts if fetched:
    // const formattedCenters = centers.map(c => ({ ...c, lecturerCount: c._count?.lecturers, departmentCount: c._count?.departments }));
    // return { success: true, centers: formattedCenters };
    return { success: true, centers: centers };
  } catch (error) {
    console.error("Error fetching centers:", error);
    return { success: false, error: "Failed to fetch centers." };
  }
}

/**
 * Creates a new User (Coordinator or Lecturer) by the Registry.
 * @param {object} userData - User data { name, email, password, role, lecturerCenterId? }.
 * @returns {Promise<object>} Success/error object.
 */
export async function createUserByRegistry({ name, email, password, role, lecturerCenterId }) {
  if (!name || !email || !password || !role) {
    return { success: false, error: "Name, email, password, and role are required." };
  }
  if (role !== 'COORDINATOR' && role !== 'LECTURER') {
    return { success: false, error: "Invalid role specified. Must be COORDINATOR or LECTURER." };
  }
  if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "A user with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role,
        lecturerCenterId: role === 'LECTURER' ? lecturerCenterId || null : null,
      },
      select: { id: true, name: true, email: true, role: true, lecturerCenterId: true, createdAt: true }
    });

    revalidatePath('/registry/users');
    return { success: true, user: newUser };
  } catch (error) {
    console.error("Error creating user by registry:", error);
    // P2002 is unique constraint violation, already checked above but good fallback
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
    // Format for easier frontend use
    const formattedUsers = users.map(user => ({
      ...user,
      coordinatedCenter: user.Center_Center_coordinatorIdToUser,
      lecturerCenter: user.Center_User_lecturerCenterIdToCenter,
      department: user.Department,
    }));
    return { success: true, users: formattedUsers };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return { success: false, error: "Failed to fetch users." };
  }
}

/**
 * Fetches all claims across the system, with optional filters.
 * @param {object} [filters] - Optional filters { centerId?, status?, lecturerId?, lecturerName? }.
 * @returns {Promise<object>} Object with 'success' and 'claims' or 'error'.
 */
export async function getAllClaimsSystemWide(filters = {}) {
  const { centerId, status, lecturerId, lecturerName } = filters;
  try {
    const whereClause = {
      ...(centerId && { centerId }),
      ...(status && { status }),
      ...(lecturerId && { submittedById: lecturerId }),
      ...(lecturerName && {
        submittedBy: {
          name: { contains: lecturerName, mode: 'insensitive' }
        }
      }),
    };

    const claims = await prisma.claim.findMany({
      where: whereClause,
      include: {
        submittedBy: { select: { id: true, name: true, email: true } },
        processedBy: { select: { id: true, name: true, email: true } },
        center: { select: { id: true, name: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Format for easier frontend use
    const formattedClaims = claims.map(claim => ({
      ...claim,
      centerName: claim.center.name,
      // submittedBy and processedBy objects are already included
    }));
    return { success: true, claims: formattedClaims };
  } catch (error) {
    console.error("Error fetching all claims system-wide:", error);
    return { success: false, error: "Failed to fetch system-wide claims." };
  }
}

/**
 * Allows Registry to process (approve/reject) any claim.
 * @param {object} data - Claim processing data { claimId, status, registryUserId }.
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
    // Potentially check if claim is already processed? Or allow re-processing by registry?
    // if (claimToUpdate.status !== 'PENDING') {
    //     return { success: false, error: `Claim is already ${claimToUpdate.status.toLowerCase()}.` };
    // }

    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        status: status,
        processedById: registryUserId, // Mark as processed by Registry
        processedAt: new Date(),
      },
    });

    // Revalidate paths where this claim might be visible
    revalidatePath('/registry/claims');
    revalidatePath(`/coordinator/${updatedClaim.centerId}/claims`);
    revalidatePath(`/lecturer/center/${updatedClaim.centerId}/my-claims`); // Assuming this path structure

    return { success: true, claim: updatedClaim };
  } catch (error) {
    console.error("Error processing claim by Registry:", error);
    return { success: false, error: "Failed to process claim." };
  }
}

/**
 * Updates a user's role and optionally their center/department assignments.
 * WARNING: Does not handle reassignment logic if demoting a Coordinator.
 * @param {object} data - User update data { userId, newRole, newCenterId?, newDepartmentId? }.
 * @returns {Promise<object>} Success/error object.
 */
export async function updateUserRoleAndAssignmentsByRegistry({ userId, newRole, newCenterId, newDepartmentId }) {
  if (!userId || !newRole) {
    return { success: false, error: "User ID and new role are required." };
  }
  if (!['REGISTRY', 'COORDINATOR', 'LECTURER'].includes(newRole)) {
      return { success: false, error: "Invalid role specified." };
  }

  // Prevent self-role change or changing other REGISTRY users via this simple action
  // const currentUser = await getSession(); // Need session to check who is making the request
  // if (currentUser?.userId === userId && currentUser?.role === 'REGISTRY') {
  //    return { success: false, error: "Cannot change own role via this action." };
  // }
  // const userToUpdate = await prisma.user.findUnique({where: {id: userId}, select: { role: true }});
  // if (userToUpdate?.role === 'REGISTRY' && currentUser?.userId !== userId) {
  //     return { success: false, error: "Cannot change another Registry user's role via this action." };
  // }

  try {
    const updateData = { role: newRole };

    if (newRole === 'LECTURER') {
      updateData.lecturerCenterId = newCenterId || null;
      updateData.departmentId = newDepartmentId || null;
      // TODO: Add logic here or in a separate step to remove user as coordinator from any Center if they were one.
    } else { // If becoming COORDINATOR or REGISTRY
      updateData.lecturerCenterId = null;
      updateData.departmentId = null;
       // TODO: If changing FROM Coordinator, handle removing them from Center.coordinatorId
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

/**
 * Allows Registry to change a user's password.
 * @param {object} data - Password update data { userId, newPassword }.
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
    // Optional: Prevent changing REGISTRY user passwords here?
    // const userToUpdate = await prisma.user.findUnique({where: {id: userId}, select: { role: true }});
    // if (userToUpdate?.role === 'REGISTRY') {
    //     return { success: false, error: "Cannot change Registry password via this action." };
    // }

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

/**
 * Fetches center names and IDs for public use (e.g., signup form).
 * @returns {Promise<object>} Object with 'success' and 'centers' or 'error'.
 */
export async function getPublicCenters() {
  try {
    const centers = await prisma.center.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return { success: true, centers };
  } catch (error) {
    console.error("Error fetching public centers:", error);
    return { success: false, error: "Failed to fetch centers list." };
  }
}

/**
 * Fetches all signup requests with 'PENDING' status.
 * @returns {Promise<object>} Object with 'success' and 'requests' (array) or 'error'.
 */
export async function getPendingSignupRequests() {
  try {
    const requests = await prisma.signupRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { submittedAt: 'asc' },
      // Include center name if requestedCenterId exists
      // Requires adding relation in schema or doing a separate lookup based on IDs
    });
    // If you add relation `requestedCenter` to SignupRequest model:
    // include: { requestedCenter: { select: { name: true } } }
    // Then map: requests.map(r => ({...r, requestedCenterName: r.requestedCenter?.name}))
    return { success: true, requests };
  } catch (error) {
    console.error("Error fetching pending signup requests:", error);
    return { success: false, error: "Failed to fetch pending requests." };
  }
}

/**
 * Approves a signup request: creates a new user and updates the request status.
 * @param {object} data - Approval data { requestId, registryUserId }.
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

    if (!request) return { success: false, error: "Signup request not found." };
    if (request.status !== 'PENDING') return { success: false, error: `Request is already ${request.status.toLowerCase()}.` };

    const existingUser = await prisma.user.findUnique({ where: { email: request.email } });
    if (existingUser) {
      await prisma.signupRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED', processedAt: new Date(), processedByRegistryId: registryUserId },
      });
      revalidatePath('/registry/requests');
      return { success: false, error: "A user with this email already exists. Request rejected." };
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: request.name,
          email: request.email,
          password: request.hashedPassword,
          role: request.requestedRole,
          lecturerCenterId: request.requestedRole === 'LECTURER' ? request.requestedCenterId : null,
          approvedSignupRequestId: request.id,
        },
        select: { id: true, name: true, email: true, role: true }
      });
      await tx.signupRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', processedAt: new Date(), processedByRegistryId: registryUserId },
      });
      return createdUser;
    });

    revalidatePath('/registry/requests');
    revalidatePath('/registry/users');
    return { success: true, user: newUser, message: "Signup request approved and user created." };

  } catch (error) {
    console.error("Error approving signup request:", error);
    return { success: false, error: "Failed to approve signup request. " + error.message };
  }
}

/**
 * Rejects a signup request.
 * @param {object} data - Rejection data { requestId, registryUserId }.
 * @returns {Promise<object>} Success/error object.
 */
export async function rejectSignupRequest({ requestId, registryUserId }) {
  if (!requestId || !registryUserId) {
    return { success: false, error: "Request ID and Registry User ID are required." };
  }

  try {
    const request = await prisma.signupRequest.findUnique({ where: { id: requestId } });
    if (!request) return { success: false, error: "Signup request not found." };
    if (request.status !== 'PENDING') return { success: false, error: `Request is already ${request.status.toLowerCase()}.` };

    await prisma.signupRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', processedAt: new Date(), processedByRegistryId: registryUserId },
    });

    revalidatePath('/registry/requests');
    return { success: true, message: "Signup request rejected successfully." };

  } catch (error) {
    console.error("Error rejecting signup request:", error);
    return { success: false, error: "Failed to reject signup request. " + error.message };
  }
}
