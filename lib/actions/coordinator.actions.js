// lib/actions/coordinator.actions.js
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs'; // For hashing passwords when creating lecturers

/**
 * Fetches all necessary data for the coordinator's dashboard for their assigned center.
 * @param {string} coordinatorUserId - The ID of the logged-in coordinator.
 * @returns {Promise<object>} Object containing center details, lecturers, departments, claims, or an error.
 */
export async function getCoordinatorDashboardData(coordinatorUserId) {
  console.log(`[${new Date().toISOString()}] [getCoordinatorDashboardData] Action called for coordinatorUserId: ${coordinatorUserId}`);
  if (!coordinatorUserId) {
    return { success: false, error: "Coordinator user ID is required." };
  }

  try {
    // Find the center coordinated by this user
    const center = await prisma.center.findUnique({
      where: { coordinatorId: coordinatorUserId },
      include: {
        lecturers: { // Users with role LECTURER assigned to this center
          where: { role: 'LECTURER' },
          select: {
            id: true,
            name: true,
            email: true,
            departmentId: true,
            Department: { select: { id: true, name: true } },
          },
          orderBy: { name: 'asc' },
        },
        departments: { // Departments belonging to this center
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { lecturers: true } } // Count of lecturers in each department
          }
        },
        claims: { // Claims submitted for this center
          where: { status: 'PENDING' }, // Default to PENDING claims for dashboard
          include: {
            submittedBy: { // User who submitted the claim
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { submittedAt: 'asc' },
        },
        coordinator: { // The coordinator user him/herself
          select: { id: true, name: true, email: true }
        }
      },
    });

    if (!center) {
      console.log(`[${new Date().toISOString()}] [getCoordinatorDashboardData] Error: Coordinator ${coordinatorUserId} is not assigned to any center or center not found.`);
      return { success: false, error: "Coordinator is not assigned to any center or center not found." };
    }

    // Formatting for easier consumption
    const formattedData = {
      center: {
        id: center.id,
        name: center.name,
        coordinator: center.coordinator
      },
      lecturers: center.lecturers.map(l => ({...l, departmentName: l.Department?.name})),
      departments: center.departments.map(d => ({...d, lecturerCount: d._count?.lecturers})),
      claims: center.claims, // claims already have submittedBy included
    };
    console.log(`[${new Date().toISOString()}] [getCoordinatorDashboardData] Successfully fetched dashboard data for coordinator ${coordinatorUserId}, center ${center.id}.`);
    return { success: true, data: formattedData };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [getCoordinatorDashboardData] Error fetching dashboard data for ${coordinatorUserId}:`, error);
    return { success: false, error: "Failed to fetch dashboard data. " + error.message };
  }
}


/**
 * Creates a new Lecturer user within the coordinator's center.
 * @param {object} data - Data for the new lecturer { name, email, password, centerId, departmentId? }.
 * @returns {Promise<object>} Success/error object with new user data or error message.
 */
export async function createLecturerInCenter({ name, email, password, centerId, departmentId }) {
  console.log(`[${new Date().toISOString()}] [createLecturerInCenter] Action called. Center: ${centerId}, Email: ${email}`);
  if (!name || !email || !password || !centerId) {
    return { success: false, error: "Name, email, password, and center ID are required." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log(`[${new Date().toISOString()}] [createLecturerInCenter] Error: User with email ${email} already exists.`);
      return { success: false, error: "A user with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newLecturer = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: 'LECTURER',
        lecturerCenterId: centerId, // This links the lecturer to the center
        departmentId: departmentId || null,
      },
      select: { id: true, name: true, email: true, role: true, lecturerCenterId: true, departmentId: true }
    });

    console.log(`[${new Date().toISOString()}] [createLecturerInCenter] Lecturer ${newLecturer.id} created successfully in center ${centerId}.`);
    // Revalidate paths relevant to the coordinator's view of their center
    revalidatePath(`/coordinator/center/${centerId}/dashboard`); // General dashboard might show lecturer counts
    revalidatePath(`/coordinator/center/${centerId}/manage-users`); // A dedicated user management page for the center
    
    // Also revalidate registry paths if they show users across all centers
    revalidatePath('/registry/users');

    return { success: true, user: newLecturer };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [createLecturerInCenter] Error creating lecturer:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { success: false, error: "A user with this email already exists." };
    }
    return { success: false, error: "Failed to create lecturer. " + error.message };
  }
}

/**
 * Creates a new Department within a specific Center (typically the coordinator's center).
 * @param {object} data - Department data { name, centerId }.
 * @returns {Promise<object>} Success/error object with new department data or error message.
 */
export async function createDepartment({ name, centerId }) {
  console.log(`[${new Date().toISOString()}] [createDepartment] Action called. Center: ${centerId}, Name: ${name}`);
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

    console.log(`[${new Date().toISOString()}] [createDepartment] Department ${newDepartment.id} created successfully in center ${centerId}.`);
    // Revalidate paths relevant to the coordinator's view of their center's departments
    revalidatePath(`/coordinator/center/${centerId}/dashboard`);
    revalidatePath(`/coordinator/center/${centerId}/manage-departments`);
    
    // Also revalidate registry paths if they show departments
    revalidatePath('/registry/centers'); // As centers list might show department counts

    return { success: true, department: newDepartment };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [createDepartment] Error creating department:`, error);
    // Prisma error P2002 for unique constraint violation (name + centerId is unique on Department)
    if (error.code === 'P2002' && error.meta?.target?.includes('name') && error.meta?.target?.includes('centerId')) {
      return { success: false, error: "A department with this name already exists in this center." };
    }
    return { success: false, error: "Failed to create department. " + error.message };
  }
}

/**
 * Assigns an existing Lecturer to a Department within the same Center.
 * @param {object} data - Assignment data { lecturerId, departmentId, centerId (for revalidation) }.
 * @returns {Promise<object>} Success/error object.
 */
export async function assignLecturerToDepartment({ lecturerId, departmentId, centerId }) {
  console.log(`[${new Date().toISOString()}] [assignLecturerToDepartment] Action called. Lecturer: ${lecturerId}, Department: ${departmentId}, Center: ${centerId}`);
  if (!lecturerId) { // departmentId can be null to unassign
    return { success: false, error: "Lecturer ID is required." };
  }

  try {
    // Optional: Add checks to ensure lecturer and department belong to the coordinator's center.
    // This would require fetching the coordinator's centerId first if not passed in.

    const updatedUser = await prisma.user.update({
      where: { id: lecturerId },
      data: { departmentId: departmentId || null }, // Assign or unassign department
      select: { id: true, name: true, departmentId: true, lecturerCenterId: true }
    });

    // Ensure the lecturer is actually part of the center for which revalidation is happening
    if (updatedUser.lecturerCenterId !== centerId) {
        console.warn(`[${new Date().toISOString()}] [assignLecturerToDepartment] Warning: Lecturer ${lecturerId} updated, but their assigned center ${updatedUser.lecturerCenterId} does not match revalidation path center ${centerId}.`);
    }

    console.log(`[${new Date().toISOString()}] [assignLecturerToDepartment] Lecturer ${lecturerId} assigned to department ${departmentId} (or unassigned).`);
    revalidatePath(`/coordinator/center/${centerId}/dashboard`);
    revalidatePath(`/coordinator/center/${centerId}/manage-users`);
    if (departmentId) {
        revalidatePath(`/coordinator/center/${centerId}/manage-departments`); // Department list might show lecturer counts
    }
    
    return { success: true, user: updatedUser };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [assignLecturerToDepartment] Error assigning lecturer:`, error);
    return { success: false, error: "Failed to assign lecturer. " + error.message };
  }
}

/**
 * Processes a claim (approves or rejects it) for the coordinator's center.
 * @param {object} data - Claim processing data { claimId, status, processedById (coordinator's ID), centerId (coordinator's center ID) }.
 * @returns {Promise<object>} Success/error object with updated claim data or error message.
 */
export async function processClaimByCoordinator({ claimId, status, processedById, centerId }) {
  console.log(`[${new Date().toISOString()}] [processClaimByCoordinator] Action called. Claim: ${claimId}, Status: ${status}, Processor: ${processedById}, Center: ${centerId}`);
  if (!claimId || !status || !processedById || !centerId) {
    return { success: false, error: "Claim ID, status, processor ID, and center ID are required." };
  }
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return { success: false, error: "Invalid status. Must be APPROVED or REJECTED." };
  }

  try {
    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) {
      console.log(`[${new Date().toISOString()}] [processClaimByCoordinator] Error: Claim ${claimId} not found.`);
      return { success: false, error: "Claim not found." };
    }
    if (claim.centerId !== centerId) {
      console.log(`[${new Date().toISOString()}] [processClaimByCoordinator] Error: Claim ${claimId} (center ${claim.centerId}) does not belong to coordinator's center ${centerId}.`);
      return { success: false, error: "Claim does not belong to this center." };
    }
    if (claim.status !== 'PENDING') {
      console.log(`[${new Date().toISOString()}] [processClaimByCoordinator] Info: Claim ${claimId} is already ${claim.status}.`);
      return { success: false, error: `Claim is already ${claim.status.toLowerCase()}.` };
    }

    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        status: status,
        processedById: processedById,
        processedAt: new Date(),
      },
    });

    console.log(`[${new Date().toISOString()}] [processClaimByCoordinator] Claim ${claimId} processed to ${status} successfully.`);
    // Revalidate paths relevant to the coordinator and the lecturer
    revalidatePath(`/coordinator/center/${centerId}/dashboard`);
    revalidatePath(`/coordinator/center/${centerId}/manage-claims`); // Assuming a dedicated claims page for coordinator
    
    if (updatedClaim.submittedById) {
      // Revalidate the specific lecturer's view of their claims for this center
      revalidatePath(`/lecturer/center/${centerId}/my-claims`);
      // Also revalidate a general view if the lecturer has one
      revalidatePath(`/lecturer/${updatedClaim.submittedById}/claims`);
    }
    // Revalidate registry's view as well
    revalidatePath('/registry/claims');


    return { success: true, claim: updatedClaim };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [processClaimByCoordinator] Error processing claim:`, error);
    return { success: false, error: "Failed to process claim. " + error.message };
  }
}

/**
 * Fetches and aggregates a monthly claims summary for the coordinator's specific center.
 * @param {object} params - Parameters for the summary.
 * @param {string} params.coordinatorUserId - The ID of the coordinator requesting the summary.
 * @param {number} params.year - The year for the summary.
 * @param {number} params.month - The month for the summary (1-12).
 * @returns {Promise<object>} Object containing success status, the summary data for their center, or an error message.
 */
export async function getCoordinatorMonthlyClaimSummary({ coordinatorUserId, year, month }) {
  console.log(`[${new Date().toISOString()}] [getCoordinatorMonthlyClaimSummary] Action called. Coordinator: ${coordinatorUserId}, Year: ${year}, Month: ${month}`);

  if (!coordinatorUserId || !year || !month) {
    return { success: false, error: "Coordinator ID, year, and month are required." };
  }
  if (month < 1 || month > 12) {
    return { success: false, error: "Invalid month provided. Must be between 1 and 12." };
  }

  try {
    // Find the center coordinated by this user
    const centerData = await prisma.center.findUnique({
      where: { coordinatorId: coordinatorUserId },
      select: { id: true, name: true }
    });

    if (!centerData) {
      console.log(`[${new Date().toISOString()}] [getCoordinatorMonthlyClaimSummary] Error: Coordinator ${coordinatorUserId} is not assigned to any center.`);
      return { success: false, error: "Coordinator is not assigned to a center." };
    }
    const centerId = centerData.id;
    const centerName = centerData.name;

    const startDate = new Date(year, month - 1, 1); // JS months are 0-indexed
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last moment of the last day of the month

    console.log(`[${new Date().toISOString()}] [getCoordinatorMonthlyClaimSummary] Querying claims for center ${centerId} from ${startDate.toISOString()} to ${endDate.toISOString()}.`);

    const claims = await prisma.claim.findMany({
      where: {
        centerId: centerId, // Filter by the coordinator's center
        submittedAt: {
          gte: startDate,
          lte: endDate,
        },
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
        // Center info is already known, but can be included for consistency if claim.center is used
      },
      orderBy: {
        // submittedBy: { departmentId: 'asc' }, // Prisma doesn't support this well for aggregation prep
        submittedAt: 'asc',
      }
    });

    console.log(`[${new Date().toISOString()}] [getCoordinatorMonthlyClaimSummary] Fetched ${claims.length} claims for center ${centerId}.`);

    // --- Aggregate Data for the Center ---
    const centerSummary = {
      centerId,
      centerName,
      totalTeachingHours: 0,
      totalTransportAmount: 0,
      totalThesisSupervision: 0,
      totalThesisExamination: 0,
      totalClaims: claims.length,
      statusCounts: { PENDING: 0, APPROVED: 0, REJECTED: 0 },
      departments: {},
    };

    for (const claim of claims) {
      centerSummary.statusCounts[claim.status] = (centerSummary.statusCounts[claim.status] || 0) + 1;
      
      const departmentId = claim.submittedBy?.Department?.id || 'unknown_department';
      const departmentName = claim.submittedBy?.Department?.name || 'Unknown Department';

      if (!centerSummary.departments[departmentId]) {
        centerSummary.departments[departmentId] = {
          departmentId,
          departmentName,
          totalTeachingHours: 0,
          totalTransportAmount: 0,
          totalThesisSupervision: 0,
          totalThesisExamination: 0,
          totalClaimsInDept: 0,
          statusCounts: { PENDING: 0, APPROVED: 0, REJECTED: 0 },
          courses: {}, // For thesis examination course codes
        };
      }
      const deptSummary = centerSummary.departments[departmentId];
      deptSummary.totalClaimsInDept += 1;
      deptSummary.statusCounts[claim.status] = (deptSummary.statusCounts[claim.status] || 0) + 1;

      if (claim.claimType === 'TEACHING' && claim.teachingHours) {
        centerSummary.totalTeachingHours += claim.teachingHours; // Add to center total
        deptSummary.totalTeachingHours += claim.teachingHours;
      } else if (claim.claimType === 'TRANSPORTATION' && claim.transportAmount) {
        centerSummary.totalTransportAmount += claim.transportAmount; // Add to center total
        deptSummary.totalTransportAmount += claim.transportAmount;
      } else if (claim.claimType === 'THESIS_PROJECT') {
        if (claim.thesisType === 'SUPERVISION') {
          centerSummary.totalThesisSupervision += 1; // Add to center total
          deptSummary.totalThesisSupervision += 1;
        } else if (claim.thesisType === 'EXAMINATION') {
          centerSummary.totalThesisExamination += 1; // Add to center total
          deptSummary.totalThesisExamination += 1;
          
          const courseCode = claim.thesisExamCourseCode || 'UNKNOWN_COURSE';
          if (!deptSummary.courses[courseCode]) {
            deptSummary.courses[courseCode] = {
              courseCode, // Course ID
              courseId: courseCode, // Explicitly adding courseId
              thesisExaminationCount: 0,
            };
          }
          deptSummary.courses[courseCode].thesisExaminationCount += 1;
        }
      }
    }

    // Convert nested department and course objects to arrays for easier frontend iteration
    const finalCenterSummary = {
      ...centerSummary,
      departments: Object.values(centerSummary.departments).map(dept => ({
        ...dept,
        courses: Object.values(dept.courses),
      })).sort((a, b) => a.departmentName.localeCompare(b.departmentName)),
    };

    console.log(`[${new Date().toISOString()}] [getCoordinatorMonthlyClaimSummary] Summary generation complete for center ${centerId}.`);
    return { success: true, summary: finalCenterSummary }; // Return a single summary object for the coordinator's center

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [getCoordinatorMonthlyClaimSummary] Error:`, error);
    return { success: false, error: "Failed to generate coordinator monthly claims summary. " + error.message };
  }
}
