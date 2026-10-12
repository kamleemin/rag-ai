import { useMutation } from "@tanstack/react-query";
import { LOCAL_SERVER_PATHS, type AskRequest, type AskResponse } from "@rag-ai/shared";
import { postToRecipeServer } from "@/lib/recipe-server";
import type { RequestMutationOptions } from "@/types";

/**
 * Searches your saved recipes (RAG on the recipe server on this PC): it finds the closest
 * recipes to the question and llama3 answers from the ones that fit.
 */
export function askRecipes(question: string): Promise<AskResponse> {
  const body: AskRequest = { question };
  return postToRecipeServer<AskResponse>(LOCAL_SERVER_PATHS.ask, body);
}

export function useAskRecipesMutation(
  options?: RequestMutationOptions<AskResponse, string>
) {
  return useMutation({ mutationFn: askRecipes, ...options });
}
