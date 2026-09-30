import { NextResponse } from "next/server";
import * as z from "zod";
import { LOCAL_SERVER_PATHS, type ExtractTikTokResponse } from "@rag-ai/shared";
import { LOCAL_SERVER_URL } from "@/lib/api-paths";
import { rejectWithoutSession } from "@/lib/session";

export const maxDuration = 300;

const requestSchema = z.object({ url: z.url() });

export async function POST(request: Request) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Body must be { url: string }" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${LOCAL_SERVER_URL}${LOCAL_SERVER_PATHS.extractTikTok}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: parsed.data.url }),
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to extract recipe from video" },
        { status: 502 }
      );
    }

    const data: ExtractTikTokResponse = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to reach the extraction service:", err);
    return NextResponse.json(
      { error: "Failed to extract recipe from video" },
      { status: 502 }
    );
  }
}
