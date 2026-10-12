import { useMutation } from "@tanstack/react-query";
import { LOCAL_SERVER_PATHS, type AskRequest, type AskResponse } from "@rag-ai/shared";
import { LOCAL_SERVER_URL } from "@/lib/api-paths";
import { ApiRequestError, handleApiError } from "@/lib/api-request-error";
import { captureException } from "@/lib/capture-exception";
import type { RequestMutationOptions } from "@/types";

/**
 * Searches your saved recipes (RAG on the recipe server on this PC): it finds the closest
 * recipes to the question and llama3 answers from those. Called from the browser because
 * the cloud never calls the PC.
 */
export async function askRecipes(question: string): Promise<AskResponse> {
  const body: AskRequest = { question };
  let res: Response;
  try {
    res = await fetch(`${LOCAL_SERVER_URL}${LOCAL_SERVER_PATHS.ask}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    // fetch only throws when the server can't be reached at all (off, or blocked by the browser).
    captureException(error, "Recipe server unreachable for /ask");
    throw new ApiRequestError(
      0,
      "RECIPE_SERVER_UNREACHABLE",
      `Could not reach ${LOCAL_SERVER_URL}: ${String(error)}`
    );
  }
  await handleApiError(res);
  return res.json();
}

export function useAskRecipesMutation(
  options?: RequestMutationOptions<AskResponse, string>
) {
  return useMutation({ mutationFn: askRecipes, ...options });
}
