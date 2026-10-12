import { useQuery } from "@tanstack/react-query";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import { usdaFoodsQueryKey } from "@/lib/query-keys";
import type { RequestQueryOptions, SearchUsdaFoodsResponse } from "@/types";

export async function searchUsdaFoods(query: string): Promise<SearchUsdaFoodsResponse> {
  const res = await fetch(API_PATHS.usdaFoods(query));
  await handleApiError(res);
  return res.json();
}

/** Results for a submitted search; the same words again come from the cache. */
export function useUsdaFoodsQuery(
  query: string,
  options?: RequestQueryOptions<SearchUsdaFoodsResponse>
) {
  return useQuery({
    queryKey: usdaFoodsQueryKey(query),
    queryFn: () => searchUsdaFoods(query),
    enabled: query !== "",
    staleTime: Infinity,
    ...options,
  });
}
