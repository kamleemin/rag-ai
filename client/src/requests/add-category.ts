import { useMutation } from "@tanstack/react-query";
import type { Category } from "@rag-ai/shared/db";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import type { AddCategoryRequest, RequestMutationOptions } from "@/types";

export async function addCategory(name: string): Promise<Category> {
  const body: AddCategoryRequest = { name };
  const res = await fetch(API_PATHS.addCategory, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await handleApiError(res);
  return res.json();
}

export function useAddCategoryMutation(options?: RequestMutationOptions<Category, string>) {
  return useMutation({ mutationFn: addCategory, ...options });
}
