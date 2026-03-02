// lib/actions/registry/centers.actions.js
"use server";
import logger from '@/lib/logger';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRegistryAuth } from './auth-helpers';

export async function getPotentialCoordinators() {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

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
    logger.error(`[getPotentialCoordinators] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch potential coordinators." };
  }
}

export async function createCenter({ name, coordinatorId, departmentIds = [] }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

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
    logger.error(`[createCenter] Error:`, error.message, error.stack);
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('name')) return { success: false, error: "A center with this name already exists." };
      if (error.meta?.target?.includes('coordinatorId')) return { success: false, error: "This user is already a coordinator." };
    }
    return { success: false, error: "Failed to create center." };
  }
}

export async function updateCenter({ centerId, name, coordinatorId }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [updateCenter] Action called with data:`, { centerId, name, coordinatorId });

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

    logger.info(` [updateCenter] Center updated successfully:`, formattedCenter);
    
    // Revalidate relevant paths
    revalidatePath('/registry/centers');
    revalidatePath('/registry/users');
    
    return { success: true, center: formattedCenter };
  } catch (error) {
    logger.error(`[updateCenter] Error:`, error.message, error.stack);
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
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

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
    logger.info(` [getCenters] Fetched ${formattedCenters.length} centers. Data:`, formattedCenters);
    return { success: true, centers: formattedCenters };
  } catch (error) {
    logger.error(`[getCenters] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch centers." };
  }
}

export async function deleteCenterByRegistry({ centerId, registryUserId }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };
  registryUserId = auth.session.userId;

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
    logger.error(`[deleteCenterByRegistry] Error:`, error.message, error.stack, JSON.stringify(error.meta));
    if (error.code === 'P2025') return { success: false, error: "Center not found or already deleted."};
    if (error.code === 'P2003') {
        const fieldName = error.meta?.field_name || "related records";
        return { success: false, error: `Cannot delete center. It is still linked by other records (e.g., via field '${fieldName}'). Ensure all dependencies have 'onDelete: Cascade' or are manually handled.`};
    }
    return { success: false, error: "Failed to delete center. " + (error.message || "An unexpected error occurred.") };
  }
}

export async function getPublicCenters() {

  try {
    const centers = await prisma.center.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' }});
    return { success: true, centers };
  } catch (error) {
    logger.error(`[getPublicCenters] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch public centers list." };
  }
}

// ACTION: assignDepartmentsToCenter - Create many-to-many assignments between departments and centers
export async function assignDepartmentsToCenter(centerId, departmentIds) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [assignDepartmentsToCenter] Action called with centerId: ${centerId}, departmentIds:`, departmentIds);
  
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
    logger.info(` [assignDepartmentsToCenter] Successfully assigned ${result.count} departments to center: ${center.name}`);
    return { success: true, assignedCount: result.count };
  } catch (error) {
    logger.error(`[assignDepartmentsToCenter] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to assign departments to center' };
  }
}

// ACTION: unassignDepartmentsFromCenter - Remove department-center assignments
export async function unassignDepartmentsFromCenter(centerId, departmentIds) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [unassignDepartmentsFromCenter] Action called with centerId: ${centerId}, departmentIds:`, departmentIds);
  
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
    logger.info(` [unassignDepartmentsFromCenter] Successfully unassigned ${result.count} departments from center`);
    return { success: true, unassignedCount: result.count };
  } catch (error) {
    logger.error(`[unassignDepartmentsFromCenter] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to unassign departments from center' };
  }
}

// ACTION: getCentersWithDepartments - Get centers with their assigned departments (many-to-many)
export async function getCentersWithDepartments() {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [getCentersWithDepartments] Action called`);
  
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

    logger.info(` [getCentersWithDepartments] Fetched ${formattedCenters.length} centers`);
    return { success: true, centers: formattedCenters };
  } catch (error) {
    logger.error(`[getCentersWithDepartments] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to fetch centers with departments' };
  }
}
