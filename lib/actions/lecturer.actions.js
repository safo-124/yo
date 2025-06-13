// lib/actions/lecturer.actions.js
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
// You need to create this file and implement the Google Maps API call
import { calculateDistanceBetweenLocations } from '@/lib/mapsService'; 

/**
 * Fetches all necessary data for the lecturer's dashboard.
 */
export async function getLecturerDashboardData(lecturerUserId) {
  const timestamp = new Date().toISOString();
  // console.log(`[${timestamp}] [getLecturerDashboardData] For UserID: ${lecturerUserId}`);
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
        designation: true,
        lecturerCenterId: true,
        departmentId: true,
        // NEW: Include bank details and phone number
        bankName: true,
        bankBranch: true,
        accountName: true,
        accountNumber: true,
        phoneNumber: true,
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
            teachingDate: true,
            teachingStartTime: true,
            teachingEndTime: true,
            teachingHours: true,
            courseCode: true,  
            courseTitle: true,  
            transportToTeachingInDate: true,     
            transportToTeachingFrom: true,       
            transportToTeachingTo: true,         
            transportToTeachingOutDate: true,    
            transportToTeachingReturnFrom: true, 
            transportToTeachingReturnTo: true,   
            transportToTeachingDistanceKM: true, 
            transportType: true,
            transportDestinationTo: true,
            transportDestinationFrom: true,
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
            processedBy: { 
              select: { name: true }
            },
            center: { 
                select: { name: true }
            }
          }
        }
      }
    });

    if (!lecturer) {
      return { success: false, error: "Lecturer profile not found." };
    }
    if (lecturer.role !== 'LECTURER' && lecturer.role !== 'COORDINATOR') { 
      return { success: false, error: "User is not authorized to submit/view claims as a lecturer/coordinator." };
    }

    const formattedData = {
      profile: {
        id: lecturer.id,
        name: lecturer.name,
        email: lecturer.email,
        role: lecturer.role,
        designation: lecturer.designation,
        // NEW: Add bank details and phone number to the profile
        bankName: lecturer.bankName,
        bankBranch: lecturer.bankBranch,
        accountName: lecturer.accountName,
        accountNumber: lecturer.accountNumber,
        phoneNumber: lecturer.phoneNumber,
      },
      center: lecturer.Center_User_lecturerCenterIdToCenter,
      department: lecturer.Department,
      claims: lecturer.Claim_Claim_submittedByIdToUser.map(claim => ({
        ...claim,
        processedByCoordinator: claim.processedBy?.name, 
        centerName: claim.center?.name 
      })),
    };
    return { success: true, data: formattedData };

  } catch (error) {
    console.error(`[${timestamp}] [getLecturerDashboardData] Error fetching data for ${lecturerUserId}:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch dashboard data. " + error.message };
  }
}

function parseDateToUTC(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return new Date(Date.UTC(dateInput.getUTCFullYear(), dateInput.getUTCMonth(), dateInput.getUTCDate()));
  }
  if (typeof dateInput === 'string') {
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) { 
      const [year, month, day] = dateInput.split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    } else { 
      const parsedDate = new Date(dateInput);
      if (!isNaN(parsedDate.getTime())) {
        return new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()));
      }
    }
  }
  console.warn("[parseDateToUTC] Invalid dateInput received:", dateInput);
  return null;
}

function parseTime(timeStr) {
  if (!timeStr || !timeStr.match(/^\d{2}:\d{2}$/)) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
    return { hours, minutes };
  }
  return null;
}

export async function submitNewClaim(claimData) {
  const timestamp = new Date().toISOString();
  // console.log(`[${timestamp}] [submitNewClaim] Received raw claimData:`, JSON.stringify(claimData));

  const { 
    submittedById, centerId, claimType, supervisedStudents, 
    teachingDate, teachingStartTime, teachingEndTime, courseCode, courseTitle,
    transportToTeachingInDate, transportToTeachingFrom, transportToTeachingTo,
    transportToTeachingOutDate, transportToTeachingReturnFrom, transportToTeachingReturnTo,
    // Note: transportToTeachingDistanceKM is calculated, not taken directly from claimData for teaching type
    ...specificData 
  } = claimData;

  if (!submittedById || !centerId || !claimType) {
    return { success: false, error: "Submitter ID, Center ID, and Claim Type are required." };
  }

  const finalTeachingDate = parseDateToUTC(teachingDate);
  const finalThesisExamDate = parseDateToUTC(specificData.thesisExamDate);
  const finalTransportToTeachingInDate = parseDateToUTC(transportToTeachingInDate);
  const finalTransportToTeachingOutDate = parseDateToUTC(transportToTeachingOutDate);
  
  let calculatedTeachingHours = null;
  let calculatedTransportToTeachingDistanceKM = null;

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
      const startDateTime = new Date(finalTeachingDate.getTime()); startDateTime.setUTCHours(parsedStartTime.hours, parsedStartTime.minutes, 0, 0);
      const endDateTime = new Date(finalTeachingDate.getTime()); endDateTime.setUTCHours(parsedEndTime.hours, parsedEndTime.minutes, 0, 0);
      if (endDateTime.getTime() > startDateTime.getTime()) {
        const durationMs = endDateTime.getTime() - startDateTime.getTime();
        calculatedTeachingHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
      } else { return { success: false, error: "Teaching end time must be after start time." }; }
    } else { return { success: false, error: "Invalid start or end time format for teaching. Please use HH:MM." }; }

    let distanceToVenue = null;
    let distanceReturn = null;

    if (transportToTeachingFrom?.trim() && transportToTeachingTo?.trim()) {
      console.log(`[${timestamp}] Calculating distance for teaching (to venue): ${transportToTeachingFrom} -> ${transportToTeachingTo}`);
      distanceToVenue = await calculateDistanceBetweenLocations(transportToTeachingFrom.trim(), transportToTeachingTo.trim());
    }
    if (transportToTeachingReturnFrom?.trim() && transportToTeachingReturnTo?.trim()) {
      console.log(`[${timestamp}] Calculating distance for teaching (return): ${transportToTeachingReturnFrom} -> ${transportToTeachingReturnTo}`);
      distanceReturn = await calculateDistanceBetweenLocations(transportToTeachingReturnFrom.trim(), transportToTeachingReturnTo.trim());
    }

    if (distanceToVenue !== null || distanceReturn !== null) {
      calculatedTransportToTeachingDistanceKM = parseFloat(((distanceToVenue || 0) + (distanceReturn || 0)).toFixed(2));
      if (calculatedTransportToTeachingDistanceKM === 0 && (distanceToVenue !== null || distanceReturn !== null)) { // If one leg is 0 but other is not
          // This case might need specific handling if 0 is a valid calculated distance vs. an error.
          // For now, if either is calculated, the sum (even if one part is 0) is used.
      }
        console.log(`[${timestamp}] Total teaching transport distance calculated: ${calculatedTransportToTeachingDistanceKM} km`);
    } else {
        console.log(`[${timestamp}] No valid locations for teaching transport distance calculation.`);
    }
  }

  try {
    const dataForPrisma = {
      submittedById, centerId, claimType, status: 'PENDING',
      teachingDate: claimType === 'TEACHING' ? finalTeachingDate : null,
      teachingStartTime: claimType === 'TEACHING' ? teachingStartTime : null,
      teachingEndTime: claimType === 'TEACHING' ? teachingEndTime : null,
      teachingHours: claimType === 'TEACHING' ? calculatedTeachingHours : (specificData.teachingHours != null ? parseFloat(specificData.teachingHours) : null),
      courseCode: claimType === 'TEACHING' ? courseCode.trim() : null,
      courseTitle: claimType === 'TEACHING' ? courseTitle.trim() : null,
      transportToTeachingInDate: claimType === 'TEACHING' ? finalTransportToTeachingInDate : null,
      transportToTeachingFrom: claimType === 'TEACHING' ? transportToTeachingFrom?.trim() || null : null,
      transportToTeachingTo: claimType === 'TEACHING' ? transportToTeachingTo?.trim() || null : null,
      transportToTeachingOutDate: claimType === 'TEACHING' ? finalTransportToTeachingOutDate : null,
      transportToTeachingReturnFrom: claimType === 'TEACHING' ? transportToTeachingReturnFrom?.trim() || null : null,
      transportToTeachingReturnTo: claimType === 'TEACHING' ? transportToTeachingReturnTo?.trim() || null : null,
      transportToTeachingDistanceKM: claimType === 'TEACHING' ? calculatedTransportToTeachingDistanceKM : null,
      transportType: claimType === 'TRANSPORTATION' ? specificData.transportType : null,
      transportDestinationTo: claimType === 'TRANSPORTATION' ? specificData.transportDestinationTo : null,
      transportDestinationFrom: claimType === 'TRANSPORTATION' ? specificData.transportDestinationFrom : null,
      transportRegNumber: claimType === 'TRANSPORTATION' ? specificData.transportRegNumber : null,
      transportCubicCapacity: claimType === 'TRANSPORTATION' && specificData.transportCubicCapacity != null ? parseInt(String(specificData.transportCubicCapacity)) : null,
      transportAmount: claimType === 'TRANSPORTATION' && specificData.transportAmount != null ? parseFloat(String(specificData.transportAmount)) : null,
      thesisType: claimType === 'THESIS_PROJECT' ? specificData.thesisType : null,
      thesisSupervisionRank: claimType === 'THESIS_PROJECT' && specificData.thesisType === 'SUPERVISION' ? specificData.thesisSupervisionRank : null,
      thesisExamCourseCode: claimType === 'THESIS_PROJECT' && specificData.thesisType === 'EXAMINATION' ? specificData.thesisExamCourseCode : null,
      thesisExamDate: claimType === 'THESIS_PROJECT' && specificData.thesisType === 'EXAMINATION' ? finalThesisExamDate : null,
    };
    Object.keys(dataForPrisma).forEach(key => { if (dataForPrisma[key] === undefined) dataForPrisma[key] = null; });

    let newClaim;
    if (claimType === 'THESIS_PROJECT' && specificData.thesisType === 'SUPERVISION' && Array.isArray(supervisedStudents) && supervisedStudents.length > 0) {
      const validStudents = supervisedStudents.filter(student => student.studentName?.trim() && student.thesisTitle?.trim());
      if (validStudents.length > 0) {
        newClaim = await prisma.$transaction(async (tx) => {
          const claim = await tx.claim.create({ data: dataForPrisma });
          const studentCreations = validStudents.map(student => tx.supervisedStudent.create({
              data: {
                  studentName: student.studentName.trim(), thesisTitle: student.thesisTitle.trim(),
                  claimId: claim.id, supervisorId: submittedById,
              }
          }));
          await Promise.all(studentCreations);
          return tx.claim.findUnique({ where: { id: claim.id }, include: { supervisedStudents: true } });
        });
      } else { // Create claim without students if no valid students provided
        newClaim = await prisma.claim.create({ data: dataForPrisma });
      }
    } else {
      newClaim = await prisma.claim.create({ data: dataForPrisma });
    }

    console.log(`[${timestamp}] [submitNewClaim] Claim created successfully: ${newClaim.id}`);
    const lecturerClaimsPath = `/lecturer/center/${centerId}/my-claims`;
    const lecturerDashboardPath = `/lecturer/center/${centerId}/dashboard`;
    revalidatePath(lecturerClaimsPath);
    revalidatePath(lecturerDashboardPath);
    if (centerId) {
      revalidatePath(`/coordinator/center/${centerId}/claims`);
      revalidatePath(`/coordinator/center/${centerId}/dashboard`);
      revalidatePath(`/staff_registry/center/${centerId}/claims`);
    }
    revalidatePath(`/registry/claims`); 
    return { success: true, claim: newClaim };
  } catch (error) {
    console.error(`[${timestamp}] [submitNewClaim] Error:`, error.message, error.stack, error.code ? `PrismaCode: ${error.code}` : '', error.meta ? `Meta: ${JSON.stringify(error.meta)}` : '');
    if (error.name === 'PrismaClientValidationError') {
        return { success: false, error: "Invalid data for claim. Check fields." };
    }
    return { success: false, error: "Failed to submit claim. " + (error.message || "Unknown error.") };
  }
}