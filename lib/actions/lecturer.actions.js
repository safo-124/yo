// lib/actions/lecturer.actions.js
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Fetches all necessary data for the lecturer's dashboard.
 * @param {string} lecturerUserId - The ID of the logged-in lecturer.
 * @returns {Promise<object>} Object containing lecturer profile, center, department, and their claims, or an error.
 */
export async function getLecturerDashboardData(lecturerUserId) {
  if (!lecturerUserId) {
    return { success: false, error: "Lecturer user ID is required." };
  }

  try {
    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lecturerCenterId: true,
        departmentId: true,
        // Include related center and department information
        Center_User_lecturerCenterIdToCenter: { // Relation from User to Center
          select: { id: true, name: true }
        },
        Department: { // Relation from User to Department
          select: { id: true, name: true }
        },
        // Include claims submitted by this lecturer
        Claim_Claim_submittedByIdToUser: { // Relation from User to Claims they submitted
          orderBy: { submittedAt: 'desc' },
          // Select all necessary claim fields for display
          select: {
            id: true,
            claimType: true,
            status: true,
            submittedAt: true,
            updatedAt: true,
            processedAt: true,
            // Include specific fields for quick summary if needed
            teachingHours: true,
            transportAmount: true,
            thesisType: true,
            // Corrected: Use the 'processedBy' relation from the Claim model
            // to get the name of the coordinator who processed the claim.
            processedBy: {
              select: { name: true }
            }
            // You can also include other scalar fields from the Claim model here if needed for the dashboard view, e.g.:
            // teachingDate: true,
            // thesisExamCourseCode: true,
            // etc.
          }
        }
      }
    });

    if (!lecturer) {
      return { success: false, error: "Lecturer profile not found." };
    }
    if (lecturer.role !== 'LECTURER') {
      return { success: false, error: "User is not a lecturer." };
    }

    // Formatting for easier consumption on the client-side
    const formattedData = {
      profile: {
        id: lecturer.id,
        name: lecturer.name,
        email: lecturer.email,
      },
      center: lecturer.Center_User_lecturerCenterIdToCenter,
      department: lecturer.Department,
      claims: lecturer.Claim_Claim_submittedByIdToUser.map(claim => ({
        ...claim,
        // Corrected: Access the coordinator's name via the 'processedBy' relation
        processedByCoordinator: claim.processedBy?.name
      })),
    };

    return { success: true, data: formattedData };

  } catch (error) {
    console.error("Error fetching lecturer dashboard data:", error);
    return { success: false, error: "Failed to fetch dashboard data. " + error.message };
  }
}

/**
 * Submits a new claim for a lecturer.
 * @param {object} claimData - The data for the new claim.
 * @param {string} claimData.submittedById - The ID of the lecturer submitting the claim.
 * @param {string} claimData.centerId - The ID of the center the claim belongs to.
 * @param {Claim_claimType} claimData.claimType - The type of claim.
 * All other fields are based on the claimType and are optional in the function signature
 * but should be validated based on type.
 * e.g., teachingDate, teachingStartTime, teachingEndTime, teachingHours for TEACHING
 * e.g., transportType, transportDestinationTo, etc. for TRANSPORTATION
 * e.g., thesisType, thesisSupervisionRank, supervisedStudents (array), etc. for THESIS_PROJECT
 * @returns {Promise<object>} Success/error object with new claim data or error message.
 */
export async function submitNewClaim(claimData) {
  const { submittedById, centerId, claimType, ...specificData } = claimData;

  if (!submittedById || !centerId || !claimType) {
    return { success: false, error: "Submitter ID, Center ID, and Claim Type are required." };
  }

  // Basic validation based on claim type (can be expanded)
  if (claimType === 'TEACHING' && (!specificData.teachingDate || !specificData.teachingHours)) {
    return { success: false, error: "For teaching claims, date and hours are required." };
  }
  // Add more specific validations for TRANSPORTATION and THESIS_PROJECT types as needed

  try {
    let newClaim;
    if (claimType === 'THESIS_PROJECT' && specificData.thesisType === 'SUPERVISION' && specificData.supervisedStudents && specificData.supervisedStudents.length > 0) {
      // Handle creation of claim and related supervised students in a transaction
      newClaim = await prisma.$transaction(async (tx) => {
        const claim = await tx.claim.create({
          data: {
            submittedById,
            centerId,
            claimType,
            status: 'PENDING', // Default status
            // Common fields
            teachingDate: specificData.teachingDate || null,
            teachingStartTime: specificData.teachingStartTime || null,
            teachingEndTime: specificData.teachingEndTime || null,
            teachingHours: specificData.teachingHours ? parseFloat(specificData.teachingHours) : null,
            transportType: specificData.transportType || null,
            transportDestinationTo: specificData.transportDestinationTo || null,
            transportDestinationFrom: specificData.transportDestinationFrom || null,
            transportRegNumber: specificData.transportRegNumber || null,
            transportCubicCapacity: specificData.transportCubicCapacity ? parseInt(specificData.transportCubicCapacity) : null,
            transportAmount: specificData.transportAmount ? parseFloat(specificData.transportAmount) : null,
            thesisType: specificData.thesisType || null,
            thesisSupervisionRank: specificData.thesisSupervisionRank || null,
            thesisExamCourseCode: specificData.thesisExamCourseCode || null,
            thesisExamDate: specificData.thesisExamDate || null,
          }
        });

        // Create SupervisedStudent records
        const studentCreations = specificData.supervisedStudents.map(student =>
          tx.supervisedStudent.create({
            data: {
              studentName: student.studentName,
              thesisTitle: student.thesisTitle,
              claimId: claim.id,
              supervisorId: submittedById, // Assuming the claim submitter is the supervisor
            }
          })
        );
        await Promise.all(studentCreations);
        return claim;
      });
    } else {
      // Create claim without supervised students transaction
      newClaim = await prisma.claim.create({
        data: {
          submittedById,
          centerId,
          claimType,
          status: 'PENDING',
          // Spread specific data, ensuring types are correct (e.g., parsing numbers)
          teachingDate: specificData.teachingDate || null,
          teachingStartTime: specificData.teachingStartTime || null,
          teachingEndTime: specificData.teachingEndTime || null,
          teachingHours: specificData.teachingHours ? parseFloat(specificData.teachingHours) : null,

          transportType: specificData.transportType || null,
          transportDestinationTo: specificData.transportDestinationTo || null,
          transportDestinationFrom: specificData.transportDestinationFrom || null,
          transportRegNumber: specificData.transportRegNumber || null,
          transportCubicCapacity: specificData.transportCubicCapacity ? parseInt(specificData.transportCubicCapacity) : null,
          transportAmount: specificData.transportAmount ? parseFloat(specificData.transportAmount) : null,

          thesisType: specificData.thesisType || null,
          thesisSupervisionRank: specificData.thesisSupervisionRank || null,
          thesisExamCourseCode: specificData.thesisExamCourseCode || null,
          thesisExamDate: specificData.thesisExamDate || null,
          // Note: supervisedStudents are handled separately above if present
        }
      });
    }

    // Revalidate paths where claims are displayed to reflect new data immediately
    revalidatePath(`/lecturer/${submittedById}/claims`); // Lecturer's claim list
    // Potentially revalidate other paths if necessary, e.g., a coordinator's view
    // For instance, if a coordinator views claims for a specific center:
    if (centerId) {
        revalidatePath(`/coordinator/center/${centerId}/claims`); // Example path
    }
    // Or a general claims path for an admin/registry role
    revalidatePath(`/admin/claims`); // Example path


    return { success: true, claim: newClaim };

  } catch (error) {
    console.error("Error submitting new claim:", error);
    return { success: false, error: "Failed to submit claim. " + error.message };
  }
}