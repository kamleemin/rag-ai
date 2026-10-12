import type { ApiErrorCode } from "@/types";

export const INVALID_LINK_MESSAGE =
  "That doesn't look like a video link. Please check it and try again.";

// What the add-recipe page says when Generate fails; anything else gets the generic message.
export const ADD_RECIPE_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  RECIPE_SERVER_UNREACHABLE:
    "Couldn't reach the recipe server on your PC. Start it and try again, or save the link for later.",
};

// What "Save for later" says when adding the link to the queue fails.
export const SAVE_FOR_LATER_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_BODY: INVALID_LINK_MESSAGE,
};

/** The two ways to add a recipe on the add-recipe page. */
export enum AddRecipeTab {
  Video = "video",
  Manual = "manual",
}

export const ADD_RECIPE_TABS = [
  { value: AddRecipeTab.Video, label: "FROM VIDEO" },
  { value: AddRecipeTab.Manual, label: "MANUAL ENTRY" },
];
