import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import type { CalorieEstimate, ExtractTikTokResponse, ParsedIngredient } from "@rag-ai/shared";

export type EditableRow = { id: string; [key: string]: string };

export type Column = {
  key: string;
  label: string;
  placeholder?: string;
};

/** Stable error identifiers the API returns — the frontend decides the wording for each. */
export type ApiErrorCode =
  | "INVALID_JSON"
  | "INVALID_BODY"
  | "INVALID_ID"
  | "UNAUTHORIZED"
  | "WRONG_PASSWORD"
  | "NOT_FOUND"
  | "EXTRACTION_FAILED"
  | "EXTRACTION_SERVICE_UNREACHABLE"
  | "ALREADY_SAVED";

/** Every API error response. `error` is technical and may change — never show it to users. */
export type ApiErrorResponse = { code: ApiErrorCode; error: string };

/**
 * Options a screen hook can pass to a src/requests/ mutation hook — everything except
 * mutationFn, which the request file supplies (e.g. { onSuccess: () => router.push(...) }).
 */
export type RequestMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  "mutationFn"
>;

/**
 * Options a screen hook can pass to a src/requests/ query hook — everything except
 * queryKey and queryFn, which the request file supplies (e.g. { enabled: false }).
 */
export type RequestQueryOptions<TData> = Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">;

/** The editable fields of a recipe, as RecipeForm holds them. */
export type RecipeFormValues = {
  title: string;
  description: string;
  servings: string;
  /** One row per ingredient: { id, name, amount, unit }. */
  ingredients: EditableRow[];
  instructions: string;
  category: string;
  /**
   * The last "Calculate calories" result — null when it hasn't been calculated, or the
   * ingredients changed since (an outdated result is never saved).
   */
  calorieEstimate: CalorieEstimate | null;
};

/** Body of POST /api/calculate-calories. The response is a CalorieEstimate; nothing is saved. */
export type CalculateCaloriesRequest = { ingredients: ParsedIngredient[] };

/**
 * Body of POST /api/update-recipe/[shortId]: the fields a person can edit. A null
 * calorieEstimate clears the saved calories (they'd no longer match the ingredients).
 */
export type UpdateRecipeRequest = {
  title: string;
  description: string;
  servings: string;
  ingredients: ParsedIngredient[];
  instructions: string;
  category: string;
  calorieEstimate: CalorieEstimate | null;
};

/**
 * Body of POST /api/save-recipe: the same fields plus the video it came from. The search
 * embedding isn't sent — the recipe server on the PC fills it in later.
 */
export type SaveRecipeRequest = UpdateRecipeRequest & {
  /** null for a recipe typed in by hand. */
  sourceUrl: string | null;
};

/** What the add-recipe page hands to the review screen: the extraction and the link it came from. */
export type ExtractedRecipe = ExtractTikTokResponse & { sourceUrl: string };
