import type { NextResponse } from "next/server";
import * as z from "zod";
import type { ApiErrorResponse } from "@/types";
import { apiError } from "./api-error";
import { captureException } from "./capture-exception";

type ParsedBody<Schema extends z.ZodType> =
  | { success: true; data: z.infer<Schema> }
  | { success: false; response: NextResponse<ApiErrorResponse> };

/**
 * Reads a route handler's JSON body and validates it. On failure it returns a ready-made
 * 400 with a technical description — INVALID_JSON (logged, since it's an exception) or
 * INVALID_BODY with zod's explanation of which field failed.
 */
export async function parseJsonBody<Schema extends z.ZodType>(
  request: Request,
  schema: Schema
): Promise<ParsedBody<Schema>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    captureException(error, `Invalid JSON body for ${new URL(request.url).pathname}`);
    return {
      success: false,
      response: apiError("INVALID_JSON", `Request body is not valid JSON: ${String(error)}`),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      response: apiError("INVALID_BODY", z.prettifyError(parsed.error)),
    };
  }
  return { success: true, data: parsed.data };
}
