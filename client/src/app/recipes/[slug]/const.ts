import type { ApiErrorCode } from "@/types";

/** Where the recipe page is while loading its recipe. */
export enum RecipeDetailState {
  Loading = "loading",
  /** No recipe with this id (or the id isn't a valid one) — the page shows its 404. */
  NotFound = "not_found",
  Error = "error",
  Ready = "ready",
}

// What the recipe page's form says when saving the edits fails.
export const UPDATE_RECIPE_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_BODY: "Please add a title and a category before saving.",
  NOT_FOUND: "This recipe no longer exists.",
};
