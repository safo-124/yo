// lib/actions/lecturer.actions.js
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Fetches all necessary data for the lecturer's dashboard.
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
        Center_User_lecturerCenterIdToCenter: {
          select: { id: true, name: true }
        },
        Department: {
          select: { id: true, name: true }
        },
        Claim_Claim_submittedByIdToUser: {
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
            courseTitle: true, // ADDED: Select new field
            courseCode: true,  // ADDED: Select new field
            teachingDate: true, // Might be useful to display with teaching claims
            teachingStartTime: true,
            teachingEndTime: true,
            processedBy: {
              select: { name: true }
            }
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
        processedByCoordinator: claim.processedBy?.name
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
 */
function parseDateToUTC(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput; // Assume if it's Date, it's handled correctly upstream or is fine

  if (typeof dateInput === 'string') {
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateInput.split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    } else {
      const parsedDate = new Date(dateInput);
      if (!isNaN(parsedDate.getTime())) return parsedDate;
    }
  }
  console.warn("Invalid dateInput received for parsing:", dateInput);
  return null;
}

/**
 * Parses a time string "HH:MM" into hours and minutes.
 * @param {string} timeStr - The time string e.g., "14:30".
 * @returns {{hours: number, minutes: number} | null}
 */
function parseTime(timeStr) {
  if (!timeStr || !timeStr.match(/^\d{2}:\d{2}$/)) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
    return { hours, minutes };
  }
  return null;
}


/**
 * Submits a new claim for a lecturer.
 */
export async function submitNewClaim(claimData) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [submitNewClaim] Received raw claimData:`, claimData);

  const { 
    submittedById, 
    centerId, 
    claimType, 
    supervisedStudents, // for THESIS_PROJECT
    ...specificData 
  } = claimData;

  if (!submittedById || !centerId || !claimType) {
    return { success: false, error: "Submitter ID, Center ID, and Claim Type are required." };
  }

  const finalTeachingDate = parseDateToUTC(specificData.teachingDate);
  const finalThesisExamDate = parseDateToUTC(specificData.thesisExamDate);
  let calculatedTeachingHours = null;

  if (claimType === 'TEACHING') {
    if (!finalTeachingDate || !specificData.teachingStartTime || !specificData.teachingEndTime) {
      return { success: false, error: "For teaching claims, date, start time, and end time are required." };
    }
    if (!specificData.courseCode || !specificData.courseTitle) {
        return { success: false, error: "For teaching claims, course code and course title are required." };
    }

    const parsedStartTime = parseTime(specificData.teachingStartTime);
    const parsedEndTime = parseTime(specificData.teachingEndTime);

    if (finalTeachingDate && parsedStartTime && parsedEndTime) {
      const startDateTime = new Date(finalTeachingDate.getTime()); // Clone UTC date part
      startDateTime.setUTCHours(parsedStartTime.hours, parsedStartTime.minutes, 0, 0);

      const endDateTime = new Date(finalTeachingDate.getTime()); // Clone UTC date part
      endDateTime.setUTCHours(parsedEndTime.hours, parsedEndTime.minutes, 0, 0);

      if (endDateTime > startDateTime) {
        const durationMs = endDateTime.getTime() - startDateTime.getTime();
        calculatedTeachingHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2)); // Calculate hours and round to 2 decimal places
      } else {
        return { success: false, error: "Teaching end time must be after start time." };
      }
    } else {
      return { success: false, error: "Invalid start or end time format. Please use HH:MM." };
    }
  }

  try {
    const dataForPrisma = {
      submittedById,
      centerId,
      claimType,
      status: 'PENDING',
      
      // Teaching specific fields
      teachingDate: claimType === 'TEACHING' ? finalTeachingDate : null,
      teachingStartTime: claimType === 'TEACHING' ? specificData.teachingStartTime : null,
      teachingEndTime: claimType === 'TEACHING' ? specificData.teachingEndTime : null,
      teachingHours: claimType === 'TEACHING' ? calculatedTeachingHours : (specificData.teachingHours != null ? parseFloat(specificData.teachingHours) : null), // Use calculated, or allow override if needed (currently replaces)
      courseCode: claimType === 'TEACHING' ? specificData.courseCode : null,
      courseTitle: claimType === 'TEACHING' ? specificData.courseTitle : null,

      // Transportation specific fields
      transportType: claimType === 'TRANSPORTATION' ? specificData.transportType : null,
      transportDestinationTo: claimType === 'TRANSPORTATION' ? specificData.transportDestinationTo : null,
      transportDestinationFrom: claimType === 'TRANSPORTATION' ? specificData.transportDestinationFrom : null,
      transportRegNumber: claimType === 'TRANSPORTATION' ? specificData.transportRegNumber : null,
      transportCubicCapacity: claimType === 'TRANSPORTATION' && specificData.transportCubicCapacity != null ? parseInt(specificData.transportCubicCapacity) : null,
      transportAmount: claimType === 'TRANSPORTATION' && specificData.transportAmount != null ? parseFloat(specificData.transportAmount) : null,

      // Thesis/Project specific fields
      thesisType: claimType === 'THESIS_PROJECT' ? specificData.thesisType : null,
      thesisSupervisionRank: claimType === 'THESIS_PROJECT' && specificData.thesisType === 'SUPERVISION' ? specificData.thesisSupervisionRank : null,
      thesisExamCourseCode: claimType === 'THESIS_PROJECT' && specificData.thesisType === 'EXAMINATION' ? specificData.thesisExamCourseCode : null,
      thesisExamDate: claimType === 'THESIS_PROJECT' && specificData.thesisType === 'EXAMINATION' ? finalThesisExamDate : null,
    };
    
    // Clean data: remove undefined properties if any, or ensure they are null for optional fields
    Object.keys(dataForPrisma).forEach(key => {
        if (dataForPrisma[key] === undefined) {
            dataForPrisma[key] = null;
        }
    });


    let newClaim;

    if (claimType === 'THESIS_PROJECT' && specificData.thesisType === 'SUPERVISION' && Array.isArray(supervisedStudents) && supervisedStudents.length > 0) {
      newClaim = await prisma.$transaction(async (tx) => {
        const claim = await tx.claim.create({
          data: dataForPrisma
        });

        const studentCreations = supervisedStudents.map(student => {
          if (!student.studentName || !student.thesisTitle) {
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
        // Fetch the claim again with includes if you need to return students in the response
        return tx.claim.findUnique({ where: { id: claim.id }, include: { supervisedStudents: true } });
      });
    } else {
      newClaim = await prisma.claim.create({
        data: dataForPrisma
      });
    }

    console.log(`[${timestamp}] [submitNewClaim] Claim created successfully: ${newClaim.id}`);
    
    const lecturerClaimsPath = `/lecturer/center/${centerId}/my-claims`; 
    const lecturerDashboardPath = `/lecturer/center/${centerId}/dashboard`;
    revalidatePath(lecturerClaimsPath);
    revalidatePath(lecturerDashboardPath);
    if (centerId) {
      revalidatePath(`/coordinator/center/${centerId}/claims`);
      revalidatePath(`/coordinator/center/${centerId}/dashboard`);
    }
    revalidatePath(`/registry/claims`); 

    return { success: true, claim: newClaim };

  } catch (error) {
    console.error(`[${timestamp}] [submitNewClaim] Error submitting new claim:`, error);
    if (error.code === 'P2002' || error.message.includes("Unique constraint failed")) {
        return { success: false, error: "A similar claim might already exist or there's a data conflict." };
    }
    if (error.name === 'PrismaClientValidationError' || error.message.includes("Invalid `prisma.claim.create()` invocation")) {
        return { success: false, error: "Invalid data provided for the claim. Please ensure all required fields for the claim type are correctly filled." };
    }
    return { success: false, error: "Failed to submit claim. " + (error.message || "An unknown error occurred.") };
  }
}