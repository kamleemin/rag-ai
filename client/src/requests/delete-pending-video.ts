import { useMutation } from "@tanstack/react-query";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import type { RequestMutationOptions } from "@/types";

/** Removes a saved link from the queue without turning it into a recipe. */
export async function deletePendingVideo(id: string): Promise<void> {
  const res = await fetch(API_PATHS.deletePendingVideo(id), { method: "DELETE" });
  await handleApiError(res);
}

export function useDeletePendingVideoMutation(options?: RequestMutationOptions<void, string>) {
  return useMutation({ mutationFn: deletePendingVideo, ...options });
}
