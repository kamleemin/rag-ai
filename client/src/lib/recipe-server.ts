import { clientEnv } from "@/data/clientEnv";
import { ApiRequestError, handleApiError } from "./api-request-error";
import { captureException } from "./capture-exception";

// The recipe server on your PC (server/ workspace). Its route paths are LOCAL_SERVER_PATHS
// from @rag-ai/shared, since the server defines the same routes.
const RECIPE_SERVER_URL = clientEnv.NEXT_PUBLIC_RECIPE_SERVER_URL;

/**
 * Calls the recipe server on the PC straight from the browser (the cloud never calls the
 * PC). Throws ApiRequestError with RECIPE_SERVER_UNREACHABLE when this device can't reach
 * it at all — e.g. on a phone, or with the server off — and for any error response.
 */
export async function fetchRecipeServer<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${RECIPE_SERVER_URL}${path}`, init);
  } catch (error) {
    // fetch only throws when the server can't be reached (off, another device, or blocked
    // by the browser). Expected on a phone — callers show a message for this code.
    captureException(error, `Recipe server unreachable for ${path}`);
    throw new ApiRequestError(
      0,
      "RECIPE_SERVER_UNREACHABLE",
      `Could not reach ${RECIPE_SERVER_URL}${path}: ${String(error)}`
    );
  }
  await handleApiError(res);
  return res.json();
}

/** A JSON POST to the recipe server. */
export function postToRecipeServer<T>(path: string, body: unknown): Promise<T> {
  return fetchRecipeServer<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
