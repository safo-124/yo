// lib/actions/registry/users.actions.js
"use server";
import logger from '@/lib/logger';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { requireRegistryAuth } from './auth-helpers';

export async function createUserByRegistry({ name, email, password, role, designation, lecturerCenterId, departmentId, bankName, bankBranch, accountName, accountNumber, phoneNumber }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [createUserByRegistry] Action called with data:`, { name, email, role, designation, lecturerCenterId, departmentId, bankName, bankBranch, accountName, accountNumber, phoneNumber });

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
    logger.info(` [createUserByRegistry] User created successfully:`, userToReturn);
    return { success: true, user: userToReturn };
  } catch (error) {
    logger.error(`[createUserByRegistry] Error caught in action:`, error.message, error.stack);
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

export async function getAllUsers({ page = 1, pageSize = 50, search = '' } = {}) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  try {
    const skip = (page - 1) * pageSize;
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    } : {};
    
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
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
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);
    const formattedUsers = users.map(user => ({
      ...user,
      coordinatedCenterName: user.Center_Center_coordinatorIdToUser?.name,
      lecturerCenterName: user.Center_User_lecturerCenterIdToCenter?.name,
      departmentName: user.Department?.name,
      staffRegistryAssignedCenterNames: user.staffRegistryCenterAssignments?.map(a => a.center?.name).filter(Boolean) || [],
      staffRegistryAssignedCentersData: user.staffRegistryCenterAssignments?.map(a => a.center ? {id: a.center.id, name: a.center.name} : null).filter(Boolean) || [],
    }));
    return { success: true, users: formattedUsers, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
  } catch (error) {
    logger.error(`[getAllUsers] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch users." };
  }
}

export async function updateUserRoleAndAssignmentsByRegistry({
  userId, newRole, newDesignation, newCenterId, newDepartmentId, newStaffRegistryCenterIds,
  newBankName, newBankBranch, newAccountName, newAccountNumber, newPhoneNumber
}) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

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
    logger.error(`[updateUserRoleAndAssignmentsByRegistry] Error:`, error.message, error.stack);
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

export async function updateUserPasswordByRegistry({ userId, newPassword }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  try {
    const userToUpdate = await prisma.user.findUnique({where: {id: userId}, select: { id: true }});
    if (!userToUpdate) return { success: false, error: "User not found." };
    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword }});
    return { success: true, message: "User password updated successfully." };
  } catch (error) {
    logger.error(`[updateUserPasswordByRegistry] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to update user password." };
  }
}

export async function deleteUserByRegistry({ userIdToDelete, registryUserId }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };
  registryUserId = auth.session.userId;

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
    logger.error(`[deleteUserByRegistry] Error:`, error.message, error.stack, JSON.stringify(error.meta));
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
