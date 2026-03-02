// lib/actions/registry/programs.actions.js
"use server";
import logger from '@/lib/logger';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRegistryAuth } from './auth-helpers';

// UPDATED ACTION: createProgram (now supports many-to-many department assignments)
export async function createProgram({ programCode, programTitle, programCategory, departmentIds = [] }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [createProgram] Code: ${programCode}, Title: ${programTitle}, Category: ${programCategory}, DepartmentIDs: ${JSON.stringify(departmentIds)}`);

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
    logger.error(`[createProgram] Error:`, error.message, error.stack);
    return { success: false, error: `Failed to create program: ${error.message || "Unknown error."}` };
  }
}


// NEW ACTION: getPrograms (with optional department filter)
export async function getPrograms(departmentId = null) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [getPrograms] Action called. Filter by departmentId: ${departmentId}`);

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
    logger.error(`[getPrograms] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch programs." };
  }
}

// UPDATED ACTION: updateProgram (now supports many-to-many department assignments)
export async function updateProgram({ id, programCode, programTitle, programCategory, departmentIds = [] }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [updateProgram] Action called for ID: ${id}, Code: ${programCode}, DepartmentIDs: ${JSON.stringify(departmentIds)}`);

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
    logger.error(`[updateProgram] Error:`, error.message, error.stack);
    if (error.code === 'P2025') {
      return { success: false, error: `Program with ID '${id}' not found.` };
    }
    return { success: false, error: `Failed to update program: ${error.message || "Unknown error."}` };
  }
}

// Delete program function
export async function deleteProgram(id) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [deleteProgram] Action called for ID:`, id);
  logger.info(` [deleteProgram] ID type:`, typeof id);
  
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

    logger.info(` [deleteProgram] Successfully deleted program: ${program.programCode} - ${program.programTitle}`);
    return { 
      success: true, 
      message: `Successfully deleted program: ${program.programCode} - ${program.programTitle}` 
    };

  } catch (error) {
    logger.error(`[deleteProgram] Error:`, error.message, error.stack);
    
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

// ACTION: getAvailablePrograms - Get all programs with their department assignments
export async function getAvailablePrograms() {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [getAvailablePrograms] Action called`);
  
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

    logger.info(` [getAvailablePrograms] Found ${formattedPrograms.length} programs`);
    return { success: true, programs: formattedPrograms };
  } catch (error) {
    logger.error(`[getAvailablePrograms] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to fetch programs' };
  }
}

// ACTION: assignProgramsToDepartments - Create many-to-many assignments between programs and departments
export async function assignProgramsToDepartments(programIds, departmentIds) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [assignProgramsToDepartments] Action called with programIds:`, programIds, 'departmentIds:', departmentIds);
  
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
    logger.info(` [assignProgramsToDepartments] Successfully created ${result.count} program-department assignments`);
    return { success: true, assignedCount: result.count };
  } catch (error) {
    logger.error(`[assignProgramsToDepartments] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to assign programs to departments' };
  }
}

// ACTION: unassignProgramsFromDepartments - Remove specific program-department assignments
export async function unassignProgramsFromDepartments(programIds, departmentIds) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  logger.info(` [unassignProgramsFromDepartments] Action called with programIds:`, programIds, 'departmentIds:', departmentIds);
  
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
    logger.info(` [unassignProgramsFromDepartments] Successfully removed ${result.count} program-department assignments`);
    return { success: true, unassignedCount: result.count };
  } catch (error) {
    logger.error(`[unassignProgramsFromDepartments] Error:`, error.message, error.stack);
    return { success: false, error: 'Failed to unassign programs from departments' };
  }
}
