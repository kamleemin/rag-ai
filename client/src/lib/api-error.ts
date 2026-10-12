import { NextResponse } from "next/server";
import type { ApiErrorCode, ApiErrorResponse } from "@/types";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  INVALID_JSON: 400,
  INVALID_BODY: 400,
  INVALID_QUERY: 400,
  INVALID_ID: 400,
  UNAUTHORIZED: 401,
  WRONG_PASSWORD: 401,
  NOT_FOUND: 404,
  EXTRACTION_FAILED: 502,
  EXTRACTION_SERVICE_UNREACHABLE: 502,
  ALREADY_SAVED: 409,
  INGREDIENT_EXISTS: 409,
  CATEGORY_EXISTS: 409,
  OPEN_FOOD_FACTS_RATE_LIMITED: 429,
  OPEN_FOOD_FACTS_FAILED: 502,
  USDA_SEARCH_FAILED: 502,
};

/**
 * Route handlers' error response: `{ code, error }`. `code` is stable for the frontend to
 * branch on; `error` is a technical description for debugging. The frontend picks the
 * words users see — never put user-facing copy here.
 */
export function apiError(code: ApiErrorCode, error: string): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ code, error }, { status: STATUS_BY_CODE[code] });
}
