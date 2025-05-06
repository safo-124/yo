// lib/actions/coordinator.actions.js
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs'; // For hashing passwords when creating lecturers

/**
 * Fetches all necessary data for the coordinator's dashboard.
 * @param {string} coordinatorUserId - The ID of the logged-in coordinator.
 * @returns {Promise<object>} Object containing center details, lecturers, departments, claims, or an error.
 */
export async function getCoordinatorDashboardData(coordinatorUserId) {
  if (!coordinatorUserId) {
    return { success: false, error: "Coordinator user ID is required." };
  }

  try {
    // Find the center coordinated by this user
    const center = await prisma.center.findUnique({
      where: { coordinatorId: coordinatorUserId },
      include: {
        // Lecturers in this center
        User_User_lecturerCenterIdToCenter: { // Relation from Center to Users (lecturers)
          where: { role: 'LECTURER' },
          select: {
            id: true,
            name: true,
            email: true,
            departmentId: true,
            Department: { select: { id: true, name: true } }, // Department they belong to
          },
          orderBy: { name: 'asc' },
        },
        // Departments in this center
        Department: {
          orderBy: { name: 'asc' },
          include: {
            // Optionally count lecturers per department
            _count: { select: { User: true } } // Counts users (lecturers) in this department
          }
        },
        // Claims associated with this center
        Claim: {
          where: { status: 'PENDING' }, // Example: Fetch pending claims by default
          include: {
            User_Claim_submittedByIdToUser: { // User who submitted the claim (Lecturer)
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { submittedAt: 'asc' },
        },
        // The coordinator him/herself
        User_Center_coordinatorIdToUser: {
            select: { id: true, name: true, email: true }
        }
      },
    });

    if (!center) {
      return { success: false, error: "Coordinator is not assigned to any center or center not found." };
    }

    // Formatting for easier consumption
    const formattedData = {
      center: {
        id: center.id,
        name: center.name,
        coordinator: center.User_Center_coordinatorIdToUser
      },
      lecturers: center.User_User_lecturerCenterIdToCenter.map(l => ({...l, departmentName: l.Department?.name})),
      departments: center.Department.map(d => ({...d, lecturerCount: d._count?.User})),
      claims: center.Claim.map(c => ({...c, submittedBy: c.User_Claim_submittedByIdToUser})),
    };

    return { success: true, data: formattedData };

  } catch (error) {
    console.error("Error fetching coordinator dashboard data:", error);
    return { success: false, error: "Failed to fetch dashboard data. " + error.message };
  }
}


/**
 * Creates a new Lecturer user within the coordinator's center.
 * @param {object} data - Data for the new lecturer.
 * @param {string} data.name - Lecturer's name.
 * @param {string} data.email - Lecturer's email.
 * @param {string} data.password - Lecturer's plain text password.
 * @param {string} data.centerId - The ID of the center this lecturer belongs to.
 * @param {string} [data.departmentId] - Optional: Department ID to assign the lecturer to.
 * @returns {Promise<object>} Success/error object with new user data or error message.
 */
export async function createLecturerInCenter({ name, email, password, centerId, departmentId }) {
  if (!name || !email || !password || !centerId) {
    return { success: false, error: "Name, email, password, and center ID are required." };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newLecturer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'LECTURER',
        lecturerCenterId: centerId,
        departmentId: departmentId || null, // Assign department if provided
      },
      select: { id: true, name: true, email: true, role: true, lecturerCenterId: true, departmentId: true }
    });

    revalidatePath(`/coordinator/${centerId}/lecturers`); // Or a more general coordinator dashboard path
    if (departmentId) {
        revalidatePath(`/coordinator/${centerId}/departments/${departmentId}`);
    }
    return { success: true, user: newLecturer };

  } catch (error) {
    console.error("Error creating lecturer in center:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { success: false, error: "A user with this email already exists." };
    }
    return { success: false, error: "Failed to create lecturer. " + error.message };
  }
}

/**
 * Creates a new Department within a specific Center.
 * @param {object} data - Department data.
 * @param {string} data.name - Department name.
 * @param {string} data.centerId - The ID of the center this department belongs to.
 * @returns {Promise<object>} Success/error object with new department data or error message.
 */
export async function createDepartment({ name, centerId }) {
  if (!name || !centerId) {
    return { success: false, error: "Department name and center ID are required." };
  }

  try {
    const newDepartment = await prisma.department.create({
      data: {
        name,
        centerId,
      },
    });

    revalidatePath(`/coordinator/${centerId}/departments`); // Or a more general coordinator dashboard path
    return { success: true, department: newDepartment };

  } catch (error)
 {
    console.error("Error creating department:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name') && error.meta?.target?.includes('centerId')) {
      return { success: false, error: "A department with this name already exists in this center." };
    }
    return { success: false, error: "Failed to create department. " + error.message };
  }
}

/**
 * Assigns an existing Lecturer to a Department within the same Center.
 * @param {object} data - Assignment data.
 * @param {string} data.lecturerId - The ID of the lecturer.
 * @param {string} data.departmentId - The ID of the department.
 * @param {string} data.centerId - The ID of the center (for revalidation).
 * @returns {Promise<object>} Success/error object.
 */
export async function assignLecturerToDepartment({ lecturerId, departmentId, centerId }) {
  if (!lecturerId || !departmentId) {
    return { success: false, error: "Lecturer ID and Department ID are required." };
  }

  try {
    // Optional: Add checks to ensure lecturer and department belong to the coordinator's center.
    const updatedUser = await prisma.user.update({
      where: { id: lecturerId },
      data: { departmentId: departmentId },
      select: { id: true, name: true, departmentId: true }
    });

    revalidatePath(`/coordinator/${centerId}/lecturers`);
    revalidatePath(`/coordinator/${centerId}/departments`);
    revalidatePath(`/coordinator/${centerId}/departments/${departmentId}`);
    return { success: true, user: updatedUser };

  } catch (error) {
    console.error("Error assigning lecturer to department:", error);
    return { success: false, error: "Failed to assign lecturer. " + error.message };
  }
}

/**
 * Processes a claim (approves or rejects it).
 * @param {object} data - Claim processing data.
 * @param {string} data.claimId - The ID of the claim.
 * @param {'APPROVED' | 'REJECTED'} data.status - The new status of the claim.
 * @param {string} data.processedById - The ID of the coordinator processing the claim.
 * @param {string} data.centerId - The ID of the center (for revalidation).
 * @returns {Promise<object>} Success/error object with updated claim data or error message.
 */
export async function processClaim({ claimId, status, processedById, centerId }) {
  if (!claimId || !status || !processedById) {
    return { success: false, error: "Claim ID, status, and processor ID are required." };
  }
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return { success: false, error: "Invalid status. Must be APPROVED or REJECTED." };
  }

  try {
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        status: status,
        processedById: processedById,
        processedAt: new Date(),
      },
    });

    revalidatePath(`/coordinator/${centerId}/claims`); // Or a more general coordinator dashboard path
    return { success: true, claim: updatedClaim };

  } catch (error) {
    console.error("Error processing claim:", error);
    return { success: false, error: "Failed to process claim. " + error.message };
  }
}
