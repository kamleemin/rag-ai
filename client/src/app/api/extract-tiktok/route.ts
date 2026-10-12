import { NextResponse } from "next/server";
import * as z from "zod";
import { LOCAL_SERVER_PATHS, type ExtractTikTokResponse } from "@rag-ai/shared";
import { LOCAL_SERVER_URL } from "@/lib/api-paths";
import { apiError } from "@/lib/api-error";
import { captureException } from "@/lib/capture-exception";
import { parseJsonBody } from "@/lib/parse-json-body";
import { rejectWithoutSession } from "@/lib/session";

export const maxDuration = 300;

const requestSchema = z.object({ url: z.url() });

export async function POST(request: Request) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const parsed = await parseJsonBody(request, requestSchema);
  if (!parsed.success) {
    return parsed.response;
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
      return apiError("EXTRACTION_FAILED", `Extraction service responded ${res.status}`);
    }

    const data: ExtractTikTokResponse = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    captureException(error, "Failed to reach the extraction service");
    return apiError(
      "EXTRACTION_SERVICE_UNREACHABLE",
      `Could not reach the extraction service: ${String(error)}`
    );
  }
}
