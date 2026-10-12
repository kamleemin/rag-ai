import { useQuery } from "@tanstack/react-query";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import { openFoodFactsQueryKey } from "@/lib/query-keys";
import type { RequestQueryOptions, SearchOpenFoodFactsResponse } from "@/types";

export async function searchOpenFoodFacts(query: string): Promise<SearchOpenFoodFactsResponse> {
  const res = await fetch(API_PATHS.openFoodFacts(query));
  await handleApiError(res);
  return res.json();
}

/**
 * Results for a submitted search. Searching the same words again comes from the cache, and
 * failures aren't retried — Open Food Facts allows only about 10 searches a minute.
 */
export function useOpenFoodFactsQuery(
  query: string,
  options?: RequestQueryOptions<SearchOpenFoodFactsResponse>
) {
  return useQuery({
    queryKey: openFoodFactsQueryKey(query),
    queryFn: () => searchOpenFoodFacts(query),
    enabled: query !== "",
    staleTime: Infinity,
    retry: false,
    ...options,
  });
}
