import type { ApiErrorCode, ApiErrorResponse } from "@/types";
import { captureException } from "./capture-exception";

/** A failed API call, carrying the API's error `code` so the UI can choose its own wording. */
export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    /** Null when the response wasn't one of our `{ code, error }` bodies (e.g. a Vercel 504 page). */
    readonly code: ApiErrorCode | null,
    technicalMessage: string
  ) {
    super(technicalMessage);
    this.name = "ApiRequestError";
  }
}

/** Throws an ApiRequestError for a non-2xx response; does nothing for a successful one. */
export async function handleApiError(res: Response): Promise<void> {
  if (res.ok) {
    return;
  }
  let body: Partial<ApiErrorResponse> = {};
  try {
    body = (await res.json()) as Partial<ApiErrorResponse>;
  } catch (error) {
    captureException(error, `Non-JSON error response from ${res.url} (${res.status})`);
  }
  throw new ApiRequestError(
    res.status,
    body.code ?? null,
    body.error ?? `HTTP ${res.status} from ${res.url}`
  );
}
