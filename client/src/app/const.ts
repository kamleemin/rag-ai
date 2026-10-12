import type { ApiErrorCode } from "@/types";

// Example questions shown under the home page's Ask box.
export const SUGGESTION_CHIPS = [
  "What can I make with chicken and spinach?",
  "Quick 20-minute dinners",
  "Show me my pasta recipes",
];

// What the home page's Ask box says when searching fails.
export const ASK_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  RECIPE_SERVER_UNREACHABLE:
    "Search runs on the recipe server on your PC — start it, then try again.",
};
