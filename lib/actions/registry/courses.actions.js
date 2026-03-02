// lib/actions/registry/courses.actions.js
"use server";
import logger from '@/lib/logger';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRegistryAuth } from './auth-helpers';

// NEW ACTION: createCourse
export async function createCourse({ courseCode, courseTitle, creditHours, level, academicSemester, programId }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [createCourse] Code: ${courseCode}, Title: ${courseTitle}, Program: ${programId}`);

  if (!courseCode?.trim() || !courseTitle?.trim() || creditHours == null || !level || !academicSemester || !programId) {
    return { success: false, error: "All course fields (code, title, credit hours, level, semester, program) are required." };
  }

  // Basic enum validation
  const validLevels = ["LEVEL_100", "LEVEL_200", "LEVEL_300", "LEVEL_400", "LEVEL_500", "LEVEL_600"];
  const validSemesters = ["FIRST_SEMESTER", "SECOND_SEMESTER", "THIRD_SEMESTER"];

  if (!validLevels.includes(level)) {
    return { success: false, error: "Invalid course level provided." };
  }
  if (!validSemesters.includes(academicSemester)) {
    return { success: false, error: "Invalid academic semester provided." };
  }
  if (isNaN(parseFloat(creditHours)) || parseFloat(creditHours) <= 0) {
    return { success: false, error: "Credit hours must be a positive number." };
  }

  try {
    // Check if program exists
    const programExists = await prisma.program.findUnique({
      where: { id: programId }, // rawCourse.programId is expected to be the actual ID
      select: { id: true },
    });
    if (!programExists) {
      return { success: false, error: "Specified program not found." };
    }

    const newCourse = await prisma.course.create({
      data: {
        courseCode: courseCode.trim(),
        courseTitle: courseTitle.trim(),
        creditHours: parseFloat(creditHours),
        level: level,
        academicSemester: academicSemester,
        program: { connect: { id: programId } },
      },
      include: {
        program: {
          select: { id: true, programTitle: true, programCode: true, department: { select: { id: true, name: true } } }
        }
      }
    });

    // Update the Excel template file with all current courses
    try {
      // Import server utilities for generating Excel template
      const { generateCourseExcelTemplate } = await import('@/lib/excelUtils');
      
      // Get all courses to update the template
      const allCourses = await prisma.course.findMany({
        include: {
          program: {
            select: { programCode: true }
          }
        },
        orderBy: { courseCode: 'asc' }
      });
      
      // Generate updated Excel template
      await generateCourseExcelTemplate(allCourses);
    } catch (excelError) {
      logger.error(`[createCourse] Error updating Excel template:`, excelError);
      // Continue with the function even if Excel update fails
    }

    revalidatePath('/registry/courses'); // Revalidate the courses management page
    return { success: true, course: newCourse };

  } catch (error) {
    logger.error(`[createCourse] Error:`, error.message, error.stack);
    if (error.code === 'P2002') {
      // Handles the @@unique([courseCode, programId, level, academicSemester]) constraint
      return { success: false, error: `A course with code '${courseCode.trim()}' already exists for this program, level, and semester.` };
    }
    return { success: false, error: `Failed to create course: ${error.message || "Unknown error."}` };
  }
}

// NEW ACTION: getCourses (fetches all courses, useful for listings and assignment)
export async function getCourses({ programId = null, page = 1, pageSize = 100, search = '' } = {}) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  try {
    const where = {};
    if (programId) where.programId = programId;
    if (search) {
      where.OR = [
        { courseCode: { contains: search, mode: 'insensitive' } },
        { courseTitle: { contains: search, mode: 'insensitive' } },
      ];
    }
    const skip = (page - 1) * pageSize;
    
    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
      select: {
        id: true,
        courseCode: true,
        courseTitle: true,
        creditHours: true,
        level: true,
        academicSemester: true,
        programId: true,
        program: {
          select: {
            id: true,
            programCode: true,
            programTitle: true,
            programCategory: true,
            departmentAssignments: {
              select: {
                department: {
                  select: {
                    id: true,
                    name: true,
                    centerAssignments: {
                      select: {
                        center: {
                          select: {
                            id: true,
                            name: true
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
        lecturerAssignments: { // Include assignments to lecturers
          select: {
            lecturer: { select: { id: true, name: true, email: true } }
          }
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { courseCode: 'asc' },
      skip,
      take: pageSize,
    }),
    prisma.course.count({ where }),
    ]);

    const formattedCourses = courses.map(course => {
      // Get all departments assigned to this program
      const departments = course.program?.departmentAssignments?.map(assignment => assignment.department) || [];
      
      // Get all centers from all departments (could be multiple)
      const centers = departments.flatMap(dept => 
        dept.centerAssignments?.map(assignment => assignment.center) || []
      );

      return {
        ...course,
        programCode: course.program?.programCode,
        programTitle: course.program?.programTitle,
        programCategory: course.program?.programCategory,
        departments: departments,
        centers: centers,
        // For backward compatibility, use the first department/center if available
        departmentName: departments[0]?.name || null,
        centerName: centers[0]?.name || null,
        assignedLecturers: course.lecturerAssignments.map(assign => assign.lecturer),
      };
    });

    return { success: true, courses: formattedCourses, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
  } catch (error) {
    logger.error(`[getCourses] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch courses." };
  }
}

export async function updateCourse({ id, courseCode, courseTitle, creditHours, level, academicSemester, programId }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [updateCourse] Action called for ID: ${id}`);

  // --- Validation ---
  if (!id) {
    return { success: false, error: "Course ID is required for an update." };
  }
  if (!courseCode?.trim() || !courseTitle?.trim() || creditHours == null || !level || !academicSemester || !programId) {
    return { success: false, error: "All course fields are required for update." };
  }
  if (isNaN(parseFloat(creditHours)) || parseFloat(creditHours) <= 0) {
    return { success: false, error: "Credit hours must be a positive number." };
  }

  try {
    const updatedCourse = await prisma.course.update({
      where: { id: id },
      data: {
        courseCode: courseCode.trim(),
        courseTitle: courseTitle.trim(),
        creditHours: parseFloat(creditHours),
        level: level,
        academicSemester: academicSemester,
        programId: programId,
      },
      include: {
        program: {
          select: { id: true, programTitle: true, programCode: true, department: { select: { id: true, name: true } } }
        }
      }
    });

    // Update the Excel template file with all current courses
    try {
      // Import server utilities for generating Excel template
      const { generateCourseExcelTemplate } = await import('@/lib/excelUtils');
      
      // Get all courses to update the template
      const allCourses = await prisma.course.findMany({
        include: {
          program: {
            select: { programCode: true }
          }
        },
        orderBy: { courseCode: 'asc' }
      });
      
      // Generate updated Excel template
      await generateCourseExcelTemplate(allCourses);
    } catch (excelError) {
      logger.error(`[updateCourse] Error updating Excel template:`, excelError);
      // Continue with the function even if Excel update fails
    }

    revalidatePath('/registry/courses'); // Adjust path if needed

    logger.info(` [updateCourse] Course updated successfully:`, updatedCourse.courseCode);
    return { success: true, course: updatedCourse };

  } catch (error) {
    logger.error(`[updateCourse] Error:`, error.message, error.stack);
    if (error.code === 'P2002') {
      return { success: false, error: `A course with code '${courseCode.trim()}' already exists for this program, level, and semester.` };
    }
    if (error.code === 'P2025') {
        return { success: false, error: `Course with ID '${id}' not found.` };
    }
    return { success: false, error: `Failed to update course: ${error.message || "Unknown error."}` };
  }
}

export async function deleteCourse(id) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [deleteCourse] Action called for ID:`, id);
  logger.info(` [deleteCourse] ID type:`, typeof id);
  logger.info(` [deleteCourse] ID stringified:`, JSON.stringify(id));

  if (!id) {
    logger.info(` [deleteCourse] ID is falsy, returning error`);
    return { success: false, error: "Course ID is required for deletion." };
  }
  
  // Extract string ID if object was passed
  const courseId = typeof id === 'object' && id !== null ? id.id : id;

  try {
    // First, find the course to get its information for logging
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { 
        program: { select: { programTitle: true } } 
      }
    });

    if (!course) {
      return { success: false, error: "Course not found." };
    }

    // Check if the course has any existing assignments to lecturers
    const assignments = await prisma.lecturerCourseAssignment.findMany({
      where: { courseId },
      select: { lecturerId: true }
    });

    if (assignments.length > 0) {
      return { 
        success: false, 
        error: "Cannot delete this course because it's assigned to lecturers. Please remove all assignments first." 
      };
    }

    // Delete the course
    await prisma.course.delete({
      where: { id: courseId }
    });

    // Update the Excel template file after deletion
    try {
      // Import server utilities for generating Excel template
      const { generateCourseExcelTemplate } = await import('@/lib/excelUtils');
      
      // Get all courses to update the template
      const allCourses = await prisma.course.findMany({
        include: {
          program: {
            select: { programCode: true }
          }
        },
        orderBy: { courseCode: 'asc' }
      });
      
      // Generate updated Excel template
      await generateCourseExcelTemplate(allCourses);
    } catch (excelError) {
      logger.error(`[deleteCourse] Error updating Excel template:`, excelError);
      // Continue with the function even if Excel update fails
    }

    revalidatePath('/registry/courses');

    logger.info(` [deleteCourse] Successfully deleted course: ${course.courseCode} - ${course.courseTitle}`);
    const result = { 
      success: true, 
      message: `Successfully deleted course: ${course.courseCode} - ${course.courseTitle}` 
    };
    logger.info(` [deleteCourse] Returning success result:`, result);
    return result;

  } catch (error) {
    logger.error(`[deleteCourse] Error:`, error.message, error.stack);
    
    // Handle foreign key constraint violations
    if (error.code === 'P2003') {
      return { 
        success: false, 
        error: "Cannot delete this course because it is referenced by other records in the system." 
      };
    }
    
    const errorResult = { success: false, error: `Failed to delete course: ${error.message || "Unknown error."}` };
    logger.info(` [deleteCourse] Returning error result:`, errorResult);
    return errorResult;
  }
}

// NEW ACTION: bulkUploadCourses
// This action will receive an array of validated course data objects from the frontend.
// The frontend will be responsible for parsing the Excel file and performing initial data validation.
export async function bulkUploadCourses(courseDataArray) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };


  if (!Array.isArray(courseDataArray) || courseDataArray.length === 0) {
    return { success: false, error: "No course data provided for bulk upload." };
  }

  const createdRecords = [];
  const failedRecords = [];
  const validLevels = ["LEVEL_100", "LEVEL_200", "LEVEL_300", "LEVEL_400", "LEVEL_500", "LEVEL_600"];
  const validSemesters = ["FIRST_SEMESTER", "SECOND_SEMESTER", "THIRD_SEMESTER"];

  // ──── Batch: resolve all unique program codes in one query ────
  const uniqueProgramCodes = [...new Set(courseDataArray.map(c => c.programCode).filter(Boolean))];
  const programs = await prisma.program.findMany({
    where: { programCode: { in: uniqueProgramCodes } },
    select: { id: true, programCode: true },
  });
  const programCodeToId = Object.fromEntries(programs.map(p => [p.programCode, p.id]));

  // ──── Validate before touching the DB ────
  const validCoursesToCreate = [];

  for (const rawCourse of courseDataArray) {
    if (!rawCourse.courseCode?.trim() || !rawCourse.courseTitle?.trim() || rawCourse.creditHours == null || !rawCourse.level || !rawCourse.academicSemester || !rawCourse.programCode) {
      failedRecords.push({ data: rawCourse, error: "Missing/invalid required field (code, title, credits, level, semester, programCode)." });
      continue;
    }
    if (!validLevels.includes(rawCourse.level)) {
      failedRecords.push({ data: rawCourse, error: `Invalid level '${rawCourse.level}'.` });
      continue;
    }
    if (!validSemesters.includes(rawCourse.academicSemester)) {
      failedRecords.push({ data: rawCourse, error: `Invalid semester '${rawCourse.academicSemester}'.` });
      continue;
    }
    if (isNaN(parseFloat(rawCourse.creditHours)) || parseFloat(rawCourse.creditHours) <= 0) {
      failedRecords.push({ data: rawCourse, error: "Credit hours must be a positive number." });
      continue;
    }
    const programId = programCodeToId[rawCourse.programCode];
    if (!programId) {
      failedRecords.push({ data: rawCourse, error: `Program '${rawCourse.programCode}' not found.` });
      continue;
    }
    validCoursesToCreate.push({
      courseCode: rawCourse.courseCode.trim(),
      courseTitle: rawCourse.courseTitle.trim(),
      creditHours: parseFloat(rawCourse.creditHours),
      level: rawCourse.level,
      academicSemester: rawCourse.academicSemester,
      programId,
      _raw: rawCourse,
    });
  }

  // ──── Batch create valid courses in a transaction ────
  if (validCoursesToCreate.length > 0) {
    try {
      await prisma.$transaction(async (tx) => {
        for (const course of validCoursesToCreate) {
          try {
            const created = await tx.course.create({
              data: {
                courseCode: course.courseCode,
                courseTitle: course.courseTitle,
                creditHours: course.creditHours,
                level: course.level,
                academicSemester: course.academicSemester,
                programId: course.programId,
              },
            });
            createdRecords.push(created);
          } catch (error) {
            let errorMessage = error.code === 'P2002'
              ? `Duplicate course entry (${course.courseCode}).`
              : `Error: ${error.message}`;
            failedRecords.push({ data: course._raw, error: errorMessage });
          }
        }
      });
    } catch (txError) {
      logger.error(`[bulkUploadCourses] Transaction error:`, txError.message);
    }
  }

  // Update the Excel template file with all current courses after bulk upload
  try {
    // Import server utilities for generating Excel template
    const { generateCourseExcelTemplate } = await import('@/lib/excelUtils');
    
    // Get all courses to update the template
    const allCourses = await prisma.course.findMany({
      include: {
        program: {
          select: { programCode: true }
        }
      },
      orderBy: { courseCode: 'asc' }
    });
    
    // Generate updated Excel template
    await generateCourseExcelTemplate(allCourses);
  } catch (excelError) {
    logger.error(`[bulkUploadCourses] Error updating Excel template:`, excelError);
    // Continue with the function even if Excel update fails
  }

  revalidatePath('/registry/courses'); // Revalidate the courses management page

  return {
    success: failedRecords.length === 0,
    message: `${createdRecords.length} course(s) created. ${failedRecords.length} failed.`,
    createdCount: createdRecords.length,
    failedCount: failedRecords.length,
    failedRecords: failedRecords, // Return details for failed records
  };
}

// NEW ACTION: getLecturersForAssignment (fetches lecturers and coordinators for assignment dropdowns)
export async function getLecturersForAssignment(departmentId = null) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [getLecturersForAssignment] Action called. Filter by departmentId: ${departmentId}`);
  try {
    // Include both lecturers and coordinators as they both can be assigned courses
    const whereClause = {
      role: { in: ['LECTURER', 'COORDINATOR'] },
    };
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    const lecturers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        designation: true,
        role: true, // Include role to distinguish between lecturers and coordinators
        Department: { select: { name: true } }, // Corrected: Capital 'D' for relation
        lecturerCenterId: true,
        Center_User_lecturerCenterIdToCenter: { select: { name: true } },
        Center_Center_coordinatorIdToUser: { select: { name: true } }, // Include center if user is a coordinator
      },
      orderBy: { name: 'asc' },
    });

    const formattedLecturers = lecturers.map(l => {
      // Determine the center name based on whether the user is a lecturer or coordinator
      let centerName = l.Center_User_lecturerCenterIdToCenter?.name;
      
      // If user is a coordinator, get the center name from the coordinator relation
      if (l.role === 'COORDINATOR') {
        centerName = l.Center_Center_coordinatorIdToUser?.name || centerName;
      }
      
      return {
        ...l,
        departmentName: l.Department?.name,
        centerName: centerName,
        // Include a user-friendly display of role for UI
        roleDisplay: l.role === 'COORDINATOR' ? 'Coordinator' : 'Lecturer'
      };
    });

    return { success: true, lecturers: formattedLecturers };
  } catch (error) {
    logger.error(`[getLecturersForAssignment] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch lecturers for assignment." };
  }
}

// NEW ACTION: assignCoursesToLecturers
export async function assignCoursesToLecturers({ courseIds, lecturerId }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [assignCoursesToLecturers] Course IDs: ${courseIds}, Lecturer/Coordinator ID: ${lecturerId}`);

  if (!Array.isArray(courseIds) || courseIds.length === 0 || !lecturerId) {
    return { success: false, error: "Course IDs and Lecturer/Coordinator ID are required for assignment." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: lecturerId },
      select: { id: true, role: true, name: true },
    });
    if (!user || (user.role !== 'LECTURER' && user.role !== 'COORDINATOR')) {
      return { success: false, error: "Invalid user selected. User must have either 'LECTURER' or 'COORDINATOR' role." };
    }

    // Check if all courseIds exist
    const existingCourses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true },
    });
    if (existingCourses.length !== courseIds.length) {
      const foundIds = new Set(existingCourses.map(c => c.id));
      const missingIds = courseIds.filter(id => !foundIds.has(id));
      return { success: false, error: `One or more courses not found: ${missingIds.join(', ')}` };
    }

    // Create assignments in a transaction
    const assignmentsToCreate = courseIds.map(courseId => ({
      lecturerId: lecturerId,
      courseId: courseId,
    }));

    const result = await prisma.lecturerCourseAssignment.createMany({
      data: assignmentsToCreate,
      skipDuplicates: true, // Prevents error if assigning same lecturer to same course twice
    });

    revalidatePath('/registry/courses'); // Revalidate courses page to show new assignments
    // Potentially revalidate lecturer's dashboard if it shows their assigned courses
    revalidatePath(`/lecturer/dashboard`);

    return {
      success: true,
      message: `Successfully assigned ${result.count} course(s) to ${user.name} (${user.role === 'COORDINATOR' ? 'Coordinator' : 'Lecturer'}).`,
      assignedCount: result.count,
    };

  } catch (error) {
    logger.error(`[assignCoursesToLecturers] Error:`, error.message, error.stack);
    if (error.code === 'P2002' && error.meta?.target?.includes('lecturerId_courseId')) {
      return { success: false, error: "Some courses are already assigned to this lecturer." };
    }
    return { success: false, error: `Failed to assign courses: ${error.message || "Unknown error."}` };
  }
}

// Function to unassign a course from all lecturers
export async function unassignCourseFromLecturers(courseId) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [unassignCourseFromLecturers] Action called for courseId:`, courseId);
  
  if (!courseId) {
    return { success: false, error: "Course ID is required." };
  }
  
  // Extract string ID if object was passed
  const id = typeof courseId === 'object' && courseId !== null ? courseId.id : courseId;
  
  try {
    // Find all assignments for this course
    const assignments = await prisma.lecturerCourseAssignment.findMany({
      where: { courseId: id },
      include: {
        lecturer: { select: { name: true, email: true } },
        course: { select: { courseCode: true, courseTitle: true } }
      }
    });
    
    if (assignments.length === 0) {
      return { success: true, message: "Course is not assigned to any lecturers.", unassignedCount: 0 };
    }
    
    // Delete all assignments for this course
    const deleteResult = await prisma.lecturerCourseAssignment.deleteMany({
      where: { courseId: id }
    });
    
    logger.info(` [unassignCourseFromLecturers] Successfully unassigned course from ${deleteResult.count} lecturers`);
    
    return { 
      success: true, 
      message: `Successfully unassigned course from ${deleteResult.count} lecturers`, 
      unassignedCount: deleteResult.count,
      unassignedFrom: assignments.map(a => ({ id: a.lecturerId, name: a.lecturer.name }))
    };
    
  } catch (error) {
    logger.error(`[unassignCourseFromLecturers] Error:`, error.message, error.stack);
    return { success: false, error: `Failed to unassign course: ${error.message || "Unknown error"}` };
  }
}

// Function to unassign specific courses from a specific lecturer
export async function unassignCoursesFromLecturer({ courseIds, lecturerId }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [unassignCoursesFromLecturer] Course IDs: ${courseIds}, Lecturer ID: ${lecturerId}`);

  if (!Array.isArray(courseIds) || courseIds.length === 0 || !lecturerId) {
    return { success: false, error: "Course IDs and Lecturer ID are required for unassignment." };
  }

  try {
    // Verify the lecturer exists
    const user = await prisma.user.findUnique({
      where: { id: lecturerId },
      select: { id: true, name: true, role: true }
    });

    if (!user) {
      return { success: false, error: "Lecturer not found." };
    }

    if (user.role !== 'LECTURER' && user.role !== 'COORDINATOR') {
      return { success: false, error: "User must be a Lecturer or Coordinator to have course assignments." };
    }

    // Find existing assignments to be removed
    const existingAssignments = await prisma.lecturerCourseAssignment.findMany({
      where: {
        lecturerId: lecturerId,
        courseId: { in: courseIds }
      },
      include: {
        course: { select: { courseCode: true, courseTitle: true } }
      }
    });

    if (existingAssignments.length === 0) {
      return { success: true, message: "No matching course assignments found to unassign.", unassignedCount: 0 };
    }

    // Delete the assignments
    const deleteResult = await prisma.lecturerCourseAssignment.deleteMany({
      where: {
        lecturerId: lecturerId,
        courseId: { in: courseIds }
      }
    });

    // Revalidate relevant paths
    revalidatePath('/registry/courses');
    revalidatePath('/coordinator');
    revalidatePath('/lecturer');

    logger.info(` [unassignCoursesFromLecturer] Successfully unassigned ${deleteResult.count} courses from ${user.name}`);

    return { 
      success: true, 
      message: `Successfully unassigned ${deleteResult.count} courses from ${user.name}`, 
      unassignedCount: deleteResult.count,
      unassignedCourses: existingAssignments.map(a => ({ 
        id: a.courseId, 
        code: a.course.courseCode, 
        title: a.course.courseTitle 
      }))
    };

  } catch (error) {
    logger.error(`[unassignCoursesFromLecturer] Error:`, error.message, error.stack);
    return { success: false, error: `Failed to unassign courses: ${error.message || "Unknown error"}` };
  }
}
