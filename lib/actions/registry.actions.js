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
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getPotentialCoordinators] Action called.`);
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
        // image: true, // Assuming 'image' field does not exist on User model based on previous errors
        Center_Center_coordinatorIdToUser: {
          select: { id: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
    const availableUsers = users.filter(user => !user.Center_Center_coordinatorIdToUser);
    console.log(`[${timestamp}] [getPotentialCoordinators] Found ${availableUsers.length} potential coordinators.`);
    return { success: true, users: availableUsers };
  } catch (error) {
    console.error(`[${timestamp}] [getPotentialCoordinators] Error:`, error);
    return { success: false, error: "Failed to fetch potential coordinators." };
  }
}

/**
 * Creates a new Center and assigns an existing User as a Coordinator.
 * If the selected user is not already a COORDINATOR, their role will be updated.
 */
export async function createCenter({ name, coordinatorId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [createCenter] Action called with name: ${name}, coordinatorId: ${coordinatorId}`);
  if (!name || !name.trim() || !coordinatorId) {
    return { success: false, error: "Center name and Coordinator ID are required." };
  }

  try {
    const coordinator = await prisma.user.findUnique({
      where: { id: coordinatorId },
      select: { id: true, name: true, email: true, role: true } // Select necessary fields
    });
    if (!coordinator) {
      console.log(`[${timestamp}] [createCenter] Error: Coordinator with ID ${coordinatorId} not found.`);
      return { success: false, error: "Selected coordinator not found." };
    }
     if (coordinator.role === 'REGISTRY') {
      console.log(`[${timestamp}] [createCenter] Error: REGISTRY user ${coordinatorId} cannot be assigned as a coordinator.`);
      return { success: false, error: "REGISTRY members cannot be assigned as center coordinators." };
    }

    const existingCenterForCoordinator = await prisma.center.findUnique({
        where: { coordinatorId: coordinatorId }
    });
    if (existingCenterForCoordinator) {
        console.log(`[${timestamp}] [createCenter] Error: User ${coordinatorId} already coordinates center ${existingCenterForCoordinator.id}.`);
        return { success: false, error: `User ${coordinator.name || coordinator.email} is already coordinating center: ${existingCenterForCoordinator.name}.` };
    }

    const newCenter = await prisma.$transaction(async (tx) => {
      if (coordinator.role !== 'COORDINATOR') {
        await tx.user.update({
          where: { id: coordinatorId },
          data: {
            role: 'COORDINATOR',
            lecturerCenterId: null,
            departmentId: null,
          },
        });
        console.log(`[${timestamp}] [createCenter] User ${coordinatorId}'s role updated to COORDINATOR and unassigned as lecturer.`);
      }
      const center = await tx.center.create({
        data: {
          name: name.trim(),
          coordinatorId, // This is correct for create, assigning the foreign key directly
        },
        include: {
            coordinator: {
                select: { id: true, name: true, email: true, role: true }
            }
        }
      });
      return center;
    });

    console.log(`[${timestamp}] [createCenter] Center created successfully: ${newCenter.id}`);
    revalidatePath('/registry');
    revalidatePath('/registry/centers');
    revalidatePath('/registry/users');
    return { success: true, center: newCenter };

  } catch (error) {
    console.error(`[${timestamp}] [createCenter] Error:`, error);
    if (error.code === 'P2002') {
        if (error.meta?.target?.includes('name')) {
            return { success: false, error: "A center with this name already exists." };
        }
        if (error.meta?.target?.includes('coordinatorId')) {
            return { success: false, error: "This user is already assigned as a coordinator (transaction fallback)." };
        }
    }
    return { success: false, error: "Failed to create center. " + (error.message || "Unknown error") };
  }
}

/**
 * Fetches all Centers with their Coordinator's details and counts.
 */
export async function getCenters() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getCenters] Action called.`);
  try {
    const centers = await prisma.center.findMany({
      include: {
        coordinator: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: { select: { lecturers: true, departments: true, claims: true } }
      },
      orderBy: { name: 'asc' },
    });
    const formattedCenters = centers.map(c => ({
        ...c,
        lecturerCount: c._count?.lecturers || 0,
        departmentCount: c._count?.departments || 0,
        claimsCount: c._count?.claims || 0,
    }));
    console.log(`[${timestamp}] [getCenters] Found ${formattedCenters.length} centers.`);
    return { success: true, centers: formattedCenters };
  } catch (error) {
    console.error(`[${timestamp}] [getCenters] Error:`, error);
    return { success: false, error: "Failed to fetch centers." };
  }
}

/**
 * Creates a new User (Coordinator or Lecturer) by the Registry.
 */
export async function createUserByRegistry({ name, email, password, role, lecturerCenterId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [createUserByRegistry] Email: ${email}, Role: ${role}`);
  if (!name || !name.trim() || !email || !email.trim() || !password || !password.trim() || !role) {
    return { success: false, error: "Name, email, password, and role are required." };
  }
  if (role !== 'COORDINATOR' && role !== 'LECTURER') {
    return { success: false, error: "Invalid role. Must be COORDINATOR or LECTURER." };
  }
  if (password.trim().length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
  }
  if (role === 'LECTURER' && !lecturerCenterId) {
    return { success: false, error: "Lecturer role requires assignment to a Center." };
  }
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) return { success: false, error: "User with this email already exists." };

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const createdUser = await prisma.user.create({
      data: {
        name: name.trim(), email: normalizedEmail, password: hashedPassword, role,
        lecturerCenterId: role === 'LECTURER' ? lecturerCenterId : null,
      },
      select: {
          id: true, name: true, email: true, role: true, lecturerCenterId: true, createdAt: true,
          Center_User_lecturerCenterIdToCenter: role === 'LECTURER' && lecturerCenterId ? { select: { name: true } } : undefined,
       }
    });

    // Format to match what getAllUsers provides for consistency in client-side state updates
    const userToReturn = {
      ...createdUser,
      lecturerCenterName: createdUser.Center_User_lecturerCenterIdToCenter?.name,
      coordinatedCenterName: null, // New users are not made coordinators of existing centers here
      departmentName: null, // Department not assigned at user creation via this function
      // Explicitly add relational objects as null if not present, to match getAllUsers structure if needed by client
      Center_Center_coordinatorIdToUser: null,
      // Center_User_lecturerCenterIdToCenter is already handled by select, but we flatten it
      Department: null,
    };
    // delete userToReturn.Center_User_lecturerCenterIdToCenter; // Keep if useful, or flatten fully

    console.log(`[${timestamp}] [createUserByRegistry] User created: ${createdUser.id}`);
    revalidatePath('/registry/users');
    return { success: true, user: userToReturn };
  } catch (error) {
    console.error(`[${timestamp}] [createUserByRegistry] Error:`, error);
    if (error.code === 'P2002') return { success: false, error: "User email exists (DB constraint)." };
    return { success: false, error: `Failed to create user: ${error.message || "Unknown"}` };
  }
}

/**
 * Fetches all users with related center/department info for display in registry.
 * This version flattens center/department names for direct use, as per user's original working version.
 */
export async function getAllUsers() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getAllUsers] Action called.`);
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
      ...user, // Includes original relational objects if needed, and FKs
      coordinatedCenterName: user.Center_Center_coordinatorIdToUser?.name,
      lecturerCenterName: user.Center_User_lecturerCenterIdToCenter?.name,
      departmentName: user.Department?.name,
    }));
    console.log(`[${timestamp}] [getAllUsers] Found ${formattedUsers.length} users.`);
    return { success: true, users: formattedUsers };
  } catch (error) {
    console.error(`[${timestamp}] [getAllUsers] Error:`, error);
    return { success: false, error: "Failed to fetch users." };
  }
}

/**
 * Fetches all claims system-wide with filters.
 */
export async function getAllClaimsSystemWide(filters = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getAllClaimsSystemWide] Filters:`, JSON.stringify(filters));

  const { centerId, status, lecturerId, lecturerName = "" } = filters;
  const trimmedLecturerName = lecturerName.trim();

  try {
    const whereClause = {};
    if (centerId) whereClause.centerId = centerId;
    if (status) whereClause.status = status;
    if (lecturerId) whereClause.submittedById = lecturerId;

    if (trimmedLecturerName) {
      whereClause.submittedBy = {
        name: {
          contains: trimmedLecturerName, // Using trim here
          // mode: 'insensitive', // Omitting for now as per user's working version; add if case-insensitivity is explicitly needed and tested
        }
      };
    }

    console.log(`[${timestamp}] [getAllClaimsSystemWide] Constructed whereClause:`, JSON.stringify(whereClause, null, 2));

    const claims = await prisma.claim.findMany({
      where: whereClause,
      include: {
        submittedBy: { select: { id: true, name: true, email: true } },
        processedBy: { select: { id: true, name: true, email: true } },
        center: { select: { id: true, name: true } },
        supervisedStudents: { select: { studentName: true, thesisTitle: true } }
      },
      orderBy: { submittedAt: 'desc' },
    });

    console.log(`[${timestamp}] [getAllClaimsSystemWide] Found ${claims.length} claims.`);

    const formattedClaims = claims.map(claim => ({ ...claim, centerName: claim.center?.name }));
    return { success: true, claims: formattedClaims };

  } catch (error) {
    console.error(`[${timestamp}] [getAllClaimsSystemWide] CAUGHT ERROR ---`);
    console.error(`[${timestamp}] [getAllClaimsSystemWide] Error Message: ${error.message}`);
    if (error.code) {
        console.error(`[${timestamp}] [getAllClaimsSystemWide] Prisma Error Code: ${error.code}`);
        console.error(`[${timestamp}] [getAllClaimsSystemWide] Prisma Error Meta:`, error.meta);
    }
    console.error(`[${timestamp}] [getAllClaimsSystemWide] Error Stack: ${error.stack}`);
    try {
        console.error(`[${timestamp}] [getAllClaimsSystemWide] Full Error JSON:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } catch (stringifyError) {
        console.error(`[${timestamp}] [getAllClaimsSystemWide] Could not stringify full error:`, stringifyError.message);
        console.error(`[${timestamp}] [getAllClaimsSystemWide] Raw error object:`, error);
    }
    return { success: false, error: "Failed to fetch system-wide claims. Please check server logs for specific details." };
  }
}

/**
 * Allows Registry to process (approve/reject) any claim.
 */
export async function processClaimByRegistry({ claimId, status, registryUserId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [processClaim] Claim: ${claimId}, Status: ${status}, By: ${registryUserId}`);
  if (!claimId || !status || !registryUserId) {
    return { success: false, error: "Claim ID, status, and Registry User ID are required." };
  }
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return { success: false, error: "Invalid status. Must be APPROVED or REJECTED." };
  }

  try {
    const processor = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!processor || processor.role !== 'REGISTRY') {
      return { success: false, error: "Unauthorized: Action performer must be Registry." };
    }
    const claimToUpdate = await prisma.claim.findUnique({
        where: {id: claimId },
        // Select fields needed for revalidation, ensure lecturerCenterId is NOT selected from Claim if it doesn't exist
        select: { status: true, centerId: true, submittedById: true }
    });
    if (!claimToUpdate) { return { success: false, error: "Claim not found." }; }
    if (claimToUpdate.status !== 'PENDING') {
        return { success: false, error: `Claim is already ${claimToUpdate.status.toLowerCase()}. No action taken.`}
    }
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: { status: status, processedById: registryUserId, processedAt: new Date() },
    });
    console.log(`[${timestamp}] Claim ${claimId} set to ${status}.`);
    revalidatePath('/registry/claims');
    if (updatedClaim.centerId) {
      revalidatePath(`/coordinator/center/${updatedClaim.centerId}/claims`);
      revalidatePath(`/coordinator/center/${updatedClaim.centerId}/dashboard`);
    }
    // For lecturer revalidation, use the claim's centerId
    if (updatedClaim.submittedById && updatedClaim.centerId) {
        revalidatePath(`/lecturer/center/${updatedClaim.centerId}/my-claims`);
        revalidatePath(`/lecturer/center/${updatedClaim.centerId}/dashboard`);
    }
    return { success: true, claim: updatedClaim };
  } catch (error) {
    console.error(`[${timestamp}] [processClaim] Error:`, error);
    return { success: false, error: "Failed to process claim. "  + (error.message || "Unknown error") };
  }
}

/**
 * Updates a user's role and assignments by Registry.
 */
export async function updateUserRoleAndAssignmentsByRegistry({ userId, newRole, newCenterId, newDepartmentId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [updateUser] User: ${userId}, Role: ${newRole}, Center: ${newCenterId}`);
  if (!userId || !newRole) return { success: false, error: "User ID and new role are required." };
  if (!['COORDINATOR', 'LECTURER', 'REGISTRY'].includes(newRole)) return { success: false, error: "Invalid role." };

  try {
    const userToUpdate = await prisma.user.findUnique({
        where: { id: userId },
        include: { Center_Center_coordinatorIdToUser: { select: { id: true } } }
    });
    if (!userToUpdate) return { success: false, error: "User not found." };
    if (userToUpdate.role === 'REGISTRY' && newRole !== 'REGISTRY') return { success: false, error: "Cannot change REGISTRY role via this function."};

    const updateData = { role: newRole };
    let centerToUnassignCoordinator = null;

    if (userToUpdate.role === 'COORDINATOR' && userToUpdate.Center_Center_coordinatorIdToUser && newRole !== 'COORDINATOR') {
        centerToUnassignCoordinator = userToUpdate.Center_Center_coordinatorIdToUser.id;
    }

    if (newRole === 'LECTURER') {
      if (!newCenterId) return { success: false, error: "Lecturer role requires a Center assignment." };
      updateData.lecturerCenterId = newCenterId;
      updateData.departmentId = newDepartmentId || null;
    } else {
      updateData.lecturerCenterId = null;
      updateData.departmentId = null;
    }
    if (newRole === 'COORDINATOR') { // Ensure a new coordinator isn't also a lecturer in a center
        updateData.lecturerCenterId = null;
        updateData.departmentId = null;
    }

    const updatedUserResult = await prisma.$transaction(async (tx) => {
        if (centerToUnassignCoordinator) {
            await tx.center.update({
              where: { id: centerToUnassignCoordinator },
              data: {
                coordinator: { // CORRECTED HERE
                  disconnect: true
                }
              }
            });
            console.log(`[${timestamp}] Unassigned ${userId} from coordinating center ${centerToUnassignCoordinator}.`);
        }
        return tx.user.update({
            where: { id: userId }, data: updateData,
            select: {
                id: true, name: true, email: true, role: true,
                lecturerCenterId: true,
                Center_User_lecturerCenterIdToCenter: { select: { id: true, name: true } }, // For lecturerCenterName
                Center_Center_coordinatorIdToUser: { select: { id: true, name: true } },   // For coordinatedCenterName
                departmentId: true, Department: { select: {id: true, name: true}}
            }
        });
    });

    const userToReturn = {
        ...updatedUserResult,
        lecturerCenterName: updatedUserResult.Center_User_lecturerCenterIdToCenter?.name,
        coordinatedCenterName: updatedUserResult.Center_Center_coordinatorIdToUser?.name,
        departmentName: updatedUserResult.Department?.name,
    };
     // Clean up nested objects if only names are preferred by client
    // delete userToReturn.Center_User_lecturerCenterIdToCenter;
    // delete userToReturn.Center_Center_coordinatorIdToUser;
    // delete userToReturn.Department;

    console.log(`[${timestamp}] User ${userId} updated. New role: ${newRole}.`);
    revalidatePath('/registry/users');
    revalidatePath('/registry/centers');
    return { success: true, user: userToReturn };
  } catch (error) {
    console.error(`[${timestamp}] [updateUser] Error:`, error);
    return { success: false, error: "Failed to update user. " + (error.message || "Unknown error") };
  }
}

/**
 * Allows Registry to change a user's password.
 */
export async function updateUserPasswordByRegistry({ userId, newPassword }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [updateUserPass] User: ${userId}`);
  if (!userId || !newPassword || !newPassword.trim()) return { success: false, error: "User ID and new password required." };
  if (newPassword.trim().length < 6) return { success: false, error: "Password min 6 characters." };

  try {
    const userToUpdate = await prisma.user.findUnique({where: {id: userId}, select: { id: true, role: true }});
    if (!userToUpdate) return { success: false, error: "User not found." };

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword }});

    console.log(`[${timestamp}] Password updated for ${userId}.`);
    return { success: true, message: "User password updated successfully." };
  } catch (error) {
    console.error(`[${timestamp}] [updateUserPass] Error:`, error);
    return { success: false, error: "Failed to update user password." };
  }
}

/**
 * Fetches center names and IDs for public use.
 */
export async function getPublicCenters() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getPublicCenters] Action called.`);
  try {
    const centers = await prisma.center.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' }});
    return { success: true, centers };
  } catch (error) {
    console.error(`[${timestamp}] [getPublicCenters] Error:`, error);
    return { success: false, error: "Failed to fetch centers list." };
  }
}

/**
 * Fetches all signup requests with 'PENDING' status.
 */
export async function getPendingSignupRequests() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getPendingSRs] Action called.`);
  try {
    const requests = await prisma.signupRequest.findMany({ where: { status: 'PENDING' }, orderBy: { submittedAt: 'asc' }});
    const centerIdsToFetch = [...new Set(requests.filter(r => r.requestedCenterId).map(r => r.requestedCenterId))];
    let centersMap = {};
    if (centerIdsToFetch.length > 0) {
        const centersData = await prisma.center.findMany({ where: { id: { in: centerIdsToFetch } }, select: { id: true, name: true }});
        centersMap = centersData.reduce((map, center) => { map[center.id] = center.name; return map; }, {});
    }
    const formattedRequests = requests.map(request => ({ ...request, requestedCenterName: request.requestedCenterId ? (centersMap[request.requestedCenterId] || `Unknown (ID: ${request.requestedCenterId.substring(0,4)}...)`) : null }));
    return { success: true, requests: formattedRequests };
  } catch (error) {
    console.error(`[${timestamp}] [getPendingSRs] Error:`, error);
    return { success: false, error: "Failed to fetch pending requests." };
  }
}

/**
 * Approves a signup request: creates a new user and updates request status.
 */
export async function approveSignupRequest({ requestId, registryUserId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [approveSR] Req: ${requestId}, By: ${registryUserId}`);
  if (!requestId || !registryUserId) return { success: false, error: "Request ID and Registry User ID required." };

  try {
    const processor = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!processor || processor.role !== 'REGISTRY') return { success: false, error: "User not authorized." };

    const request = await prisma.signupRequest.findUnique({ where: { id: requestId } });
    if (!request) return { success: false, error: "Signup request not found." };
    if (request.status !== 'PENDING') return { success: false, error: `Request is already ${request.status.toLowerCase()}.` };

    const existingUser = await prisma.user.findUnique({ where: { email: request.email } });
    if (existingUser) {
      await prisma.signupRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED', processedAt: new Date(), processedByRegistryId: registryUserId, notes: "User with this email already exists." },
      });
      revalidatePath('/registry/requests');
      return { success: false, error: "User email exists. Request auto-rejected." };
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: request.name, email: request.email, password: request.hashedPassword, role: request.requestedRole,
          lecturerCenterId: request.requestedRole === 'LECTURER' ? request.requestedCenterId : null,
          approvedSignupRequestId: request.id,
        },
        select: {
            id: true, name: true, email: true, role: true,
            lecturerCenterId: true,
            Center_User_lecturerCenterIdToCenter: request.requestedRole === 'LECTURER' ? { select: { name: true } } : undefined,
         }
      });
      await tx.signupRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', processedAt: new Date(), processedByRegistryId: registryUserId, notes: "User account created." },
      });
      return createdUser;
    });

    const userToReturn = {
        ...newUser,
        lecturerCenterName: newUser.Center_User_lecturerCenterIdToCenter?.name,
        coordinatedCenterName: null,
    };
    delete userToReturn.Center_User_lecturerCenterIdToCenter;

    console.log(`[${timestamp}] Req ${requestId} approved, User ${newUser.id} created.`);
    revalidatePath('/registry/requests');
    revalidatePath('/registry/users');
    return { success: true, user: userToReturn, message: "Signup request approved & user created." };
  } catch (error) {
    console.error(`[${timestamp}] [approveSR] Error:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        try {
            await prisma.signupRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED', processedAt: new Date(), processedByRegistryId: registryUserId, notes: "User email exists (transaction)." },
            });
            revalidatePath('/registry/requests');
        } catch (rejectError) { console.error(`[${timestamp}] [approveSR] Fail to mark REJECTED after P2002:`, rejectError); }
        return { success: false, error: "User email exists. Request rejected." };
    }
    return { success: false, error: "Failed to approve signup request. " + (error.message || "") };
  }
}

/**
 * Rejects a signup request.
 */
export async function rejectSignupRequest({ requestId, registryUserId, rejectionReason = "Request rejected by Registry." }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [rejectSR] Req: ${requestId}, Reason: ${rejectionReason}`);
  if (!requestId || !registryUserId) return { success: false, error: "Request ID and Registry User ID required." };

  try {
    const processor = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!processor || processor.role !== 'REGISTRY') return { success: false, error: "User not authorized." };

    const request = await prisma.signupRequest.findUnique({ where: { id: requestId } });
    if (!request) return { success: false, error: "Signup request not found." };
    if (request.status !== 'PENDING') return { success: false, error: `Request is already ${request.status.toLowerCase()}.` };

    await prisma.signupRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', processedAt: new Date(), processedByRegistryId: registryUserId, notes: rejectionReason },
    });
    console.log(`[${timestamp}] Request ${requestId} rejected.`);
    revalidatePath('/registry/requests');
    return { success: true, message: "Signup request rejected successfully." };
  } catch (error) {
    console.error(`[${timestamp}] [rejectSR] Error:`, error);
    return { success: false, error: "Failed to reject signup request. " + (error.message || "") };
  }
}

/**
 * Fetches a monthly claim summary for a specific lecturer. (UTC dates used)
 */
export async function getLecturerMonthlyClaimSummary({ lecturerId, year, month }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getLecturerSummary] Lec: ${lecturerId}, Period: ${year}-${month}`);
  if (!lecturerId || !year || !month) return { success: false, error: "Lecturer ID, year, month required." };
  if (month < 1 || month > 12) return { success: false, error: "Invalid month (1-12)." };

  try {
    const lecturer = await prisma.user.findUnique({ where: { id: lecturerId }, select: { id: true, name: true, email: true }});
    if (!lecturer) return { success: false, error: "Lecturer not found." };

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0,0,0,0));
    const endDate = new Date(Date.UTC(year, month, 0, 23,59,59,999));

    const claimsInMonth = await prisma.claim.findMany({
      where: { submittedById: lecturerId, submittedAt: { gte: startDate, lte: endDate }},
      select: {
        id: true, claimType: true, status: true, submittedAt: true, processedAt: true,
        teachingHours: true, transportAmount: true, thesisType: true, thesisSupervisionRank: true, thesisExamCourseCode: true, supervisedStudents: { select: { studentName: true, thesisTitle: true } },
        center: { select: { name: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });

    const summary = {
      lecturerName: lecturer.name, lecturerEmail: lecturer.email,
      month: startDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }), year,
      totalClaims: claimsInMonth.length,
      pending: claimsInMonth.filter(c => c.status === 'PENDING').length,
      approved: claimsInMonth.filter(c => c.status === 'APPROVED').length,
      rejected: claimsInMonth.filter(c => c.status === 'REJECTED').length,
      totalTeachingHours: claimsInMonth.filter(c => c.claimType === 'TEACHING' && c.status === 'APPROVED' && typeof c.teachingHours === 'number').reduce((sum, c) => sum + c.teachingHours, 0),
      totalTransportAmount: claimsInMonth.filter(c => c.claimType === 'TRANSPORTATION' && c.status === 'APPROVED' && typeof c.transportAmount === 'number').reduce((sum, c) => sum + c.transportAmount, 0),
      claims: claimsInMonth.map(claim => ({ ...claim, centerName: claim.center?.name })),
    };
    return { success: true, summary };
  } catch (error) {
    console.error(`[${timestamp}] [getLecturerSummary] Error:`, error);
    return { success: false, error: "Failed to generate summary. " + (error.message || "") };
  }
}

/**
 * Fetches and aggregates a monthly claims summary (APPROVED claims only), grouped by center, department, lecturer, and course.
 */
export async function getMonthlyClaimsSummaryByGrouping({ year, month, requestingUserId, filterCenterId: directFilterCenterId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getMonthlyGroupedSummary] Period: ${year}-${month}, User: ${requestingUserId}, CenterFilter: ${directFilterCenterId}`);
  if (!year || !month) return { success: false, error: "Year and month are required." };
  if (month < 1 || month > 12) return { success: false, error: "Invalid month (1-12)." };

  try {
    let effectiveFilterCenterId = directFilterCenterId;
    let userRole = 'UNKNOWN';
    let generatedFor = "System Wide";

    if (requestingUserId && !effectiveFilterCenterId) {
      const reqUser = await prisma.user.findUnique({
        where: { id: requestingUserId },
        select: { role: true, Center_Center_coordinatorIdToUser: { select: { id: true, name: true } } }
      });
      if (!reqUser) return { success: false, error: "Requesting user not found." };
      userRole = reqUser.role;
      if (userRole === 'COORDINATOR') {
        if (reqUser.Center_Center_coordinatorIdToUser?.id) {
          effectiveFilterCenterId = reqUser.Center_Center_coordinatorIdToUser.id;
          generatedFor = reqUser.Center_Center_coordinatorIdToUser.name;
        } else return { success: false, error: "Coordinator not assigned to a center.", summary: [] };
      } else if (userRole !== 'REGISTRY') return { success: false, error: "Unauthorized." };
    } else if (effectiveFilterCenterId) {
        const filteredCenter = await prisma.center.findUnique({ where: {id: effectiveFilterCenterId}, select: { name: true }});
        if (filteredCenter) generatedFor = filteredCenter.name;
        else return { success: false, error: "Specified filter center not found." };
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0,0,0,0));
    const endDate = new Date(Date.UTC(year, month, 0, 23,59,59,999));

    const claims = await prisma.claim.findMany({
      where: {
        submittedAt: { gte: startDate, lte: endDate },
        ...(effectiveFilterCenterId && { centerId: effectiveFilterCenterId }),
        status: 'APPROVED',
      },
      include: {
        submittedBy: { select: { id: true, name: true, Department: { select: { id: true, name: true } } } },
        center: { select: { id: true, name: true } },
        supervisedStudents: {select: {studentName: true, thesisTitle: true} }
      },
      orderBy: { center: { name: 'asc' } , submittedBy: { Department: { name: 'asc' } }, submittedBy: { name: 'asc' } }
    });

    const summaryByCenter = {};
    for (const claim of claims) {
      const cId = claim.center?.id || 'unknown_center';
      const cName = claim.center?.name || 'Unknown Center';
      const dId = claim.submittedBy?.Department?.id || 'no_department';
      const dName = claim.submittedBy?.Department?.name || 'No Department Assigned';
      const lId = claim.submittedBy.id;
      const lName = claim.submittedBy.name;

      if (!summaryByCenter[cId]) {
        summaryByCenter[cId] = {
          centerId: cId, centerName: cName, totalTeachingHours: 0, totalTransportAmount: 0,
          totalThesisSupervisionUnits: 0, totalThesisExaminationUnits: 0, totalClaims: 0, departments: {},
        };
      }
      const centerSum = summaryByCenter[cId];
      centerSum.totalClaims++;

      if (!centerSum.departments[dId]) {
        centerSum.departments[dId] = { departmentId: dId, departmentName: dName, lecturers: {} };
      }
      if (!centerSum.departments[dId].lecturers[lId]) {
        centerSum.departments[dId].lecturers[lId] = {
          lecturerId: lId, lecturerName: lName, totalTeachingHours: 0, totalTransportAmount: 0,
          thesisSupervisions: [], thesisExaminations: [],
        };
      }
      const lectSum = centerSum.departments[dId].lecturers[lId];

      if (claim.claimType === 'TEACHING' && typeof claim.teachingHours === 'number') {
        centerSum.totalTeachingHours += claim.teachingHours;
        lectSum.totalTeachingHours += claim.teachingHours;
      } else if (claim.claimType === 'TRANSPORTATION' && typeof claim.transportAmount === 'number') {
        centerSum.totalTransportAmount += claim.transportAmount;
        lectSum.totalTransportAmount += claim.transportAmount;
      } else if (claim.claimType === 'THESIS_PROJECT') {
        if (claim.thesisType === 'SUPERVISION') {
          centerSum.totalThesisSupervisionUnits += (claim.supervisedStudents?.length || 0);
          lectSum.thesisSupervisions.push({
            rank: claim.thesisSupervisionRank,
            students: claim.supervisedStudents || []
          });
        } else if (claim.thesisType === 'EXAMINATION') {
          centerSum.totalThesisExaminationUnits++;
          lectSum.thesisExaminations.push({
            courseCode: claim.thesisExamCourseCode,
            examDate: claim.thesisExamDate
          });
        }
      }
    }

    const finalSummary = Object.values(summaryByCenter).map(c => ({
      ...c,
      departments: Object.values(c.departments).map(d => ({
        ...d,
        lecturers: Object.values(d.lecturers).map(l => ({ ...l, courses: Object.values(l.courses || {}).sort((a,b) => a.courseCode.localeCompare(b.courseCode)) })), // Added null check for l.courses
      })).sort((a,b) => a.departmentName.localeCompare(b.departmentName)),
    })).sort((a,b) => a.centerName.localeCompare(b.centerName));

    return {
        success: true,
        summary: finalSummary,
        period: { month: startDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }), year },
        generatedForRole: userRole,
        filterContext: generatedFor
    };
  } catch (error) {
    console.error(`[${timestamp}] [getMonthlyGroupedSummary] Error:`, error);
    return { success: false, error: "Failed to generate grouped summary. " + (error.message || "") };
  }
}

// --- DELETE FUNCTIONS ---

/**
 * Deletes a User (Lecturer or Coordinator) by the Registry.
 */
export async function deleteUserByRegistry({ userIdToDelete, registryUserId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [deleteUserByRegistry] Deleting user ${userIdToDelete} by registry user ${registryUserId}`);
  if (!userIdToDelete || !registryUserId) {
    return { success: false, error: "User ID to delete and performing Registry User ID are required." };
  }
  try {
    const performingUser = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!performingUser || performingUser.role !== 'REGISTRY') {
      return { success: false, error: "Unauthorized: Action performer is not a Registry member." };
    }
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
      select: { id: true, name: true, email: true, role: true, Center_Center_coordinatorIdToUser: { select: { id: true } } }
    });
    if (!userToDelete) { return { success: false, error: "User to delete not found." }; }
    if (userToDelete.role === 'REGISTRY') {
      return { success: false, error: "REGISTRY users cannot be deleted through this function." };
    }
    await prisma.$transaction(async (tx) => {
      if (userToDelete.role === 'COORDINATOR' && userToDelete.Center_Center_coordinatorIdToUser) {
        await tx.center.update({
          where: { id: userToDelete.Center_Center_coordinatorIdToUser.id },
          data: {
            coordinator: { // CORRECTED HERE
              disconnect: true
            }
          }
        });
        console.log(`[${timestamp}] Unassigned ${userIdToDelete} from center ${userToDelete.Center_Center_coordinatorIdToUser.id}.`);
      }
      await tx.user.delete({ where: { id: userIdToDelete } });
    });
    console.log(`[${timestamp}] User "${userToDelete.name || userToDelete.email}" deleted.`);
    revalidatePath('/registry/users');
    revalidatePath('/registry/centers');
    return { success: true, message: `User "${userToDelete.name || userToDelete.email}" deleted successfully.` };
  } catch (error) {
    console.error(`[${timestamp}] [deleteUserByRegistry] Full Error:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.code === 'P2025') return { success: false, error: "User not found or already deleted."};
    if (error.code === 'P2003') return { success: false, error: `Cannot delete user. Linked to other records (Field: ${error.meta?.field_name}). Resolve dependencies.`};
    return { success: false, error: "Failed to delete user. " + (error.message || "An unexpected error occurred.") };
  }
}

/**
 * Deletes a Center by the Registry.
 */
export async function deleteCenterByRegistry({ centerId, registryUserId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [deleteCenterByRegistry] Deleting center ${centerId} by registry user ${registryUserId}`);
  if (!centerId || !registryUserId) {
    return { success: false, error: "Center ID and performing Registry User ID are required." };
  }
  try {
    const performingUser = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!performingUser || performingUser.role !== 'REGISTRY') {
      return { success: false, error: "Unauthorized: Action performer is not a Registry member." };
    }
    const centerToDelete = await prisma.center.findUnique({ where: { id: centerId }, select: { name: true }});
    if (!centerToDelete) { return { success: false, error: "Center not found." }; }
    const centerNameForMessage = centerToDelete.name;

    await prisma.$transaction(async (tx) => {
      const { count: unassignedLecturersCount } = await tx.user.updateMany({
        where: { lecturerCenterId: centerId },
        data: { lecturerCenterId: null },
      });
      if (unassignedLecturersCount > 0) console.log(`[${timestamp}] Unassigned ${unassignedLecturersCount} lecturers from center ${centerId}.`);

      // Add more unlinking or dependent record deletion here if necessary before deleting center
      // e.g., await tx.department.deleteMany({ where: { centerId: centerId }});
      // e.g., await tx.claim.deleteMany({ where: { centerId: centerId }}); // Be very careful with this

      await tx.center.delete({ where: { id: centerId } });
    });
    console.log(`[${timestamp}] Center "${centerNameForMessage}" deleted.`);
    revalidatePath('/registry/centers');
    revalidatePath('/registry/users');
    revalidatePath('/registry/claims');
    return { success: true, message: `Center "${centerNameForMessage}" and its lecturer assignments removed.` };
  } catch (error) {
    console.error(`[${timestamp}] [deleteCenterByRegistry] Full Error:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.code === 'P2025') return { success: false, error: "Center not found or already deleted."};
    if (error.code === 'P2003') return { success: false, error: `Cannot delete center. Linked to other records (Field: ${error.meta?.field_name}). Resolve dependencies.`};
    return { success: false, error: "Failed to delete center. " + (error.message || "An unexpected error occurred.") };
  }
}

/**
 * Deletes a specific claim by the Registry.
 */
export async function deleteClaimByRegistry({ claimId, registryUserId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [deleteClaimByRegistry] Action: Delete claim ${claimId} by registry user ${registryUserId}`);
  if (!claimId || !registryUserId) {
    return { success: false, error: "Claim ID and performing Registry User ID are required." };
  }

  try {
    const performingUser = await prisma.user.findUnique({
      where: { id: registryUserId },
      select: { role: true }
    });
    if (!performingUser || performingUser.role !== 'REGISTRY') {
      console.warn(`[${timestamp}] [deleteClaimByRegistry] Unauthorized attempt by user ${registryUserId}.`);
      return { success: false, error: "Unauthorized: Action performer is not a Registry member." };
    }

    const claimToDelete = await prisma.claim.findUnique({
      where: { id: claimId },
      select: { id: true, submittedById: true, centerId: true } // lecturerCenterId was removed
    });

    if (!claimToDelete) {
      console.log(`[${timestamp}] [deleteClaimByRegistry] Claim ${claimId} not found.`);
      return { success: false, error: "Claim not found or already deleted." };
    }

    await prisma.$transaction(async (tx) => {
        const deletedSupervisedStudents = await tx.supervisedStudent.deleteMany({
            where: { claimId: claimId }
        });
        if (deletedSupervisedStudents.count > 0) {
            console.log(`[${timestamp}] [deleteClaimByRegistry] Deleted ${deletedSupervisedStudents.count} supervised student records for claim ${claimId}.`);
        }

        await tx.claim.delete({
            where: { id: claimId },
        });
    });

    console.log(`[${timestamp}] [deleteClaimByRegistry] Claim ${claimId} deleted successfully.`);

    revalidatePath('/registry/claims');
    // Use claimToDelete.centerId for revalidation paths
    if (claimToDelete.submittedById && claimToDelete.centerId) {
        revalidatePath(`/lecturer/center/${claimToDelete.centerId}/my-claims`);
        revalidatePath(`/lecturer/center/${claimToDelete.centerId}/dashboard`);
    }
    if (claimToDelete.centerId) {
        revalidatePath(`/coordinator/center/${claimToDelete.centerId}/claims`);
        revalidatePath(`/coordinator/center/${claimToDelete.centerId}/dashboard`);
    }

    return { success: true, message: `Claim (ID: ${claimId.substring(0,8)}...) deleted successfully.` };

  } catch (error) {
    console.error(`[${timestamp}] [deleteClaimByRegistry] Full error object for claim ${claimId}:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    let userErrorMessage = "Failed to delete claim. Please check server logs for specific details.";
    if (error.code) {
        console.error(`[${timestamp}] [deleteClaimByRegistry] Prisma Error Code: ${error.code}, Meta: ${JSON.stringify(error.meta)}`);
        if (error.code === 'P2025') {
            userErrorMessage = "Claim not found or already deleted.";
        } else if (error.code === 'P2003') {
            const fieldName = error.meta?.field_name || "related records";
            userErrorMessage = `Cannot delete claim. It is still linked to other records via '${fieldName}'. Please resolve these dependencies.`;
        } else {
            userErrorMessage = `Failed to delete claim due to a database error (Code: ${error.code}). Check server logs.`;
        }
    } else if (error.message && process.env.NODE_ENV !== 'production') {
        userErrorMessage = `Failed to delete claim: ${error.message}`;
    }
    return { success: false, error: userErrorMessage };
  }
}