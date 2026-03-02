// lib/actions/lecturer.actions.js
"use server";
import logger from '@/lib/logger';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
// You need to create this file and implement the Google Maps API call
import { calculateDistanceBetweenLocations } from '@/lib/mapsService'; 

/**
 * Fetches all necessary data for the lecturer's dashboard.
 */
export async function getLecturerDashboardData(lecturerUserId) {

  
  // Auth check
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }
  // Use session userId; only REGISTRY can view other users' data
  const actualUserId = (session.role === 'REGISTRY' || session.role === 'COORDINATOR') ? lecturerUserId : session.userId;
  
  logger.info(` [getLecturerDashboardData] Starting for UserID: ${actualUserId}`);
  
  if (!actualUserId) {
    return { success: false, error: "Lecturer user ID is required." };
  }

  try {
    const lecturer = await prisma.user.findUnique({
      where: { id: actualUserId },
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
        lecturerCourseAssignments: {
          include: {
            course: {
              include: {
                program: {
                  include: {
                    departmentAssignments: {
                      include: {
                        department: {
                          include: {
                            centerAssignments: {
                              include: {
                                center: true
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
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
      logger.info(` [getLecturerDashboardData] Lecturer not found for ID: ${lecturerUserId}`);
      return { success: false, error: "Lecturer profile not found." };
    }
    if (lecturer.role !== 'LECTURER' && lecturer.role !== 'COORDINATOR') { 
      logger.info(` [getLecturerDashboardData] Invalid role: ${lecturer.role} for ID: ${lecturerUserId}`);
      return { success: false, error: "User is not authorized to submit/view claims as a lecturer/coordinator." };
    }

    logger.info(` [getLecturerDashboardData] Processing data for: ${lecturer.email}`);
    
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
      center: lecturer.Center_User_lecturerCenterIdToCenter || 
        (lecturer.lecturerCourseAssignments?.length > 0 ? 
          (() => {
            const deptAssignments = lecturer.lecturerCourseAssignments[0].course.program.departmentAssignments;
            if (deptAssignments?.length > 0) {
              const centerAssignments = deptAssignments[0].department.centerAssignments;
              if (centerAssignments?.length > 0) {
                return {
                  id: centerAssignments[0].center.id,
                  name: centerAssignments[0].center.name
                };
              }
            }
            return null;
          })() : 
          null),
      department: lecturer.Department,
      courseAssignments: lecturer.lecturerCourseAssignments?.map(assignment => {
        const deptAssignment = assignment.course.program.departmentAssignments?.[0];
        const dept = deptAssignment?.department;
        const centerAssignment = dept?.centerAssignments?.[0];
        return {
          id: assignment.id,
          courseId: assignment.course.id,
          courseCode: assignment.course.courseCode,
          courseTitle: assignment.course.courseTitle,
          creditHours: assignment.course.creditHours,
          level: assignment.course.level,
          academicSemester: assignment.course.academicSemester,
          program: assignment.course.program.programTitle,
          department: dept?.name || 'Unknown',
          center: centerAssignment?.center?.name || 'Unknown',
          assignedAt: assignment.assignedAt
        };
      }) || [],
      claims: lecturer.Claim_Claim_submittedByIdToUser.map(claim => ({
        ...claim,
        processedByCoordinator: claim.processedBy?.name, 
        centerName: claim.center?.name 
      })),
    };
    return { success: true, data: formattedData };

  } catch (error) {
    logger.error(`[getLecturerDashboardData] Error fetching data for ${lecturerUserId}:`, error.message, error.stack);
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
  logger.warn("[parseDateToUTC] Invalid dateInput received:", dateInput);
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

// Replace your old submitNewClaim function with this one

export async function submitNewClaim(claimData) {

  
  // Auth check
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }
  if (session.role !== 'LECTURER' && session.role !== 'COORDINATOR') {
    return { success: false, error: "Only lecturers and coordinators can submit claims." };
  }
  
  // CHANGED: Added courseId, removed courseCode and courseTitle from destructuring
  const { 
    submittedById, centerId, claimType, supervisedStudents, 
    teachingDate, teachingStartTime, teachingEndTime, courseId, // <-- MODIFIED HERE
    transportToTeachingInDate, transportToTeachingFrom, transportToTeachingTo,
    transportToTeachingOutDate, transportToTeachingReturnFrom, transportToTeachingReturnTo,
    ...specificData 
  } = claimData;

  // Use session userId instead of client-supplied submittedById
  const actualSubmitterId = session.userId;

  if (!centerId || !claimType) {
    return { success: false, error: "Center ID and Claim Type are required." };
  }

  const finalTeachingDate = parseDateToUTC(teachingDate);
  const finalThesisExamDate = parseDateToUTC(specificData.thesisExamDate);
  const finalTransportToTeachingInDate = parseDateToUTC(transportToTeachingInDate);
  const finalTransportToTeachingOutDate = parseDateToUTC(transportToTeachingOutDate);
  
  let calculatedTeachingHours = null;
  let calculatedTransportToTeachingDistanceKM = null;
  
  // --- NEW: Variables to hold course details ---
  let finalCourseCode = null;
  let finalCourseTitle = null;

  if (claimType === 'TEACHING') {
    // CHANGED: Validation now checks for courseId instead of text fields
    if (!finalTeachingDate || !teachingStartTime || !teachingEndTime) {
      return { success: false, error: "For teaching claims, date, start time, and end time are required." };
    }
    if (!courseId) {
      return { success: false, error: "You must select an assigned course for teaching claims." };
    }
    
    // --- NEW: Look up course details on the server for accuracy ---
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
        return { success: false, error: "Selected course not found in the database. It may have been deleted." };
    }
    finalCourseCode = course.courseCode;
    finalCourseTitle = course.courseTitle;
    // --- End of new server-side lookup ---

    const parsedStartTime = parseTime(teachingStartTime);
    const parsedEndTime = parseTime(teachingEndTime);
    if (finalTeachingDate && parsedStartTime && parsedEndTime) {
      const startDateTime = new Date(finalTeachingDate.getTime()); startDateTime.setUTCHours(parsedStartTime.hours, parsedStartTime.minutes, 0, 0);
      const endDateTime = new Date(finalTeachingDate.getTime()); endDateTime.setUTCHours(parsedEndTime.hours, parsedEndTime.minutes, 0, 0);
      if (endDateTime.getTime() > startDateTime.getTime()) {
        const durationMs = endDateTime.getTime() - startDateTime.getTime();
        calculatedTeachingHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
      } else { return { success: false, error: "Teaching end time must be after start time." }; }
    } else { return { success: false, error: "Invalid start or end time format. Please use HH:MM." }; }

    let distanceToVenue = null;
    let distanceReturn = null;
    if (transportToTeachingFrom?.trim() && transportToTeachingTo?.trim()) {
      distanceToVenue = await calculateDistanceBetweenLocations(transportToTeachingFrom.trim(), transportToTeachingTo.trim());
    }
    if (transportToTeachingReturnFrom?.trim() && transportToTeachingReturnTo?.trim()) {
      distanceReturn = await calculateDistanceBetweenLocations(transportToTeachingReturnFrom.trim(), transportToTeachingReturnTo.trim());
    }
    if (distanceToVenue !== null || distanceReturn !== null) {
      calculatedTransportToTeachingDistanceKM = parseFloat(((distanceToVenue || 0) + (distanceReturn || 0)).toFixed(2));
    }
  }

  try {
    const dataForPrisma = {
      submittedById: actualSubmitterId, centerId, claimType, status: 'PENDING',
      teachingDate: claimType === 'TEACHING' ? finalTeachingDate : null,
      teachingStartTime: claimType === 'TEACHING' ? teachingStartTime : null,
      teachingEndTime: claimType === 'TEACHING' ? teachingEndTime : null,
      teachingHours: claimType === 'TEACHING' ? calculatedTeachingHours : (specificData.teachingHours != null ? parseFloat(specificData.teachingHours) : null),
      // CHANGED: Use the server-verified course details
      courseCode: claimType === 'TEACHING' ? finalCourseCode : null,
      courseTitle: claimType === 'TEACHING' ? finalCourseTitle : null,
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
              claimId: claim.id, supervisorId: actualSubmitterId,
            }
          }));
          await Promise.all(studentCreations);
          return tx.claim.findUnique({ where: { id: claim.id }, include: { supervisedStudents: true } });
        });
      } else {
        newClaim = await prisma.claim.create({ data: dataForPrisma });
      }
    } else {
      newClaim = await prisma.claim.create({ data: dataForPrisma });
    }

    logger.info(` [submitNewClaim] Claim created successfully: ${newClaim.id}`);
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
    logger.error(`[submitNewClaim] Error:`, error.message, error.stack, error.code ? `PrismaCode: ${error.code}` : '', error.meta ? `Meta: ${JSON.stringify(error.meta)}` : '');
    if (error.name === 'PrismaClientValidationError') {
      return { success: false, error: "Invalid data for claim. Check fields." };
    }
    return { success: false, error: "Failed to submit claim. " + (error.message || "Unknown error.") };
  }
}

// Add this new function to lib/actions/lecturer.actions.js

/**
 * Fetches only the courses that are specifically assigned to a given lecturer.
 * @param {string} lecturerId - The ID of the lecturer.
 * @returns {Promise<object>} An object containing an array of assigned courses or an error.
 */
export async function getAssignedCoursesForLecturer(lecturerId) {

  
  // Auth check
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: "Not authenticated." };
  }
  // Use session userId; only REGISTRY/COORDINATOR can view other users' courses
  const actualLecturerId = (session.role === 'REGISTRY' || session.role === 'COORDINATOR') ? lecturerId : session.userId;
  
  logger.info(` [getAssignedCoursesForLecturer] Fetching courses for Lecturer ID: ${actualLecturerId}`);

  if (!actualLecturerId) {
    return { success: false, error: "Lecturer ID is required." };
  }

  try {
    const assignments = await prisma.lecturerCourseAssignment.findMany({
      where: { lecturerId: actualLecturerId },
      include: {
        course: { // Include the full details of the course
          select: {
            id: true,
            courseCode: true,
            courseTitle: true,
          }
        }
      },
      orderBy: {
        course: {
          courseCode: 'asc'
        }
      }
    });

    // Extract just the course data from the assignment records
    const assignedCourses = assignments.map(assignment => assignment.course);

    return { success: true, courses: assignedCourses };
  } catch (error) {
    logger.error(`[getAssignedCoursesForLecturer] Error:`, error);
    return { success: false, error: "Failed to fetch assigned courses." };
  }
}