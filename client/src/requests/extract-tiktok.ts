import { useMutation } from "@tanstack/react-query";
import {
  LOCAL_SERVER_PATHS,
  type ExtractTikTokRequest,
  type ExtractTikTokResponse,
} from "@rag-ai/shared";
import { postToRecipeServer } from "@/lib/recipe-server";
import type { RequestMutationOptions } from "@/types";

/** Reads a TikTok video's recipe on the recipe server on this PC (yt-dlp + llama3). Saves nothing. */
export function extractTikTok(url: string): Promise<ExtractTikTokResponse> {
  const body: ExtractTikTokRequest = { url };
  return postToRecipeServer<ExtractTikTokResponse>(LOCAL_SERVER_PATHS.extractTikTok, body);
}

export function useExtractTikTokMutation(
  options?: RequestMutationOptions<ExtractTikTokResponse, string>
) {
  return useMutation({ mutationFn: extractTikTok, ...options });
}
