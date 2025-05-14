// lib/actions/lecturer.actions.js
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
// Assuming Enums like ClaimType, ClaimStatus etc. are implicitly handled by Prisma client values
// For explicit type safety in TypeScript, you would import them:
// import { ClaimType, ClaimStatus, TransportType, ThesisType, SupervisionRank } from '@prisma/client';

/**
 * Fetches all necessary data for the lecturer's dashboard.
 * @param {string} lecturerUserId - The ID of the logged-in lecturer.
 * @returns {Promise<object>} Object containing lecturer profile, center, department, and their claims, or an error.
 */
export async function getLecturerDashboardData(lecturerUserId) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getLecturerDashboardData] For UserID: ${lecturerUserId}`);
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
        designation: true, // ADDED: Select lecturer's designation
        lecturerCenterId: true,
        departmentId: true,
        Center_User_lecturerCenterIdToCenter: { 
          select: { id: true, name: true }
        },
        Department: { 
          select: { id: true, name: true }
        },
        Claim_Claim_submittedByIdToUser: { // Claims submitted by this lecturer
          orderBy: { submittedAt: 'desc' },
          select: { // Select all relevant claim fields for dashboard/claim list display
            id: true,
            claimType: true,
            status: true,
            submittedAt: true,
            updatedAt: true,
            processedAt: true,
            // Teaching specific
            teachingDate: true,
            teachingStartTime: true,
            teachingEndTime: true,
            teachingHours: true,
            courseCode: true,   // ADDED
            courseTitle: true,  // ADDED
            // Transportation to Teaching specific
            transportToTeachingInDate: true,      // ADDED
            transportToTeachingFrom: true,        // ADDED
            transportToTeachingTo: true,          // ADDED
            transportToTeachingOutDate: true,     // ADDED
            transportToTeachingReturnFrom: true,  // ADDED
            transportToTeachingReturnTo: true,    // ADDED
            transportToTeachingDistanceKM: true,  // ADDED
            // General Transportation specific
            transportType: true,
            transportDestinationTo: true,
            transportDestinationFrom: true,
            transportRegNumber: true,
            transportCubicCapacity: true,
            transportAmount: true,
            // Thesis/Project specific
            thesisType: true,
            thesisSupervisionRank: true,
            thesisExamCourseCode: true,
            thesisExamDate: true,
            supervisedStudents: { // If displaying student count or names in a list
              select: { studentName: true, thesisTitle: true }
            },
            processedBy: { // User who processed the claim
              select: { name: true }
            },
            center: { // Center of the claim (should match lecturer's center for their claims)
                select: { name: true }
            }
          }
        }
      }
    });

    if (!lecturer) {
      return { success: false, error: "Lecturer profile not found." };
    }
    if (lecturer.role !== 'LECTURER' && lecturer.role !== 'COORDINATOR') { // Coordinators might also submit claims
      return { success: false, error: "User is not authorized to submit/view claims as a lecturer/coordinator." };
    }

    const formattedData = {
      profile: {
        id: lecturer.id,
        name: lecturer.name,
        email: lecturer.email,
        role: lecturer.role,
        designation: lecturer.designation, // ADDED
      },
      center: lecturer.Center_User_lecturerCenterIdToCenter,
      department: lecturer.Department,
      claims: lecturer.Claim_Claim_submittedByIdToUser.map(claim => ({
        ...claim,
        processedByCoordinator: claim.processedBy?.name, // Keeping this for simplicity
        centerName: claim.center?.name // Add centerName to each claim if not already there
      })),
    };
    console.log(`[${timestamp}] [getLecturerDashboardData] Data fetched successfully for ${lecturerUserId}`);
    return { success: true, data: formattedData };

  } catch (error) {
    console.error(`[${timestamp}] [getLecturerDashboardData] Error fetching data for ${lecturerUserId}:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch dashboard data. " + error.message };
  }
}

/**
 * Converts a date string (YYYY-MM-DD) or a Date object to a UTC Date object.
 * Returns null if the input is invalid or empty.
 */
function parseDateToUTC(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    // If it's already a Date, re-construct as UTC date to ensure only date part is considered at UTC midnight
    return new Date(Date.UTC(dateInput.getUTCFullYear(), dateInput.getUTCMonth(), dateInput.getUTCDate()));
  }
  if (typeof dateInput === 'string') {
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) { // YYYY-MM-DD
      const [year, month, day] = dateInput.split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    } else { // Try parsing other ISO-like strings
      const parsedDate = new Date(dateInput);
      if (!isNaN(parsedDate.getTime())) {
        return new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()));
      }
    }
  }
  console.warn("[parseDateToUTC] Invalid dateInput received:", dateInput);
  return null;
}

/**
 * Parses a time string "HH:MM" into hours and minutes.
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
  console.log(`[${timestamp}] [submitNewClaim] Received raw claimData:`, JSON.stringify(claimData));

  const { 
    submittedById, 
    centerId, 
    claimType, 
    supervisedStudents, 
    // Teaching specific from form (might include transport related to teaching)
    teachingDate,
    teachingStartTime,
    teachingEndTime,
    courseCode,
    courseTitle,
    // New transport to teaching fields from form
    transportToTeachingInDate,
    transportToTeachingFrom,
    transportToTeachingTo,
    transportToTeachingOutDate,
    transportToTeachingReturnFrom,
    transportToTeachingReturnTo,
    // Other claim type specific data is in ...specificData
    ...specificData 
  } = claimData;

  if (!submittedById || !centerId || !claimType) {
    return { success: false, error: "Submitter ID, Center ID, and Claim Type are required." };
  }

  // Prepare dates (convert to Date objects or null)
  const finalTeachingDate = parseDateToUTC(teachingDate);
  const finalThesisExamDate = parseDateToUTC(specificData.thesisExamDate);
  const finalTransportToTeachingInDate = parseDateToUTC(transportToTeachingInDate);
  const finalTransportToTeachingOutDate = parseDateToUTC(transportToTeachingOutDate);

  let calculatedTeachingHours = null;
  let calculatedTransportToTeachingDistanceKM = null; // Placeholder for distance

  if (claimType === 'TEACHING') {
    if (!finalTeachingDate || !teachingStartTime || !teachingEndTime) {
      return { success: false, error: "For teaching claims, date, start time, and end time are required." };
    }
    if (!courseCode?.trim() || !courseTitle?.trim()) {
        return { success: false, error: "For teaching claims, course code and course title are required." };
    }

    const parsedStartTime = parseTime(teachingStartTime);
    const parsedEndTime = parseTime(teachingEndTime);

    if (finalTeachingDate && parsedStartTime && parsedEndTime) {
      // Use UTC methods because finalTeachingDate is set to UTC midnight
      const startDateTime = new Date(finalTeachingDate.getTime());
      startDateTime.setUTCHours(parsedStartTime.hours, parsedStartTime.minutes, 0, 0);

      const endDateTime = new Date(finalTeachingDate.getTime());
      endDateTime.setUTCHours(parsedEndTime.hours, parsedEndTime.minutes, 0, 0);

      if (endDateTime.getTime() > startDateTime.getTime()) {
        const durationMs = endDateTime.getTime() - startDateTime.getTime();
        calculatedTeachingHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
      } else {
        return { success: false, error: "Teaching end time must be after start time." };
      }
    } else {
      return { success: false, error: "Invalid start or end time format for teaching. Please use HH:MM." };
    }

    // Placeholder for distance calculation for transport to teaching
    if (transportToTeachingFrom && transportToTeachingTo) {
        // TODO: IMPLEMENT YOUR DISTANCE CALCULATION LOGIC HERE
        // e.g., calculatedTransportToTeachingDistanceKM = await calculateDistance(transportToTeachingFrom, transportToTeachingTo);
        // For now, it will be null unless you implement it.
        // You might also want to calculate distance for the return journey if those fields are filled.
        console.warn(`[${timestamp}] [submitNewClaim] Distance calculation for teaching transport not implemented. 'transportToTeachingDistanceKM' will be null or based on direct input if schema changes to allow it.`);
    }
  }
  // Add more specific validations for TRANSPORTATION and THESIS_PROJECT types here if needed

  try {
    const dataForPrisma = {
      submittedById,
      centerId,
      claimType,
      status: 'PENDING',
      
      // Teaching specific fields
      teachingDate: claimType === 'TEACHING' ? finalTeachingDate : null,
      teachingStartTime: claimType === 'TEACHING' ? teachingStartTime : null,
      teachingEndTime: claimType === 'TEACHING' ? teachingEndTime : null,
      teachingHours: claimType === 'TEACHING' ? calculatedTeachingHours : (specificData.teachingHours != null ? parseFloat(specificData.teachingHours) : null),
      courseCode: claimType === 'TEACHING' ? courseCode.trim() : null,
      courseTitle: claimType === 'TEACHING' ? courseTitle.trim() : null,

      // New Transportation to Teaching fields
      transportToTeachingInDate: claimType === 'TEACHING' ? finalTransportToTeachingInDate : null,
      transportToTeachingFrom: claimType === 'TEACHING' ? transportToTeachingFrom || null : null,
      transportToTeachingTo: claimType === 'TEACHING' ? transportToTeachingTo || null : null,
      transportToTeachingOutDate: claimType === 'TEACHING' ? finalTransportToTeachingOutDate : null,
      transportToTeachingReturnFrom: claimType === 'TEACHING' ? transportToTeachingReturnFrom || null : null,
      transportToTeachingReturnTo: claimType === 'TEACHING' ? transportToTeachingReturnTo || null : null,
      transportToTeachingDistanceKM: claimType === 'TEACHING' ? calculatedTransportToTeachingDistanceKM : null, // Or a value if you calculate it

      // General Transportation specific fields
      transportType: claimType === 'TRANSPORTATION' ? specificData.transportType : null,
      transportDestinationTo: claimType === 'TRANSPORTATION' ? specificData.transportDestinationTo : null,
      transportDestinationFrom: claimType === 'TRANSPORTATION' ? specificData.transportDestinationFrom : null,
      transportRegNumber: claimType === 'TRANSPORTATION' ? specificData.transportRegNumber : null,
      transportCubicCapacity: claimType === 'TRANSPORTATION' && specificData.transportCubicCapacity != null ? parseInt(String(specificData.transportCubicCapacity)) : null,
      transportAmount: claimType === 'TRANSPORTATION' && specificData.transportAmount != null ? parseFloat(String(specificData.transportAmount)) : null,

      // Thesis/Project specific fields
      thesisType: claimType === 'THESIS_PROJECT' ? specificData.thesisType : null,
      thesisSupervisionRank: claimType === 'THESIS_PROJECT' && specificData.thesisType === 'SUPERVISION' ? specificData.thesisSupervisionRank : null,
      thesisExamCourseCode: claimType === 'THESIS_PROJECT' && specificData.thesisType === 'EXAMINATION' ? specificData.thesisExamCourseCode : null,
      thesisExamDate: claimType === 'THESIS_PROJECT' && specificData.thesisType === 'EXAMINATION' ? finalThesisExamDate : null,
    };
    
    Object.keys(dataForPrisma).forEach(key => {
        if (dataForPrisma[key] === undefined) { dataForPrisma[key] = null; }
    });

    let newClaim;

    if (claimType === 'THESIS_PROJECT' && specificData.thesisType === 'SUPERVISION' && Array.isArray(supervisedStudents) && supervisedStudents.length > 0) {
      newClaim = await prisma.$transaction(async (tx) => {
        const claim = await tx.claim.create({ data: dataForPrisma });
        const studentCreations = supervisedStudents
            .filter(student => student.studentName?.trim() && student.thesisTitle?.trim()) // Only create students with both name and title
            .map(student => tx.supervisedStudent.create({
                data: {
                    studentName: student.studentName.trim(),
                    thesisTitle: student.thesisTitle.trim(),
                    claimId: claim.id,
                    supervisorId: submittedById,
                }
            }));
        await Promise.all(studentCreations);
        return tx.claim.findUnique({ where: { id: claim.id }, include: { supervisedStudents: true } });
      });
    } else {
      newClaim = await prisma.claim.create({ data: dataForPrisma });
    }

    console.log(`[${timestamp}] [submitNewClaim] Claim created successfully: ${newClaim.id}`);
    
    // Path revalidation - ensure paths are correct for your application
    const lecturerClaimsPath = `/lecturer/center/${centerId}/my-claims`;
    const lecturerDashboardPath = `/lecturer/center/${centerId}/dashboard`;
    revalidatePath(lecturerClaimsPath);
    revalidatePath(lecturerDashboardPath);
    if (centerId) {
      revalidatePath(`/coordinator/center/${centerId}/claims`);
      revalidatePath(`/coordinator/center/${centerId}/dashboard`);
      // Add revalidation for staff registry if they view these claims
      revalidatePath(`/staff_registry/center/${centerId}/claims`);
    }
    revalidatePath(`/registry/claims`); 

    return { success: true, claim: newClaim };

  } catch (error) {
    console.error(`[${timestamp}] [submitNewClaim] Error submitting new claim:`, error.message, error.stack, error.code ? `Prisma Error Code: ${error.code}` : '', error.meta ? `Meta: ${JSON.stringify(error.meta)}` : '');
    if (error.name === 'PrismaClientValidationError') {
        return { success: false, error: "Invalid data provided for the claim. Please check all fields and formats." };
    }
    return { success: false, error: "Failed to submit claim. " + (error.message || "An unknown error occurred.") };
  }
}