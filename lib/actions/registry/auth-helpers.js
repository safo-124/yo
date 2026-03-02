// lib/actions/registry/auth-helpers.js — Internal helpers (NOT a server action module)
import { getSession } from '@/lib/session';

/** Verify the caller is an authenticated REGISTRY user */
export async function requireRegistryAuth() {
  const session = await getSession();
  if (!session?.userId) {
    return { authenticated: false, error: "Not authenticated." };
  }
  if (session.role !== 'REGISTRY') {
    return { authenticated: false, error: "Unauthorized. Registry role required." };
  }
  return { authenticated: true, session };
}

/** Verify the caller is REGISTRY or STAFF_REGISTRY */
export async function requireStaffOrRegistryAuth() {
  const session = await getSession();
  if (!session?.userId) {
    return { authenticated: false, error: "Not authenticated." };
  }
  if (session.role !== 'REGISTRY' && session.role !== 'STAFF_REGISTRY') {
    return { authenticated: false, error: "Unauthorized. Registry or Staff Registry role required." };
  }
  return { authenticated: true, session };
}
