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
        // CORRECTED: Use the relation field name from the Center model
        lecturers: { // Relation from Center to Users (lecturers)
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
        // CORRECTED: Use the relation field name from the Center model
        departments: { // Relation from Center to Departments
          orderBy: { name: 'asc' },
          include: {
            // Optionally count lecturers per department
            _count: { select: { lecturers: true } } // Count users (lecturers) via the 'lecturers' relation on Department
          }
        },
        // CORRECTED: Use the relation field name from the Center model
        claims: { // Relation from Center to Claims
          where: { status: 'PENDING' }, // Example: Fetch pending claims by default
          include: {
            // CORRECTED: Use the relation field name from the Claim model
            submittedBy: { // User who submitted the claim (Lecturer)
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { submittedAt: 'asc' },
        },
        // CORRECTED: Use the relation field name from the Center model
        coordinator: { // The coordinator him/herself
            select: { id: true, name: true, email: true }
        }
      },
    });

    if (!center) {
      return { success: false, error: "Coordinator is not assigned to any center or center not found." };
    }

    // Formatting for easier consumption using the correct field names
    const formattedData = {
      center: {
        id: center.id,
        name: center.name,
        coordinator: center.coordinator // Use the included coordinator object
      },
      lecturers: center.lecturers.map(l => ({...l, departmentName: l.Department?.name})), // Use center.lecturers
      departments: center.departments.map(d => ({...d, lecturerCount: d._count?.lecturers})), // Use center.departments and count lecturers
      claims: center.claims.map(c => ({...c, submittedBy: c.submittedBy})), // Use center.claims and included submittedBy
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
 * @returns {Promise<object>} Success/error object with new user data or error message.
 */
export async function createLecturerInCenter({ name, email, password, centerId, departmentId }) {
  if (!name || !email || !password || !centerId) {
    return { success: false, error: "Name, email, password, and center ID are required." };
  }
  if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
  }

  try {
    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "A user with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newLecturer = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: 'LECTURER',
        lecturerCenterId: centerId,
        departmentId: departmentId || null, // Assign department if provided
      },
      select: { id: true, name: true, email: true, role: true, lecturerCenterId: true, departmentId: true }
    });

    revalidatePath(`/coordinator/${centerId}/lecturers`);
    if (departmentId) {
        revalidatePath(`/coordinator/${centerId}/departments/${departmentId}`);
        revalidatePath(`/coordinator/${centerId}/departments`); // Also revalidate dept list for counts
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
 * @param {object} data - Department data { name, centerId }.
 * @returns {Promise<object>} Success/error object with new department data or error message.
 */
export async function createDepartment({ name, centerId }) {
  if (!name || !centerId) {
    return { success: false, error: "Department name and center ID are required." };
  }

  try {
    const newDepartment = await prisma.department.create({
      data: {
        name: name.trim(),
        centerId,
      },
    });

    revalidatePath(`/coordinator/${centerId}/departments`);
    return { success: true, department: newDepartment };

  } catch (error) {
    console.error("Error creating department:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name') && error.meta?.target?.includes('centerId')) {
      return { success: false, error: "A department with this name already exists in this center." };
    }
    return { success: false, error: "Failed to create department. " + error.message };
  }
}

/**
 * Assigns an existing Lecturer to a Department within the same Center.
 * @param {object} data - Assignment data { lecturerId, departmentId, centerId }.
 * @returns {Promise<object>} Success/error object.
 */
export async function assignLecturerToDepartment({ lecturerId, departmentId, centerId }) {
  if (!lecturerId || !departmentId) {
    // Allow unassigning by passing null or empty string for departmentId
    // For now, assume departmentId is required for assignment
     return { success: false, error: "Lecturer ID and Department ID are required." };
  }

  try {
    // Optional: Add checks to ensure lecturer and department belong to the coordinator's center.
    const updatedUser = await prisma.user.update({
      where: { id: lecturerId },
      data: { departmentId: departmentId }, // Assign the department
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
 * @param {object} data - Claim processing data { claimId, status, processedById, centerId }.
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
    // Optional: Check if claim belongs to the centerId first
    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) return { success: false, error: "Claim not found." };
    if (claim.centerId !== centerId) return { success: false, error: "Claim does not belong to this center." };
    if (claim.status !== 'PENDING') return { success: false, error: `Claim is already ${claim.status.toLowerCase()}.` };


    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        status: status,
        processedById: processedById,
        processedAt: new Date(),
      },
    });

    revalidatePath(`/coordinator/${centerId}/claims`);
    revalidatePath(`/lecturer/center/${centerId}/my-claims`); // Revalidate lecturer's view too

    return { success: true, claim: updatedClaim };

  } catch (error) {
    console.error("Error processing claim:", error);
    return { success: false, error: "Failed to process claim. " + error.message };
  }
}
