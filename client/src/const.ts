import type { ApiErrorCode } from "@/types";

// What a recipe form says when saving fails (manual entry and the review screen);
// anything else gets the generic message.
export const SAVE_RECIPE_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_BODY: "Please add a title and a category before saving.",
  ALREADY_SAVED: "This video's recipe is already saved.",
};

// The badge next to a recipe's calories (the recipe page and the recipe form).
export const CALORIE_BADGES = {
  exact: { label: "EXACT", variant: "green" },
  estimated: { label: "ESTIMATED", variant: "tan" },
  pending: { label: "NOT YET", variant: "tan" },
} as const;
