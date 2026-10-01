import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as z from "zod";
import { apiError } from "@/lib/api-error";
import { parseJsonBody } from "@/lib/parse-json-body";
import {
  createSessionToken,
  isCorrectPassword,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/session";

const requestSchema = z.object({ password: z.string() });

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, requestSchema);
  if (!parsed.success) {
    return parsed.response;
  }

  if (!isCorrectPassword(parsed.data.password)) {
    return apiError("WRONG_PASSWORD", "Password is incorrect");
  }

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
  return new NextResponse(null, { status: 204 });
}
