// lib/actions/registry.actions.js
"use server";

import prisma from '@/lib/prisma'; // Make sure this path alias is also working
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

/**
 * Fetches a list of users who can potentially be assigned as Coordinators.
 * @returns {Promise<object>} An object with 'success' (boolean) and 'users' (array) or 'error' (string).
 */
export async function getPotentialCoordinators() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return { success: true, users };
  } catch (error) {
    console.error("Error fetching potential coordinators:", error);
    return { success: false, error: "Failed to fetch users." };
  }
}

/**
 * Creates a new Center and assigns an existing User as a Coordinator.
 * If the selected user is not already a COORDINATOR, their role will be updated.
 * @param {object} data - The data for the new center.
 * @param {string} data.name - The name of the center.
 * @param {string} data.coordinatorId - The ID of the user to be assigned as coordinator.
 * @returns {Promise<object>} An object with 'success' (boolean) and 'center' (object) or 'error' (string).
 */
export async function createCenter({ name, coordinatorId }) {
  if (!name || !coordinatorId) {
    return { success: false, error: "Center name and Coordinator ID are required." };
  }

  try {
    const coordinator = await prisma.user.findUnique({
      where: { id: coordinatorId },
    });

    if (!coordinator) {
      return { success: false, error: "Selected coordinator not found." };
    }

    const newCenter = await prisma.$transaction(async (tx) => {
      if (coordinator.role !== 'COORDINATOR') {
        await tx.user.update({
          where: { id: coordinatorId },
          data: { role: 'COORDINATOR' },
        });
        console.log(`User ${coordinator.name || coordinator.email}'s role updated to COORDINATOR.`);
      }
      const center = await tx.center.create({
        data: {
          name,
          coordinatorId,
        },
      });
      return center;
    });

    revalidatePath('/registry'); // Or specific path like '/registry/centers'
    revalidatePath('/registry/users');
    return { success: true, center: newCenter };

  } catch (error) {
    console.error("Error creating center:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return { success: false, error: "A center with this name already exists." };
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('coordinatorId')) {
      return { success: false, error: "This user is already assigned as a coordinator for another center." };
    }
    return { success: false, error: "Failed to create center. " + (error.message || "Unknown error") };
  }
}

/**
 * Fetches all Centers with their Coordinator's details.
 * @returns {Promise<object>} An object with 'success' (boolean) and 'centers' (array) or 'error' (string).
 */
export async function getCenters() {
  try {
    const centers = await prisma.center.findMany({
      include: {
        User_Center_coordinatorIdToUser: { // Relation field name for the coordinator
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedCenters = centers.map(center => ({
      ...center,
      coordinator: center.User_Center_coordinatorIdToUser,
    }));

    return { success: true, centers: formattedCenters };
  } catch (error) {
    console.error("Error fetching centers:", error);
    return { success: false, error: "Failed to fetch centers." };
  }
}

/**
 * Creates a new User (Coordinator or Lecturer) by the Registry.
 * @param {object} userData - The data for the new user.
 * @param {string} userData.name - The name of the user.
 * @param {string} userData.email - The email of the user (must be unique).
 * @param {string} userData.password - The plain text password for the user.
 * @param {'COORDINATOR' | 'LECTURER'} userData.role - The role of the new user.
 * @param {string} [userData.lecturerCenterId] - Optional: Center ID if role is LECTURER.
 * @returns {Promise<object>} An object with 'success' (boolean) and 'user' (object) or 'error' (string).
 */
export async function createUserByRegistry({ name, email, password, role, lecturerCenterId }) {
  if (!name || !email || !password || !role) {
    return { success: false, error: "Name, email, password, and role are required." };
  }
  if (role !== 'COORDINATOR' && role !== 'LECTURER') {
    return { success: false, error: "Invalid role specified. Must be COORDINATOR or LECTURER." };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        lecturerCenterId: role === 'LECTURER' ? lecturerCenterId : null,
      },
      select: {
        id: true, name: true, email: true, role: true, lecturerCenterId: true, createdAt: true,
      }
    });
    revalidatePath('/registry/users');
    return { success: true, user: newUser };
  } catch (error) {
    console.error("Error creating user by registry:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { success: false, error: "A user with this email already exists." };
    }
    return { success: false, error: "Failed to create user. " + (error.message || "Unknown error") };
  }
}

/**
 * Fetches all users.
 * @returns {Promise<object>} An object with 'success' (boolean) and 'users' (array) or 'error' (string).
 */
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lecturerCenterId: true,
        departmentId: true,
        // Corrected relation name for the center a user coordinates
        Center_Center_coordinatorIdToUser: { // Use the actual relation name from User to Center
          select: { id: true, name: true }
        },
        // This relation is from User to Center they are a lecturer in
        Center_User_lecturerCenterIdToCenter: { // Use the actual relation name from User to Center
          select: { id: true, name: true }
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // It might be helpful to format this data slightly for easier use in the frontend,
    // similar to how getCenters formats its coordinator data.
    const formattedUsers = users.map(user => ({
      ...user,
      // You can create aliases here if you prefer simpler names in the UI component
      coordinatedCenter: user.Center_Center_coordinatorIdToUser,
      lecturerCenter: user.Center_User_lecturerCenterIdToCenter,
    }));

    return { success: true, users: formattedUsers };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return { success: false, error: "Failed to fetch users." };
  }
}
