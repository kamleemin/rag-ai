import type { ApiErrorCode } from "@/types";
import { ApiRequestError } from "./api-request-error";

// User-facing wording shared by every screen. Screen-specific wording lives in that
// screen's const.ts and is passed to toUserMessage.
export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
export const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please log in again.";

/**
 * The words to show for a failed request. The API's technical `error` text is never
 * shown — only its `code` picks a message, falling back to the generic one.
 */
export function toUserMessage(
  error: unknown,
  messages: Partial<Record<ApiErrorCode, string>>
): string {
  if (!(error instanceof ApiRequestError) || error.code === null) {
    return GENERIC_ERROR_MESSAGE;
  }
  const message = messages[error.code];
  if (message) {
    return message;
  }
  if (error.code === "UNAUTHORIZED") {
    return SESSION_EXPIRED_MESSAGE;
  }
  return GENERIC_ERROR_MESSAGE;
}
