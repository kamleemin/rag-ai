import { useQuery } from "@tanstack/react-query";
import type { ListPendingVideosResponse } from "@rag-ai/shared";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import { PENDING_VIDEOS_QUERY_KEY } from "@/lib/query-keys";
import type { RequestQueryOptions } from "@/types";

export async function fetchPendingVideos(): Promise<ListPendingVideosResponse> {
  const res = await fetch(API_PATHS.pendingVideos);
  await handleApiError(res);
  return res.json();
}

export function usePendingVideosQuery(options?: RequestQueryOptions<ListPendingVideosResponse>) {
  return useQuery({ queryKey: PENDING_VIDEOS_QUERY_KEY, queryFn: fetchPendingVideos, ...options });
}
