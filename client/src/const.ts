import { MISSING_FIELDS_MESSAGE } from "@/components/ingredient/const";
import type { ApiErrorCode } from "@/types";

// What a recipe form says when saving fails (manual entry and the review screen);
// anything else gets the generic message.
export const SAVE_RECIPE_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_BODY: "Please add a title and a category before saving.",
  ALREADY_SAVED: "This video's recipe is already saved.",
};

// What Generate says when reading a video fails (the add page and the waiting-videos banner).
export const GENERATE_RECIPE_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  RECIPE_SERVER_UNREACHABLE:
    "Couldn't reach the recipe server on your PC. Start it and try again, or save the link for later.",
};

// What "+ Add new category" in the recipe form says when adding fails.
export const ADD_CATEGORY_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_BODY: "Category names can be up to 40 characters.",
  CATEGORY_EXISTS: "You already have this category — pick it from the list.",
};

// The badge next to a recipe's calories (the recipe page and the recipe form).
export const CALORIE_BADGES = {
  exact: { label: "EXACT", variant: "green" },
  estimated: { label: "ESTIMATED", variant: "tan" },
  pending: { label: "NOT YET", variant: "tan" },
} as const;

// What the add-ingredient form says when saving fails (Ingredients page, and fixing a
// calorie match from the recipe form).
export const SAVE_INGREDIENT_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_BODY: MISSING_FIELDS_MESSAGE,
  INGREDIENT_EXISTS: "You already have an ingredient with this name — edit that one instead.",
  NOT_FOUND: "This ingredient no longer exists.",
};
