import { useQuery } from "@tanstack/react-query";
import { LOCAL_SERVER_PATHS, type HealthResponse } from "@rag-ai/shared";
import { RECIPE_SERVER_QUERY_KEY } from "@/lib/query-keys";
import { fetchRecipeServer } from "@/lib/recipe-server";
import type { RequestQueryOptions } from "@/types";

/** Whether this device can reach the recipe server on the PC (it can't from a phone). */
export function checkRecipeServer(): Promise<HealthResponse> {
  return fetchRecipeServer<HealthResponse>(LOCAL_SERVER_PATHS.health);
}

/**
 * An error means unreachable — not retried, so a phone finds out straight away instead of
 * after three retries. Rechecked at most every 30 seconds.
 */
export function useRecipeServerQuery(options?: RequestQueryOptions<HealthResponse>) {
  return useQuery({
    queryKey: RECIPE_SERVER_QUERY_KEY,
    queryFn: checkRecipeServer,
    retry: false,
    staleTime: 30_000,
    ...options,
  });
}
