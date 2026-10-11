import { useQuery } from "@tanstack/react-query";
import type { ListRecipesResponse } from "@rag-ai/shared";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import { RECIPES_QUERY_KEY } from "@/lib/query-keys";
import type { RequestQueryOptions } from "@/types";

export async function fetchRecipes(): Promise<ListRecipesResponse> {
  const res = await fetch(API_PATHS.recipes);
  await handleApiError(res);
  return res.json();
}

export function useRecipesQuery(options?: RequestQueryOptions<ListRecipesResponse>) {
  return useQuery({ queryKey: RECIPES_QUERY_KEY, queryFn: fetchRecipes, ...options });
}
