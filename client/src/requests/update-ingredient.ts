import { useMutation } from "@tanstack/react-query";
import type { Ingredient } from "@rag-ai/shared/db";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import type { IngredientRequest, RequestMutationOptions } from "@/types";

type UpdateIngredientVariables = { id: string; ingredient: IngredientRequest };

export async function updateIngredient({
  id,
  ingredient,
}: UpdateIngredientVariables): Promise<Ingredient> {
  const res = await fetch(API_PATHS.updateIngredient(id), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ingredient),
  });
  await handleApiError(res);
  return res.json();
}

export function useUpdateIngredientMutation(
  options?: RequestMutationOptions<Ingredient, UpdateIngredientVariables>
) {
  return useMutation({ mutationFn: updateIngredient, ...options });
}
