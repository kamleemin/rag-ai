import type { ApiErrorCode } from "@/types";

const EXTRACTION_FAILED_MESSAGE = "Couldn't get the recipe from that video. Please try again.";

// What the add-recipe page says for each API error; anything else gets the generic message.
export const ADD_RECIPE_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_BODY: "That doesn't look like a video link. Please check it and try again.",
  EXTRACTION_FAILED: EXTRACTION_FAILED_MESSAGE,
  EXTRACTION_SERVICE_UNREACHABLE: EXTRACTION_FAILED_MESSAGE,
};
