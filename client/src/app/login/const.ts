import type { ApiErrorCode } from "@/types";

// What the login form says for each API error; anything else gets the generic message.
export const LOGIN_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  WRONG_PASSWORD: "That password is incorrect.",
  INVALID_BODY: "Please enter your password.",
};
