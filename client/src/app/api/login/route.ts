import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as z from "zod";
import {
  createSessionToken,
  isCorrectPassword,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/session";

const requestSchema = z.object({ password: z.string() });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Body must be { password: string }" },
      { status: 400 }
    );
  }

  if (!isCorrectPassword(parsed.data.password)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
  return new NextResponse(null, { status: 204 });
}
