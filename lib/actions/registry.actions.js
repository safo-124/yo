// lib/actions/registry.actions.js
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getPotentialCoordinators() {
  const timestamp = new Date().toISOString();
  // console.log(`[${timestamp}] [getPotentialCoordinators] Action called (strict coordinator role).`);
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'COORDINATOR',
        Center_Center_coordinatorIdToUser: null,
      },
      select: {
        id: true, name: true, email: true, role: true, designation: true,
      },
      orderBy: { name: 'asc' },
    });
    return { success: true, users: users };
  } catch (error) {
    console.error(`[${timestamp}] [getPotentialCoordinators] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch potential coordinators." };
  }
}

export async function createCenter({ name, coordinatorId }) {
  const timestamp = new Date().toISOString();
  // console.log(`[${timestamp}] [createCenter] Name: ${name}, CoordinatorID: ${coordinatorId}`);
  if (!name || !name.trim() || !coordinatorId) {
    return { success: false, error: "Center name and Coordinator ID are required." };
  }
  try {
    const coordinator = await prisma.user.findUnique({
      where: { id: coordinatorId },
      select: { id: true, name: true, email: true, role: true }
    });
    if (!coordinator) return { success: false, error: "Selected coordinator not found." };
    if (['REGISTRY', 'STAFF_REGISTRY'].includes(coordinator.role)) {
      return { success: false, error: "Registry/Staff Registry members cannot be direct center coordinators." };
    }
    const existingCenterForCoordinator = await prisma.center.findUnique({ where: { coordinatorId } });
    if (existingCenterForCoordinator) {
      return { success: false, error: `User ${coordinator.name || coordinator.email} is already coordinating center: ${existingCenterForCoordinator.name}.` };
    }
    const newCenter = await prisma.$transaction(async (tx) => {
      if (coordinator.role !== 'COORDINATOR') {
        await tx.user.update({
          where: { id: coordinatorId },
          data: { role: 'COORDINATOR', lecturerCenterId: null, departmentId: null },
        });
      }
      return tx.center.create({
        data: { name: name.trim(), coordinator: { connect: { id: coordinatorId } } },
        include: { coordinator: { select: { id: true, name: true, email: true, role: true, designation: true } } }
      });
    });
    revalidatePath('/registry/centers'); revalidatePath('/registry/users');
    return { success: true, center: newCenter };
  } catch (error) {
    console.error(`[${timestamp}] [createCenter] Error:`, error.message, error.stack);
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('name')) return { success: false, error: "A center with this name already exists." };
      if (error.meta?.target?.includes('coordinatorId')) return { success: false, error: "This user is already a coordinator." };
    }
    return { success: false, error: "Failed to create center." };
  }
}

export async function getCenters() {
  const timestamp = new Date().toISOString();
  try {
    const centers = await prisma.center.findMany({
      include: {
        coordinator: { select: { id: true, name: true, email: true, role: true, designation: true } },
        _count: { select: { lecturers: true, departments: true, claims: true, staffRegistryAssignments: true } }
      },
      orderBy: { name: 'asc' },
    });
    const formattedCenters = centers.map(c => ({
        ...c,
        lecturerCount: c._count?.lecturers || 0,
        departmentCount: c._count?.departments || 0,
        claimsCount: c._count?.claims || 0,
        staffRegistryCount: c._count?.staffRegistryAssignments || 0,
    }));
    console.log(`[${timestamp}] [getCenters] Fetched ${formattedCenters.length} centers. Data:`, formattedCenters); // DEBUG LOG
    return { success: true, centers: formattedCenters };
  } catch (error) {
    console.error(`[${timestamp}] [getCenters] Error:`, error.message, error.stack); // DEBUG LOG
    return { success: false, error: "Failed to fetch centers." };
  }
}

export async function createUserByRegistry({ name, email, password, role, designation, lecturerCenterId, departmentId, bankName, bankBranch, accountName, accountNumber, phoneNumber }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [createUserByRegistry] Action called with data:`, { name, email, role, designation, lecturerCenterId, departmentId, bankName, bankBranch, accountName, accountNumber, phoneNumber }); // DEBUG LOG

  if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
    return { success: false, error: "Name, email, password, and role are required." };
  }
  if (!['LECTURER', 'COORDINATOR', 'STAFF_REGISTRY', 'REGISTRY'].includes(role)) {
    return { success: false, error: "Invalid role specified." };
  }
  if (password.trim().length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }
  if (role === 'LECTURER' && !lecturerCenterId) {
    return { success: false, error: "Lecturer role requires assignment to a Center." };
  }
  if (role === 'LECTURER') {
    if (!bankName?.trim() || !bankBranch?.trim() || !accountName?.trim() || !accountNumber?.trim() || !phoneNumber?.trim()) {
      return { success: false, error: "For lecturer role, bank details (name, branch, account name, account number) and phone number are required." };
    }
  }

  if (role !== 'LECTURER') {
    lecturerCenterId = null; departmentId = null;
    bankName = null; bankBranch = null; accountName = null; accountNumber = null; phoneNumber = null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) return { success: false, error: "User with this email already exists." };
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const userData = {
      name: name.trim(), email: normalizedEmail, password: hashedPassword, role,
      designation: designation || null,
      lecturerCenterId: lecturerCenterId, departmentId: departmentId,
      bankName: bankName?.trim() || null,
      bankBranch: bankBranch?.trim() || null,
      accountName: accountName?.trim() || null,
      accountNumber: accountNumber?.trim() || null,
      phoneNumber: phoneNumber?.trim() || null,
    };
    const createdUser = await prisma.user.create({
      data: userData,
      select: {
          id: true, name: true, email: true, role: true, designation: true,
          lecturerCenterId: true, departmentId: true, createdAt: true,
          bankName: true, bankBranch: true, accountName: true, accountNumber: true, phoneNumber: true,
          Center_User_lecturerCenterIdToCenter: { select: { name: true } },
          Center_Center_coordinatorIdToUser: { select: { name: true } },
          Department: {select: {name: true}},
          staffRegistryCenterAssignments: { select: { center: { select: { id: true, name: true }}}}
       }
    });
    const userToReturn = {
      ...createdUser,
      lecturerCenterName: createdUser.Center_User_lecturerCenterIdToCenter?.name,
      coordinatedCenterName: createdUser.Center_Center_coordinatorIdToUser?.name,
      departmentName: createdUser.Department?.name,
      staffRegistryAssignedCenterNames: [],
      staffRegistryAssignedCentersData: [],
    };
    revalidatePath('/registry/users');
    console.log(`[${timestamp}] [createUserByRegistry] User created successfully:`, userToReturn); // DEBUG LOG
    return { success: true, user: userToReturn };
  } catch (error) {
    console.error(`[${timestamp}] [createUserByRegistry] Error caught in action:`, error.message, error.stack); // DEBUG LOG
    if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) return { success: false, error: "User with this email already exists (DB constraint)." };
        if (error.meta?.target?.includes('accountNumber')) return { success: false, error: "A user with this bank account number already exists." };
    }
    if (error.message.includes("Argument `designation` is invalid") || error.message.includes("for the enum `Designation`")) {
        return { success: false, error: "Invalid designation value provided."};
    }
    return { success: false, error: `Failed to create user: ${error.message || "Unknown error"}` };
  }
}

export async function getAllUsers() {
  const timestamp = new Date().toISOString();
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, designation: true,
        lecturerCenterId: true, departmentId: true,
        bankName: true, bankBranch: true, accountName: true, accountNumber: true, phoneNumber: true,
        Center_Center_coordinatorIdToUser: { select: { id: true, name: true } },
        Center_User_lecturerCenterIdToCenter: { select: { id: true, name: true } },
        Department: { select: { id: true, name: true } },
        staffRegistryCenterAssignments: {
          select: { center: {select : {id: true, name: true}}}
        },
        createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    const formattedUsers = users.map(user => ({
      ...user,
      coordinatedCenterName: user.Center_Center_coordinatorIdToUser?.name,
      lecturerCenterName: user.Center_User_lecturerCenterIdToCenter?.name,
      departmentName: user.Department?.name,
      staffRegistryAssignedCenterNames: user.staffRegistryCenterAssignments?.map(a => a.center?.name).filter(Boolean) || [],
      staffRegistryAssignedCentersData: user.staffRegistryCenterAssignments?.map(a => a.center ? {id: a.center.id, name: a.center.name} : null).filter(Boolean) || [],
    }));
    return { success: true, users: formattedUsers };
  } catch (error) {
    console.error(`[${timestamp}] [getAllUsers] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch users." };
  }
}

export async function updateUserRoleAndAssignmentsByRegistry({
  userId, newRole, newDesignation, newCenterId, newDepartmentId, newStaffRegistryCenterIds,
  newBankName, newBankBranch, newAccountName, newAccountNumber, newPhoneNumber
}) {
  const timestamp = new Date().toISOString();
  if (!userId || !newRole) return { success: false, error: "User ID and new role are required." };
  if (!['COORDINATOR', 'LECTURER', 'REGISTRY', 'STAFF_REGISTRY'].includes(newRole)) return { success: false, error: "Invalid role." };

  try {
    const userToUpdate = await prisma.user.findUnique({
        where: { id: userId },
        include: { Center_Center_coordinatorIdToUser: { select: { id: true } } }
    });
    if (!userToUpdate) return { success: false, error: "User not found." };
    if (userToUpdate.role === 'REGISTRY' && newRole !== 'REGISTRY') return { success: false, error: "Cannot change REGISTRY role."};

    const updateData = {
        role: newRole, designation: newDesignation || null,
        lecturerCenterId: null, departmentId: null,
        bankName: newBankName?.trim() || null,
        bankBranch: newBankBranch?.trim() || null,
        accountName: newAccountName?.trim() || null,
        accountNumber: newAccountNumber?.trim() || null,
        phoneNumber: newPhoneNumber?.trim() || null,
    };
    let centerToUnassignCoordinatorFrom = null;

    if (userToUpdate.role === 'COORDINATOR' && userToUpdate.Center_Center_coordinatorIdToUser && newRole !== 'COORDINATOR') {
        centerToUnassignCoordinatorFrom = userToUpdate.Center_Center_coordinatorIdToUser.id;
    }
    if (newRole === 'LECTURER') {
      if (!newCenterId) return { success: false, error: "Lecturer role requires a Center assignment." };
      updateData.lecturerCenterId = newCenterId;
      updateData.departmentId = newDepartmentId || null;
      if (!newBankName?.trim() || !newBankBranch?.trim() || !newAccountName?.trim() || !newAccountNumber?.trim() || !newPhoneNumber?.trim()) {
        return { success: false, error: "For lecturer role, bank details and phone number are required." };
      }
    } else {
        updateData.bankName = null;
        updateData.bankBranch = null;
        updateData.accountName = null;
        updateData.accountNumber = null;
        updateData.phoneNumber = null;
    }


    await prisma.$transaction(async (tx) => {
      if (centerToUnassignCoordinatorFrom) {
        await tx.center.update({ where: { id: centerToUnassignCoordinatorFrom }, data: { coordinatorId: null } });
      }
      if ((userToUpdate.role === 'STAFF_REGISTRY' && newRole !== 'STAFF_REGISTRY') || (newRole === 'STAFF_REGISTRY' && Array.isArray(newStaffRegistryCenterIds))) {
        await tx.staffRegistryCenterAssignment.deleteMany({ where: { userId: userId } });
      }
      await tx.user.update({ where: { id: userId }, data: updateData });
      if (newRole === 'STAFF_REGISTRY' && Array.isArray(newStaffRegistryCenterIds) && newStaffRegistryCenterIds.length > 0) {
        await tx.staffRegistryCenterAssignment.createMany({
          data: newStaffRegistryCenterIds.map(centerIdToAssign => ({ userId: userId, centerId: centerIdToAssign })),
          skipDuplicates: true,
        });
      }
    });

    const finalUser = await prisma.user.findUnique({
        where: {id: userId },
        select: {
            id: true, name: true, email: true, role: true, designation: true,
            lecturerCenterId: true, Center_User_lecturerCenterIdToCenter: { select: { id: true, name: true } },
            departmentId: true, Department: { select: {id: true, name: true}},
            bankName: true, bankBranch: true, accountName: true, accountNumber: true, phoneNumber: true,
            Center_Center_coordinatorIdToUser: { select: { id: true, name: true } },
            staffRegistryCenterAssignments: { select: { center: {select : {id: true, name: true}}}}
        }
    });
    const userToReturn = {
        ...finalUser,
        lecturerCenterName: finalUser.Center_User_lecturerCenterIdToCenter?.name,
        coordinatedCenterName: finalUser.Center_Center_coordinatorIdToUser?.name,
        departmentName: finalUser.Department?.name,
        staffRegistryAssignedCenterNames: finalUser.staffRegistryCenterAssignments?.map(a => a.center?.name).filter(Boolean) || [],
        staffRegistryAssignedCentersData: finalUser.staffRegistryCenterAssignments?.map(a => a.center ? {id: a.center.id, name: a.center.name} : null).filter(Boolean) || [],
    };
    revalidatePath('/registry/users'); revalidatePath('/registry/centers');
    return { success: true, user: userToReturn };
  } catch (error) {
    console.error(`[${timestamp}] [updateUserRoleAndAssignmentsByRegistry] Error:`, error.message, error.stack);
    if (error.code === 'P2002') {
        if (error.meta?.target?.includes('userId_centerId')) return { success: false, error: "Failed to update staff center assignments due to a conflict."};
        if (error.meta?.target?.includes('accountNumber')) return { success: false, error: "Another user already has this bank account number." };
    }
    if (error.message.includes("value for field `designation`") || error.message.includes("for the enum `Designation`")) {
        return { success: false, error: "Invalid designation value provided."};
    }
    return { success: false, error: "Failed to update user." };
  }
}

// NEW ACTION: createProgram
export async function createProgram({ programCode, programTitle, programCategory, departmentId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [createProgram] Code: ${programCode}, Title: ${programTitle}, Category: ${programCategory}, Dept: ${departmentId}`);

  if (!programCode?.trim() || !programTitle?.trim() || !programCategory || !departmentId) {
    return { success: false, error: "All program fields (code, title, category, department) are required." };
  }

  // Basic validation for enum values
  const validProgramCategories = ["DIPLOMA", "UNDERGRADUATE", "POSTGRADUATE"];
  if (!validProgramCategories.includes(programCategory)) {
    return { success: false, error: "Invalid program category provided." };
  }

  try {
    // Check if department exists
    const departmentExists = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true },
    });
    if (!departmentExists) {
      return { success: false, error: "Specified department not found." };
    }

    const newProgram = await prisma.program.create({
      data: {
        programCode: programCode.trim(),
        programTitle: programTitle.trim(),
        programCategory: programCategory,
        department: { connect: { id: departmentId } },
      },
      include: {
        department: {
          select: { id: true, name: true, center: { select: { id: true, name: true } } }
        }
      }
    });

    revalidatePath('/registry/programs'); // New path for programs management (if applicable)
    revalidatePath('/registry/courses'); // Courses page lists programs
    return { success: true, program: newProgram };

  } catch (error) {
    console.error(`[${timestamp}] [createProgram] Error:`, error.message, error.stack);
    if (error.code === 'P2002') {
      // Handles the @@unique([programCode, departmentId]) constraint in schema.prisma
      return { success: false, error: `A program with code '${programCode.trim()}' already exists in this department.` };
    }
    return { success: false, error: `Failed to create program: ${error.message || "Unknown error."}` };
  }
}


// NEW ACTION: getPrograms (with optional department filter)
export async function getPrograms(departmentId = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getPrograms] Action called. Filter by departmentId: ${departmentId}`);

  try {
    const programs = await prisma.program.findMany({
      where: departmentId ? { departmentId: departmentId } : {},
      select: {
        id: true,
        programCode: true,
        programTitle: true,
        programCategory: true,
        departmentId: true,
        department: { select: { id: true, name: true, center: { select: { id: true, name: true } } } },
        _count: { select: { courses: true } },
      },
      orderBy: { programTitle: 'asc' },
    });

    const formattedPrograms = programs.map(p => ({
      ...p,
      departmentName: p.department?.name,
      centerName: p.department?.center?.name,
      courseCount: p._count.courses,
    }));

    return { success: true, programs: formattedPrograms };

  } catch (error) {
    console.error(`[${timestamp}] [getPrograms] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch programs." };
  }
}


// NEW ACTION: createCourse
export async function createCourse({ courseCode, courseTitle, creditHours, level, academicSemester, programId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [createCourse] Code: ${courseCode}, Title: ${courseTitle}, Program: ${programId}`);

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

    revalidatePath('/registry/courses'); // Revalidate the courses management page
    return { success: true, course: newCourse };

  } catch (error) {
    console.error(`[${timestamp}] [createCourse] Error:`, error.message, error.stack);
    if (error.code === 'P2002') {
      // Handles the @@unique([courseCode, programId, level, academicSemester]) constraint
      return { success: false, error: `A course with code '${courseCode.trim()}' already exists for this program, level, and semester.` };
    }
    return { success: false, error: `Failed to create course: ${error.message || "Unknown error."}` };
  }
}

// NEW ACTION: getCourses (fetches all courses, useful for listings and assignment)
export async function getCourses(programId = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getCourses] Action called. Filter by programId: ${programId}`);
  try {
    const courses = await prisma.course.findMany({
      where: programId ? { programId: programId } : {},
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
            id: true, programCode: true, programTitle: true,
            department: { select: { id: true, name: true, center: { select: { id: true, name: true } } } }
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
    });

    const formattedCourses = courses.map(course => ({
      ...course,
      programCode: course.program?.programCode,
      programTitle: course.program?.programTitle,
      departmentName: course.program?.department?.name,
      centerName: course.program?.department?.center?.name,
      assignedLecturers: course.lecturerAssignments.map(assign => assign.lecturer),
    }));

    return { success: true, courses: formattedCourses };
  } catch (error) {
    console.error(`[${timestamp}] [getCourses] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch courses." };
  }
}

// NEW ACTION: getLecturersForAssignment (fetches only lecturers for assignment dropdowns)
export async function getLecturersForAssignment(departmentId = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getLecturersForAssignment] Action called. Filter by departmentId: ${departmentId}`);
  try {
    const whereClause = {
      role: 'LECTURER',
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
        Department: { select: { name: true } }, // Corrected: Capital 'D' for relation
        lecturerCenterId: true,
        Center_User_lecturerCenterIdToCenter: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });

    const formattedLecturers = lecturers.map(l => ({
      ...l,
      departmentName: l.Department?.name, // Corrected: Capital 'D' for relation
      centerName: l.Center_User_lecturerCenterIdToCenter?.name,
    }));

    return { success: true, lecturers: formattedLecturers };
  } catch (error) {
    console.error(`[${timestamp}] [getLecturersForAssignment] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch lecturers for assignment." };
  }
}

// NEW ACTION: assignCoursesToLecturers
export async function assignCoursesToLecturers({ courseIds, lecturerId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [assignCoursesToLecturers] Course IDs: ${courseIds}, Lecturer ID: ${lecturerId}`);

  if (!Array.isArray(courseIds) || courseIds.length === 0 || !lecturerId) {
    return { success: false, error: "Course IDs and Lecturer ID are required for assignment." };
  }

  try {
    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId },
      select: { id: true, role: true, name: true },
    });
    if (!lecturer || lecturer.role !== 'LECTURER') {
      return { success: false, error: "Invalid lecturer selected. User must have 'LECTURER' role." };
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
      message: `Successfully assigned ${result.count} course(s) to ${lecturer.name}.`,
      assignedCount: result.count,
    };

  } catch (error) {
    console.error(`[${timestamp}] [assignCoursesToLecturers] Error:`, error.message, error.stack);
    if (error.code === 'P2002' && error.meta?.target?.includes('lecturerId_courseId')) {
      return { success: false, error: "Some courses are already assigned to this lecturer." };
    }
    return { success: false, error: `Failed to assign courses: ${error.message || "Unknown error."}` };
  }
}


// NEW ACTION: bulkUploadCourses
// This action will receive an array of validated course data objects from the frontend.
// The frontend will be responsible for parsing the Excel file and performing initial data validation.
export async function bulkUploadCourses(courseDataArray) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [bulkUploadCourses] Received ${courseDataArray.length} course records.`);

  if (!Array.isArray(courseDataArray) || courseDataArray.length === 0) {
    return { success: false, error: "No course data provided for bulk upload." };
  }

  const createdRecords = [];
  const failedRecords = [];

  for (const rawCourse of courseDataArray) {
    try {
      // Basic validation matching createCourse requirements
      if (!rawCourse.courseCode?.trim() || !rawCourse.courseTitle?.trim() || rawCourse.creditHours == null || !rawCourse.level || !rawCourse.academicSemester || !rawCourse.programCode) {
        failedRecords.push({ data: rawCourse, error: "Missing/invalid required field (code, title, credits, level, semester, programId)." });
        continue;
      }

      const validLevels = ["LEVEL_100", "LEVEL_200", "LEVEL_300", "LEVEL_400", "LEVEL_500", "LEVEL_600"];
      const validSemesters = ["FIRST_SEMESTER", "SECOND_SEMESTER", "THIRD_SEMESTER"];

      if (!validLevels.includes(rawCourse.level)) {
        failedRecords.push({ data: rawCourse, error: `Invalid level '${rawCourse.level}'. Must be one of: ${validLevels.join(', ')}` });
        continue;
      }
      if (!validSemesters.includes(rawCourse.academicSemester)) {
        failedRecords.push({ data: rawCourse, error: `Invalid semester '${rawCourse.academicSemester}'. Must be one of: ${validSemesters.join(', ')}` });
        continue;
      }
      if (isNaN(parseFloat(rawCourse.creditHours)) || parseFloat(rawCourse.creditHours) <= 0) {
        failedRecords.push({ data: rawCourse, error: "Credit hours must be a positive number." });
        continue;
      }

      // Resolve programId from programCode
      const program = await prisma.program.findUnique({
        where: { programCode: rawCourse.programCode }, // Assuming programCode is unique globally for bulk upload context
        select: { id: true },
      });
      if (!program) {
        failedRecords.push({ data: rawCourse, error: `Program with code '${rawCourse.programCode}' not found.` });
        continue;
      }
      // Set programId for Prisma create
      rawCourse.programId = program.id;


      const createdCourse = await prisma.course.create({
        data: {
          courseCode: rawCourse.courseCode.trim(),
          courseTitle: rawCourse.courseTitle.trim(),
          creditHours: parseFloat(rawCourse.creditHours),
          level: rawCourse.level,
          academicSemester: rawCourse.academicSemester,
          program: { connect: { id: rawCourse.programId } }, // Now using resolved programId
        },
      });
      createdRecords.push(createdCourse);

    } catch (error) {
      console.error(`[${timestamp}] [bulkUploadCourses] Failed to create course record:`, rawCourse.courseCode, error.message);
      let errorMessage = `Unknown error: ${error.message}`;
      if (error.code === 'P2002') {
        errorMessage = `Duplicate course entry (Code: ${rawCourse.courseCode}, Program ID: ${rawCourse.programId}, Level: ${rawCourse.level}, Semester: ${rawCourse.academicSemester}) already exists.`;
      }
      failedRecords.push({ data: rawCourse, error: errorMessage });
    }
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


// NEW ACTION: getDepartments (useful for program/course linking)
export async function getDepartments(centerId = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getDepartments] Action called. Filter by centerId: ${centerId}`);

  try {
    const departments = await prisma.department.findMany({
      where: centerId ? { centerId: centerId } : {},
      select: {
        id: true,
        name: true,
        centerId: true,
        center: { select: { id: true, name: true } },
        _count: { select: { lecturers: true, programs: true } }
      },
      orderBy: { name: 'asc' },
    });

    const formattedDepartments = departments.map(d => ({
      ...d,
      centerName: d.center?.name,
      lecturerCount: d._count.lecturers,
      programCount: d._count.programs,
    }));

    return { success: true, departments: formattedDepartments };
  } catch (error) {
    console.error(`[${timestamp}] [getDepartments] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch departments." };
  }
}

// NEW ACTION: createDepartment
export async function createDepartment({ name, centerId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [createDepartment] Name: ${name}, CenterID: ${centerId}`);

  if (!name?.trim() || !centerId) {
    return { success: false, error: "Department name and Center ID are required." };
  }

  try {
    // Check if center exists
    const centerExists = await prisma.center.findUnique({
      where: { id: centerId },
      select: { id: true },
    });
    if (!centerExists) {
      return { success: false, error: "Specified center not found." };
    }

    const newDepartment = await prisma.department.create({
      data: {
        name: name.trim(),
        center: { connect: { id: centerId } },
      },
      include: {
        center: { select: { id: true, name: true } } // Include center details for response
      }
    });

    revalidatePath('/registry/departments'); // Revalidate a hypothetical departments management page
    revalidatePath('/registry/courses'); // Courses page lists departments/programs

    return { success: true, department: newDepartment };

  } catch (error) {
    console.error(`[${timestamp}] [createDepartment] Error:`, error.message, error.stack);
    if (error.code === 'P2002' && error.meta?.target?.includes('name') && error.meta?.target?.includes('centerId')) { // Assuming @@unique([name, centerId]) in schema
      return { success: false, error: `A department with name '${name.trim()}' already exists in this center.` };
    }
    return { success: false, error: `Failed to create department: ${error.message || "Unknown error."}` };
  }
}


export async function getAllClaimsSystemWide(filters = {}) {
  const timestamp = new Date().toISOString();
  // Destructure the properties from the filters object
  const { centerId, status, lecturerId, lecturerName = "" } = filters;
  const trimmedLecturerName = lecturerName.trim();

  try {
    const whereClause = {};
    if (centerId) whereClause.centerId = centerId;
    if (status) whereClause.status = status;
    if (lecturerId) whereClause.submittedById = lecturerId;
    if (trimmedLecturerName) {
      whereClause.submittedBy = { name: { contains: trimmedLecturerName } };
    }
    const claims = await prisma.claim.findMany({
      where: whereClause,
      include: {
        submittedBy: { select: { id: true, name: true, email: true, designation: true } },
        processedBy: { select: { id: true, name: true, email: true, designation: true } },
        center: { select: { id: true, name: true } },
        supervisedStudents: { select: { studentName: true, thesisTitle: true } }
      },
      orderBy: { submittedAt: 'desc' },
    });
    const formattedClaims = claims.map(claim => ({ ...claim, centerName: claim.center?.name }));
    return { success: true, claims: formattedClaims };
  } catch (error) {
    console.error(`[${timestamp}] [getAllClaimsSystemWide] Error:`, error.message, error.stack, error.meta);
    return { success: false, error: "Failed to fetch system-wide claims. Check server logs." };
  }
}

export async function getClaimsForStaffRegistry({ staffRegistryUserId, filters = {} }) {
    const timestamp = new Date().toISOString();
    try {
      const staffUser = await prisma.user.findUnique({
          where: { id: staffRegistryUserId },
          select: { role: true, staffRegistryCenterAssignments: { select: { center: {select: {id: true, name: true}} } } }
      });
      if (!staffUser || staffUser.role !== 'STAFF_REGISTRY') return { success: false, error: "User is not authorized or not found." };
      
      const assignedCenters = staffUser.staffRegistryCenterAssignments.map(assignment => assignment.center);
      if (assignedCenters.length === 0) return { success: true, claims: [], assignedCenters: [] };
      
      const assignedCenterIds = assignedCenters.map(c => c.id);
      const { status, lecturerId, lecturerName = "", centerId: filterSpecificCenterId } = filters;
      const trimmedLecturerName = lecturerName.trim();
      const whereClause = { centerId: { in: assignedCenterIds } };

      if (filterSpecificCenterId && assignedCenterIds.includes(filterSpecificCenterId)) {
           whereClause.centerId = filterSpecificCenterId;
      } else if (filterSpecificCenterId && !assignedCenterIds.includes(filterSpecificCenterId)){
           console.warn(`[${timestamp}] Staff user ${staffRegistryUserId} attempted to filter by unassigned center ${filterSpecificCenterId}.`);
           return { success: true, claims: [], assignedCenters };
      }
      if (status) whereClause.status = status;
      if (lecturerId) whereClause.submittedById = lecturerId;
      if (trimmedLecturerName) whereClause.submittedBy = { name: { contains: trimmedLecturerName } };
      
      const claims = await prisma.claim.findMany({
          where: whereClause,
          include: {
              submittedBy: { select: { id: true, name: true, email: true, designation: true } },
              processedBy: { select: { id: true, name: true, email: true, designation: true } },
              center: { select: { id: true, name: true } },
              supervisedStudents: { select: { studentName: true, thesisTitle: true } }
          },
          orderBy: { submittedAt: 'desc' },
      });
      const formattedClaims = claims.map(claim => ({ ...claim, centerName: claim.center?.name }));
      return { success: true, claims: formattedClaims, assignedCenters };
    } catch (error) {
      console.error(`[${timestamp}] [getClaimsForStaffRegistry] Error:`, error.message, error.stack);
      return { success: false, error: "Failed to fetch claims for Staff Registry user." };
    }
}

export async function processClaimByRegistry({ claimId, status, registryUserId }) {
  const timestamp = new Date().toISOString();
  if (!claimId || !status || !registryUserId) return { success: false, error: "Claim ID, status, and Registry User ID are required." };
  if (!['APPROVED', 'REJECTED'].includes(status)) return { success: false, error: "Invalid status." };
  try {
    const processor = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!processor || processor.role !== 'REGISTRY') return { success: false, error: "Unauthorized: Action performer must be REGISTRY." };
    const claimToUpdate = await prisma.claim.findUnique({ where: {id: claimId }, select: { status: true, centerId: true, submittedById: true }});
    if (!claimToUpdate) return { success: false, error: "Claim not found." };
    if (claimToUpdate.status !== 'PENDING') return { success: false, error: `Claim is already ${claimToUpdate.status.toLowerCase()}.`};
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId }, data: { status: status, processedById: registryUserId, processedAt: new Date() },
    });
    revalidatePath('/registry/claims');
    if (updatedClaim.centerId) {
      revalidatePath(`/coordinator/center/${updatedClaim.centerId}/claims`);
      revalidatePath(`/coordinator/center/${updatedClaim.centerId}/dashboard`);
      revalidatePath(`/staff_registry/center/${updatedClaim.centerId}/claims`);
    }
    if (updatedClaim.submittedById && updatedClaim.centerId) {
        revalidatePath(`/lecturer/center/${updatedClaim.centerId}/my-claims`);
        revalidatePath(`/lecturer/center/${updatedClaim.centerId}/dashboard`);
    }
    return { success: true, claim: updatedClaim };
  } catch (error) {
    console.error(`[${timestamp}] [processClaimByRegistry] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to process claim." };
  }
}

export async function processClaimByStaffRegistry({ claimId, status, staffRegistryUserId }) {
    const timestamp = new Date().toISOString();
    try {
      const processor = await prisma.user.findUnique({
          where: { id: staffRegistryUserId },
          select: { role: true, staffRegistryCenterAssignments: { select: { centerId: true }} }
      });
      if (!processor || processor.role !== 'STAFF_REGISTRY') return { success: false, error: "User is not authorized or not found." };
      const claimToUpdate = await prisma.claim.findUnique({ where: {id: claimId }, select: { status: true, centerId: true, submittedById: true }});
      if (!claimToUpdate) return { success: false, error: "Claim not found." };
      if (claimToUpdate.status !== 'PENDING') return { success: false, error: `Claim is already ${claimToUpdate.status.toLowerCase()}.`};
      const assignedCenterIds = processor.staffRegistryCenterAssignments.map(a => a.centerId);
      if (!assignedCenterIds.includes(claimToUpdate.centerId)) return { success: false, error: "Unauthorized: Not assigned to this claim's center."};
      const updatedClaim = await prisma.claim.update({
        where: { id: claimId }, data: { status: status, processedById: staffRegistryUserId, processedAt: new Date() },
      });
      revalidatePath(`/staff-registry/claims`);
      if (updatedClaim.centerId) {
        revalidatePath(`/staff_registry/center/${updatedClaim.centerId}/claims`);
        revalidatePath(`/coordinator/center/${updatedClaim.centerId}/claims`);
      }
      if (updatedClaim.submittedById && updatedClaim.centerId) revalidatePath(`/lecturer/center/${updatedClaim.centerId}/my-claims`);
      revalidatePath('/registry/claims');
      return { success: true, claim: updatedClaim };
    } catch (error) {
      console.error(`[${timestamp}] [processClaimByStaffRegistry] Error:`, error.message, error.stack);
      return { success: false, error: "Failed to process claim by staff." };
    }
}

export async function updateUserPasswordByRegistry({ userId, newPassword }) {
  const timestamp = new Date().toISOString();
  try {
    const userToUpdate = await prisma.user.findUnique({where: {id: userId}, select: { id: true }});
    if (!userToUpdate) return { success: false, error: "User not found." };
    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword }});
    return { success: true, message: "User password updated successfully." };
  } catch (error) {
    console.error(`[${timestamp}] [updateUserPasswordByRegistry] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to update user password." };
  }
}

export async function getPublicCenters() {
  const timestamp = new Date().toISOString();
  try {
    const centers = await prisma.center.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' }});
    return { success: true, centers };
  } catch (error) {
    console.error(`[${timestamp}] [getPublicCenters] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch public centers list." };
  }
}

export async function getPendingSignupRequests() {
  const timestamp = new Date().toISOString();
  try {
    const requests = await prisma.signupRequest.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        name: true,
        email: true,
        requestedRole: true,
        requestedCenterId: true,
        bankName: true,
        bankBranch: true,
        accountName: true,
        accountNumber: true,
        phoneNumber: true,
        status: true,
        submittedAt: true,
        processedAt: true,
        processedByRegistryId: true,
      },
      orderBy: { submittedAt: 'asc' }
    });
    const centerIdsToFetch = [...new Set(requests.map(r => r.requestedCenterId).filter(Boolean))];
    let centersMap = {};
    if (centerIdsToFetch.length > 0) {
        const centersData = await prisma.center.findMany({ where: { id: { in: centerIdsToFetch } }, select: { id: true, name: true }});
        centersMap = centersData.reduce((map, center) => { map[center.id] = center.name; return map; }, {});
    }
    const formattedRequests = requests.map(request => ({ ...request, requestedCenterName: request.requestedCenterId ? (centersMap[request.requestedCenterId] || `Unknown (ID: ${request.requestedCenterId.substring(0,4)}...)`) : null }));
    return { success: true, requests: formattedRequests };
  } catch (error) {
    console.error(`[${timestamp}] [getPendingSignupRequests] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch pending requests." };
  }
}

export async function approveSignupRequest({ requestId, registryUserId }) {
  const timestamp = new Date().toISOString();
  try {
    const processor = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!processor || processor.role !== 'REGISTRY') return { success: false, error: "User not authorized." };
    const request = await prisma.signupRequest.findUnique({ where: { id: requestId } });
    if (!request) return { success: false, error: "Signup request not found." };
    if (request.status !== 'PENDING') return { success: false, error: `Request is already ${request.status.toLowerCase()}.` };
    const existingUser = await prisma.user.findUnique({ where: { email: request.email.toLowerCase() } });
    if (existingUser) {
      await prisma.signupRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED', processedAt: new Date(), registryProcessor: { connect: { id: registryUserId } } }, // FIX APPLIED HERE
      });
      revalidatePath('/registry/requests');
      return { success: false, error: "User email exists. Request auto-rejected." };
    }
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: request.name, email: request.email.toLowerCase(), password: request.hashedPassword, role: request.requestedRole,
          lecturerCenterId: request.requestedRole === 'LECTURER' ? request.requestedCenterId : null,
          bankName: request.bankName,
          bankBranch: request.bankBranch,
          accountName: request.accountName,
          accountNumber: request.accountNumber,
          phoneNumber: request.phoneNumber,
          approvedSignupRequestId: request.id,
        },
        select: {
          id: true, name: true, email: true, role: true, designation: true, lecturerCenterId: true, createdAt: true,
          bankName: true, bankBranch: true, accountName: true, accountNumber: true, phoneNumber: true,
          Center_User_lecturerCenterIdToCenter: request.requestedRole === 'LECTURER' && request.requestedCenterId ? { select: { name: true } } : undefined
        }
      });
      await tx.signupRequest.update({
        where: { id: requestId }, data: { status: 'APPROVED', processedAt: new Date(), registryProcessor: { connect: { id: registryUserId }}},
      });
      return createdUser;
    });
    const userToReturn = { ...newUser, lecturerCenterName: newUser.Center_User_lecturerCenterIdToCenter?.name, coordinatedCenterName: null, departmentName: null };
    revalidatePath('/registry/requests'); revalidatePath('/registry/users');
    return { success: true, user: userToReturn, message: "Signup request approved & user created." };
  } catch (error) {
    console.error(`[${timestamp}] [approveSignupRequest] Error:`, error.message, error.stack);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        try {
            await prisma.signupRequest.update({ where: { id: requestId }, data: { status: 'REJECTED', processedAt: new Date(), registryProcessor: { connect: { id: registryUserId }} } }); // FIX APPLIED HERE
            revalidatePath('/registry/requests');
        } catch (rejectError) { console.error(`[${timestamp}] [approveSR] Fail to mark REJECTED after P2002:`, rejectError.message, rejectError.stack); }
        return { success: false, error: "User email exists. Request rejected." };
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('accountNumber')) {
        try {
            await prisma.signupRequest.update({ where: { id: requestId }, data: { status: 'REJECTED', processedAt: new Date(), registryProcessor: { connect: { id: registryUserId }} } }); // FIX APPLIED HERE
            revalidatePath('/registry/requests');
        } catch (rejectError) { console.error(`[${timestamp}] [approveSR] Fail to mark REJECTED after P2002 (accountNumber):`, rejectError.message, rejectError.stack); }
        return { success: false, error: "User with this bank account number already exists. Request rejected." };
    }
    return { success: false, error: "Failed to approve signup request. " + (error.message || "") };
  }
}

export async function rejectSignupRequest({ requestId, registryUserId, rejectionReason = "Request rejected by Registry." }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [rejectSignupRequest] Req: ${requestId}, Reason: "${rejectionReason}"`);
  if (!requestId || !registryUserId) return { success: false, error: "Request ID and Registry User ID required." };
  try {
    const processor = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!processor || processor.role !== 'REGISTRY') return { success: false, error: "User not authorized." };
    const request = await prisma.signupRequest.findUnique({ where: { id: requestId } });
    if (!request) return { success: false, error: "Signup request not found." };
    if (request.status !== 'PENDING') return { success: false, error: `Request is already ${request.status.toLowerCase()}.` };
    await prisma.signupRequest.update({
      where: { id: requestId }, data: { status: 'REJECTED', processedAt: new Date(), registryProcessor: { connect: { id: registryUserId }}},
    });
    console.log(`[${timestamp}] Request ${requestId} rejected. Reason logged (if not saved to DB by default): ${rejectionReason}`);
    revalidatePath('/registry/requests');
    return { success: true, message: "Signup request rejected successfully." };
  } catch (error) {
    console.error(`[${timestamp}] [rejectSignupRequest] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to reject signup request. " + (error.message || "") };
  }
}

export async function getLecturerMonthlyClaimSummary({ lecturerId, year, month }) {
  const timestamp = new Date().toISOString();
  try {
    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId },
      select: {
        id: true, name: true, email: true, designation: true,
        phoneNumber: true,
        bankName: true,
        bankBranch: true,
        accountName: true,
        accountNumber: true,
      }
    });
    if (!lecturer) return { success: false, error: "Lecturer not found." };
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0,0,0,0));
    const endDate = new Date(Date.UTC(year, month, 0, 23,59,59,999));
    const claimsInMonth = await prisma.claim.findMany({
      where: { submittedById: lecturerId, submittedAt: { gte: startDate, lte: endDate }},
      select: {
        id: true, claimType: true, status: true, submittedAt: true, processedAt: true,
        teachingDate: true, teachingStartTime: true, teachingEndTime: true, courseCode: true, courseTitle: true, teachingHours: true,
        transportToTeachingInDate: true, transportToTeachingFrom: true, transportToTeachingTo: true, transportToTeachingOutDate: true, transportToTeachingReturnFrom: true, transportToTeachingReturnTo: true, transportToTeachingDistanceKM: true,
        transportType: true, transportDestinationFrom: true, transportDestinationTo: true, transportRegNumber: true, transportCubicCapacity: true, transportAmount: true,
        thesisType: true, thesisSupervisionRank: true, thesisExamCourseCode: true, thesisExamDate: true,
        supervisedStudents: { select: { studentName: true, thesisTitle: true } },
        center: { select: { name: true } },
        processedBy: { select: { name: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });
    const summary = {
      lecturerName: lecturer.name, lecturerEmail: lecturer.email, lecturerDesignation: lecturer.designation,
      lecturerPhoneNumber: lecturer.phoneNumber,
      lecturerBankName: lecturer.bankName,
      lecturerBankBranch: lecturer.bankBranch,
      lecturerAccountName: lecturer.accountName,
      lecturerAccountNumber: lecturer.accountNumber,
      month: startDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }), year,
      totalClaims: claimsInMonth.length,
      pending: claimsInMonth.filter(c => c.status === 'PENDING').length,
      approved: claimsInMonth.filter(c => c.status === 'APPROVED').length,
      rejected: claimsInMonth.filter(c => c.status === 'REJECTED').length,
      totalTeachingHours: claimsInMonth.filter(c => c.claimType === 'TEACHING' && c.status === 'APPROVED' && typeof c.teachingHours === 'number').reduce((sum, c) => sum + c.teachingHours, 0),
      totalTransportAmount: claimsInMonth.filter(c => c.claimType === 'TRANSPORTATION' && c.status === 'APPROVED' && typeof c.transportAmount === 'number').reduce((sum, c) => sum + c.transportAmount, 0),
      claims: claimsInMonth.map(claim => ({ ...claim, centerName: claim.center?.name, processedByCoordinatorName: claim.processedBy?.name })),
    };
    return { success: true, summary };
  } catch (error) {
    console.error(`[${timestamp}] [getLecturerMonthlyClaimSummary] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to generate summary. " + (error.message || "") };
  }
}

export async function getMonthlyClaimsSummaryByGrouping({ year, month, requestingUserId, filterCenterId: directFilterCenterId }) {
  const timestamp = new Date().toISOString();
  try {
    let effectiveCenterIdFilter = null;
    let userRole = 'UNKNOWN'; let generatedFor = "System Wide";
    const reqUser = await prisma.user.findUnique({
        where: { id: requestingUserId },
        select: { role: true, Center_Center_coordinatorIdToUser: { select: { id: true, name: true } }, staffRegistryCenterAssignments: { select: { center: { select: { id: true, name: true}}}} }
    });
    if (!reqUser) return { success: false, error: "Requesting user not found." };
    userRole = reqUser.role;

    if (userRole === 'COORDINATOR') {
        if (reqUser.Center_Center_coordinatorIdToUser?.id) { effectiveCenterIdFilter = { in: [reqUser.Center_Center_coordinatorIdToUser.id] }; generatedFor = `Center: ${reqUser.Center_Center_coordinatorIdToUser.name}`; }
        else return { success: false, error: "Coordinator is not assigned to a center.", summary: [] };
    } else if (userRole === 'STAFF_REGISTRY') {
        const assignedCenters = reqUser.staffRegistryCenterAssignments.map(a => a.center);
        if (assignedCenters.length === 0) return { success: false, error: "Staff Registry user has no centers assigned.", summary: [] };
        if (directFilterCenterId) {
            if (!assignedCenters.some(c => c.id === directFilterCenterId)) return { success: false, error: "Unauthorized to view summary for this specific center."};
            effectiveCenterIdFilter = { in: [directFilterCenterId] }; generatedFor = `Center: ${assignedCenters.find(c=>c.id === directFilterCenterId)?.name}`;
        } else { effectiveCenterIdFilter = { in: assignedCenters.map(c => c.id) }; generatedFor = `Assigned Centers (${assignedCenters.length})`; }
    } else if (userRole === 'REGISTRY') {
        if (directFilterCenterId) {
            const filteredCenter = await prisma.center.findUnique({ where: {id: directFilterCenterId}, select: { name: true }});
            if (filteredCenter) { effectiveCenterIdFilter = { in: [directFilterCenterId] }; generatedFor = `Center: ${filteredCenter.name}`; }
            else return { success: false, error: "Specified filter center not found." };
        }
    } else { return { success: false, error: "Unauthorized to view this summary type." }; }

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0,0,0,0));
    const endDate = new Date(Date.UTC(year, month, 0, 23,59,59,999));
    const whereConditions = { submittedAt: { gte: startDate, lte: endDate }, status: 'APPROVED' };
    if (effectiveCenterIdFilter) { whereConditions.centerId = effectiveCenterIdFilter; }
     else if (userRole !== 'REGISTRY' && (!effectiveCenterIdFilter || (typeof effectiveCenterIdFilter === 'object' && effectiveCenterIdFilter.in && effectiveCenterIdFilter.in.length === 0))) {
        return { success: true, summary: [], period: { month: startDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }), year }, generatedForRole: userRole, filterContext: generatedFor };
    }
    const claims = await prisma.claim.findMany({
      where: whereConditions,
      select: {
        id: true, claimType: true, teachingHours: true, transportAmount: true, thesisType: true,
        supervisedStudents: {select: {studentName: true}},
        submittedById: true, centerId: true, thesisSupervisionRank: true, thesisExamCourseCode: true, thesisExamDate: true,
        submittedBy: { select: { id: true, name: true, Department: { select: { id: true, name: true } } } },
        center: { select: { id: true, name: true } },
      },
      orderBy: [ { "center": { "name": 'asc' } }, { "submittedBy": { "name": 'asc' } }, { "claimType": 'asc' } ]
    });
    const summaryByCenter = {};
    for (const claim of claims) {
      const cId = claim.center?.id || 'unknown_center'; const cName = claim.center?.name || 'Unknown Center';
      const dId = claim.submittedBy?.Department?.id || 'no_department'; const dName = claim.submittedBy?.Department?.name || 'No Department Assigned';
      const lId = claim.submittedBy.id; const lName = claim.submittedBy.name;
      if (!summaryByCenter[cId]) summaryByCenter[cId] = { centerId: cId, centerName: cName, totalTeachingHours: 0, totalTransportAmount: 0, totalThesisSupervisionUnits: 0, totalThesisExaminationUnits: 0, totalClaims: 0, departments: {}, };
      const centerSum = summaryByCenter[cId]; centerSum.totalClaims++;
      if (!centerSum.departments[dId]) centerSum.departments[dId] = { departmentId: dId, departmentName: dName, totalTeachingHours: 0, totalTransportAmount: 0, totalThesisSupervisionUnits: 0, totalThesisExaminationUnits: 0, lecturers: {} };
      const deptSum = centerSum.departments[dId];
      if (!deptSum.lecturers[lId]) deptSum.lecturers[lId] = { lecturerId: lId, lecturerName: lName, totalTeachingHours: 0, totalTransportAmount: 0, thesisSupervisions: 0, thesisExaminations: 0, supervisionDetails: [], examinationDetails: [] };
      const lectSum = deptSum.lecturers[lId];
      if (claim.claimType === 'TEACHING' && typeof claim.teachingHours === 'number') { centerSum.totalTeachingHours += claim.teachingHours; deptSum.totalTeachingHours += claim.teachingHours; lectSum.totalTeachingHours += claim.teachingHours; }
      else if (claim.claimType === 'TRANSPORTATION' && typeof claim.transportAmount === 'number') { centerSum.totalTransportAmount += claim.transportAmount; deptSum.totalTransportAmount += claim.transportAmount; lectSum.totalTransportAmount += claim.transportAmount; }
      else if (claim.claimType === 'THESIS_PROJECT') {
        if (claim.thesisType === 'SUPERVISION') { const numStudents = claim.supervisedStudents?.length || 0; centerSum.totalThesisSupervisionUnits += numStudents; deptSum.totalThesisSupervisionUnits += numStudents; lectSum.thesisSupervisions += numStudents; lectSum.supervisionDetails.push({rank: claim.thesisSupervisionRank, studentsCount: numStudents});}
        else if (claim.thesisType === 'EXAMINATION') { centerSum.totalThesisExaminationUnits++; deptSum.totalThesisExaminationUnits++; lectSum.thesisExaminations++; lectSum.examinationDetails.push({courseCode: claim.thesisExamCourseCode, examDate: claim.thesisExamDate});}
      }
    }
    const finalSummary = Object.values(summaryByCenter).map(center => ({ ...center, departments: Object.values(center.departments).map(dept => ({ ...dept, lecturers: Object.values(dept.lecturers).sort((a,b) => (a.lecturerName || "").localeCompare(b.lecturerName || "")), })).sort((a,b) => (a.departmentName || "").localeCompare(b.departmentName || "")),})).sort((a,b) => (a.centerName || "").localeCompare(b.centerName || ""));
    return { success: true, summary: finalSummary, period: { month: startDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }), year }, generatedForRole: userRole, filterContext: generatedFor };
  } catch (error) {
    console.error(`[${timestamp}] [getMonthlyClaimsSummaryByGrouping] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to generate grouped summary." };
  }
}

export async function getAssignedCentersForStaffRegistry({ staffRegistryUserId }) {
    const timestamp = new Date().toISOString();
    try {
      const user = await prisma.user.findUnique({
          where: {id: staffRegistryUserId},
          select: {staffRegistryCenterAssignments: {select: {center: {select: {id:true, name:true}}}}}
      });
      if (!user) return {success: false, error: "User not found."};
      const assignedCenters = user.staffRegistryCenterAssignments.map(a => a.center);
      return { success: true, centers: assignedCenters };
    } catch (error) {
      console.error(`[${timestamp}] [getAssignedCentersForStaffRegistry] Error:`, error.message, error.stack);
      return { success: false, error: "Failed to fetch assigned centers." };
    }
}

export async function getStaffRegistryDashboardStats({ staffRegistryUserId }) {
  const timestamp = new Date().toISOString();
  try {
    const staffUser = await prisma.user.findUnique({
      where: { id: staffRegistryUserId },
      select: { role: true, staffRegistryCenterAssignments: { select: { centerId: true } } },
    });
    if (!staffUser || staffUser.role !== 'STAFF_REGISTRY') return { success: false, error: "User is not authorized or not found." };
    const assignedCenterIds = staffUser.staffRegistryCenterAssignments.map(a => a.centerId);
    let pendingClaimsCount = 0; const assignedCentersCount = assignedCenterIds.length;
    if (assignedCentersCount > 0) {
      pendingClaimsCount = await prisma.claim.count({
        where: { centerId: { in: assignedCenterIds }, status: 'PENDING' },
      });
    }
    return { success: true, data: { assignedCentersCount, pendingClaimsCount }};
  } catch (error) {
    console.error(`[${timestamp}] [getStaffRegistryDashboardStats] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch dashboard statistics." };
  }
}

export async function deleteUserByRegistry({ userIdToDelete, registryUserId }) {
  const timestamp = new Date().toISOString();
  try {
    const performingUser = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!performingUser || performingUser.role !== 'REGISTRY') return { success: false, error: "Unauthorized: Action performer is not a Registry member." };
    const userToDelete = await prisma.user.findUnique({ where: { id: userIdToDelete }, select: { id: true, name: true, email: true, role: true, Center_Center_coordinatorIdToUser: { select: { id: true } } }});
    if (!userToDelete) return { success: false, error: "User to delete not found." };
    if (userToDelete.role === 'REGISTRY') return { success: false, error: "REGISTRY users cannot be deleted by this function." };

    await prisma.$transaction(async (tx) => {
      if (userToDelete.role === 'COORDINATOR' && userToDelete.Center_Center_coordinatorIdToUser) {
        await tx.center.update({ where: { id: userToDelete.Center_Center_coordinatorIdToUser.id }, data: { coordinatorId: null } });
      }
      // StaffRegistryCenterAssignment records linked to this user will be deleted by onDelete: Cascade defined in schema
      await tx.user.delete({ where: { id: userIdToDelete } });
    });
    revalidatePath('/registry/users'); revalidatePath('/registry/centers');
    return { success: true, message: `User "${userToDelete.name || userToDelete.email}" deleted successfully.` };
  } catch (error) {
    console.error(`[${timestamp}] [deleteUserByRegistry] Error:`, error.message, error.stack, JSON.stringify(error.meta));
    if (error.code === 'P2025') return { success: false, error: "User not found or already deleted."};
    if (error.code === 'P2003') {
        const fieldName = error.meta?.field_name || "related records";
        let specificMessage = `User is linked via field '${fieldName}'.`;
        if (String(fieldName).includes('Claim_submittedByIdToUser')) specificMessage = `They have submitted claims. Reassign or delete their claims first.`;
        else if (String(fieldName).includes('Claim_processedByIdToUser')) specificMessage = `They have processed claims. Please update those claims first.`;
        else if (String(fieldName).includes('SupervisedStudent_supervisorIdToUser')) specificMessage = `They are listed as a supervisor for students. Update student supervision records first.`;
        else if (String(fieldName).includes('SignupRequest_processedByRegistryIdToUser')) specificMessage = `They have processed signup requests. Update those requests first.`;
        else if (String(fieldName).includes('Center_coordinatorIdToUser')) specificMessage = `They are assigned as a coordinator. Unassign them from the center first.`;
        return { success: false, error: `Cannot delete user. ${specificMessage} Resolve dependencies.`};
    }
    return { success: false, error: "Failed to delete user. " + (error.message || "An unexpected error occurred.") };
  }
}

export async function deleteCenterByRegistry({ centerId, registryUserId }) {
  const timestamp = new Date().toISOString();
  try {
    const performingUser = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!performingUser || performingUser.role !== 'REGISTRY') return { success: false, error: "Unauthorized: Action performer is not a Registry member." };
    const centerToDelete = await prisma.center.findUnique({ where: { id: centerId }, select: { name: true }});
    if (!centerToDelete) return { success: false, error: "Center not found." };
    const centerNameForMessage = centerToDelete.name;

    // Relations like StaffRegistryCenterAssignment, Department, Claim have onDelete: Cascade
    // on their respective centerId fields in the schema, so Prisma/DB handles their deletion.
    // We only need to manually nullify lecturerCenterId on Users.
    await prisma.$transaction(async (tx) => {
      await tx.user.updateMany({ where: { lecturerCenterId: centerId }, data: { lecturerCenterId: null }});
      // The coordinator link (Center.coordinatorId) is part of the Center being deleted.
      await tx.center.delete({ where: { id: centerId } });
    });
    revalidatePath('/registry/centers'); revalidatePath('/registry/users'); revalidatePath('/registry/claims');
    return { success: true, message: `Center "${centerNameForMessage}" and relevant associations handled.` };
  } catch (error) {
    console.error(`[${timestamp}] [deleteCenterByRegistry] Error:`, error.message, error.stack, JSON.stringify(error.meta));
    if (error.code === 'P2025') return { success: false, error: "Center not found or already deleted."};
    if (error.code === 'P2003') {
        const fieldName = error.meta?.field_name || "related records";
        return { success: false, error: `Cannot delete center. It is still linked by other records (e.g., via field '${fieldName}'). Ensure all dependencies have 'onDelete: Cascade' or are manually handled.`};
    }
    return { success: false, error: "Failed to delete center. " + (error.message || "An unexpected error occurred.") };
  }
}

export async function deleteClaimByRegistry({ claimId, registryUserId }) {
  const timestamp = new Date().toISOString();
  try {
    const performingUser = await prisma.user.findUnique({ where: { id: registryUserId }, select: { role: true }});
    if (!performingUser || performingUser.role !== 'REGISTRY') return { success: false, error: "Unauthorized: Action performer is not a Registry member." };
    const claimToDelete = await prisma.claim.findUnique({ where: { id: claimId }, select: { id: true, submittedById: true, centerId: true } });
    if (!claimToDelete) return { success: false, error: "Claim not found or already deleted." };

    // SupervisedStudent records related to this claim are handled by onDelete: Cascade from schema.
    await prisma.claim.delete({ where: { id: claimId } });

    revalidatePath('/registry/claims');
    if (claimToDelete.submittedById && claimToDelete.centerId) {
        revalidatePath(`/lecturer/center/${claimToDelete.centerId}/my-claims`);
        revalidatePath(`/lecturer/center/${claimToDelete.centerId}/dashboard`);
    }
    if (claimToDelete.centerId) {
        revalidatePath(`/coordinator/center/${claimToDelete.centerId}/claims`);
        revalidatePath(`/coordinator/center/${claimToDelete.centerId}/dashboard`);
        revalidatePath(`/staff_registry/center/${claimToDelete.centerId}/claims`);
    }
    return { success: true, message: `Claim (ID: ${claimId.substring(0,8)}...) deleted successfully.` };
  } catch (error) {
    console.error(`[${timestamp}] [deleteClaimByRegistry] Error:`, error.message, error.stack, JSON.stringify(error.meta));
    if (error.code === 'P2025') return { success: false, error: "Claim not found or already deleted."};
    if (error.code === 'P2003') return { success: false, error: `Cannot delete claim. It is referenced by other records.`};
    return { success: false, error: "Failed to delete claim." };
  }
}