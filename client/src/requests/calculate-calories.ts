import { useMutation } from "@tanstack/react-query";
import type { CalorieEstimate, ParsedIngredient } from "@rag-ai/shared";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import type { CalculateCaloriesRequest, RequestMutationOptions } from "@/types";

/** Works out calories for these ingredients. Nothing is saved — saving the recipe does that. */
export async function calculateCalories(
  ingredients: ParsedIngredient[]
): Promise<CalorieEstimate> {
  const body: CalculateCaloriesRequest = { ingredients };
  const res = await fetch(API_PATHS.calculateCalories, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await handleApiError(res);
  return res.json();
}

export function useCalculateCaloriesMutation(
  options?: RequestMutationOptions<CalorieEstimate, ParsedIngredient[]>
) {
  return useMutation({ mutationFn: calculateCalories, ...options });
}
