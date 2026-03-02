// lib/actions/registry/summaries.actions.js
"use server";
import logger from '@/lib/logger';

import prisma from '@/lib/prisma';
import { requireRegistryAuth, requireStaffOrRegistryAuth } from './auth-helpers';

export async function getLecturerMonthlyClaimSummary({ lecturerId, year, month }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

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
    logger.error(`[getLecturerMonthlyClaimSummary] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to generate summary. " + (error.message || "") };
  }
}

export async function getMonthlyClaimsSummaryByGrouping({ year, month, requestingUserId, filterCenterId: directFilterCenterId }) {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

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
    logger.error(`[getMonthlyClaimsSummaryByGrouping] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to generate grouped summary." };
  }
}

export async function getSystemOverviewData() {
  const auth = await requireRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

  try {
    // --- Perform Health Checks ---
    let dbHealth = { status: 'error', message: 'Unknown database error.' };
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbHealth = { status: 'ok', message: 'Database connection successful.' };
    } catch (e) {
      logger.error(`[System Health] Database check failed:`, e.message);
      dbHealth = { status: 'error', message: e.message };
    }

    let mapsHealth = { status: 'ok', message: 'API Key is configured on the server.' };
    if (!process.env.Maps_API_KEY) {
      mapsHealth = { status: 'misconfigured', message: 'Maps_API_KEY is not set in server environment variables.' };
      logger.warn(`[System Health] Google Maps API key is not configured.`);
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
    logger.error(`[getSystemOverviewData] Error:`, error.message);
    return { 
        success: false, 
        error: "Failed to fetch system overview data.",
        stats: {},
        activityFeed: [],
        health: { database: { status: 'error', message: error.message }, googleMaps: { status: 'unknown' } }
    };
  }
}

export async function getAssignedCentersForStaffRegistry({ staffRegistryUserId }) {
  const auth = await requireStaffOrRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };
  
    try {
      const user = await prisma.user.findUnique({
          where: {id: staffRegistryUserId},
          select: {staffRegistryCenterAssignments: {select: {center: {select: {id:true, name:true}}}}}
      });
      if (!user) return {success: false, error: "User not found."};
      const assignedCenters = user.staffRegistryCenterAssignments.map(a => a.center);
      return { success: true, centers: assignedCenters };
    } catch (error) {
      logger.error(`[getAssignedCentersForStaffRegistry] Error:`, error.message, error.stack);
      return { success: false, error: "Failed to fetch assigned centers." };
    }
}

export async function getStaffRegistryDashboardStats({ staffRegistryUserId }) {
  const auth = await requireStaffOrRegistryAuth();
  if (!auth.authenticated) return { success: false, error: auth.error };

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
    logger.error(`[getStaffRegistryDashboardStats] Error:`, error.message, error.stack);
    return { success: false, error: "Failed to fetch dashboard statistics." };
  }
}
