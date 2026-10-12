import { useMutation } from "@tanstack/react-query";
import type { AddPendingVideoRequest, AddPendingVideoResponse } from "@rag-ai/shared";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import type { RequestMutationOptions } from "@/types";

/** Saves a video link to turn into a recipe later, on the PC. */
export async function addPendingVideo(url: string): Promise<AddPendingVideoResponse> {
  const body: AddPendingVideoRequest = { url };
  const res = await fetch(API_PATHS.addPendingVideo, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await handleApiError(res);
  return res.json();
}

export function useAddPendingVideoMutation(
  options?: RequestMutationOptions<AddPendingVideoResponse, string>
) {
  return useMutation({ mutationFn: addPendingVideo, ...options });
}
