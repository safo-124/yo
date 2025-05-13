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
        Center_User_lecturerCenterIdToCenter: { // Relation from User to Center
          select: { id: true, name: true }
        },
        Department: { // Relation from User to Department
          select: { id: true, name: true }
        },
        Claim_Claim_submittedByIdToUser: { // Relation from User to Claims they submitted
          orderBy: { submittedAt: 'desc' },
          select: {
            id: true,
            claimType: true,
            status: true,
            submittedAt: true,
            updatedAt: true,
            processedAt: true,
            teachingHours: true,
            transportAmount: true,
            thesisType: true,
            // Get the name of the user who processed the claim via the 'processedBy' relation
            processedBy: {
              select: { name: true }
            }
            // Add other claim fields if needed for dashboard summary
            // teachingDate: true,
            // thesisExamCourseCode: true,
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
        processedByCoordinator: claim.processedBy?.name // Simplified access
      })),
    };

    return { success: true, data: formattedData };

  } catch (error) {
    console.error("Error fetching lecturer dashboard data:", error.message);
    return { success: false, error: "Failed to fetch dashboard data. " + error.message };
  }
}

/**
 * Converts a date string (YYYY-MM-DD) or a Date object to a UTC Date object.
 * Returns null if the input is invalid or empty.
 * @param {string | Date | null | undefined} dateInput - The date input.
 * @returns {Date | null} - The Date object at UTC midnight, or null.
 */
function parseDateToUTC(dateInput) {
  if (!dateInput) return null;

  if (dateInput instanceof Date) {
    // If it's already a Date object, ensure it's treated as UTC for consistency if needed,
    // or just return it if local timezone interpretation at midnight is fine.
    // For simplicity here, we'll assume it's either correctly timezone-aware or a local date picker value.
    // To force UTC from a local date:
    // return new Date(Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()));
    return dateInput; // Or simply return if it's already a Date object from a reliable source
  }

  if (typeof dateInput === 'string') {
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) { // Matches YYYY-MM-DD
      const [year, month, day] = dateInput.split('-').map(Number);
      // Creates a Date object representing midnight UTC on that day
      return new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed for Date constructor
    } else {
      // Try to parse other string formats, might be an ISO string already
      const parsedDate = new Date(dateInput);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  }
  console.warn("Invalid dateInput received for parsing:", dateInput);
  return null; // Return null if input is not a valid date string or Date object
}


/**
 * Submits a new claim for a lecturer.
 */
export async function submitNewClaim(claimData) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [submitNewClaim] Received raw claimData:`, claimData);

  const { submittedById, centerId, claimType, supervisedStudents, ...specificData } = claimData;

  if (!submittedById || !centerId || !claimType) {
    return { success: false, error: "Submitter ID, Center ID, and Claim Type are required." };
  }

  // --- **DATE CONVERSION** ---
  const finalTeachingDate = parseDateToUTC(specificData.teachingDate);
  const finalThesisExamDate = parseDateToUTC(specificData.thesisExamDate);

  // Basic validation based on claim type
  if (claimType === 'TEACHING' && (!finalTeachingDate || specificData.teachingHours == null)) {
    // Note: teachingHours can be 0, so check for null/undefined
    return { success: false, error: "For teaching claims, date and hours are required." };
  }
  // Add more specific validations for TRANSPORTATION and THESIS_PROJECT types here

  try {
    const dataForPrisma = {
      submittedById,
      centerId,
      claimType,
      status: 'PENDING', // Default status
      teachingDate: finalTeachingDate, // Use converted date
      teachingStartTime: specificData.teachingStartTime || null,
      teachingEndTime: specificData.teachingEndTime || null,
      teachingHours: specificData.teachingHours != null ? parseFloat(specificData.teachingHours) : null,
      transportType: specificData.transportType || null,
      transportDestinationTo: specificData.transportDestinationTo || null,
      transportDestinationFrom: specificData.transportDestinationFrom || null,
      transportRegNumber: specificData.transportRegNumber || null,
      transportCubicCapacity: specificData.transportCubicCapacity != null ? parseInt(specificData.transportCubicCapacity) : null,
      transportAmount: specificData.transportAmount != null ? parseFloat(specificData.transportAmount) : null,
      thesisType: specificData.thesisType || null,
      thesisSupervisionRank: specificData.thesisSupervisionRank || null,
      thesisExamCourseCode: specificData.thesisExamCourseCode || null,
      thesisExamDate: finalThesisExamDate, // Use converted date
    };

    let newClaim;

    if (claimType === 'THESIS_PROJECT' && specificData.thesisType === 'SUPERVISION' && Array.isArray(supervisedStudents) && supervisedStudents.length > 0) {
      newClaim = await prisma.$transaction(async (tx) => {
        const claim = await tx.claim.create({
          data: dataForPrisma
        });

        const studentCreations = supervisedStudents.map(student => {
          if (!student.studentName || !student.thesisTitle) {
            // Throw an error to rollback transaction if student data is invalid
            throw new Error("Student name and thesis title are required for supervised students.");
          }
          return tx.supervisedStudent.create({
            data: {
              studentName: student.studentName,
              thesisTitle: student.thesisTitle,
              claimId: claim.id,
              supervisorId: submittedById,
            }
          });
        });
        await Promise.all(studentCreations);
        return claim; // Return the created claim
      });
    } else {
      newClaim = await prisma.claim.create({
        data: dataForPrisma
      });
    }

    console.log(`[${timestamp}] [submitNewClaim] Claim created successfully: ${newClaim.id}`);
    // Path revalidation
    // Ensure these paths match your application's routing structure
    const lecturerClaimsPath = `/lecturer/center/${centerId}/my-claims`; // Example, adjust as needed
    const lecturerDashboardPath = `/lecturer/center/${centerId}/dashboard`; // Example
    revalidatePath(lecturerClaimsPath);
    revalidatePath(lecturerDashboardPath);
    if (centerId) {
      revalidatePath(`/coordinator/center/${centerId}/claims`);
      revalidatePath(`/coordinator/center/${centerId}/dashboard`);
    }
    revalidatePath(`/registry/claims`); // General claims page for registry/admin

    return { success: true, claim: newClaim };

  } catch (error) {
    console.error(`[${timestamp}] [submitNewClaim] Error submitting new claim:`, error);
    // Check for Prisma's validation error, which can include details about specific fields
    if (error.code === 'P2002' || error.message.includes("Unique constraint failed")) {
        return { success: false, error: "A similar claim might already exist or there's a data conflict." };
    }
    if (error.message.includes("Invalid `prisma.claim.create()` invocation") || error.name === 'PrismaClientValidationError') {
        return { success: false, error: "Invalid data provided for the claim. Please check all fields." };
    }
    return { success: false, error: "Failed to submit claim. " + (error.message || "An unknown error occurred.") };
  }
}