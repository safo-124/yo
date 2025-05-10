// lib/actions/registry.actions.js
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

/**
 * Fetches a list of users who can potentially be assigned as Coordinators.
 * Filters out REGISTRY users and those already coordinating a center.
 */
export async function getPotentialCoordinators() {
  console.log(`[${new Date().toISOString()}] [getPotentialCoordinators] Action called.`);
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
        Center_Center_coordinatorIdToUser: { // Relation from User to Center they coordinate
          select: { id: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
    const availableUsers = users.filter(user => !user.Center_Center_coordinatorIdToUser);
    console.log(`[${new Date().toISOString()}] [getPotentialCoordinators] Found ${availableUsers.length} potential coordinators.`);
    return { success: true, users: availableUsers };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [getPotentialCoordinators] Error:`, error);
    return { success: false, error: "Failed to fetch users." };
  }
}

/**
 * Creates a new Center and assigns an existing User as a Coordinator.
 * If the selected user is not already a COORDINATOR, their role will be updated.
 */
export async function createCenter({ name, coordinatorId }) {
  console.log(`[${new Date().toISOString()}] [createCenter] Action called with name: ${name}, coordinatorId: ${coordinatorId}`);
  if (!name || !coordinatorId) {
    return { success: false, error: "Center name and Coordinator ID are required." };
  }

  try {
    const coordinator = await prisma.user.findUnique({
      where: { id: coordinatorId },
    });
    if (!coordinator) {
      console.log(`[${new Date().toISOString()}] [createCenter] Error: Coordinator with ID ${coordinatorId} not found.`);
      return { success: false, error: "Selected coordinator not found." };
    }

    const existingCenterForCoordinator = await prisma.center.findUnique({
        where: { coordinatorId: coordinatorId }
    });
    if (existingCenterForCoordinator) {
        console.log(`[${new Date().toISOString()}] [createCenter] Error: User ${coordinatorId} already coordinates center ${existingCenterForCoordinator.id}.`);
        return { success: false, error: `User ${coordinator.name || coordinator.email} is already coordinating center: ${existingCenterForCoordinator.name}.` };
    }

    const newCenter = await prisma.$transaction(async (tx) => {
      if (coordinator.role !== 'COORDINATOR') {
        await tx.user.update({
          where: { id: coordinatorId },
          data: { role: 'COORDINATOR' },
        });
        console.log(`[${new Date().toISOString()}] [createCenter] User ${coordinatorId}'s role updated to COORDINATOR.`);
      }
      const center = await tx.center.create({
        data: {
          name: name.trim(),
          coordinatorId,
        },
      });
      return center;
    });

    console.log(`[${new Date().toISOString()}] [createCenter] Center created successfully: ${newCenter.id}`);
    revalidatePath('/registry');
    revalidatePath('/registry/centers');
    revalidatePath('/registry/users');
    return { success: true, center: newCenter };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [createCenter] Error:`, error);
    if (error.code === 'P2002') {
        if (error.meta?.target?.includes('name')) {
            return { success: false, error: "A center with this name already exists." };
        }
        if (error.meta?.target?.includes('coordinatorId')) {
            return { success: false, error: "This user is already assigned as a coordinator for another center (transaction fallback)." };
        }
    }
    return { success: false, error: "Failed to create center. " + (error.message || "Unknown error") };
  }
}

/**
 * Fetches all Centers with their Coordinator's details and counts.
 */
export async function getCenters() {
  console.log(`[${new Date().toISOString()}] [getCenters] Action called.`);
  try {
    const centers = await prisma.center.findMany({
      include: {
        coordinator: {
          select: { id: true, name: true, email: true },
        },
        _count: { select: { lecturers: true, departments: true, claims: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    const formattedCenters = centers.map(c => ({
        ...c,
        lecturerCount: c._count?.lecturers,
        departmentCount: c._count?.departments,
        claimsCount: c._count?.claims
    }));
    console.log(`[${new Date().toISOString()}] [getCenters] Found ${formattedCenters.length} centers.`);
    return { success: true, centers: formattedCenters };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [getCenters] Error:`, error);
    return { success: false, error: "Failed to fetch centers." };
  }
}

/**
 * Creates a new User (Coordinator or Lecturer) by the Registry.
 */
export async function createUserByRegistry({ name, email, password, role, lecturerCenterId }) {
  console.log(`[${new Date().toISOString()}] [createUserByRegistry] Action called for email: ${email}, role: ${role}`);
  if (!name || !email || !password || !role) {
    return { success: false, error: "Name, email, password, and role are required." };
  }
  if (role !== 'COORDINATOR' && role !== 'LECTURER') {
    return { success: false, error: "Invalid role specified. Must be COORDINATOR or LECTURER." };
  }
  if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
  }
  if (role === 'LECTURER' && !lecturerCenterId) {
    return { success: false, error: "Lecturer role requires a Center ID." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log(`[${new Date().toISOString()}] [createUserByRegistry] Error: User with email ${email} already exists.`);
      return { success: false, error: "A user with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role,
        lecturerCenterId: role === 'LECTURER' ? lecturerCenterId : null,
      },
      select: { id: true, name: true, email: true, role: true, lecturerCenterId: true, createdAt: true }
    });

    console.log(`[${new Date().toISOString()}] [createUserByRegistry] User created successfully: ${newUser.id}`);
    revalidatePath('/registry/users');
    return { success: true, user: newUser };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [createUserByRegistry] Error:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { success: false, error: "A user with this email already exists (db constraint)." };
    }
    return { success: false, error: "Failed to create user. " + (error.message || "Unknown error") };
  }
}

/**
 * Fetches all users with related center/department info.
 */
export async function getAllUsers() {
  console.log(`[${new Date().toISOString()}] [getAllUsers] Action called.`);
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
      coordinatedCenterName: user.Center_Center_coordinatorIdToUser?.name,
      lecturerCenterName: user.Center_User_lecturerCenterIdToCenter?.name,
      departmentName: user.Department?.name,
    }));
    console.log(`[${new Date().toISOString()}] [getAllUsers] Found ${formattedUsers.length} users.`);
    return { success: true, users: formattedUsers };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [getAllUsers] Error:`, error);
    return { success: false, error: "Failed to fetch users." };
  }
}

/**
 * Fetches all claims across the system, with optional filters.
 */
export async function getAllClaimsSystemWide(filters = {}) {
  console.log(`[${new Date().toISOString()}] [getAllClaimsSystemWide] Action called.`);
  console.log(`[${new Date().toISOString()}] [getAllClaimsSystemWide] Received filters:`, JSON.stringify(filters, null, 2));

  const { centerId, status, lecturerId, lecturerName } = filters;
  try {
    const whereClause = {};
    if (centerId) whereClause.centerId = centerId;
    if (status) whereClause.status = status;
    if (lecturerId) whereClause.submittedById = lecturerId;
    if (lecturerName) {
      whereClause.submittedBy = {
        name: {
          contains: lecturerName,
        }
      };
    }

    console.log(`[${new Date().toISOString()}] [getAllClaimsSystemWide] Constructed whereClause:`, JSON.stringify(whereClause, null, 2));

    const claims = await prisma.claim.findMany({
      where: whereClause,
      include: {
        submittedBy: { select: { id: true, name: true, email: true } },
        processedBy: { select: { id: true, name: true, email: true } },
        center: { select: { id: true, name: true } },
        supervisedStudents: { 
          select: {
            studentName: true,
            thesisTitle: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
    });

    console.log(`[${new Date().toISOString()}] [getAllClaimsSystemWide] Found ${claims.length} claims.`);

    if (claims.length > 0 && claims.length < 5) {
        console.log(`[${new Date().toISOString()}] [getAllClaimsSystemWide] Sample claims data:`, JSON.stringify(claims.slice(0, 5), null, 2));
    }
    
    const formattedClaims = claims.map(claim => ({
      ...claim,
      centerName: claim.center?.name,
    }));

    return { success: true, claims: formattedClaims };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [getAllClaimsSystemWide] Error fetching claims:`, error);
    return { success: false, error: "Failed to fetch system-wide claims. Check server logs for details." };
  }
}

/**
 * Allows Registry to process (approve/reject) any claim.
 */
export async function processClaimByRegistry({ claimId, status, registryUserId }) {
  console.log(`[${new Date().toISOString()}] [processClaimByRegistry] Action called for claimId: ${claimId}, status: ${status}, registryUserId: ${registryUserId}`);
  if (!claimId || !status || !registryUserId) {
    return { success: false, error: "Claim ID, status, and Registry User ID are required." };
  }
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return { success: false, error: "Invalid status. Must be APPROVED or REJECTED." };
  }

  try {
    const processor = await prisma.user.findUnique({
        where: { id: registryUserId },
        select: { role: true }
    });

    if (!processor) {
        console.log(`[${new Date().toISOString()}] [processClaimByRegistry] Error: Processing user (Registry) with ID ${registryUserId} not found.`);
        return { success: false, error: "Processing user (Registry) not found." };
    }
    if (processor.role !== 'REGISTRY') {
        console.log(`[${new Date().toISOString()}] [processClaimByRegistry] Error: User ${registryUserId} is not a Registry member (role: ${processor.role}).`);
        return { success: false, error: "User performing the action is not authorized (must be a Registry member)." };
    }

    const claimToUpdate = await prisma.claim.findUnique({ where: {id: claimId }});
    if (!claimToUpdate) {
        console.log(`[${new Date().toISOString()}] [processClaimByRegistry] Error: Claim with ID ${claimId} not found.`);
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

    console.log(`[${new Date().toISOString()}] [processClaimByRegistry] Claim ${claimId} processed to status ${status} successfully.`);
    revalidatePath('/registry/claims');
    if (updatedClaim.centerId) {
        revalidatePath(`/coordinator/center/${updatedClaim.centerId}/claims`);
    }
    if (updatedClaim.submittedById) {
        revalidatePath(`/lecturer/my-claims`);
        revalidatePath(`/lecturer/${updatedClaim.submittedById}/claims`); 
    }
    return { success: true, claim: updatedClaim };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [processClaimByRegistry] Error:`, error);
    return { success: false, error: "Failed to process claim." };
  }
}

/**
 * Updates a user's role and optionally their center/department assignments.
 */
export async function updateUserRoleAndAssignmentsByRegistry({ userId, newRole, newCenterId, newDepartmentId }) {
  console.log(`[${new Date().toISOString()}] [updateUserRoleAndAssignmentsByRegistry] Action called for userId: ${userId}, newRole: ${newRole}`);
  if (!userId || !newRole) {
    return { success: false, error: "User ID and new role are required." };
  }
  if (!['REGISTRY', 'COORDINATOR', 'LECTURER'].includes(newRole)) {
      return { success: false, error: "Invalid role specified." };
  }

  try {
    const updateData = { role: newRole };
    const userToUpdate = await prisma.user.findUnique({
        where: { id: userId },
        include: { Center_Center_coordinatorIdToUser: true }
    });

    if (!userToUpdate) {
        console.log(`[${new Date().toISOString()}] [updateUserRoleAndAssignmentsByRegistry] Error: User with ID ${userId} not found.`);
        return { success: false, error: "User to update not found." };
    }

    if (newRole === 'LECTURER') {
      if (!newCenterId) return { success: false, error: "Lecturer role requires a Center ID." };
      updateData.lecturerCenterId = newCenterId;
      updateData.departmentId = newDepartmentId || null;
    } else { 
      updateData.lecturerCenterId = null;
      updateData.departmentId = null;
    }

    if (userToUpdate.Center_Center_coordinatorIdToUser && (newRole === 'LECTURER' || newRole === 'REGISTRY')) {
        console.warn(`[${new Date().toISOString()}] [updateUserRoleAndAssignmentsByRegistry] WARNING: User ${userId} is a coordinator for center ${userToUpdate.Center_Center_coordinatorIdToUser.id}. Changing role to ${newRole} without explicit reassignment of center's coordinator. This needs careful handling.`);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    console.log(`[${new Date().toISOString()}] [updateUserRoleAndAssignmentsByRegistry] User ${userId} role updated to ${newRole}.`);
    revalidatePath('/registry/users');
    if (userToUpdate.Center_Center_coordinatorIdToUser) {
        revalidatePath('/registry/centers');
    }
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [updateUserRoleAndAssignmentsByRegistry] Error:`, error);
    return { success: false, error: "Failed to update user role. " + error.message };
  }
}

/**
 * Allows Registry to change a user's password.
 */
export async function updateUserPasswordByRegistry({ userId, newPassword }) {
  console.log(`[${new Date().toISOString()}] [updateUserPasswordByRegistry] Action called for userId: ${userId}`);
  if (!userId || !newPassword) {
    return { success: false, error: "User ID and new password are required." };
  }
  if (newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  try {
    const userToUpdate = await prisma.user.findUnique({where: {id: userId}, select: { role: true }});
    if (!userToUpdate) {
        console.log(`[${new Date().toISOString()}] [updateUserPasswordByRegistry] Error: User with ID ${userId} not found.`);
        return { success: false, error: "User not found." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    console.log(`[${new Date().toISOString()}] [updateUserPasswordByRegistry] Password updated for user ${userId}.`);
    return { success: true, message: "User password updated successfully." };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [updateUserPasswordByRegistry] Error:`, error);
    return { success: false, error: "Failed to update user password." };
  }
}

/**
 * Fetches center names and IDs for public use (e.g., signup form).
 */
export async function getPublicCenters() {
  console.log(`[${new Date().toISOString()}] [getPublicCenters] Action called.`);
  try {
    const centers = await prisma.center.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    console.log(`[${new Date().toISOString()}] [getPublicCenters] Found ${centers.length} public centers.`);
    return { success: true, centers };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [getPublicCenters] Error:`, error);
    return { success: false, error: "Failed to fetch centers list." };
  }
}

/**
 * Fetches all signup requests with 'PENDING' status.
 */
export async function getPendingSignupRequests() {
  console.log(`[${new Date().toISOString()}] [getPendingSignupRequests] Action called.`);
  try {
    const requests = await prisma.signupRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { submittedAt: 'asc' },
    });

    let centersMap = {};
    const requestsWithCenterIds = requests.filter(r => r.requestedCenterId);
    if (requestsWithCenterIds.length > 0) {
        const centerIds = [...new Set(requestsWithCenterIds.map(r => r.requestedCenterId))];
        const centers = await prisma.center.findMany({
            where: { id: { in: centerIds } },
            select: { id: true, name: true }
        });
        centersMap = centers.reduce((map, center) => {
            map[center.id] = center.name;
            return map;
        }, {});
        console.log(`[${new Date().toISOString()}] [getPendingSignupRequests] Fetched names for ${centers.length} centers.`);
    }

    const formattedRequests = requests.map(request => ({
        ...request,
        requestedCenterName: request.requestedCenterId ? (centersMap[request.requestedCenterId] || "Unknown Center") : null,
    }));
    console.log(`[${new Date().toISOString()}] [getPendingSignupRequests] Found ${formattedRequests.length} pending requests.`);
    return { success: true, requests: formattedRequests };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [getPendingSignupRequests] Error:`, error);
    return { success: false, error: "Failed to fetch pending requests." };
  }
}

/**
 * Approves a signup request: creates a new user and updates the request status.
 */
export async function approveSignupRequest({ requestId, registryUserId }) {
  console.log(`[${new Date().toISOString()}] [approveSignupRequest] Action called for requestId: ${requestId}, registryUserId: ${registryUserId}`);
  if (!requestId || !registryUserId) {
    return { success: false, error: "Request ID and Registry User ID are required." };
  }

  try {
    const processor = await prisma.user.findUnique({
        where: { id: registryUserId },
        select: { role: true }
    });
    if (!processor) {
        console.log(`[${new Date().toISOString()}] [approveSignupRequest] Error: Approving user (Registry) with ID ${registryUserId} not found.`);
        return { success: false, error: "Approving user (Registry) not found." };
    }
    if (processor.role !== 'REGISTRY') {
        console.log(`[${new Date().toISOString()}] [approveSignupRequest] Error: User ${registryUserId} is not a Registry member (role: ${processor.role}).`);
        return { success: false, error: "User performing the approval is not authorized (must be a Registry member)." };
    }

    const request = await prisma.signupRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
        console.log(`[${new Date().toISOString()}] [approveSignupRequest] Error: Signup request with ID ${requestId} not found.`);
        return { success: false, error: "Signup request not found." };
    }
    if (request.status !== 'PENDING') {
        console.log(`[${new Date().toISOString()}] [approveSignupRequest] Info: Request ${requestId} is already ${request.status}.`);
        return { success: false, error: `Request is already ${request.status.toLowerCase()}.` };
    }

    const existingUser = await prisma.user.findUnique({ where: { email: request.email } });
    if (existingUser) {
      console.log(`[${new Date().toISOString()}] [approveSignupRequest] Info: User with email ${request.email} already exists. Rejecting request ${requestId}.`);
      await prisma.signupRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED', processedAt: new Date(), processedByRegistryId: registryUserId },
      });
      revalidatePath('/registry/requests');
      return { success: false, error: "A user with this email already exists. Request has been automatically rejected." };
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

    console.log(`[${new Date().toISOString()}] [approveSignupRequest] Request ${requestId} approved, user ${newUser.id} created.`);
    revalidatePath('/registry/requests');
    revalidatePath('/registry/users');
    return { success: true, user: newUser, message: "Signup request approved and user created." };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [approveSignupRequest] Error:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        try {
            await prisma.signupRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED', processedAt: new Date(), processedByRegistryId: registryUserId },
            });
            revalidatePath('/registry/requests');
        } catch (rejectError) {
            console.error(`[${new Date().toISOString()}] [approveSignupRequest] Failed to mark request ${requestId} as REJECTED after P2002 error:`, rejectError);
        }
        return { success: false, error: "A user with this email already exists. Request has been rejected." };
    }
    return { success: false, error: "Failed to approve signup request. " + error.message };
  }
}

/**
 * Rejects a signup request.
 */
export async function rejectSignupRequest({ requestId, registryUserId }) {
  console.log(`[${new Date().toISOString()}] [rejectSignupRequest] Action called for requestId: ${requestId}, registryUserId: ${registryUserId}`);
  if (!requestId || !registryUserId) {
    return { success: false, error: "Request ID and Registry User ID are required." };
  }

  try {
    const processor = await prisma.user.findUnique({
        where: { id: registryUserId },
        select: { role: true }
    });
    if (!processor) {
        console.log(`[${new Date().toISOString()}] [rejectSignupRequest] Error: Rejecting user (Registry) with ID ${registryUserId} not found.`);
        return { success: false, error: "Rejecting user (Registry) not found." };
    }
    if (processor.role !== 'REGISTRY') {
        console.log(`[${new Date().toISOString()}] [rejectSignupRequest] Error: User ${registryUserId} is not a Registry member (role: ${processor.role}).`);
        return { success: false, error: "User performing the rejection is not authorized (must be a Registry member)." };
    }

    const request = await prisma.signupRequest.findUnique({ where: { id: requestId } });
    if (!request) {
        console.log(`[${new Date().toISOString()}] [rejectSignupRequest] Error: Signup request with ID ${requestId} not found.`);
        return { success: false, error: "Signup request not found." };
    }
    if (request.status !== 'PENDING') {
        console.log(`[${new Date().toISOString()}] [rejectSignupRequest] Info: Request ${requestId} is already ${request.status}.`);
        return { success: false, error: `Request is already ${request.status.toLowerCase()}.` };
    }

    await prisma.signupRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', processedAt: new Date(), processedByRegistryId: registryUserId },
    });

    console.log(`[${new Date().toISOString()}] [rejectSignupRequest] Request ${requestId} rejected successfully.`);
    revalidatePath('/registry/requests');
    return { success: true, message: "Signup request rejected successfully." };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [rejectSignupRequest] Error:`, error);
    return { success: false, error: "Failed to reject signup request. " + error.message };
  }
}

// --- FUNCTION FOR LECTURER MONTHLY CLAIM SUMMARY (can be called by Registry) ---
/**
 * Fetches a monthly claim summary for a specific lecturer.
 * @param {object} params - The parameters for fetching the summary.
 * @param {string} params.lecturerId - The ID of the lecturer.
 * @param {number} params.year - The year for the summary.
 * @param {number} params.month - The month for the summary (1-12).
 * @returns {Promise<object>} Object containing success status, summary data, or an error.
 */
export async function getLecturerMonthlyClaimSummary({ lecturerId, year, month }) {
  console.log(`[${new Date().toISOString()}] [getLecturerMonthlyClaimSummary] Action called for lecturerId: ${lecturerId}, Year: ${year}, Month: ${month}`);
  if (!lecturerId || !year || !month) {
    return { success: false, error: "Lecturer ID, year, and month are required." };
  }
  if (month < 1 || month > 12) {
    return { success: false, error: "Invalid month provided. Must be between 1 and 12." };
  }

  try {
    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId },
      select: { id: true, name: true, email: true }
    });

    if (!lecturer) {
      return { success: false, error: "Lecturer not found." };
    }

    const startDate = new Date(year, month - 1, 1); 
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); 

    console.log(`[${new Date().toISOString()}] [getLecturerMonthlyClaimSummary] Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const claimsInMonth = await prisma.claim.findMany({
      where: {
        submittedById: lecturerId,
        submittedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        claimType: true,
        status: true,
        submittedAt: true,
        processedAt: true,
        teachingHours: true,
        transportAmount: true,
        center: { select: { name: true } } // Include center name
      },
      orderBy: { submittedAt: 'desc' }
    });

    console.log(`[${new Date().toISOString()}] [getLecturerMonthlyClaimSummary] Found ${claimsInMonth.length} claims for the period.`);

    const summary = {
      lecturerName: lecturer.name,
      lecturerEmail: lecturer.email,
      month: startDate.toLocaleString('default', { month: 'long' }), 
      year: year,
      totalClaims: claimsInMonth.length,
      pending: claimsInMonth.filter(c => c.status === 'PENDING').length,
      approved: claimsInMonth.filter(c => c.status === 'APPROVED').length,
      rejected: claimsInMonth.filter(c => c.status === 'REJECTED').length,
      totalTeachingHours: claimsInMonth
        .filter(c => c.claimType === 'TEACHING' && c.status === 'APPROVED' && c.teachingHours)
        .reduce((sum, c) => sum + (c.teachingHours || 0), 0),
      totalTransportAmount: claimsInMonth
        .filter(c => c.claimType === 'TRANSPORTATION' && c.status === 'APPROVED' && c.transportAmount)
        .reduce((sum, c) => sum + (c.transportAmount || 0), 0),
      claims: claimsInMonth.map(claim => ({ // Ensure centerName is directly on claim object
        ...claim,
        centerName: claim.center?.name
      })), 
    };

    return { success: true, summary };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [getLecturerMonthlyClaimSummary] Error:`, error);
    return { success: false, error: "Failed to generate lecturer monthly claim summary. " + error.message };
  }
}


// --- FUNCTION FOR MONTHLY GROUPED CLAIM SUMMARY (for Registry/Coordinator) ---
/**
 * Fetches and aggregates a monthly claims summary, grouped by center, department, and course (for thesis exams).
 * @param {object} params - Parameters for the summary.
 * @param {number} params.year - The year for the summary.
 * @param {number} params.month - The month for the summary (1-12).
 * @param {string} [params.requestingUserId] - Optional: ID of the user requesting the summary. Used to determine role and filter by center for Coordinators.
 * @param {string} [params.filterCenterId] - Optional: Directly filter by a center ID (e.g., if role logic is handled client-side or for specific admin views).
 * @returns {Promise<object>} Object containing success status, the summary data, or an error message.
 */
export async function getMonthlyClaimsSummaryByGrouping({ year, month, requestingUserId, filterCenterId: directFilterCenterId }) {
  console.log(`[${new Date().toISOString()}] [getMonthlyClaimsSummaryByGrouping] Action called. Year: ${year}, Month: ${month}, UserID: ${requestingUserId}, FilterCenterID: ${directFilterCenterId}`);

  if (!year || !month) {
    return { success: false, error: "Year and month are required." };
  }
  if (month < 1 || month > 12) {
    return { success: false, error: "Invalid month provided. Must be between 1 and 12." };
  }

  try {
    let effectiveFilterCenterId = directFilterCenterId;

    if (requestingUserId && !effectiveFilterCenterId) {
      const requestingUser = await prisma.user.findUnique({
        where: { id: requestingUserId },
        select: { role: true, Center_Center_coordinatorIdToUser: { select: { id: true } } } 
      });

      if (!requestingUser) {
        return { success: false, error: "Requesting user not found." };
      }
      if (requestingUser.role === 'COORDINATOR') {
        if (requestingUser.Center_Center_coordinatorIdToUser?.id) {
          effectiveFilterCenterId = requestingUser.Center_Center_coordinatorIdToUser.id;
          console.log(`[${new Date().toISOString()}] [getMonthlyClaimsSummaryByGrouping] Coordinator ${requestingUserId} fetching for their center: ${effectiveFilterCenterId}`);
        } else {
          return { success: false, error: "Coordinator is not assigned to a center.", summary: [] }; 
        }
      } else if (requestingUser.role !== 'REGISTRY') {
        return { success: false, error: "User does not have permission to view this summary." };
      }
    }

    const startDate = new Date(year, month - 1, 1); 
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    console.log(`[${new Date().toISOString()}] [getMonthlyClaimsSummaryByGrouping] Querying claims from ${startDate.toISOString()} to ${endDate.toISOString()}${effectiveFilterCenterId ? ` for center ${effectiveFilterCenterId}` : ' for all centers'}.`);

    const claims = await prisma.claim.findMany({
      where: {
        submittedAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(effectiveFilterCenterId && { centerId: effectiveFilterCenterId }),
      },
      include: {
        submittedBy: {
          select: {
            id: true, 
            name: true, 
            departmentId: true,
            Department: { 
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        center: { 
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        centerId: 'asc',
        submittedAt: 'asc',
      }
    });

    console.log(`[${new Date().toISOString()}] [getMonthlyClaimsSummaryByGrouping] Fetched ${claims.length} claims.`);

    const summaryByCenter = {};

    for (const claim of claims) {
      const centerId = claim.center?.id || 'unknown_center';
      const centerName = claim.center?.name || 'Unknown Center';
      const departmentId = claim.submittedBy?.Department?.id || 'unknown_department';
      const departmentName = claim.submittedBy?.Department?.name || 'Unknown Department';
      
      if (!summaryByCenter[centerId]) {
        summaryByCenter[centerId] = {
          centerId,
          centerName,
          totalTeachingHours: 0,
          totalTransportAmount: 0,
          totalThesisSupervision: 0,
          totalThesisExamination: 0,
          totalClaims: 0,
          statusCounts: { PENDING: 0, APPROVED: 0, REJECTED: 0 },
          departments: {},
        };
      }
      const centerSummary = summaryByCenter[centerId];
      centerSummary.totalClaims += 1;
      centerSummary.statusCounts[claim.status] = (centerSummary.statusCounts[claim.status] || 0) + 1;


      if (!centerSummary.departments[departmentId]) {
        centerSummary.departments[departmentId] = {
          departmentId,
          departmentName,
          lecturerId: claim.submittedBy.id, 
          lecturerName: claim.submittedBy.name, 
          totalTeachingHours: 0,
          totalTransportAmount: 0,
          totalThesisSupervision: 0,
          totalThesisExamination: 0,
          totalClaimsInDept: 0,
          statusCounts: { PENDING: 0, APPROVED: 0, REJECTED: 0 },
          courses: {}, 
        };
      }
      const deptSummary = centerSummary.departments[departmentId];
      deptSummary.totalClaimsInDept += 1;
      deptSummary.statusCounts[claim.status] = (deptSummary.statusCounts[claim.status] || 0) + 1;


      if (claim.claimType === 'TEACHING' && claim.teachingHours) {
        centerSummary.totalTeachingHours += claim.teachingHours;
        deptSummary.totalTeachingHours += claim.teachingHours;
      } else if (claim.claimType === 'TRANSPORTATION' && claim.transportAmount) {
        centerSummary.totalTransportAmount += claim.transportAmount;
        deptSummary.totalTransportAmount += claim.transportAmount;
      } else if (claim.claimType === 'THESIS_PROJECT') {
        if (claim.thesisType === 'SUPERVISION') {
          centerSummary.totalThesisSupervision += 1;
          deptSummary.totalThesisSupervision += 1;
        } else if (claim.thesisType === 'EXAMINATION') {
          centerSummary.totalThesisExamination += 1;
          deptSummary.totalThesisExamination += 1;
          
          const courseCode = claim.thesisExamCourseCode || 'UNKNOWN_COURSE';
          if (!deptSummary.courses[courseCode]) {
            deptSummary.courses[courseCode] = {
              courseCode, 
              courseId: courseCode, 
              thesisExaminationCount: 0,
            };
          }
          deptSummary.courses[courseCode].thesisExaminationCount += 1;
        }
      }
    }

    const finalSummary = Object.values(summaryByCenter).map(center => ({
      ...center,
      departments: Object.values(center.departments).map(dept => ({
        ...dept,
        courses: Object.values(dept.courses),
      })).sort((a, b) => a.departmentName.localeCompare(b.departmentName)), 
    })).sort((a,b) => a.centerName.localeCompare(b.centerName)); 

    console.log(`[${new Date().toISOString()}] [getMonthlyClaimsSummaryByGrouping] Summary generation complete.`);
    return { success: true, summary: finalSummary };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [getMonthlyClaimsSummaryByGrouping] Error:`, error);
    return { success: false, error: "Failed to generate monthly claims summary. " + error.message };
  }
}
