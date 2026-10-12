import { useMutation } from "@tanstack/react-query";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import type { RequestMutationOptions } from "@/types";

export async function logOut(): Promise<void> {
  const res = await fetch(API_PATHS.logout, { method: "POST" });
  await handleApiError(res);
}

export function useLogOutMutation(options?: RequestMutationOptions<void, void>) {
  return useMutation({ mutationFn: logOut, ...options });
}
