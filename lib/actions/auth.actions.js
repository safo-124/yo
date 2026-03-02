// lib/actions/auth.actions.js
"use server";
import logger from '@/lib/logger';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { createSession, getSession as getSessionFromLib, deleteSession } from '@/lib/session';
import { loginSchema, signupRequestSchema } from '@/lib/validations';

export async function loginUser(credentials) {
  // Validate input with Zod
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input.' };
  }
  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        designation: true, // Ensure designation is fetched
        lecturerCenterId: true,
        lecturerCourseAssignments: {
          include: {
            course: {
              include: {
                program: {
                  include: {
                    departmentAssignments: {
                      include: {
                        department: {
                          include: {
                            centerAssignments: {
                              include: {
                                center: true
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    let dashboardPath = '/profile';

    if (user.role === 'REGISTRY') {
      dashboardPath = '/registry';
    } else if (user.role === 'STAFF_REGISTRY') {
      dashboardPath = '/staff-registry';
    } else if (user.role === 'COORDINATOR') {
      const centerManagedByCoordinator = await prisma.center.findUnique({
        where: { coordinatorId: user.id },
        select: { id: true },
      });
      if (centerManagedByCoordinator) {
        dashboardPath = `/coordinator/${centerManagedByCoordinator.id}`;
      } else {
        logger.warn(`Coordinator ${user.email} (ID: ${user.id}) is not assigned to any center. Defaulting dashboard path.`);
        dashboardPath = '/coordinator/assignment-pending';
      }
    } else if (user.role === 'LECTURER') {
      if (user.lecturerCenterId) {
        dashboardPath = `/lecturer/center/${user.lecturerCenterId}/dashboard`;
        logger.info(`Lecturer ${user.email} using direct center assignment: ${user.lecturerCenterId}`);
      } else if (user.lecturerCourseAssignments?.length > 0) {
        // Get center ID from first course assignment
        const firstAssignment = user.lecturerCourseAssignments[0];
        // Navigate through the many-to-many relationships
        const departmentAssignments = firstAssignment.course.program.departmentAssignments;
        
        if (departmentAssignments?.length > 0) {
          const centerAssignments = departmentAssignments[0].department.centerAssignments;
          
          if (centerAssignments?.length > 0) {
            const centerId = centerAssignments[0].center.id;
            logger.info(`[AUTH] Lecturer ${user.email} course assignment data:`, {
              assignmentId: firstAssignment.id,
              courseId: firstAssignment.course.id,
              programId: firstAssignment.course.program.id,
              departmentId: departmentAssignments[0].department.id,
              centerId: centerId
            });
            logger.info(`Lecturer ${user.email} has ${user.lecturerCourseAssignments.length} course assignments. Using center ${centerId} from first assignment.`);
            dashboardPath = `/lecturer/center/${centerId}/dashboard`;
          } else {
            logger.warn(`Lecturer ${user.email} course department has no center assignments. Redirecting to assignment-pending.`);
            dashboardPath = '/lecturer/assignment-pending';
          }
        } else {
          logger.warn(`Lecturer ${user.email} course program has no department assignments. Redirecting to assignment-pending.`);
          dashboardPath = '/lecturer/assignment-pending';
        }
      } else {
        logger.warn(`Lecturer ${user.email} (ID: ${user.id}) is not assigned to any center or courses. Redirecting to assignment-pending.`);
        dashboardPath = '/lecturer/assignment-pending';
      }
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      designation: user.designation,
      dashboardPath: dashboardPath,
    };

    await createSession(sessionPayload);

    return {
      success: true,
      message: 'Login successful!',
      user: sessionPayload,
      redirectTo: dashboardPath
    };

  } catch (error) {
    logger.error('Login Action Error:', error.message, error.stack);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

// Re-export getSession from the session utility for backward compatibility
export async function getSession() {
  return getSessionFromLib();
}

export async function logoutUser() {
  await deleteSession();
  redirect('/login');
}

export async function requestSignup(data) {
  // Validate input with Zod
  const parsed = signupRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input.' };
  }
  const { name, email, password, role, requestedCenterId } = parsed.data;

  if (role === 'LECTURER' && !requestedCenterId) {
    return { success: false, error: "Lecturers must request a center assignment if centers are available." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }
    const existingRequest = await prisma.signupRequest.findFirst({
      where: { email, status: 'PENDING' }
    });
    if (existingRequest) {
      return { success: false, error: "A signup request with this email is already pending approval." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const signupData = {
      name: name.trim(),
      email,
      hashedPassword,
      requestedRole: role,
      status: 'PENDING',
    };

    if (role === 'LECTURER' && requestedCenterId) {
      signupData.requestedCenterId = requestedCenterId;
    }

    await prisma.signupRequest.create({ data: signupData });

    return { success: true, message: "Signup request submitted successfully! Please wait for Registry approval." };
  } catch (error) {
    logger.error("Signup Request Error:", error.message, error.stack);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
       return { success: false, error: "This email address is already associated with a pending request." };
    }
    return { success: false, error: "An unexpected error occurred during signup request." };
  }
}