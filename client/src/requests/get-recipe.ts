import { useQuery } from "@tanstack/react-query";
import type { Recipe } from "@rag-ai/shared/db";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import { recipeQueryKey } from "@/lib/query-keys";
import type { RequestQueryOptions } from "@/types";

export async function fetchRecipe(shortId: string): Promise<Recipe> {
  const res = await fetch(API_PATHS.recipeByShortId(shortId));
  await handleApiError(res);
  return res.json();
}

export function useRecipeQuery(shortId: string, options?: RequestQueryOptions<Recipe>) {
  return useQuery({
    queryKey: recipeQueryKey(shortId),
    queryFn: () => fetchRecipe(shortId),
    ...options,
  });
}
