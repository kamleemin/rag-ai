import { useMutation } from "@tanstack/react-query";
import type { ExtractTikTokResponse } from "@rag-ai/shared";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import type { RequestMutationOptions } from "@/types";

export async function extractTikTok(url: string): Promise<ExtractTikTokResponse> {
  const res = await fetch(API_PATHS.extractTikTok, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  await handleApiError(res);
  return res.json();
}

export function useExtractTikTokMutation(
  options?: RequestMutationOptions<ExtractTikTokResponse, string>
) {
  return useMutation({ mutationFn: extractTikTok, ...options });
}
