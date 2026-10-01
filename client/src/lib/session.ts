import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { serverEnv } from "@/data/serverEnv";
import type { ApiErrorResponse } from "@/types";
import { apiError } from "./api-error";
import { captureException } from "./capture-exception";

export const SESSION_COOKIE = "kamasak_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const signingKey = () => new TextEncoder().encode(serverEnv.SESSION_SECRET);

export const sessionCookieOptions = {
  httpOnly: true,
  // Plain http://localhost in dev can't hold a Secure cookie in every browser.
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const;

/** Hashing first makes both sides equal length, so timingSafeEqual can't leak the password length. */
export function isCorrectPassword(password: string): boolean {
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(password), hash(serverEnv.APP_PASSWORD));
}

export function createSessionToken(): Promise<string> {
  return new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("owner")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(signingKey());
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }
  try {
    await jwtVerify(token, signingKey(), { algorithms: ["HS256"] });
    return true;
  } catch (error) {
    // Expired, forged or signed with an old SESSION_SECRET — the user just logs in again.
    captureException(error, "Rejected session token");
    return false;
  }
}

/** Returns a 401 response when the request has no valid session cookie, otherwise null. */
export async function rejectWithoutSession(): Promise<NextResponse<ApiErrorResponse> | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return (await isValidSessionToken(token))
    ? null
    : apiError("UNAUTHORIZED", "Missing, expired or invalid session cookie");
}
