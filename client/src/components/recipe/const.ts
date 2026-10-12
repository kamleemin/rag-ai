import type { CalorieReviewReason } from "@rag-ai/shared";
import type { ApiErrorCode } from "@/types";

// RecipeForm placeholders: "detected" when the values came from a video (blank means the
// video didn't say), "manual" when the user is typing a recipe in.
export const RECIPE_FORM_PLACEHOLDERS = {
  detected: {
    title: "Not detected — add a title manually.",
    description: "Not detected in the video — add a note manually.",
    ingredientName: "Not detected",
    instructions: "Not detected in the video — add steps manually.",
  },
  manual: {
    title: "e.g. Brown Butter Pasta with Sage",
    description:
      "A brief note about the dish — what makes it special, the occasion, or the technique.",
    ingredientName: "e.g. Pasta",
    instructions:
      "1. Bring a large pot of salted water to a boil.\n2. Cook pasta until al dente, about 9 minutes.",
  },
} as const;


// Why an ingredient's calories couldn't be worked out, under its line in the breakdown.
export const CALORIE_REVIEW_REASON_LABELS: Record<CalorieReviewReason, string> = {
  processed: "Packaged item — add your brand to your ingredient list",
  no_match: "No matching food found",
  no_amount: "No amount given",
  unknown_unit: "This unit can't be converted to grams",
  lookup_failed: "Couldn't reach USDA — calculate again",
};

// What the "Change" / "Find it" panel says when the USDA search fails.
export const USDA_SEARCH_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_QUERY: "Type at least 2 letters to search.",
  USDA_SEARCH_FAILED: "Couldn't search USDA right now. Please try again.",
};

export const MIN_USDA_SEARCH_LENGTH = 2;
