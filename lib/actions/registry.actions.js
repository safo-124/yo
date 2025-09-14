// lib/actions/registry.actions.js
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getPotentialCoordinators() {
  const timestamp = new Date().toISOString();
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

export async function createCenter({ name, coordinatorId, departmentIds = [] }) {
  const timestamp = new Date().toISOString();
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

    // Validate department IDs if provided
    if (departmentIds.length > 0) {
      const validDepartments = await prisma.department.findMany({
        where: { id: { in: departmentIds } },
        select: { id: true }
      });
      if (validDepartments.length !== departmentIds.length) {
        return { success: false, error: "Some selected departments are invalid." };
      }
    }

    const newCenter = await prisma.$transaction(async (tx) => {
      if (coordinator.role !== 'COORDINATOR') {
        await tx.user.update({
          where: { id: coordinatorId },
          data: { role: 'COORDINATOR', lecturerCenterId: null, departmentId: null },
        });
      }
      
      const center = await tx.center.create({
        data: { name: name.trim(), coordinator: { connect: { id: coordinatorId } } },
        include: { coordinator: { select: { id: true, name: true, email: true, role: true, designation: true } } }
      });

      // Create department-center assignments if departments are provided
      if (departmentIds.length > 0) {
        await tx.departmentCenterAssignment.createMany({
          data: departmentIds.map(departmentId => ({
            departmentId,
            centerId: center.id
          }))
        });
      }

      return center;
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

export async function updateCenter({ centerId, name, coordinatorId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [updateCenter] Action called with data:`, { centerId, name, coordinatorId });

  if (!centerId) {
    return { success: false, error: "Center ID is required." };
  }

  if (!name || !name.trim()) {
    return { success: false, error: "Center name is required." };
  }

  try {
    // Check if center exists
    const existingCenter = await prisma.center.findUnique({
      where: { id: centerId },
      include: { coordinator: true }
    });

    if (!existingCenter) {
      return { success: false, error: "Center not found." };
    }

    // If coordinatorId is provided, validate the coordinator
    if (coordinatorId) {
      const coordinator = await prisma.user.findUnique({
        where: { id: coordinatorId },
        select: { id: true, name: true, email: true, role: true }
      });

      if (!coordinator) {
        return { success: false, error: "Selected coordinator not found." };
      }

      if (['REGISTRY', 'STAFF_REGISTRY'].includes(coordinator.role)) {
        return { success: false, error: "Registry/Staff Registry members cannot be direct center coordinators." };
      }

      // Check if coordinator is already assigned to another center
      const existingCenterForCoordinator = await prisma.center.findFirst({
        where: { 
          coordinatorId,
          id: { not: centerId } // Exclude current center
        }
      });

      if (existingCenterForCoordinator) {
        return { success: false, error: `User ${coordinator.name || coordinator.email} is already coordinating center: ${existingCenterForCoordinator.name}.` };
      }
    }

    // Update center in transaction
    const updatedCenter = await prisma.$transaction(async (tx) => {
      // If changing coordinator, update roles
      if (coordinatorId && coordinatorId !== existingCenter.coordinatorId) {
        // Reset previous coordinator role if needed
        if (existingCenter.coordinatorId) {
          const previousCoordinator = await tx.user.findUnique({
            where: { id: existingCenter.coordinatorId }
          });
          if (previousCoordinator && previousCoordinator.role === 'COORDINATOR') {
            // Check if they have other coordinator responsibilities
            const otherCoordinatorRoles = await tx.center.count({
              where: {
                coordinatorId: existingCenter.coordinatorId,
                id: { not: centerId }
              }
            });
            if (otherCoordinatorRoles === 0) {
              await tx.user.update({
                where: { id: existingCenter.coordinatorId },
                data: { role: 'LECTURER' } // Default back to lecturer
              });
            }
          }
        }

        // Update new coordinator role
        const newCoordinator = await tx.user.findUnique({
          where: { id: coordinatorId }
        });
        if (newCoordinator && newCoordinator.role !== 'COORDINATOR') {
          await tx.user.update({
            where: { id: coordinatorId },
            data: { 
              role: 'COORDINATOR', 
              lecturerCenterId: null, 
              departmentId: null 
            },
          });
        }
      }

      // Update the center
      return tx.center.update({
        where: { id: centerId },
        data: {
          name: name.trim(),
          ...(coordinatorId && { coordinatorId })
        },
        include: { 
          coordinator: { 
            select: { id: true, name: true, email: true, role: true, designation: true } 
          },
          departmentAssignments: {
            include: {
              department: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: { 
            select: { 
              lecturers: true, 
              departmentAssignments: true, 
              claims: true, 
              staffRegistryAssignments: true 
            } 
          }
        }
      });
    });

    // Format the response like getCenters
    const formattedCenter = {
      ...updatedCenter,
      departments: updatedCenter.departmentAssignments.map(assignment => assignment.department),
      lecturerCount: updatedCenter._count?.lecturers || 0,
      departmentCount: updatedCenter._count?.departmentAssignments || 0,
      claimsCount: updatedCenter._count?.claims || 0,
      staffRegistryCount: updatedCenter._count?.staffRegistryAssignments || 0,
    };

    console.log(`[${timestamp}] [updateCenter] Center updated successfully:`, formattedCenter);
    
    // Revalidate relevant paths
    revalidatePath('/registry/centers');
    revalidatePath('/registry/users');
    
    return { success: true, center: formattedCenter };
  } catch (error) {
    console.error(`[${timestamp}] [updateCenter] Error:`, error.message, error.stack);
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('name')) {
        return { success: false, error: "A center with this name already exists." };
      }
      if (error.meta?.target?.includes('coordinatorId')) {
        return { success: false, error: "This user is already a coordinator." };
      }
    }
    return { success: false, error: "Failed to update center." };
  }
}

export async function getCenters() {
  const timestamp = new Date().toISOString();
  try {
    const centers = await prisma.center.findMany({
      include: {
        coordinator: { select: { id: true, name: true, email: true, role: true, designation: true } },
        departmentAssignments: {
          include: {
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: { 
          select: { 
            lecturers: true, 
            departmentAssignments: true, 
            claims: true, 
            staffRegistryAssignments: true 
          } 
        }
      },
      orderBy: { name: 'asc' },
    });
    const formattedCenters = centers.map(c => ({
        ...c,
        departments: c.departmentAssignments.map(assignment => assignment.department),
        lecturerCount: c._count?.lecturers || 0,
        departmentCount: c._count?.departmentAssignments || 0,
        claimsCount: c._count?.claims || 0,
        staffRegistryCount: c._count?.staffRegistryAssignments || 0,
    }));
    console.log(`[${timestamp}] [getCenters] Fetched ${formattedCenters.length} centers. Data:`, formattedCenters);
    return { success: true, centers: formattedCenters };
  } catch (error) {
    console.error(`[${timestamp}] [getCenters] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch centers." };
  }
}

export async function createUserByRegistry({ name, email, password, role, designation, lecturerCenterId, departmentId, bankName, bankBranch, accountName, accountNumber, phoneNumber }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [createUserByRegistry] Action called with data:`, { name, email, role, designation, lecturerCenterId, departmentId, bankName, bankBranch, accountName, accountNumber, phoneNumber });

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
  if (role === 'LECTURER' || role === 'COORDINATOR') {
    if (!bankName?.trim() || !bankBranch?.trim() || !accountName?.trim() || !accountNumber?.trim() || !phoneNumber?.trim()) {
      return { success: false, error: `For ${role.toLowerCase()} role, bank details (name, branch, account name, account number) and phone number are required.` };
    }
  }

  if (role !== 'LECTURER' && role !== 'COORDINATOR') {
    // For non-Lecturer and non-Coordinator roles, clear payment fields
    lecturerCenterId = null; departmentId = null;
    bankName = null; bankBranch = null; accountName = null; accountNumber = null; phoneNumber = null;
  } else if (role !== 'LECTURER') {
    // For Coordinator (but not Lecturer), clear center and department fields only
    lecturerCenterId = null; departmentId = null;
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
    console.log(`[${timestamp}] [createUserByRegistry] User created successfully:`, userToReturn);
    return { success: true, user: userToReturn };
  } catch (error) {
    console.error(`[${timestamp}] [createUserByRegistry] Error caught in action:`, error.message, error.stack);
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
    } else if (newRole === 'COORDINATOR') {
      // For coordinator role, bank details are required but no center assignment is needed
      if (!newBankName?.trim() || !newBankBranch?.trim() || !newAccountName?.trim() || !newAccountNumber?.trim() || !newPhoneNumber?.trim()) {
        return { success: false, error: "For coordinator role, bank details and phone number are required." };
      }
      // Keep bank and payment details for coordinators
    } else {
        // For other roles, clear payment information
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

// UPDATED ACTION: createProgram (now supports many-to-many department assignments)
export async function createProgram({ programCode, programTitle, programCategory, departmentIds = [] }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [createProgram] Code: ${programCode}, Title: ${programTitle}, Category: ${programCategory}, DepartmentIDs: ${JSON.stringify(departmentIds)}`);

  if (!programCode?.trim() || !programTitle?.trim() || !programCategory) {
    return { success: false, error: "Program code, title, and category are required." };
  }

  if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
    return { success: false, error: "At least one department must be selected." };
  }

  // Basic validation for enum values
  const validProgramCategories = ["DIPLOMA", "UNDERGRADUATE", "POSTGRADUATE"];
  if (!validProgramCategories.includes(programCategory)) {
    return { success: false, error: "Invalid program category provided." };
  }

  try {
    // Check if all departments exist
    const existingDepartments = await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true }
    });

    if (existingDepartments.length !== departmentIds.length) {
      const missingIds = departmentIds.filter(id => !existingDepartments.find(d => d.id === id));
      return { success: false, error: `Departments not found: ${missingIds.join(', ')}` };
    }

    // Check if program code already exists
    const existingProgram = await prisma.program.findFirst({
      where: { programCode: programCode.trim() }
    });

    if (existingProgram) {
      return { success: false, error: `A program with code '${programCode.trim()}' already exists.` };
    }

    const newProgram = await prisma.program.create({
      data: {
        programCode: programCode.trim(),
        programTitle: programTitle.trim(),
        programCategory: programCategory,
        departmentAssignments: {
          create: departmentIds.map(departmentId => ({
            departmentId: departmentId
          }))
        }
      },
      include: {
        departmentAssignments: {
          include: {
            department: { 
              select: { 
                id: true, 
                name: true,
                centerAssignments: {
                  include: {
                    center: { select: { id: true, name: true } }
                  }
                }
              } 
            }
          }
        },
        _count: {
          select: {
            departmentAssignments: true,
            courses: true
          }
        }
      }
    });

    revalidatePath('/registry/programs');
    revalidatePath('/registry/courses');
    return { success: true, program: newProgram };

  } catch (error) {
    console.error(`[${timestamp}] [createProgram] Error:`, error.message, error.stack);
    return { success: false, error: `Failed to create program: ${error.message || "Unknown error."}` };
  }
}


// NEW ACTION: getPrograms (with optional department filter)
export async function getPrograms(departmentId = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getPrograms] Action called. Filter by departmentId: ${departmentId}`);

  try {
    const whereClause = {};
    
    // For many-to-many, we need to filter based on department assignments
    if (departmentId) {
      whereClause.departmentAssignments = {
        some: {
          departmentId: departmentId
        }
      };
    }

    const programs = await prisma.program.findMany({
      where: whereClause,
      include: {
        departmentAssignments: {
          include: {
            department: {
              include: {
                centerAssignments: {
                  include: {
                    center: { select: { id: true, name: true } }
                  }
                }
              }
            }
          }
        },
        _count: { select: { courses: true, departmentAssignments: true } },
      },
      orderBy: { programTitle: 'asc' },
    });

    const formattedPrograms = programs.map(p => ({
      ...p,
      departments: p.departmentAssignments.map(assignment => assignment.department),
      departmentName: p.departmentAssignments.length > 0 ? p.departmentAssignments[0].department.name : null, // For backward compatibility
      centerName: p.departmentAssignments.length > 0 && p.departmentAssignments[0].department.centerAssignments.length > 0 
        ? p.departmentAssignments[0].department.centerAssignments[0].center.name 
        : null, // For backward compatibility
      courseCount: p._count.courses,
      departmentCount: p._count.departmentAssignments
    }));

    return { success: true, programs: formattedPrograms };

  } catch (error) {
    console.error(`[${timestamp}] [getPrograms] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch programs." };
  }
}

// UPDATED ACTION: updateProgram (now supports many-to-many department assignments)
export async function updateProgram({ id, programCode, programTitle, programCategory, departmentIds = [] }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [updateProgram] Action called for ID: ${id}, Code: ${programCode}, DepartmentIDs: ${JSON.stringify(departmentIds)}`);

  if (!id || !programCode?.trim() || !programTitle?.trim() || !programCategory) {
    return { success: false, error: "Program ID, code, title, and category are required for update." };
  }

  if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
    return { success: false, error: "At least one department must be selected." };
  }

  // Basic validation for enum values
  const validProgramCategories = ["DIPLOMA", "UNDERGRADUATE", "POSTGRADUATE"];
  if (!validProgramCategories.includes(programCategory)) {
    return { success: false, error: "Invalid program category provided." };
  }

  try {
    // Check if all departments exist
    const existingDepartments = await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true }
    });

    if (existingDepartments.length !== departmentIds.length) {
      const missingIds = departmentIds.filter(id => !existingDepartments.find(d => d.id === id));
      return { success: false, error: `Departments not found: ${missingIds.join(', ')}` };
    }

    // Check if program code already exists (excluding current program)
    const existingProgram = await prisma.program.findFirst({
      where: { 
        programCode: programCode.trim(),
        NOT: { id: id }
      }
    });

    if (existingProgram) {
      return { success: false, error: `A program with code '${programCode.trim()}' already exists.` };
    }

    const updatedProgram = await prisma.program.update({
      where: { id: id },
      data: {
        programCode: programCode.trim(),
        programTitle: programTitle.trim(),
        programCategory: programCategory,
        departmentAssignments: {
          deleteMany: {}, // Remove all existing department assignments
          create: departmentIds.map(departmentId => ({
            departmentId: departmentId
          }))
        }
      },
      include: {
        departmentAssignments: {
          include: {
            department: { 
              select: { 
                id: true, 
                name: true,
                centerAssignments: {
                  include: {
                    center: { select: { id: true, name: true } }
                  }
                }
              } 
            }
          }
        },
        _count: {
          select: {
            departmentAssignments: true,
            courses: true
          }
        }
      }
    });

    revalidatePath('/registry');
    revalidatePath('/registry/courses');

    return { success: true, program: updatedProgram };

  } catch (error) {
    console.error(`[${timestamp}] [updateProgram] Error:`, error.message, error.stack);
    if (error.code === 'P2025') {
      return { success: false, error: `Program with ID '${id}' not found.` };
    }
    return { success: false, error: `Failed to update program: ${error.message || "Unknown error."}` };
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
      console.error(`[${timestamp}] [createCourse] Error updating Excel template:`, excelError);
      // Continue with the function even if Excel update fails
    }

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
    });

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

    return { success: true, courses: formattedCourses };
  } catch (error) {
    console.error(`[${timestamp}] [getCourses] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch courses." };
  }
}

// NEW ACTION: getLecturersForAssignment (fetches lecturers and coordinators for assignment dropdowns)
export async function getLecturersForAssignment(departmentId = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getLecturersForAssignment] Action called. Filter by departmentId: ${departmentId}`);
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
    console.error(`[${timestamp}] [getLecturersForAssignment] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch lecturers for assignment." };
  }
}

// NEW ACTION: assignCoursesToLecturers
export async function assignCoursesToLecturers({ courseIds, lecturerId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [assignCoursesToLecturers] Course IDs: ${courseIds}, Lecturer/Coordinator ID: ${lecturerId}`);

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
    console.error(`[${timestamp}] [bulkUploadCourses] Error updating Excel template:`, excelError);
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

export async function updateCourse({ id, courseCode, courseTitle, creditHours, level, academicSemester, programId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [updateCourse] Action called for ID: ${id}`);

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
      console.error(`[${timestamp}] [updateCourse] Error updating Excel template:`, excelError);
      // Continue with the function even if Excel update fails
    }

    revalidatePath('/registry/courses'); // Adjust path if needed

    console.log(`[${timestamp}] [updateCourse] Course updated successfully:`, updatedCourse.courseCode);
    return { success: true, course: updatedCourse };

  } catch (error) {
    console.error(`[${timestamp}] [updateCourse] Error:`, error.message, error.stack);
    if (error.code === 'P2002') {
      return { success: false, error: `A course with code '${courseCode.trim()}' already exists for this program, level, and semester.` };
    }
    if (error.code === 'P2025') {
        return { success: false, error: `Course with ID '${id}' not found.` };
    }
    return { success: false, error: `Failed to update course: ${error.message || "Unknown error."}` };
  }
}


// NEW ACTION: getDepartments (useful for program/course linking)
export async function getDepartments(centerId = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getDepartments] Action called. Filter by centerId: ${centerId}`);

  try {
    const whereClause = {};
    
    // For many-to-many, we need to filter based on center assignments
    if (centerId) {
      whereClause.centerAssignments = {
        some: {
          centerId: centerId
        }
      };
    }

    const departments = await prisma.department.findMany({
      where: whereClause,
      include: {
        centerAssignments: {
          include: {
            center: { select: { id: true, name: true } }
          }
        },
        programAssignments: {
          include: {
            program: {
              select: {
                id: true,
                programCode: true,
                programTitle: true,
                programCategory: true
              }
            }
          }
        },
        _count: { 
          select: { 
            lecturers: true, 
            programAssignments: true,
            centerAssignments: true
          } 
        }
      },
      orderBy: { name: 'asc' },
    });

    const formattedDepartments = departments.map(d => ({
      ...d,
      centers: d.centerAssignments.map(assignment => assignment.center),
      programs: d.programAssignments.map(assignment => assignment.program),
      centerName: d.centerAssignments.length > 0 ? d.centerAssignments[0].center.name : null, // For backward compatibility
      lecturerCount: d._count.lecturers,
      programCount: d._count.programAssignments,
      centerCount: d._count.centerAssignments
    }));

    return { success: true, departments: formattedDepartments };
  } catch (error) {
    console.error(`[${timestamp}] [getDepartments] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch departments." };
  }
}

// UPDATED ACTION: createDepartment (now supports many-to-many center assignments)
export async function createDepartment({ name, centerIds = [] }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [createDepartment] Name: ${name}, CenterIDs: ${JSON.stringify(centerIds)}`);

  if (!name?.trim()) {
    return { success: false, error: "Department name is required." };
  }

  if (!Array.isArray(centerIds) || centerIds.length === 0) {
    return { success: false, error: "At least one center must be selected." };
  }

  try {
    // Check if all centers exist
    const existingCenters = await prisma.center.findMany({
      where: { id: { in: centerIds } },
      select: { id: true, name: true }
    });

    if (existingCenters.length !== centerIds.length) {
      const missingIds = centerIds.filter(id => !existingCenters.find(c => c.id === id));
      return { success: false, error: `Centers not found: ${missingIds.join(', ')}` };
    }

    // Check if department name already exists
    const existingDepartment = await prisma.department.findFirst({
      where: { name: name.trim() }
    });

    if (existingDepartment) {
      return { success: false, error: `A department with name '${name.trim()}' already exists.` };
    }

    const newDepartment = await prisma.department.create({
      data: {
        name: name.trim(),
        centerAssignments: {
          create: centerIds.map(centerId => ({
            centerId: centerId
          }))
        }
      },
      include: {
        centerAssignments: {
          include: {
            center: { select: { id: true, name: true } }
          }
        },
        _count: {
          select: {
            lecturers: true,
            programAssignments: true,
            centerAssignments: true
          }
        }
      }
    });

    revalidatePath('/registry/departments');
    revalidatePath('/registry/courses');

    return { success: true, department: newDepartment };

  } catch (error) {
    console.error(`[${timestamp}] [createDepartment] Error:`, error.message, error.stack);
    return { success: false, error: `Failed to create department: ${error.message || "Unknown error."}` };
  }
}

// UPDATED ACTION: updateDepartment (now supports many-to-many center assignments)
export async function updateDepartment({ id, name, centerIds = [] }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [updateDepartment] Action called for ID: ${id}, Name: ${name}, CenterIDs: ${JSON.stringify(centerIds)}`);

  if (!id || !name?.trim()) {
    return { success: false, error: "Department ID and name are required." };
  }

  if (!Array.isArray(centerIds) || centerIds.length === 0) {
    return { success: false, error: "At least one center must be selected." };
  }

  try {
    // Check if all centers exist
    const existingCenters = await prisma.center.findMany({
      where: { id: { in: centerIds } },
      select: { id: true, name: true }
    });

    if (existingCenters.length !== centerIds.length) {
      const missingIds = centerIds.filter(id => !existingCenters.find(c => c.id === id));
      return { success: false, error: `Centers not found: ${missingIds.join(', ')}` };
    }

    // Check if department name already exists (excluding current department)
    const existingDepartment = await prisma.department.findFirst({
      where: { 
        name: name.trim(),
        NOT: { id: id }
      }
    });

    if (existingDepartment) {
      return { success: false, error: `A department with name '${name.trim()}' already exists.` };
    }

    const updatedDepartment = await prisma.department.update({
      where: { id: id },
      data: {
        name: name.trim(),
        centerAssignments: {
          deleteMany: {}, // Remove all existing center assignments
          create: centerIds.map(centerId => ({
            centerId: centerId
          }))
        }
      },
      include: {
        centerAssignments: {
          include: {
            center: { select: { id: true, name: true } }
          }
        },
        _count: {
          select: {
            lecturers: true,
            programAssignments: true,
            centerAssignments: true
          }
        }
      }
    });

    revalidatePath('/registry');
    revalidatePath('/registry/courses');

    return { success: true, department: updatedDepartment };

  } catch (error) {
    console.error(`[${timestamp}] [updateDepartment] Error:`, error.message, error.stack);
    if (error.code === 'P2025') {
      return { success: false, error: `Department with ID '${id}' not found.` };
    }
    return { success: false, error: `Failed to update department: ${error.message || "Unknown error."}` };
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
      if (!processor || processor.role !== 'STAFF_REGISTRY') return { success: false, error: "Unauthorized: Must be STAFF_REGISTRY." };
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
            await prisma.signupRequest.update({ where: { id: requestId }, data: { status: 'REJECTED', processedAt: new Date(), registryProcessor: { connect: { id: registryUserId }} } });
            revalidatePath('/registry/requests');
        } catch (rejectError) { console.error(`[${timestamp}] [approveSR] Fail to mark REJECTED after P2002:`, rejectError.message, rejectError.stack); }
        return { success: false, error: "User email exists. Request rejected." };
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('accountNumber')) {
        try {
            await prisma.signupRequest.update({ where: { id: requestId }, data: { status: 'REJECTED', processedAt: new Date(), registryProcessor: { connect: { id: registryUserId }} } });
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

export async function getSystemOverviewData() {
  const timestamp = new Date().toISOString();
  try {
    // --- Perform Health Checks ---
    let dbHealth = { status: 'error', message: 'Unknown database error.' };
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbHealth = { status: 'ok', message: 'Database connection successful.' };
    } catch (e) {
      console.error(`[${timestamp}] [System Health] Database check failed:`, e.message);
      dbHealth = { status: 'error', message: e.message };
    }

    let mapsHealth = { status: 'ok', message: 'API Key is configured on the server.' };
    if (!process.env.Maps_API_KEY) {
      mapsHealth = { status: 'misconfigured', message: 'Maps_API_KEY is not set in server environment variables.' };
      console.warn(`[${timestamp}] [System Health] Google Maps API key is not configured.`);
    }

    const health = {
        database: dbHealth,
        googleMaps: mapsHealth,
    };
    
    // --- Fetch Statistics and Activity ---
    const [
        userCount,
        centerCount,
        pendingClaimsCount,
        approvedClaimsCount,
        rejectedClaimsCount,
        pendingSignupsCount,
        recentClaims,
        recentUsers,
        recentApprovals,
    ] = await prisma.$transaction([
        prisma.user.count(),
        prisma.center.count(),
        prisma.claim.count({ where: { status: 'PENDING' } }),
        prisma.claim.count({ where: { status: 'APPROVED' } }),
        prisma.claim.count({ where: { status: 'REJECTED' } }),
        prisma.signupRequest.count({ where: { status: 'PENDING' } }),
        prisma.claim.findMany({
            take: 5,
            orderBy: { submittedAt: 'desc' },
            include: { submittedBy: { select: { name: true } }, center: { select: { name: true } } }
        }),
        prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { name: true, role: true, createdAt: true }
        }),
        prisma.signupRequest.findMany({
            where: { status: 'APPROVED' },
            take: 3,
            orderBy: { processedAt: 'desc' },
            select: { name: true, processedAt: true }
        })
    ]);
    
    const activityFeed = [
        ...recentClaims.map(c => ({ 
            type: 'NEW_CLAIM', 
            timestamp: c.submittedAt, 
            details: `A ${c.claimType.toLowerCase().replace('_',' ')} claim was submitted by ${c.submittedBy.name} for ${c.center.name}.` 
        })),
        ...recentUsers.map(u => ({ 
            type: 'NEW_USER_REQUEST', // Assuming creation comes from requests for now
            timestamp: u.createdAt, 
            details: `A new user account was created for ${u.name} with the role of ${u.role}.` 
        })),
        ...recentApprovals.map(r => ({
            type: 'CLAIM_PROCESSED', // Using a generic processed icon
            timestamp: r.processedAt,
            details: `The signup request for ${r.name} was approved.`
        }))
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 7); // Get the 7 most recent activities overall

    return { 
        success: true, 
        stats: { userCount, centerCount, pendingClaimsCount, approvedClaimsCount, rejectedClaimsCount, pendingSignupsCount },
        activityFeed,
        health
    };
  } catch (error) {
    console.error(`[${timestamp}] [getSystemOverviewData] Error:`, error.message);
    return { 
        success: false, 
        error: "Failed to fetch system overview data.",
        stats: {},
        activityFeed: [],
        health: { database: { status: 'error', message: error.message }, googleMaps: { status: 'unknown' } }
    };
  }
}

// Delete course function
// Function to unassign a course from all lecturers
export async function unassignCourseFromLecturers(courseId) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [unassignCourseFromLecturers] Action called for courseId:`, courseId);
  
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
    
    console.log(`[${timestamp}] [unassignCourseFromLecturers] Successfully unassigned course from ${deleteResult.count} lecturers`);
    
    return { 
      success: true, 
      message: `Successfully unassigned course from ${deleteResult.count} lecturers`, 
      unassignedCount: deleteResult.count,
      unassignedFrom: assignments.map(a => ({ id: a.lecturerId, name: a.lecturer.name }))
    };
    
  } catch (error) {
    console.error(`[${timestamp}] [unassignCourseFromLecturers] Error:`, error.message, error.stack);
    return { success: false, error: `Failed to unassign course: ${error.message || "Unknown error"}` };
  }
}

// Function to unassign specific courses from a specific lecturer
export async function unassignCoursesFromLecturer({ courseIds, lecturerId }) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [unassignCoursesFromLecturer] Course IDs: ${courseIds}, Lecturer ID: ${lecturerId}`);

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

    console.log(`[${timestamp}] [unassignCoursesFromLecturer] Successfully unassigned ${deleteResult.count} courses from ${user.name}`);

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
    console.error(`[${timestamp}] [unassignCoursesFromLecturer] Error:`, error.message, error.stack);
    return { success: false, error: `Failed to unassign courses: ${error.message || "Unknown error"}` };
  }
}

export async function deleteCourse(id) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [deleteCourse] Action called for ID:`, id);
  console.log(`[${timestamp}] [deleteCourse] ID type:`, typeof id);
  console.log(`[${timestamp}] [deleteCourse] ID stringified:`, JSON.stringify(id));

  if (!id) {
    console.log(`[${timestamp}] [deleteCourse] ID is falsy, returning error`);
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
      console.error(`[${timestamp}] [deleteCourse] Error updating Excel template:`, excelError);
      // Continue with the function even if Excel update fails
    }

    revalidatePath('/registry/courses');

    console.log(`[${timestamp}] [deleteCourse] Successfully deleted course: ${course.courseCode} - ${course.courseTitle}`);
    const result = { 
      success: true, 
      message: `Successfully deleted course: ${course.courseCode} - ${course.courseTitle}` 
    };
    console.log(`[${timestamp}] [deleteCourse] Returning success result:`, result);
    return result;

  } catch (error) {
    console.error(`[${timestamp}] [deleteCourse] Error:`, error.message, error.stack);
    
    // Handle foreign key constraint violations
    if (error.code === 'P2003') {
      return { 
        success: false, 
        error: "Cannot delete this course because it is referenced by other records in the system." 
      };
    }
    
    const errorResult = { success: false, error: `Failed to delete course: ${error.message || "Unknown error."}` };
    console.log(`[${timestamp}] [deleteCourse] Returning error result:`, errorResult);
    return errorResult;
  }
}

// Delete program function
export async function deleteProgram(id) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [deleteProgram] Action called for ID:`, id);
  console.log(`[${timestamp}] [deleteProgram] ID type:`, typeof id);
  
  if (!id) {
    return { success: false, error: "Program ID is required for deletion." };
  }
  
  // Extract string ID if object was passed
  const programId = typeof id === 'object' && id !== null ? id.id : id;

  try {
    // First, check if the program has any courses
    const courseCount = await prisma.course.count({
      where: { programId }
    });

    if (courseCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete this program because it has ${courseCount} course(s) associated with it. Please delete all courses first.` 
      };
    }

    // Find the program to get its information for logging
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: { programCode: true, programTitle: true }
    });

    if (!program) {
      return { success: false, error: "Program not found." };
    }

    // Delete the program
    await prisma.program.delete({
      where: { id: programId }
    });

    revalidatePath('/registry/courses');

    console.log(`[${timestamp}] [deleteProgram] Successfully deleted program: ${program.programCode} - ${program.programTitle}`);
    return { 
      success: true, 
      message: `Successfully deleted program: ${program.programCode} - ${program.programTitle}` 
    };

  } catch (error) {
    console.error(`[${timestamp}] [deleteProgram] Error:`, error.message, error.stack);
    
    // Handle foreign key constraint violations
    if (error.code === 'P2003') {
      return { 
        success: false, 
        error: "Cannot delete this program because it is referenced by other records in the system." 
      };
    }
    
    return { success: false, error: `Failed to delete program: ${error.message || "Unknown error."}` };
  }
}

// Delete department function
// UPDATED ACTION: deleteDepartment (now handles many-to-many relationships)
export async function deleteDepartment(id) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [deleteDepartment] Action called for ID:`, id);
  console.log(`[${timestamp}] [deleteDepartment] ID type:`, typeof id);
  
  if (!id) {
    return { success: false, error: "Department ID is required for deletion." };
  }
  
  // Extract string ID if object was passed
  const departmentId = typeof id === 'object' && id !== null ? id.id : id;

  try {
    // Check if there are any programs assigned to this department (many-to-many)
    const programAssignmentCount = await prisma.programDepartmentAssignment.count({
      where: { departmentId: departmentId }
    });

    if (programAssignmentCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete this department because it has ${programAssignmentCount} program assignment(s). Please unassign all programs first.` 
      };
    }

    // Check if there are any lecturers in this department
    const lecturerCount = await prisma.user.count({
      where: { 
        departmentId: departmentId
      }
    });

    if (lecturerCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete this department because it has ${lecturerCount} lecturer(s) assigned to it. Please reassign all lecturers first.` 
      };
    }

    // Find department for logging
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { 
        name: true,
        centerAssignments: {
          include: {
            center: { select: { name: true } }
          }
        }
      }
    });

    if (!department) {
      return { success: false, error: "Department not found." };
    }

    // Delete the department (this will cascade delete centerAssignments due to onDelete: Cascade)
    await prisma.department.delete({
      where: { id: departmentId }
    });

    revalidatePath('/registry/courses');
    revalidatePath('/registry/departments');

    console.log(`[${timestamp}] [deleteDepartment] Successfully deleted department: ${department.name}`);
    return { 
      success: true, 
      message: `Successfully deleted department: ${department.name}` 
    };

  } catch (error) {
    console.error(`[${timestamp}] [deleteDepartment] Error:`, error.message, error.stack);
    
    // Handle foreign key constraint violations
    if (error.code === 'P2003') {
      return { 
        success: false, 
        error: "Cannot delete this department because it is referenced by other records in the system." 
      };
    }
    
    return { success: false, error: `Failed to delete department: ${error.message || "Unknown error."}` };
  }
}

// NEW MANY-TO-MANY ACTIONS: Program-Department and Department-Center assignments

// ACTION: assignProgramsToDepartments - Create many-to-many assignments between programs and departments
export async function assignProgramsToDepartments(programIds, departmentIds) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [assignProgramsToDepartments] Action called with programIds:`, programIds, 'departmentIds:', departmentIds);
  
  try {
    if (!Array.isArray(programIds) || !Array.isArray(departmentIds) || programIds.length === 0 || departmentIds.length === 0) {
      return { success: false, error: 'Program IDs and department IDs are required' };
    }

    // Create assignment records for all combinations
    const assignmentsToCreate = [];
    for (const programId of programIds) {
      for (const departmentId of departmentIds) {
        assignmentsToCreate.push({
          programId,
          departmentId
        });
      }
    }

    // Create the assignments (skipDuplicates to avoid errors on existing assignments)
    const result = await prisma.programDepartmentAssignment.createMany({
      data: assignmentsToCreate,
      skipDuplicates: true
    });

    revalidatePath('/registry');
    console.log(`[${timestamp}] [assignProgramsToDepartments] Successfully created ${result.count} program-department assignments`);
    return { success: true, assignedCount: result.count };
  } catch (error) {
    console.error(`[${timestamp}] [assignProgramsToDepartments] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to assign programs to departments' };
  }
}

// ACTION: unassignProgramsFromDepartments - Remove specific program-department assignments
export async function unassignProgramsFromDepartments(programIds, departmentIds) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [unassignProgramsFromDepartments] Action called with programIds:`, programIds, 'departmentIds:', departmentIds);
  
  try {
    if (!Array.isArray(programIds) || !Array.isArray(departmentIds)) {
      return { success: false, error: 'Program IDs and department IDs are required' };
    }

    // Remove specific assignments
    const result = await prisma.programDepartmentAssignment.deleteMany({
      where: {
        programId: { in: programIds },
        departmentId: { in: departmentIds }
      }
    });

    revalidatePath('/registry');
    console.log(`[${timestamp}] [unassignProgramsFromDepartments] Successfully removed ${result.count} program-department assignments`);
    return { success: true, unassignedCount: result.count };
  } catch (error) {
    console.error(`[${timestamp}] [unassignProgramsFromDepartments] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to unassign programs from departments' };
  }
}

// ACTION: getDepartmentsWithPrograms - Get departments with their assigned programs (many-to-many)
export async function getDepartmentsWithPrograms() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getDepartmentsWithPrograms] Action called`);
  
  try {
    const departments = await prisma.department.findMany({
      include: {
        programAssignments: {
          include: {
            program: {
              select: {
                id: true,
                programCode: true,
                programTitle: true,
                programCategory: true
              }
            }
          },
          orderBy: {
            program: { programTitle: 'asc' }
          }
        },
        centerAssignments: {
          include: {
            center: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            programAssignments: true,
            lecturers: true,
            centerAssignments: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform the data to match the expected format
    const formattedDepartments = departments.map(dept => ({
      ...dept,
      programs: dept.programAssignments.map(assignment => assignment.program),
      centers: dept.centerAssignments.map(assignment => assignment.center),
      _count: {
        programs: dept._count.programAssignments,
        lecturers: dept._count.lecturers,
        centers: dept._count.centerAssignments
      }
    }));

    console.log(`[${timestamp}] [getDepartmentsWithPrograms] Fetched ${formattedDepartments.length} departments`);
    return { success: true, departments: formattedDepartments };
  } catch (error) {
    console.error(`[${timestamp}] [getDepartmentsWithPrograms] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to fetch departments' };
  }
}

// ACTION: getAvailablePrograms - Get all programs with their department assignments
export async function getAvailablePrograms() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getAvailablePrograms] Action called`);
  
  try {
    // Get all programs with their department assignments
    const programs = await prisma.program.findMany({
      include: {
        departmentAssignments: {
          include: {
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { programTitle: 'asc' }
    });

    // Transform the data
    const formattedPrograms = programs.map(program => ({
      ...program,
      departments: program.departmentAssignments.map(assignment => assignment.department),
      isAssigned: program.departmentAssignments.length > 0
    }));

    console.log(`[${timestamp}] [getAvailablePrograms] Found ${formattedPrograms.length} programs`);
    return { success: true, programs: formattedPrograms };
  } catch (error) {
    console.error(`[${timestamp}] [getAvailablePrograms] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to fetch programs' };
  }
}

// ACTION: assignDepartmentsToCenter - Create many-to-many assignments between departments and centers
export async function assignDepartmentsToCenter(centerId, departmentIds) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [assignDepartmentsToCenter] Action called with centerId: ${centerId}, departmentIds:`, departmentIds);
  
  try {
    if (!centerId || !Array.isArray(departmentIds) || departmentIds.length === 0) {
      return { success: false, error: 'Center ID and department IDs are required' };
    }

    // Verify center exists
    const center = await prisma.center.findUnique({
      where: { id: centerId },
      select: { id: true, name: true }
    });
    
    if (!center) {
      return { success: false, error: 'Center not found' };
    }

    // Create assignment records
    const assignmentsToCreate = departmentIds.map(departmentId => ({
      centerId,
      departmentId
    }));

    const result = await prisma.departmentCenterAssignment.createMany({
      data: assignmentsToCreate,
      skipDuplicates: true
    });

    revalidatePath('/registry');
    console.log(`[${timestamp}] [assignDepartmentsToCenter] Successfully assigned ${result.count} departments to center: ${center.name}`);
    return { success: true, assignedCount: result.count };
  } catch (error) {
    console.error(`[${timestamp}] [assignDepartmentsToCenter] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to assign departments to center' };
  }
}

// NEW ACTION: unassignCentersFromDepartment (remove center assignments from a department)
export async function unassignCentersFromDepartment(centerIds, departmentId) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [unassignCentersFromDepartment] CenterIDs: ${JSON.stringify(centerIds)}, DepartmentID: ${departmentId}`);

  if (!Array.isArray(centerIds) || centerIds.length === 0 || !departmentId) {
    return { success: false, error: "Center IDs array and Department ID are required." };
  }

  try {
    // Verify that the department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true, name: true }
    });

    if (!department) {
      return { success: false, error: "Department not found." };
    }

    // Check for existing assignments
    const existingAssignments = await prisma.departmentCenterAssignment.findMany({
      where: {
        departmentId: departmentId,
        centerId: { in: centerIds }
      }
    });

    if (existingAssignments.length === 0) {
      return { success: false, error: "No assignments found to unassign." };
    }

    // Check if this would leave the department with no centers
    const totalAssignments = await prisma.departmentCenterAssignment.count({
      where: { departmentId: departmentId }
    });

    if (totalAssignments === existingAssignments.length) {
      return { 
        success: false, 
        error: "Cannot unassign all centers from a department. A department must be assigned to at least one center." 
      };
    }

    // Remove the assignments
    await prisma.departmentCenterAssignment.deleteMany({
      where: {
        departmentId: departmentId,
        centerId: { in: centerIds }
      }
    });

    revalidatePath('/registry/courses');
    revalidatePath('/registry/departments');

    return { 
      success: true, 
      message: `Successfully unassigned ${existingAssignments.length} center(s) from department: ${department.name}`,
      unassignedCount: existingAssignments.length
    };

  } catch (error) {
    console.error(`[${timestamp}] [unassignCentersFromDepartment] Error:`, error.message, error.stack);
    return { success: false, error: `Failed to unassign centers from department: ${error.message || "Unknown error."}` };
  }
}

// ACTION: unassignDepartmentsFromCenter - Remove department-center assignments
export async function unassignDepartmentsFromCenter(centerId, departmentIds) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [unassignDepartmentsFromCenter] Action called with centerId: ${centerId}, departmentIds:`, departmentIds);
  
  try {
    if (!centerId || !Array.isArray(departmentIds) || departmentIds.length === 0) {
      return { success: false, error: 'Center ID and department IDs are required' };
    }

    // Remove assignments
    const result = await prisma.departmentCenterAssignment.deleteMany({
      where: {
        centerId,
        departmentId: { in: departmentIds }
      }
    });

    revalidatePath('/registry');
    console.log(`[${timestamp}] [unassignDepartmentsFromCenter] Successfully unassigned ${result.count} departments from center`);
    return { success: true, unassignedCount: result.count };
  } catch (error) {
    console.error(`[${timestamp}] [unassignDepartmentsFromCenter] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to unassign departments from center' };
  }
}

// ACTION: getAvailableDepartments - Get all departments with their center assignments
export async function getAvailableDepartments() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getAvailableDepartments] Action called`);
  
  try {
    const departments = await prisma.department.findMany({
      include: {
        centerAssignments: {
          include: {
            center: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        programAssignments: {
          include: {
            program: {
              select: {
                id: true,
                programTitle: true
              }
            }
          }
        },
        _count: {
          select: { 
            programAssignments: true,
            centerAssignments: true 
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform the data
    const formattedDepartments = departments.map(dept => ({
      ...dept,
      centers: dept.centerAssignments.map(assignment => assignment.center),
      programs: dept.programAssignments.map(assignment => assignment.program),
      isAssigned: dept.centerAssignments.length > 0,
      _count: {
        programs: dept._count.programAssignments,
        centers: dept._count.centerAssignments
      }
    }));

    console.log(`[${timestamp}] [getAvailableDepartments] Found ${formattedDepartments.length} departments`);
    return { success: true, departments: formattedDepartments };
  } catch (error) {
    console.error(`[${timestamp}] [getAvailableDepartments] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to fetch departments' };
  }
}

// ACTION: getCentersWithDepartments - Get centers with their assigned departments (many-to-many)
export async function getCentersWithDepartments() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [getCentersWithDepartments] Action called`);
  
  try {
    const centers = await prisma.center.findMany({
      include: {
        coordinator: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            role: true, 
            designation: true 
          } 
        },
        departmentAssignments: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                programAssignments: {
                  include: {
                    program: {
                      select: {
                        id: true,
                        programTitle: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        _count: { 
          select: { 
            lecturers: true, 
            departmentAssignments: true, 
            claims: true, 
            staffRegistryAssignments: true 
          } 
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform the data
    const formattedCenters = centers.map(center => ({
      ...center,
      departments: center.departmentAssignments.map(assignment => ({
        ...assignment.department,
        programs: assignment.department.programAssignments.map(pa => pa.program)
      })),
      lecturerCount: center._count?.lecturers || 0,
      departmentCount: center._count?.departmentAssignments || 0,
      claimsCount: center._count?.claims || 0,
      staffRegistryCount: center._count?.staffRegistryAssignments || 0
    }));

    console.log(`[${timestamp}] [getCentersWithDepartments] Fetched ${formattedCenters.length} centers`);
    return { success: true, centers: formattedCenters };
  } catch (error) {
    console.error(`[${timestamp}] [getCentersWithDepartments] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to fetch centers with departments' };
  }
}