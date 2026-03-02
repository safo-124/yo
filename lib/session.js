// lib/session.js
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "app_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
const ALGORITHM = "HS256";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Encrypt a payload into a signed JWT token.
 */
export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secret);
}

/**
 * Decrypt/verify a JWT token and return its payload.
 * Returns null if the token is invalid or expired.
 */
export async function decrypt(token) {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
    });
    return payload;
  } catch (error) {
    // Token is invalid, expired, or tampered with
    return null;
  }
}

/**
 * Create a session cookie with the given payload.
 * @param {object} sessionPayload - { userId, email, name, role, designation, dashboardPath }
 */
export async function createSession(sessionPayload) {
  const token = await encrypt(sessionPayload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION,
    path: "/",
    sameSite: "lax",
  });
}

/**
 * Read and verify the current session from the cookie.
 * Returns null if no session or token is invalid.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const payload = await decrypt(sessionCookie.value);
  if (!payload) {
    // Token invalid/expired — clear the stale cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return payload;
}

/**
 * Delete the session cookie (logout).
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME, { path: "/" });
}

/**
 * Verify a JWT token from a raw string (for middleware use).
 * This doesn't need the cookies() API.
 */
export async function verifyToken(token) {
  return decrypt(token);
}
