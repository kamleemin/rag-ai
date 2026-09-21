import { NextResponse } from "next/server";
import * as z from "zod";
import type { ExtractTikTokResponse } from "@rag-ai/shared";
import { serverEnv } from "@/data/serverEnv";

export const maxDuration = 300;

const requestSchema = z.object({ url: z.url() });

export async function POST(request: Request) {
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
      `${serverEnv.KAMASAK_SERVICE_URL}/extract-tiktok`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": serverEnv.KAMASAK_SERVICE_API_KEY,
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
