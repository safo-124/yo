// lib/actions/registry/requests.actions.js
"use server";
import logger from '@/lib/logger';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRegistryAuth } from './auth-helpers';

export async function getPendingSignupRequests() {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

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
    logger.error(`[getPendingSignupRequests] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch pending requests." };
  }
}

export async function approveSignupRequest({ requestId, registryUserId }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };
  registryUserId = auth.session.userId;

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
    logger.error(`[approveSignupRequest] Error:`, error.message, error.stack);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        try {
            await prisma.signupRequest.update({ where: { id: requestId }, data: { status: 'REJECTED', processedAt: new Date(), registryProcessor: { connect: { id: registryUserId }} } });
            revalidatePath('/registry/requests');
        } catch (rejectError) { logger.error(`[approveSR] Fail to mark REJECTED after P2002:`, rejectError.message, rejectError.stack); }
        return { success: false, error: "User email exists. Request rejected." };
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('accountNumber')) {
        try {
            await prisma.signupRequest.update({ where: { id: requestId }, data: { status: 'REJECTED', processedAt: new Date(), registryProcessor: { connect: { id: registryUserId }} } });
            revalidatePath('/registry/requests');
        } catch (rejectError) { logger.error(`[approveSR] Fail to mark REJECTED after P2002 (accountNumber):`, rejectError.message, rejectError.stack); }
        return { success: false, error: "User with this bank account number already exists. Request rejected." };
    }
    return { success: false, error: "Failed to approve signup request. " + (error.message || "") };
  }
}

export async function rejectSignupRequest({ requestId, registryUserId, rejectionReason = "Request rejected by Registry." }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };
  registryUserId = auth.session.userId;

  logger.info(` [rejectSignupRequest] Req: ${requestId}, Reason: "${rejectionReason}"`);
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
    logger.info(` Request ${requestId} rejected. Reason logged (if not saved to DB by default): ${rejectionReason}`);
    revalidatePath('/registry/requests');
    return { success: true, message: "Signup request rejected successfully." };
  } catch (error) {
    logger.error(`[rejectSignupRequest] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to reject signup request. " + (error.message || "") };
  }
}
