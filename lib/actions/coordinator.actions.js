// lib/actions/coordinator.actions.js
"use server";
import logger from '@/lib/logger';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';

/**
 * Fetches all necessary data for the coordinator's dashboard for their assigned center.
 * @param {string} coordinatorUserId - The ID of the logged-in coordinator.
 * @returns {Promise<object>} Object containing center details, lecturers, departments, claims, or an error.
 */
// In lib/actions/coordinator.actions.js

/**
 * Fetches all necessary data for the coordinator's dashboard for their assigned center.
 * @param {string} coordinatorUserId - The ID of the logged-in coordinator.
 * @returns {Promise<object>} Object containing center details, lecturers, departments, claims, or an error.
 */
export async function getCoordinatorDashboardData(coordinatorUserId) {
  logger.info(`[${new Date().toISOString()}] [getCoordinatorDashboardData] Action called for coordinatorUserId: ${coordinatorUserId}`);
  
  // Auth check: verify session and ensure caller matches
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }
  if (session.role !== 'COORDINATOR' && session.role !== 'REGISTRY') {
    return { success: false, error: "Unauthorized role." };
  }
  // Use session userId instead of client-supplied ID
  const actualUserId = session.role === 'REGISTRY' ? coordinatorUserId : session.userId;
  
  if (!actualUserId) {
    return { success: false, error: "Coordinator user ID is required." };
  }

  try {
    const center = await prisma.center.findUnique({
      where: { coordinatorId: actualUserId },
      include: {
        lecturers: {
          where: { role: 'LECTURER' },
          select: {
            id: true,
            name: true,
            email: true,
            departmentId: true,
            Department: { select: { id: true, name: true } },
            // ================== NEWLY ADDED CODE START ==================
            lecturerCourseAssignments: {
              select: {
                course: {
                  select: {
                    courseCode: true,
                    program: {
                      select: {
                        programCode: true
                      }
                    }
                  }
                }
              }
            }
            // =================== NEWLY ADDED CODE END ===================
          },
          orderBy: { name: 'asc' },
        },
        departmentAssignments: {
          orderBy: { assignedAt: 'asc' },
          include: {
            department: {
              include: {
                _count: { select: { lecturers: true } }
              }
            }
          }
        },
        claims: {
          where: { status: 'PENDING' },
          include: {
            submittedBy: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { submittedAt: 'asc' },
        },
        coordinator: {
          select: { id: true, name: true, email: true }
        }
      },
    });

    if (!center) {
      return { success: false, error: "Coordinator is not assigned to any center or center not found." };
    }

    const formattedData = {
      center: {
        id: center.id,
        name: center.name,
        coordinator: center.coordinator
      },
      // ================== MODIFIED FORMATTING START ==================
      lecturers: center.lecturers.map(l => {
        const programCodes = [...new Set(l.lecturerCourseAssignments.map(a => a.course.program.programCode))];
        return {
          ...l,
          departmentName: l.Department?.name,
          assignedCoursesCount: l.lecturerCourseAssignments.length,
          assignedProgramCodes: programCodes,
        };
      }),
      // =================== MODIFIED FORMATTING END ===================
      departments: center.departmentAssignments.map(assignment => ({
        ...assignment.department,
        lecturerCount: assignment.department._count?.lecturers || 0
      })),
      claims: center.claims,
    };
    logger.info(`[${new Date().toISOString()}] [getCoordinatorDashboardData] Successfully fetched dashboard data for coordinator ${coordinatorUserId}, center ${center.id}.`);
    return { success: true, data: formattedData };

  } catch (error) {
    logger.error(`[${new Date().toISOString()}] [getCoordinatorDashboardData] Error fetching dashboard data for ${coordinatorUserId}:`, error);
    return { success: false, error: "Failed to fetch dashboard data. " + error.message };
  }
}


/**
 * Creates a new Lecturer user within the coordinator's center.
 * @param {object} data - Data for the new lecturer { name, email, password, centerId, departmentId? }.
 * @returns {Promise<object>} Success/error object with new user data or error message.
 */
export async function createLecturerInCenter({ name, email, password, centerId, departmentId }) {
  // Auth check
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }
  if (session.role !== 'COORDINATOR' && session.role !== 'REGISTRY') {
    return { success: false, error: "Unauthorized role." };
  }
  
  logger.info(`[${new Date().toISOString()}] [createLecturerInCenter] Center: ${centerId}, Email: ${email}`);
  if (!name || !email || !password || !centerId) {
    return { success: false, error: "Name, email, password, and center ID are required." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.info(`[${new Date().toISOString()}] [createLecturerInCenter] Error: User with email ${email} already exists.`);
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

    logger.info(`[${new Date().toISOString()}] [createLecturerInCenter] Lecturer ${newLecturer.id} created successfully in center ${centerId}.`);
    // Revalidate paths relevant to the coordinator's view of their center
    revalidatePath(`/coordinator/center/${centerId}/dashboard`); // General dashboard might show lecturer counts
    revalidatePath(`/coordinator/center/${centerId}/manage-users`); // A dedicated user management page for the center
    
    // Also revalidate registry paths if they show users across all centers
    revalidatePath('/registry/users');

    return { success: true, user: newLecturer };

  } catch (error) {
    logger.error(`[${new Date().toISOString()}] [createLecturerInCenter] Error creating lecturer:`, error);
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
  // Auth check
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }
  if (session.role !== 'COORDINATOR' && session.role !== 'REGISTRY') {
    return { success: false, error: "Unauthorized role." };
  }
  
  logger.info(`[${new Date().toISOString()}] [createDepartment] Center: ${centerId}, Name: ${name}`);
  if (!name || !centerId) {
    return { success: false, error: "Department name and center ID are required." };
  }

  try {
    // Use a transaction to create the department AND the junction table entry
    const newDepartment = await prisma.$transaction(async (tx) => {
      const dept = await tx.department.create({
        data: {
          name: name.trim(),
        },
      });
      // Create the DepartmentCenterAssignment junction record
      await tx.departmentCenterAssignment.create({
        data: {
          departmentId: dept.id,
          centerId: centerId,
        },
      });
      return dept;
    });

    logger.info(`[${new Date().toISOString()}] [createDepartment] Department ${newDepartment.id} created and assigned to center ${centerId}.`);
    revalidatePath(`/coordinator/center/${centerId}/dashboard`);
    revalidatePath(`/coordinator/center/${centerId}/manage-departments`);
    revalidatePath('/registry/centers');

    return { success: true, department: newDepartment };

  } catch (error) {
    logger.error(`[${new Date().toISOString()}] [createDepartment] Error creating department:`, error);
    if (error.code === 'P2002') {
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
  // Auth check
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }
  if (session.role !== 'COORDINATOR' && session.role !== 'REGISTRY') {
    return { success: false, error: "Unauthorized role." };
  }
  
  logger.info(`[${new Date().toISOString()}] [assignLecturerToDepartment] Lecturer: ${lecturerId}, Department: ${departmentId}, Center: ${centerId}`);
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
        logger.warn(`[${new Date().toISOString()}] [assignLecturerToDepartment] Warning: Lecturer ${lecturerId} updated, but their assigned center ${updatedUser.lecturerCenterId} does not match revalidation path center ${centerId}.`);
    }

    logger.info(`[${new Date().toISOString()}] [assignLecturerToDepartment] Lecturer ${lecturerId} assigned to department ${departmentId} (or unassigned).`);
    revalidatePath(`/coordinator/center/${centerId}/dashboard`);
    revalidatePath(`/coordinator/center/${centerId}/manage-users`);
    if (departmentId) {
        revalidatePath(`/coordinator/center/${centerId}/manage-departments`); // Department list might show lecturer counts
    }
    
    return { success: true, user: updatedUser };

  } catch (error) {
    logger.error(`[${new Date().toISOString()}] [assignLecturerToDepartment] Error assigning lecturer:`, error);
    return { success: false, error: "Failed to assign lecturer. " + error.message };
  }
}

/**
 * Processes a claim (approves or rejects it) for the coordinator's center.
 * @param {object} data - Claim processing data { claimId, status, processedById (coordinator's ID), centerId (coordinator's center ID) }.
 * @returns {Promise<object>} Success/error object with updated claim data or error message.
 */
export async function processClaimByCoordinator({ claimId, status, processedById, centerId }) {
  // Auth check
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }
  if (session.role !== 'COORDINATOR' && session.role !== 'REGISTRY') {
    return { success: false, error: "Unauthorized role." };
  }
  // Use session userId for processing, ignore client-supplied processedById
  const actualProcessorId = session.userId;
  
  logger.info(`[${new Date().toISOString()}] [processClaimByCoordinator] Claim: ${claimId}, Status: ${status}, Processor: ${actualProcessorId}, Center: ${centerId}`);
  if (!claimId || !status || !centerId) {
    return { success: false, error: "Claim ID, status, and center ID are required." };
  }
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return { success: false, error: "Invalid status. Must be APPROVED or REJECTED." };
  }

  try {
    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) {
      logger.info(`[${new Date().toISOString()}] [processClaimByCoordinator] Error: Claim ${claimId} not found.`);
      return { success: false, error: "Claim not found." };
    }
    if (claim.centerId !== centerId) {
      logger.info(`[${new Date().toISOString()}] [processClaimByCoordinator] Error: Claim ${claimId} (center ${claim.centerId}) does not belong to coordinator's center ${centerId}.`);
      return { success: false, error: "Claim does not belong to this center." };
    }
    if (claim.status !== 'PENDING') {
      logger.info(`[${new Date().toISOString()}] [processClaimByCoordinator] Info: Claim ${claimId} is already ${claim.status}.`);
      return { success: false, error: `Claim is already ${claim.status.toLowerCase()}.` };
    }

    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        status: status,
        processedById: actualProcessorId,
        processedAt: new Date(),
      },
    });

    logger.info(`[${new Date().toISOString()}] [processClaimByCoordinator] Claim ${claimId} processed to ${status} successfully.`);
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
    logger.error(`[${new Date().toISOString()}] [processClaimByCoordinator] Error processing claim:`, error);
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
  // Auth check
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }
  if (session.role !== 'COORDINATOR' && session.role !== 'REGISTRY') {
    return { success: false, error: "Unauthorized role." };
  }
  // Use session userId instead of client-supplied ID
  const actualUserId = session.role === 'REGISTRY' ? coordinatorUserId : session.userId;
  
  logger.info(`[${new Date().toISOString()}] [getCoordinatorMonthlyClaimSummary] Coordinator: ${actualUserId}, Year: ${year}, Month: ${month}`);

  if (!actualUserId || !year || !month) {
    return { success: false, error: "Coordinator ID, year, and month are required." };
  }
  if (month < 1 || month > 12) {
    return { success: false, error: "Invalid month provided. Must be between 1 and 12." };
  }

  try {
    // Find the center coordinated by this user
    const centerData = await prisma.center.findUnique({
      where: { coordinatorId: actualUserId },
      select: { id: true, name: true }
    });

    if (!centerData) {
      logger.info(`[${new Date().toISOString()}] [getCoordinatorMonthlyClaimSummary] Error: Coordinator ${coordinatorUserId} is not assigned to any center.`);
      return { success: false, error: "Coordinator is not assigned to a center." };
    }
    const centerId = centerData.id;
    const centerName = centerData.name;

    const startDate = new Date(year, month - 1, 1); // JS months are 0-indexed
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last moment of the last day of the month

    logger.info(`[${new Date().toISOString()}] [getCoordinatorMonthlyClaimSummary] Querying claims for center ${centerId} from ${startDate.toISOString()} to ${endDate.toISOString()}.`);

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

    logger.info(`[${new Date().toISOString()}] [getCoordinatorMonthlyClaimSummary] Fetched ${claims.length} claims for center ${centerId}.`);

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

    logger.info(`[${new Date().toISOString()}] [getCoordinatorMonthlyClaimSummary] Summary generation complete for center ${centerId}.`);
    return { success: true, summary: finalCenterSummary }; // Return a single summary object for the coordinator's center

  } catch (error) {
    logger.error(`[${new Date().toISOString()}] [getCoordinatorMonthlyClaimSummary] Error:`, error);
    return { success: false, error: "Failed to generate coordinator monthly claims summary. " + error.message };
  }
}
// Add this new function to: lib/actions/coordinator.actions.js

/**
 * Assigns a list of courses to a specific lecturer, managed by a coordinator.
 * This function replaces all existing assignments for the lecturer with the new list.
 * @param {object} params - The parameters for the assignment.
 * @param {string} params.lecturerId - The ID of the lecturer to assign courses to.
 * @param {string[]} params.courseIds - An array of course IDs to be assigned.
 * @param {string} params.coordinatorId - The ID of the coordinator performing the action (for authorization).
 * @returns {Promise<object>} A success or error object.
 */
export async function assignCoursesToLecturerByCoordinator({ lecturerId, courseIds, coordinatorId }) {
  // Auth check
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }
  if (session.role !== 'COORDINATOR' && session.role !== 'REGISTRY') {
    return { success: false, error: "Unauthorized role." };
  }
  // Use session userId instead of client-supplied coordinatorId
  const actualCoordinatorId = session.userId;

  logger.info(` [assignCoursesToLecturerByCoordinator] Action called by Coordinator ${actualCoordinatorId} for Lecturer ${lecturerId}`);

  if (!lecturerId || !Array.isArray(courseIds) || !actualCoordinatorId) {
    return { success: false, error: "Lecturer ID, an array of Course IDs, and Coordinator ID are required." };
  }

  try {
    // --- Import the settings utility
    const { getMaxCoursesPerLecturer } = await import('@/lib/settings');
    
    // --- Authorization Step ---
    // 1. Find the coordinator's center
    const coordinatorCenter = await prisma.center.findUnique({
      where: { coordinatorId: actualCoordinatorId },
      select: { id: true }
    });
    if (!coordinatorCenter) {
      return { success: false, error: "Unauthorized: You are not a coordinator of any center." };
    }

    // 2. Find the user (lecturer or coordinator) to assign courses to
    // For lecturers, check if they belong to the coordinator's center
    // For coordinators, check if it's the coordinator themselves
    let user;
    
    if (lecturerId === actualCoordinatorId) {
      // If assigning to themselves (the coordinator)
      user = await prisma.user.findFirst({
        where: {
          id: lecturerId,
          role: 'COORDINATOR'
        },
        select: { id: true, name: true, role: true }
      });
    } else {
      // If assigning to a lecturer in their center
      user = await prisma.user.findFirst({
        where: {
          id: lecturerId,
          role: 'LECTURER',
          lecturerCenterId: coordinatorCenter.id
        },
        select: { id: true, name: true, role: true }
      });
    }
    
    if (!user) {
      return { success: false, error: "User not found or not authorized to assign courses to this user." };
    }
    
    // 3. Check if course assignment exceeds maximum allowed
    const maxCoursesAllowed = await getMaxCoursesPerLecturer();
    if (courseIds.length > maxCoursesAllowed) {
      return { 
        success: false, 
        error: `Cannot assign more than ${maxCoursesAllowed} courses to a ${user.role === 'COORDINATOR' ? 'coordinator' : 'lecturer'} as set by registry. Please remove some courses or contact registry to increase the limit.`,
        maxCoursesAllowed
      };
    }
    
    // --- Database Transaction ---
    // Using a transaction ensures that deleting old and creating new assignments is an all-or-nothing operation.
    await prisma.$transaction(async (tx) => {
      // 1. Delete all existing course assignments for this lecturer
      await tx.lecturerCourseAssignment.deleteMany({
        where: { lecturerId: lecturerId },
      });

      // 2. If there are new courses to assign, create them
      if (courseIds.length > 0) {
        await tx.lecturerCourseAssignment.createMany({
          data: courseIds.map(courseId => ({
            lecturerId: lecturerId,
            courseId: courseId,
          })),
        });
      }
    });

    logger.info(` [assignCoursesToLecturerByCoordinator] Successfully assigned ${courseIds.length} courses to ${user.name} (${user.role}).`);
    
    // Revalidate relevant paths
    revalidatePath(`/coordinator/center/${coordinatorCenter.id}/manage-assignments`); // Or your assignment page path
    revalidatePath('/registry/courses'); // Courses page might show assignment counts

    return { 
      success: true, 
      message: `Successfully assigned ${courseIds.length} courses to ${user.name} ${user.role === 'COORDINATOR' ? '(Coordinator)' : ''}` 
    };

  } catch (error) {
    logger.error(`[assignCoursesToLecturerByCoordinator] Error:`, error);
    return { success: false, error: "An error occurred while assigning courses. " + error.message };
  }
}

// Add this new function to: lib/actions/coordinator.actions.js

/**
 * Fetches all data needed for the course assignment page for a specific center.
 * @param {string} centerId - The ID of the center.
 * @returns {Promise<object>} An object containing lecturers and courses, or an error.
 */
export async function getAssignmentPageData(centerId) {
  // Auth check
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }
  if (session.role !== 'COORDINATOR' && session.role !== 'REGISTRY') {
    return { success: false, error: "Unauthorized role." };
  }
  

  logger.info(` [getAssignmentPageData] Fetching data for center: ${centerId}`);

  if (!centerId) {
    return { success: false, error: "Center ID is required." };
  }

  try {
    // Import the settings utility
    const { getMaxCoursesPerLecturer } = await import('@/lib/settings');
    
    // Get the maximum courses allowed per lecturer
    const maxCoursesAllowed = await getMaxCoursesPerLecturer();

    // First get lecturers in the center
    const lecturersInCenter = await prisma.user.findMany({
      where: {
        role: 'LECTURER',
        lecturerCenterId: centerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // Include the existing assignments to pre-fill the form
        lecturerCourseAssignments: {
          select: {
            courseId: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Get the coordinator of the center
    const coordinator = await prisma.center.findUnique({
      where: { id: centerId },
      select: {
        coordinator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            lecturerCourseAssignments: {
              select: {
                courseId: true,
              }
            }
          }
        }
      }
    });

    // Fetch all courses. In a larger system, you might scope this by center.
    const allCourses = await prisma.course.findMany({
      select: {
        id: true,
        courseCode: true,
        courseTitle: true,
      },
      orderBy: {
        courseCode: 'asc',
      },
    });
    
    // Format lecturer data to be more convenient for the client
    const formattedLecturers = lecturersInCenter.map(lecturer => ({
      ...lecturer,
      assignedCourseIds: lecturer.lecturerCourseAssignments.map(assignment => assignment.courseId)
    }));
    
    // Add coordinator to the list of users who can be assigned courses
    let usersWithAssignments = [...formattedLecturers];
    
    if (coordinator && coordinator.coordinator) {
      usersWithAssignments.push({
        ...coordinator.coordinator,
        assignedCourseIds: coordinator.coordinator.lecturerCourseAssignments.map(assignment => assignment.courseId),
        isCoordinator: true // Flag to identify coordinator in the UI
      });
    }

    return { 
      success: true, 
      lecturers: usersWithAssignments, 
      courses: allCourses,
      maxCoursesAllowed
    };
  } catch (error) {
    logger.error(`[getAssignmentPageData] Error:`, error);
    return { success: false, error: "Failed to fetch data for assignment page." };
  }
}