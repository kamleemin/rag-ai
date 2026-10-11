import { useMutation } from "@tanstack/react-query";
import type { RecipeSummary } from "@rag-ai/shared";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import { toParsedIngredients } from "@/lib/recipe-form-values";
import type { SaveRecipeRequest, RecipeFormValues, RequestMutationOptions } from "@/types";

type SaveRecipeVariables = {
  values: RecipeFormValues;
  /** The video the recipe came from; left out for a recipe typed in by hand. */
  sourceUrl?: string;
};

export async function saveRecipe({
  values,
  sourceUrl,
}: SaveRecipeVariables): Promise<RecipeSummary> {
  const body: SaveRecipeRequest = {
    ...values,
    ingredients: toParsedIngredients(values.ingredients),
    sourceUrl: sourceUrl ?? null,
  };
  const res = await fetch(API_PATHS.saveRecipe, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await handleApiError(res);
  return res.json();
}

export function useSaveRecipeMutation(
  options?: RequestMutationOptions<RecipeSummary, SaveRecipeVariables>
) {
  return useMutation({ mutationFn: saveRecipe, ...options });
}
