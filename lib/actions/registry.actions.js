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
        Center_Center_coordinatorIdToUser: { // Relation checking if user is a coordinator of any center
          select: { id: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
    // Filter out users who are already coordinating a center
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
      select: { id: true, name: true, email: true, role: true } 
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
        where: { coordinatorId: coordinatorId } // Check if this user already coordinates a center
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
            lecturerCenterId: null, // A coordinator is not a lecturer in a specific center by default
            departmentId: null,   // A coordinator is not tied to a department by default
          },
        });
        console.log(`[${timestamp}] [createCenter] User ${coordinatorId}'s role updated to COORDINATOR.`);
      }
      // Create the new center and link the coordinator
      const center = await tx.center.create({
        data: {
          name: name.trim(),
          coordinator: { // Connect the existing user as the coordinator
            connect: { id: coordinatorId }
          }
        },
        include: { // Include coordinator details in the returned center object
            coordinator: {
                select: { id: true, name: true, email: true, role: true }
            }
        }
      });
      return center;
    });

    console.log(`[${timestamp}] [createCenter] Center created successfully: ${newCenter.id}`);
    revalidatePath('/registry'); // General revalidation
    revalidatePath('/registry/centers');
    revalidatePath('/registry/users'); // User role might have changed
    return { success: true, center: newCenter };

  } catch (error) {
    console.error(`[${timestamp}] [createCenter] Error:`, error);
    if (error.code === 'P2002') { // Unique constraint violation
        if (error.meta?.target?.includes('name')) {
            return { success: false, error: "A center with this name already exists." };
        }
        // Prisma might point to 'coordinatorId' if the unique constraint is on that field in the Center model
        if (error.meta?.target?.includes('coordinatorId')) { 
            return { success: false, error: "This user is already assigned as a coordinator (P2002 on coordinatorId)." };
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
        coordinator: { // Includes the related User record for the coordinator
          select: { id: true, name: true, email: true, role: true },
        },
        _count: { // Counts related records
            select: { 
                lecturers: true, // Assuming 'lecturers' is the relation name on Center to User model
                departments: true, 
                claims: true 
            } 
        }
      },
      orderBy: { name: 'asc' },
    });
    // Format the counts for easier use on the client
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
  console.log(`[${timestamp}] [createUserByRegistry] Email: ${email}, Role: ${role}, Center: ${lecturerCenterId}`);
  if (!name || !name.trim() || !email || !email.trim() || !password || !password.trim() || !role) {
    return { success: false, error: "Name, email, password, and role are required." };
  }
  if (role !== 'COORDINATOR' && role !== 'LECTURER') {
    return { success: false, error: "Invalid role. Must be COORDINATOR or LECTURER." };
  }
  if (password.trim().length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
  }
  if (role === 'LECTURER' && !lecturerCenterId) { // A lecturer must be assigned to a center
    return { success: false, error: "Lecturer role requires assignment to a Center." };
  }
  // Coordinators are not directly assigned to a lecturerCenterId or departmentId via this function.
  // They get linked to a center when a center is created or updated to assign them as coordinator.
  if (role === 'COORDINATOR' && lecturerCenterId) {
    console.warn(`[${timestamp}] [createUserByRegistry] Coordinator role does not use lecturerCenterId directly at creation. It will be ignored.`);
    lecturerCenterId = null; // Ensure it's null for coordinators
  }


  const normalizedEmail = email.trim().toLowerCase();
  try {
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) return { success: false, error: "User with this email already exists." };

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    
    const dataToCreate = {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,
        departmentId: null, // Department is not assigned at user creation by this function
    };

    if (role === 'LECTURER' && lecturerCenterId) {
        dataToCreate.lecturerCenterId = lecturerCenterId;
    } else {
        dataToCreate.lecturerCenterId = null; // Explicitly null if not lecturer or no center
    }


    const createdUser = await prisma.user.create({
      data: dataToCreate,
      select: { // Select all necessary fields for the return object
          id: true, name: true, email: true, role: true, lecturerCenterId: true, departmentId: true, createdAt: true,
          Center_User_lecturerCenterIdToCenter: { select: { name: true } }, // For lecturer's center name
          Center_Center_coordinatorIdToUser: { select: { name: true } }, // For coordinator's center name (will be null for new user)
          Department: {select: {name: true}} // For department name (will be null for new user)
       }
    });

    // Format to match what getAllUsers provides for consistency
    const userToReturn = {
      ...createdUser,
      lecturerCenterName: createdUser.Center_User_lecturerCenterIdToCenter?.name,
      coordinatedCenterName: createdUser.Center_Center_coordinatorIdToUser?.name, // Will be null
      departmentName: createdUser.Department?.name, // Will be null
    };

    console.log(`[${timestamp}] [createUserByRegistry] User created: ${createdUser.id}`);
    revalidatePath('/registry/users');
    return { success: true, user: userToReturn };
  } catch (error) {
    console.error(`[${timestamp}] [createUserByRegistry] Error:`, error);
    if (error.code === 'P2002') return { success: false, error: "User with this email already exists (database constraint)." };
    return { success: false, error: `Failed to create user: ${error.message || "Unknown error"}` };
  }
}

/**
 * Fetches all users with related center/department info for display in registry.
 */
export async function getAllUsers() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getAllUsers] Action called.`);
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        lecturerCenterId: true, departmentId: true,
        Center_Center_coordinatorIdToUser: { select: { id: true, name: true } }, // Center they coordinate
        Center_User_lecturerCenterIdToCenter: { select: { id: true, name: true } }, // Center they lecture at
        Department: { select: { id: true, name: true } }, // Department they belong to
        createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    // Format the user data to include flattened names for easier display
    const formattedUsers = users.map(user => ({
      ...user,
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
          contains: trimmedLecturerName,
          mode: 'insensitive', // Add if your DB supports it and you want case-insensitive search
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
        supervisedStudents: { select: { studentName: true, thesisTitle: true } } // Include for display if needed
      },
      orderBy: { submittedAt: 'desc' },
    });

    console.log(`[${timestamp}] [getAllClaimsSystemWide] Found ${claims.length} claims.`);
    // Add centerName directly to each claim object for easier access
    const formattedClaims = claims.map(claim => ({ 
        ...claim, 
        centerName: claim.center?.name 
    }));
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
  console.log(`[${timestamp}] [processClaimByRegistry] Claim: ${claimId}, Status: ${status}, By: ${registryUserId}`);
  if (!claimId || !status || !registryUserId) {
    return { success: false, error: "Claim ID, new status, and Registry User ID are required." };
  }
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return { success: false, error: "Invalid status. Must be APPROVED or REJECTED." };
  }

  try {
    const processor = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!processor || processor.role !== 'REGISTRY') { // Ensure processor is valid and has REGISTRY role
      return { success: false, error: "Unauthorized: Action performer must be a Registry member." };
    }

    const claimToUpdate = await prisma.claim.findUnique({
        where: {id: claimId },
        select: { status: true, centerId: true, submittedById: true } // Select fields needed for revalidation paths
    });

    if (!claimToUpdate) { 
      return { success: false, error: "Claim not found." }; 
    }
    if (claimToUpdate.status !== 'PENDING') { // Only PENDING claims can be processed
        return { success: false, error: `Claim is already ${claimToUpdate.status.toLowerCase()}. No action taken.`}
    }

    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: { 
        status: status, 
        processedById: registryUserId, // Link to the registry user who processed it
        processedAt: new Date() 
      },
    });

    console.log(`[${timestamp}] [processClaimByRegistry] Claim ${claimId} processed. Status set to ${status}.`);
    
    // Revalidate paths
    revalidatePath('/registry/claims'); // Registry's view of all claims
    if (updatedClaim.centerId) { // If claim is associated with a center
      revalidatePath(`/coordinator/center/${updatedClaim.centerId}/claims`);
      revalidatePath(`/coordinator/center/${updatedClaim.centerId}/dashboard`);
    }
    if (updatedClaim.submittedById && updatedClaim.centerId) { // Lecturer's views
        revalidatePath(`/lecturer/center/${updatedClaim.centerId}/my-claims`);
        revalidatePath(`/lecturer/center/${updatedClaim.centerId}/dashboard`);
    }
    
    return { success: true, claim: updatedClaim };
  } catch (error) {
    console.error(`[${timestamp}] [processClaimByRegistry] Error:`, error);
    return { success: false, error: "Failed to process claim. "  + (error.message || "Unknown error") };
  }
}


/**
 * Updates a user's role and assignments by Registry.
 * Handles unassigning from coordination if role changes from COORDINATOR.
 * Handles assigning to a center if new role is LECTURER.
 */
export async function updateUserRoleAndAssignmentsByRegistry({ userId, newRole, newCenterId, newDepartmentId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [updateUserRoleAndAssignmentsByRegistry] User: ${userId}, New Role: ${newRole}, New Center: ${newCenterId}, New Dept: ${newDepartmentId}`);
  
  if (!userId || !newRole) {
    return { success: false, error: "User ID and new role are required." };
  }
  if (!['COORDINATOR', 'LECTURER', 'REGISTRY'].includes(newRole)) {
    return { success: false, error: "Invalid role provided." };
  }

  try {
    const userToUpdate = await prisma.user.findUnique({
        where: { id: userId },
        // Include the center they currently coordinate, if any
        include: { Center_Center_coordinatorIdToUser: { select: { id: true } } } 
    });

    if (!userToUpdate) {
      return { success: false, error: "User not found." };
    }
    // Prevent changing REGISTRY role via this function to avoid accidental lockouts or privilege escalation
    if (userToUpdate.role === 'REGISTRY' && newRole !== 'REGISTRY') {
      return { success: false, error: "The REGISTRY role cannot be changed through this function." };
    }
    if (newRole === 'REGISTRY' && userToUpdate.role !== 'REGISTRY') {
        // If changing TO REGISTRY, ensure they are unassigned from centers/departments as lecturer/coordinator
        // This logic might need further refinement based on how REGISTRY users should be structured
        console.log(`[${timestamp}] User ${userId} is being promoted to REGISTRY. Unassigning from lecturer/coordinator roles.`);
    }


    const updateData = { role: newRole };
    let centerIdToUnassignCoordinatorFrom = null;

    // If user was a COORDINATOR and is changing role, their current center needs coordinator unassigned.
    if (userToUpdate.role === 'COORDINATOR' && userToUpdate.Center_Center_coordinatorIdToUser && newRole !== 'COORDINATOR') {
        centerIdToUnassignCoordinatorFrom = userToUpdate.Center_Center_coordinatorIdToUser.id;
    }

    if (newRole === 'LECTURER') {
      if (!newCenterId) { // Lecturers must be assigned to a center
        return { success: false, error: "Lecturer role requires a Center assignment." };
      }
      updateData.lecturerCenterId = newCenterId;
      updateData.departmentId = newDepartmentId || null; // Department is optional for a lecturer
      // Ensure they are not a coordinator if they become a lecturer
      updateData.Center_Center_coordinatorIdToUser = { disconnect: true }; // Prisma syntax to remove this relation
    } else if (newRole === 'COORDINATOR') {
      // A coordinator is not a lecturer of a specific center/department by default via this role assignment.
      // They get assigned a center to coordinate via the Center model.
      // If they were a lecturer, clear these fields.
      updateData.lecturerCenterId = null;
      updateData.departmentId = null;
    } else if (newRole === 'REGISTRY') {
      // Registry members are typically not lecturers or coordinators of specific centers/departments.
      updateData.lecturerCenterId = null;
      updateData.departmentId = null;
      updateData.Center_Center_coordinatorIdToUser = { disconnect: true };
    }


    const updatedUserResult = await prisma.$transaction(async (tx) => {
      // If user was a coordinator and is changing role, update their previously coordinated center
      if (centerIdToUnassignCoordinatorFrom) {
        await tx.center.update({
          where: { id: centerIdToUnassignCoordinatorFrom },
          data: {
            coordinatorId: null, // Or handle this by assigning a placeholder/prompting for new coordinator
                                 // For now, just unlinking. Explicitly setting coordinatorId to null.
                                 // If coordinatorId is not nullable or has other constraints, this needs care.
                                 // The relation disconnect on User model might be better: see User update below.
          }
        });
        // The disconnect on user model is better for one-to-one from Center to User coordinator:
        // If the User model's 'Center_Center_coordinatorIdToUser' relation is the source of truth for the link,
        // then just clearing it from user might be enough or setting it to {disconnect: true} if updating the user data.
        // However, Center.coordinatorId is likely the direct FK.
        // The previous code had 'coordinator: { disconnect: true }' which is for the relation from Center's perspective.
        // Since User.Center_Center_coordinatorIdToUser is the "other side" of a 1-to-1 where User.id = Center.coordinatorId
        // and Center.coordinatorId is @unique, directly nullifying Center.coordinatorId is the most direct.
        console.log(`[${timestamp}] Unassigned user ${userId} from coordinating center ${centerIdToUnassignCoordinatorFrom}.`);
      }
      
      // If new role is COORDINATOR, but they are being assigned to coordinate a *new* center,
      // that assignment happens when creating/editing the Center, not here.
      // This function primarily changes the user's role and lecturer assignments.

      return tx.user.update({
        where: { id: userId }, 
        data: updateData, // Contains role, lecturerCenterId, departmentId
        select: { // Reselect all necessary fields for client update
            id: true, name: true, email: true, role: true,
            lecturerCenterId: true, 
            Center_User_lecturerCenterIdToCenter: { select: { id: true, name: true } },
            departmentId: true, 
            Department: { select: {id: true, name: true}},
            // Also fetch the center they might be coordinating if they are now a coordinator
            // This is tricky because this action doesn't MAKE them a coordinator of a NEW center,
            // only changes their role. If they ALREADY coordinated a center, that relation is on Center.
            // For consistency, we fetch what `getAllUsers` fetches.
            Center_Center_coordinatorIdToUser: { select: { id: true, name: true } },
        }
      });
    });

    const userToReturn = {
        ...updatedUserResult,
        lecturerCenterName: updatedUserResult.Center_User_lecturerCenterIdToCenter?.name,
        coordinatedCenterName: updatedUserResult.Center_Center_coordinatorIdToUser?.name, 
        departmentName: updatedUserResult.Department?.name,
    };

    console.log(`[${timestamp}] User ${userId} updated. New role: ${newRole}.`);
    revalidatePath('/registry/users');
    revalidatePath('/registry/centers'); // Revalidate centers if a coordinator was unassigned
    return { success: true, user: userToReturn };
  } catch (error) {
    console.error(`[${timestamp}] [updateUserRoleAndAssignmentsByRegistry] Error:`, error);
    return { success: false, error: "Failed to update user. " + (error.message || "Unknown error") };
  }
}


/**
 * Allows Registry to change a user's password.
 */
export async function updateUserPasswordByRegistry({ userId, newPassword }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [updateUserPasswordByRegistry] For User: ${userId}`);
  if (!userId || !newPassword || !newPassword.trim()) {
    return { success: false, error: "User ID and a new password are required." };
  }
  if (newPassword.trim().length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  try {
    const userToUpdate = await prisma.user.findUnique({
        where: {id: userId}, 
        select: { id: true, role: true } // Select only what's needed
    });
    if (!userToUpdate) {
      return { success: false, error: "User not found." };
    }
    // Optional: Add check if registry user can change password of other registry users, etc.

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    await prisma.user.update({ 
      where: { id: userId }, 
      data: { password: hashedPassword }
    });

    console.log(`[${timestamp}] Password updated successfully for user ${userId}.`);
    return { success: true, message: "User password updated successfully." };
  } catch (error) {
    console.error(`[${timestamp}] [updateUserPasswordByRegistry] Error:`, error);
    return { success: false, error: "Failed to update user password." };
  }
}

/**
 * Fetches center names and IDs for public use (e.g., dropdowns).
 */
export async function getPublicCenters() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getPublicCenters] Action called.`);
  try {
    const centers = await prisma.center.findMany({ 
      select: { id: true, name: true }, 
      orderBy: { name: 'asc' }
    });
    return { success: true, centers };
  } catch (error) {
    console.error(`[${timestamp}] [getPublicCenters] Error:`, error);
    return { success: false, error: "Failed to fetch public list of centers." };
  }
}


/**
 * Fetches all signup requests with 'PENDING' status.
 */
export async function getPendingSignupRequests() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getPendingSignupRequests] Action called.`);
  try {
    const requests = await prisma.signupRequest.findMany({ 
        where: { status: 'PENDING' }, 
        orderBy: { submittedAt: 'asc' }
    });
    
    // Fetch center names for requests that have a requestedCenterId
    const centerIdsToFetch = [...new Set(requests.map(r => r.requestedCenterId).filter(Boolean))];
    let centersMap = {};
    if (centerIdsToFetch.length > 0) {
        const centersData = await prisma.center.findMany({ 
            where: { id: { in: centerIdsToFetch } }, 
            select: { id: true, name: true }
        });
        centersMap = centersData.reduce((map, center) => { map[center.id] = center.name; return map; }, {});
    }
    
    const formattedRequests = requests.map(request => ({ 
        ...request, 
        // Use the fetched center name, or a fallback if ID is invalid or center not found
        requestedCenterName: request.requestedCenterId ? 
                             (centersMap[request.requestedCenterId] || `Unknown Center (ID: ${request.requestedCenterId.substring(0,4)}...)`) 
                             : null 
    }));
    
    return { success: true, requests: formattedRequests };
  } catch (error) {
    console.error(`[${timestamp}] [getPendingSignupRequests] Error:`, error);
    return { success: false, error: "Failed to fetch pending signup requests." };
  }
}

/**
 * Approves a signup request: creates a new user and updates request status.
 * Note: 'notes' field handling removed as per user direction. Schema update needed if notes are to be stored.
 */
export async function approveSignupRequest({ requestId, registryUserId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [approveSignupRequest] Req: ${requestId}, By: ${registryUserId}`);
  if (!requestId || !registryUserId) return { success: false, error: "Request ID and Registry User ID required." };

  try {
    const processor = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!processor || processor.role !== 'REGISTRY') return { success: false, error: "User not authorized to approve requests." };

    const request = await prisma.signupRequest.findUnique({ where: { id: requestId } });
    if (!request) return { success: false, error: "Signup request not found." };
    if (request.status !== 'PENDING') return { success: false, error: `Request is already ${request.status.toLowerCase()}.` };

    const existingUser = await prisma.user.findUnique({ where: { email: request.email.toLowerCase() } }); // Ensure email check is case-insensitive
    if (existingUser) {
      await prisma.signupRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          processedAt: new Date(),
          // notes: "User with this email already exists.", // NOTES REMOVED
          // Connect via the relation field name from your schema (e.g., 'registryProcessor')
          registryProcessor: { 
            connect: { id: registryUserId }
          }
        },
      });
      revalidatePath('/registry/requests');
      return { success: false, error: "User with this email already exists. Request auto-rejected." };
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: request.name, 
          email: request.email.toLowerCase(), 
          password: request.hashedPassword, // Password should already be hashed if coming from signup form
          role: request.requestedRole,
          lecturerCenterId: request.requestedRole === 'LECTURER' ? request.requestedCenterId : null,
          approvedSignupRequestId: request.id, // Link User to the SignupRequest that approved them
        },
        select: { // Select fields needed for the return object or client-side state
            id: true, name: true, email: true, role: true,
            lecturerCenterId: true, createdAt: true,
            Center_User_lecturerCenterIdToCenter: request.requestedRole === 'LECTURER' && request.requestedCenterId ? { select: { name: true } } : undefined,
        }
      });

      await tx.signupRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          processedAt: new Date(),
          // notes: "User account created.", // NOTES REMOVED
          registryProcessor: { // Connect via the relation field
            connect: { id: registryUserId }
          },
          // approvedUser relation is on User model, not directly set here unless SignupRequest also has a direct link back
        },
      });
      return createdUser;
    });

    // Prepare a user object consistent with what getAllUsers might return
    const userToReturn = {
        ...newUser,
        lecturerCenterName: newUser.Center_User_lecturerCenterIdToCenter?.name,
        coordinatedCenterName: null, // New users aren't coordinators by this action
        departmentName: null,      // Not assigned department here
    };

    console.log(`[${timestamp}] Signup request ${requestId} approved. User ${newUser.id} created.`);
    revalidatePath('/registry/requests');
    revalidatePath('/registry/users');
    return { success: true, user: userToReturn, message: "Signup request approved & user account created." };
  } catch (error) {
    console.error(`[${timestamp}] [approveSignupRequest] Error:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        // This case should ideally be caught by the 'existingUser' check above,
        // but as a fallback during transaction:
        try {
            await prisma.signupRequest.update({
                where: { id: requestId },
                data: {
                    status: 'REJECTED',
                    processedAt: new Date(),
                    // notes: "User email exists (transaction).", // NOTES REMOVED
                    registryProcessor: {
                      connect: { id: registryUserId }
                    }
                },
            });
            revalidatePath('/registry/requests');
        } catch (rejectError) { 
            console.error(`[${timestamp}] [approveSignupRequest] CRITICAL: Failed to auto-reject request ${requestId} after P2002 error:`, rejectError); 
        }
        return { success: false, error: "User with this email already exists. Request has been rejected." };
    }
    return { success: false, error: "Failed to approve signup request. " + (error.message || "Unknown error.") };
  }
}

/**
 * Rejects a signup request.
 * Note: 'notes' field handling removed. rejectionReason can be logged.
 */
export async function rejectSignupRequest({ requestId, registryUserId, rejectionReason = "Request rejected by Registry." }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [rejectSignupRequest] Req: ${requestId}, Reason: "${rejectionReason}", By: ${registryUserId}`);
  if (!requestId || !registryUserId) return { success: false, error: "Request ID and Registry User ID required." };

  try {
    const processor = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!processor || processor.role !== 'REGISTRY') return { success: false, error: "User not authorized to reject requests." };

    const request = await prisma.signupRequest.findUnique({ where: { id: requestId } });
    if (!request) return { success: false, error: "Signup request not found." };
    if (request.status !== 'PENDING') return { success: false, error: `Request is already ${request.status.toLowerCase()}.` };

    await prisma.signupRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
        // notes: rejectionReason, // NOTES REMOVED (original rejectionReason is logged above)
        registryProcessor: { // Connect via the relation field
          connect: { id: registryUserId }
        }
      },
    });
    console.log(`[${timestamp}] Signup request ${requestId} rejected successfully.`);
    revalidatePath('/registry/requests');
    return { success: true, message: "Signup request rejected successfully." };
  } catch (error) {
    console.error(`[${timestamp}] [rejectSignupRequest] Error:`, error);
    return { success: false, error: "Failed to reject signup request. " + (error.message || "Unknown error.") };
  }
}

/**
 * Fetches a monthly claim summary for a specific lecturer. (UTC dates used)
 * Includes courseCode and courseTitle for teaching claims.
 */
export async function getLecturerMonthlyClaimSummary({ lecturerId, year, month }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getLecturerMonthlyClaimSummary] Lec: ${lecturerId}, Period: ${year}-${month}`);
  if (!lecturerId || !year || !month) return { success: false, error: "Lecturer ID, year, and month are required." };
  if (month < 1 || month > 12) return { success: false, error: "Invalid month (1-12)." };

  try {
    const lecturer = await prisma.user.findUnique({ 
      where: { id: lecturerId }, 
      select: { id: true, name: true, email: true }
    });
    if (!lecturer) return { success: false, error: "Lecturer not found." };

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const claimsInMonth = await prisma.claim.findMany({
      where: { 
        submittedById: lecturerId, 
        submittedAt: { gte: startDate, lte: endDate }
      },
      select: { // Ensure all fields needed by ManageLecturerSummariesTab are here
        id: true,
        claimType: true,
        status: true,
        submittedAt: true,
        processedAt: true,
        
        teachingDate: true,
        teachingStartTime: true,
        teachingEndTime: true,
        courseCode: true,      // ADDED
        courseTitle: true,     // ADDED
        teachingHours: true,
        
        transportType: true,
        transportDestinationFrom: true,
        transportDestinationTo: true,
        transportRegNumber: true,
        transportCubicCapacity: true,
        transportAmount: true,
        
        thesisType: true,
        thesisSupervisionRank: true,
        thesisExamCourseCode: true,
        thesisExamDate: true,
        supervisedStudents: { 
          select: { studentName: true, thesisTitle: true } 
        },
        center: { 
          select: { name: true } 
        },
        processedBy: { // If needed for display in summary print
            select: { name: true }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    const summary = {
      lecturerName: lecturer.name,
      lecturerEmail: lecturer.email,
      month: startDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }),
      year,
      totalClaims: claimsInMonth.length,
      pending: claimsInMonth.filter(c => c.status === 'PENDING').length,
      approved: claimsInMonth.filter(c => c.status === 'APPROVED').length,
      rejected: claimsInMonth.filter(c => c.status === 'REJECTED').length,
      totalTeachingHours: claimsInMonth
        .filter(c => c.claimType === 'TEACHING' && c.status === 'APPROVED' && typeof c.teachingHours === 'number')
        .reduce((sum, c) => sum + c.teachingHours, 0),
      totalTransportAmount: claimsInMonth
        .filter(c => c.claimType === 'TRANSPORTATION' && c.status === 'APPROVED' && typeof c.transportAmount === 'number')
        .reduce((sum, c) => sum + c.transportAmount, 0),
      claims: claimsInMonth.map(claim => ({ 
        ...claim, 
        centerName: claim.center?.name,
        processedByCoordinatorName: claim.processedBy?.name // Added for potential use
      })),
    };
    return { success: true, summary };
  } catch (error) {
    console.error(`[${timestamp}] [getLecturerMonthlyClaimSummary] Error:`, error);
    return { success: false, error: "Failed to generate summary. " + (error.message || "An unknown error occurred.") };
  }
}

/**
 * Fetches and aggregates a monthly claims summary (APPROVED claims only), 
 * grouped by center, department, lecturer.
 */
export async function getMonthlyClaimsSummaryByGrouping({ year, month, requestingUserId, filterCenterId: directFilterCenterId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getMonthlyClaimsSummaryByGrouping] Period: ${year}-${month}, User: ${requestingUserId}, CenterFilter: ${directFilterCenterId}`);
  if (!year || !month) return { success: false, error: "Year and month are required." };
  if (month < 1 || month > 12) return { success: false, error: "Invalid month (1-12)." };

  try {
    let effectiveFilterCenterId = directFilterCenterId;
    let userRole = 'UNKNOWN';
    let generatedFor = "System Wide"; // Default context

    // Determine user role and automatically apply center filter for coordinators
    if (requestingUserId && !effectiveFilterCenterId) { // If no direct filter, but user is provided
      const reqUser = await prisma.user.findUnique({
        where: { id: requestingUserId },
        select: { role: true, Center_Center_coordinatorIdToUser: { select: { id: true, name: true } } }
      });
      if (!reqUser) return { success: false, error: "Requesting user not found." };
      userRole = reqUser.role;
      if (userRole === 'COORDINATOR') {
        if (reqUser.Center_Center_coordinatorIdToUser?.id) {
          effectiveFilterCenterId = reqUser.Center_Center_coordinatorIdToUser.id;
          generatedFor = `Center: ${reqUser.Center_Center_coordinatorIdToUser.name}`;
        } else {
          // Coordinator not assigned to any center, return empty summary or error
          return { success: false, error: "Coordinator is not assigned to a center.", summary: [] };
        }
      } else if (userRole !== 'REGISTRY') {
        // Non-registry, non-coordinator users cannot access system-wide or other centers' summaries
        return { success: false, error: "Unauthorized to view this summary.", summary: [] };
      }
    } else if (effectiveFilterCenterId) { // If a center filter is directly provided
        const filteredCenter = await prisma.center.findUnique({ where: {id: effectiveFilterCenterId}, select: { name: true }});
        if (filteredCenter) generatedFor = `Center: ${filteredCenter.name}`;
        else return { success: false, error: "Specified filter center not found." };
    }


    const startDate = new Date(Date.UTC(year, month - 1, 1, 0,0,0,0));
    const endDate = new Date(Date.UTC(year, month, 0, 23,59,59,999));

    const claims = await prisma.claim.findMany({
      where: {
        submittedAt: { gte: startDate, lte: endDate },
        ...(effectiveFilterCenterId && { centerId: effectiveFilterCenterId }), // Apply center filter if present
        status: 'APPROVED', // Only consider approved claims for this summary
      },
      include: { // Include necessary related data for grouping and display
        submittedBy: { select: { id: true, name: true, Department: { select: { id: true, name: true } } } },
        center: { select: { id: true, name: true } },
        supervisedStudents: {select: {studentName: true, thesisTitle: true} } // For thesis units
      },
      // Order for consistent output, helps with grouping logic if done manually
      orderBy: [
        { center: { name: 'asc' } },
        { submittedBy: { Department: { name: 'asc' } } }, // Prisma doesn't directly sort by nested relation's field like this in orderBy, manual sort after fetch might be needed for department name
        { submittedBy: { name: 'asc' } },
        { claimType: 'asc' } 
      ]
    });

    // Manual grouping logic (example)
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
          centerId: cId, centerName: cName, 
          totalTeachingHours: 0, totalTransportAmount: 0,
          totalThesisSupervisionUnits: 0, totalThesisExaminationUnits: 0, 
          totalClaims: 0, departments: {},
        };
      }
      const centerSum = summaryByCenter[cId];
      centerSum.totalClaims++;

      if (!centerSum.departments[dId]) {
        centerSum.departments[dId] = { 
            departmentId: dId, departmentName: dName, 
            totalTeachingHours: 0, totalTransportAmount: 0,
            totalThesisSupervisionUnits: 0, totalThesisExaminationUnits: 0, 
            lecturers: {} 
        };
      }
      const deptSum = centerSum.departments[dId];

      if (!deptSum.lecturers[lId]) {
        deptSum.lecturers[lId] = {
          lecturerId: lId, lecturerName: lName, 
          totalTeachingHours: 0, totalTransportAmount: 0,
          thesisSupervisions: [], thesisExaminations: [], // Store details for individual thesis claims
        };
      }
      const lectSum = deptSum.lecturers[lId];

      // Aggregate based on claim type
      if (claim.claimType === 'TEACHING' && typeof claim.teachingHours === 'number') {
        centerSum.totalTeachingHours += claim.teachingHours;
        deptSum.totalTeachingHours += claim.teachingHours;
        lectSum.totalTeachingHours += claim.teachingHours;
      } else if (claim.claimType === 'TRANSPORTATION' && typeof claim.transportAmount === 'number') {
        centerSum.totalTransportAmount += claim.transportAmount;
        deptSum.totalTransportAmount += claim.transportAmount;
        lectSum.totalTransportAmount += claim.transportAmount;
      } else if (claim.claimType === 'THESIS_PROJECT') {
        if (claim.thesisType === 'SUPERVISION') {
          const numStudents = claim.supervisedStudents?.length || 0;
          centerSum.totalThesisSupervisionUnits += numStudents;
          deptSum.totalThesisSupervisionUnits += numStudents;
          lectSum.thesisSupervisions.push({
            rank: claim.thesisSupervisionRank,
            studentsCount: numStudents,
            students: claim.supervisedStudents // Keep details if needed
          });
        } else if (claim.thesisType === 'EXAMINATION') {
          centerSum.totalThesisExaminationUnits++; // Each examination claim is one unit
          deptSum.totalThesisExaminationUnits++;
          lectSum.thesisExaminations.push({
            courseCode: claim.thesisExamCourseCode,
            examDate: claim.thesisExamDate
          });
        }
      }
    }
    
    // Convert map to array and sort for presentation
    // Sort departments within centers, and lecturers within departments
    const finalSummary = Object.values(summaryByCenter).map(center => ({
        ...center,
        departments: Object.values(center.departments).map(dept => ({
            ...dept,
            lecturers: Object.values(dept.lecturers).sort((a,b) => (a.lecturerName || "").localeCompare(b.lecturerName || "")),
        })).sort((a,b) => (a.departmentName || "").localeCompare(b.departmentName || "")),
    })).sort((a,b) => (a.centerName || "").localeCompare(b.centerName || ""));


    return {
        success: true,
        summary: finalSummary,
        period: { month: startDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }), year },
        generatedForRole: userRole,
        filterContext: generatedFor
    };
  } catch (error) {
    console.error(`[${timestamp}] [getMonthlyClaimsSummaryByGrouping] Error:`, error);
    return { success: false, error: "Failed to generate grouped summary. " + (error.message || "An unknown error occurred.") };
  }
}


// --- DELETE FUNCTIONS ---

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
            // Disconnect coordinator from center by nullifying coordinatorId
            // This assumes coordinatorId in Center schema is optional or relation is handled this way
            coordinatorId: null 
          }
        });
        console.log(`[${timestamp}] Unassigned ${userIdToDelete} from center ${userToDelete.Center_Center_coordinatorIdToUser.id}.`);
      }
      await tx.user.delete({ where: { id: userIdToDelete } });
    });
    console.log(`[${timestamp}] User "${userToDelete.name || userToDelete.email}" deleted.`);
    revalidatePath('/registry/users');
    revalidatePath('/registry/centers'); // Revalidate centers as a coordinator might have been unlinked
    return { success: true, message: `User "${userToDelete.name || userToDelete.email}" deleted successfully.` };
  } catch (error) {
    console.error(`[${timestamp}] [deleteUserByRegistry] Full Error:`, error);
    if (error.code === 'P2025') return { success: false, error: "User not found or already deleted."};
    if (error.code === 'P2003') { 
        const fieldName = error.meta?.field_name || "related records";
        // Provide more specific error messages based on common foreign key constraints for User
        if (String(fieldName).includes('Claim_submittedByIdToUser')) return { success: false, error: `Cannot delete user. They have submitted claims. Please reassign or delete their claims first.`};
        if (String(fieldName).includes('Claim_processedByIdToUser')) return { success: false, error: `Cannot delete user. They have processed claims. Please update those claims first.`};
        if (String(fieldName).includes('SupervisedStudent_supervisorIdToUser')) return { success: false, error: `Cannot delete user. They are listed as a supervisor for students. Update student supervision records first.`};
        if (String(fieldName).includes('SignupRequest_processedByRegistryIdToUser')) return { success: false, error: `Cannot delete user. They have processed signup requests. Update those requests first.`};
        if (String(fieldName).includes('Center_coordinatorIdToUser')) return { success: false, error: `Cannot delete user. They are assigned as a coordinator. Unassign them from the center first.`};
        return { success: false, error: `Cannot delete user. User is linked to other records (field: ${fieldName}). Please resolve these dependencies first.`};
    }
    return { success: false, error: "Failed to delete user. " + (error.message || "An unexpected error occurred.") };
  }
}

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
    const centerToDelete = await prisma.center.findUnique({ 
        where: { id: centerId }, 
        select: { name: true, _count: { select: { departments: true, claims: true } } }
    });
    if (!centerToDelete) { return { success: false, error: "Center not found." }; }
    const centerNameForMessage = centerToDelete.name;

    // Add pre-deletion checks if necessary (e.g., if departments or claims exist)
    // This depends on business logic: should a center with departments/claims be deletable?
    // If not, throw an error here. Example:
    // if (centerToDelete._count.departments > 0) {
    //   return { success: false, error: `Cannot delete center "${centerNameForMessage}" as it has ${centerToDelete._count.departments} associated department(s). Please delete them first.`};
    // }
    // if (centerToDelete._count.claims > 0) {
    //   return { success: false, error: `Cannot delete center "${centerNameForMessage}" as it has ${centerToDelete._count.claims} associated claim(s). Please reassign or delete them first.`};
    // }


    await prisma.$transaction(async (tx) => {
      // 1. Unassign lecturers from this center
      const { count: unassignedLecturersCount } = await tx.user.updateMany({
        where: { lecturerCenterId: centerId },
        data: { lecturerCenterId: null },
      });
      if (unassignedLecturersCount > 0) console.log(`[${timestamp}] Unassigned ${unassignedLecturersCount} lecturers from center ${centerId}.`);

      // 2. Handle related entities. If onDelete: Cascade is set in schema, Prisma handles some.
      //    Explicitly delete departments if not cascaded and required by business logic.
      //    If departments have lecturers, they also need to be unassigned or handled.
      //    For now, assuming departments might be deleted if Center is gone, or handled by onDelete: Cascade if set.
      //    Example: await tx.department.deleteMany({ where: { centerId: centerId } });

      // 3. Delete the center
      await tx.center.delete({ where: { id: centerId } });
    });

    console.log(`[${timestamp}] Center "${centerNameForMessage}" deleted.`);
    revalidatePath('/registry/centers');
    revalidatePath('/registry/users'); // Users might have been unassigned from this center
    revalidatePath('/registry/claims'); // Claims related to this center might be implicitly affected or need review
    return { success: true, message: `Center "${centerNameForMessage}" and its lecturer assignments removed.` };
  } catch (error) {
    console.error(`[${timestamp}] [deleteCenterByRegistry] Full Error:`, error);
    if (error.code === 'P2025') return { success: false, error: "Center not found or already deleted."};
    if (error.code === 'P2003') { // Foreign key constraint failed on delete
        const fieldName = error.meta?.field_name || "related records";
        if (String(fieldName).includes('Department_centerIdToCenter')) return { success: false, error: `Cannot delete center. It has associated departments. Please delete or reassign them first.`};
        if (String(fieldName).includes('Claim_centerIdToCenter')) return { success: false, error: `Cannot delete center. It has associated claims. Please reassign or delete them first.`};
        return { success: false, error: `Cannot delete center. It is linked to other records (field: ${fieldName}). Resolve dependencies.`};
    }
    return { success: false, error: "Failed to delete center. " + (error.message || "An unexpected error occurred.") };
  }
}

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
      select: { id: true, submittedById: true, centerId: true } 
    });

    if (!claimToDelete) {
      console.log(`[${timestamp}] [deleteClaimByRegistry] Claim ${claimId} not found.`);
      return { success: false, error: "Claim not found or already deleted." };
    }

    // Transaction to delete claim and its dependent SupervisedStudent records
    await prisma.$transaction(async (tx) => {
        // First, delete dependent SupervisedStudent records (due to onDelete: Cascade on ClaimStudents, this might be redundant if schema handles it)
        // However, explicit deletion is safer if onDelete behavior isn't fully relied upon or understood.
        const deletedSupervisedStudents = await tx.supervisedStudent.deleteMany({
            where: { claimId: claimId }
        });
        if (deletedSupervisedStudents.count > 0) {
            console.log(`[${timestamp}] [deleteClaimByRegistry] Deleted ${deletedSupervisedStudents.count} supervised student records for claim ${claimId}.`);
        }
        // Then, delete the claim itself
        await tx.claim.delete({
            where: { id: claimId },
        });
    });

    console.log(`[${timestamp}] [deleteClaimByRegistry] Claim ${claimId} deleted successfully.`);

    revalidatePath('/registry/claims');
    // Revalidate paths for lecturer and coordinator dashboards if the deleted claim was visible there
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
    console.error(`[${timestamp}] [deleteClaimByRegistry] Full error object for claim ${claimId}:`, error);
    let userErrorMessage = "Failed to delete claim. Please check server logs for specific details.";
    if (error.code) {
        console.error(`[${timestamp}] [deleteClaimByRegistry] Prisma Error Code: ${error.code}, Meta: ${JSON.stringify(error.meta)}`);
        if (error.code === 'P2025') { // "Record to delete does not exist."
            userErrorMessage = "Claim not found or already deleted.";
        } else if (error.code === 'P2003') { // Foreign key constraint failed
            const fieldName = error.meta?.field_name || "related records";
            // SupervisedStudent has onDelete: Cascade, so this shouldn't be the cause for Claim deletion usually
            userErrorMessage = `Cannot delete claim. It might be linked to other records not automatically handled (e.g. via field '${fieldName}'). Please resolve these dependencies.`;
        } else {
            userErrorMessage = `Failed to delete claim due to a database error (Code: ${error.code}). Check server logs.`;
        }
    } else if (error.message && process.env.NODE_ENV !== 'production') { // Show more detailed error in dev
        userErrorMessage = `Failed to delete claim: ${error.message}`;
    }
    return { success: false, error: userErrorMessage };
  }
}