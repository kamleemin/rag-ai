import { useMutation } from "@tanstack/react-query";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import type { RequestMutationOptions } from "@/types";

export async function deleteIngredient(id: string): Promise<void> {
  const res = await fetch(API_PATHS.deleteIngredient(id), { method: "DELETE" });
  await handleApiError(res);
}

export function useDeleteIngredientMutation(options?: RequestMutationOptions<void, string>) {
  return useMutation({ mutationFn: deleteIngredient, ...options });
}
