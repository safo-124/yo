// lib/actions/registry/claims.actions.js
"use server";
import logger from '@/lib/logger';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRegistryAuth, requireStaffOrRegistryAuth } from './auth-helpers';

export async function getAllClaimsSystemWide(filters = {}) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  const { centerId, status, lecturerId, lecturerName = "", page = 1, pageSize = 50 } = filters;
  const trimmedLecturerName = lecturerName.trim();

  try {
    const whereClause = {};
    if (centerId) whereClause.centerId = centerId;
    if (status) whereClause.status = status;
    if (lecturerId) whereClause.submittedById = lecturerId;
    if (trimmedLecturerName) {
      whereClause.submittedBy = { name: { contains: trimmedLecturerName, mode: 'insensitive' } };
    }
    const skip = (page - 1) * pageSize;
    
    const [claims, totalCount] = await Promise.all([
      prisma.claim.findMany({
        where: whereClause,
        include: {
          submittedBy: { select: { id: true, name: true, email: true, designation: true } },
          processedBy: { select: { id: true, name: true, email: true, designation: true } },
          center: { select: { id: true, name: true } },
          supervisedStudents: { select: { studentName: true, thesisTitle: true } }
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.claim.count({ where: whereClause }),
    ]);
    const formattedClaims = claims.map(claim => ({ ...claim, centerName: claim.center?.name }));
    return { success: true, claims: formattedClaims, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
  } catch (error) {
    logger.error(`[getAllClaimsSystemWide] Error:`, error.message, error.stack, error.meta);
    return { success: false, error: "Failed to fetch system-wide claims. Check server logs." };
  }
}

export async function getClaimsForStaffRegistry({ staffRegistryUserId, filters = {} }) {
  const auth = await requireStaffOrRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };
  
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
           logger.warn(`Staff user ${staffRegistryUserId} attempted to filter by unassigned center ${filterSpecificCenterId}.`);
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
      logger.error(`[getClaimsForStaffRegistry] Error:`, error.message, error.stack);
      return { success: false, error: "Failed to fetch claims for Staff Registry user." };
    }
}

export async function processClaimByRegistry({ claimId, status, registryUserId }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };
  registryUserId = auth.session.userId;

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
    logger.error(`[processClaimByRegistry] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to process claim." };
  }
}

export async function processClaimByStaffRegistry({ claimId, status, staffRegistryUserId }) {
  const auth = await requireStaffOrRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };
  staffRegistryUserId = auth.session.userId;
  
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
      logger.error(`[processClaimByStaffRegistry] Error:`, error.message, error.stack);
      return { success: false, error: "Failed to process claim by staff." };
    }
}

export async function deleteClaimByRegistry({ claimId, registryUserId }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };
  registryUserId = auth.session.userId;

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
    logger.error(`[deleteClaimByRegistry] Error:`, error.message, error.stack, JSON.stringify(error.meta));
    if (error.code === 'P2025') return { success: false, error: "Claim not found or already deleted."};
    if (error.code === 'P2003') return { success: false, error: `Cannot delete claim. It is referenced by other records.`};
    return { success: false, error: "Failed to delete claim." };
  }
}
