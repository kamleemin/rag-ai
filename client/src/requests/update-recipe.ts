import { useMutation } from "@tanstack/react-query";
import type { Recipe } from "@rag-ai/shared/db";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import { toParsedIngredients } from "@/lib/recipe-form-values";
import type { RecipeFormValues, RequestMutationOptions, UpdateRecipeRequest } from "@/types";

type UpdateRecipeVariables = {
  shortId: string;
  values: RecipeFormValues;
};

/** Saves the edits to a saved recipe; returns the updated recipe. */
export async function updateRecipe({ shortId, values }: UpdateRecipeVariables): Promise<Recipe> {
  const body: UpdateRecipeRequest = {
    ...values,
    ingredients: toParsedIngredients(values.ingredients),
  };
  const res = await fetch(API_PATHS.updateRecipe(shortId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await handleApiError(res);
  return res.json();
}

export function useUpdateRecipeMutation(
  options?: RequestMutationOptions<Recipe, UpdateRecipeVariables>
) {
  return useMutation({ mutationFn: updateRecipe, ...options });
}
