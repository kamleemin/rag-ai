import { useMutation } from "@tanstack/react-query";
import type { Ingredient } from "@rag-ai/shared/db";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import type { IngredientRequest, RequestMutationOptions } from "@/types";

export async function addIngredient(ingredient: IngredientRequest): Promise<Ingredient> {
  const res = await fetch(API_PATHS.addIngredient, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ingredient),
  });
  await handleApiError(res);
  return res.json();
}

export function useAddIngredientMutation(
  options?: RequestMutationOptions<Ingredient, IngredientRequest>
) {
  return useMutation({ mutationFn: addIngredient, ...options });
}
