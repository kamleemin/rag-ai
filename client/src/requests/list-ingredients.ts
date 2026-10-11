import { useQuery } from "@tanstack/react-query";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import { INGREDIENTS_QUERY_KEY } from "@/lib/query-keys";
import type { ListIngredientsResponse, RequestQueryOptions } from "@/types";

export async function fetchIngredients(): Promise<ListIngredientsResponse> {
  const res = await fetch(API_PATHS.ingredients);
  await handleApiError(res);
  return res.json();
}

export function useIngredientsQuery(options?: RequestQueryOptions<ListIngredientsResponse>) {
  return useQuery({ queryKey: INGREDIENTS_QUERY_KEY, queryFn: fetchIngredients, ...options });
}
