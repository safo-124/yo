// lib/actions/registry/departments.actions.js
"use server";
import logger from '@/lib/logger';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRegistryAuth } from './auth-helpers';

// NEW ACTION: getDepartments (useful for program/course linking)
export async function getDepartments(centerId = null) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [getDepartments] Action called. Filter by centerId: ${centerId}`);

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
    logger.error(`[getDepartments] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch departments." };
  }
}

// UPDATED ACTION: createDepartment (now supports many-to-many center assignments)
export async function createDepartment({ name, centerIds = [] }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [createDepartment] Name: ${name}, CenterIDs: ${JSON.stringify(centerIds)}`);

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
    logger.error(`[createDepartment] Error:`, error.message, error.stack);
    return { success: false, error: `Failed to create department: ${error.message || "Unknown error."}` };
  }
}

// UPDATED ACTION: updateDepartment (now supports many-to-many center assignments)
export async function updateDepartment({ id, name, centerIds = [] }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [updateDepartment] Action called for ID: ${id}, Name: ${name}, CenterIDs: ${JSON.stringify(centerIds)}`);

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
    logger.error(`[updateDepartment] Error:`, error.message, error.stack);
    if (error.code === 'P2025') {
      return { success: false, error: `Department with ID '${id}' not found.` };
    }
    return { success: false, error: `Failed to update department: ${error.message || "Unknown error."}` };
  }
}

// Delete department function
// UPDATED ACTION: deleteDepartment (now handles many-to-many relationships)
export async function deleteDepartment(id) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [deleteDepartment] Action called for ID:`, id);
  logger.info(` [deleteDepartment] ID type:`, typeof id);
  
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

    logger.info(` [deleteDepartment] Successfully deleted department: ${department.name}`);
    return { 
      success: true, 
      message: `Successfully deleted department: ${department.name}` 
    };

  } catch (error) {
    logger.error(`[deleteDepartment] Error:`, error.message, error.stack);
    
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

// ACTION: getDepartmentsWithPrograms - Get departments with their assigned programs (many-to-many)
export async function getDepartmentsWithPrograms() {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [getDepartmentsWithPrograms] Action called`);
  
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

    logger.info(` [getDepartmentsWithPrograms] Fetched ${formattedDepartments.length} departments`);
    return { success: true, departments: formattedDepartments };
  } catch (error) {
    logger.error(`[getDepartmentsWithPrograms] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to fetch departments' };
  }
}

// ACTION: getAvailableDepartments - Get all departments with their center assignments
export async function getAvailableDepartments() {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [getAvailableDepartments] Action called`);
  
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

    logger.info(` [getAvailableDepartments] Found ${formattedDepartments.length} departments`);
    return { success: true, departments: formattedDepartments };
  } catch (error) {
    logger.error(`[getAvailableDepartments] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to fetch departments' };
  }
}

// NEW ACTION: unassignCentersFromDepartment (remove center assignments from a department)
export async function unassignCentersFromDepartment(centerIds, departmentId) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [unassignCentersFromDepartment] CenterIDs: ${JSON.stringify(centerIds)}, DepartmentID: ${departmentId}`);

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
    logger.error(`[unassignCentersFromDepartment] Error:`, error.message, error.stack);
    return { success: false, error: `Failed to unassign centers from department: ${error.message || "Unknown error."}` };
  }
}
