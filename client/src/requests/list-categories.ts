import { useQuery } from "@tanstack/react-query";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import { CATEGORIES_QUERY_KEY } from "@/lib/query-keys";
import type { ListCategoriesResponse, RequestQueryOptions } from "@/types";

export async function fetchCategories(): Promise<ListCategoriesResponse> {
  const res = await fetch(API_PATHS.categories);
  await handleApiError(res);
  return res.json();
}

export function useCategoriesQuery(options?: RequestQueryOptions<ListCategoriesResponse>) {
  return useQuery({ queryKey: CATEGORIES_QUERY_KEY, queryFn: fetchCategories, ...options });
}
