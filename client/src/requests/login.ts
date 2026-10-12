import { useMutation } from "@tanstack/react-query";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import type { RequestMutationOptions } from "@/types";

export async function logIn(password: string): Promise<void> {
  const res = await fetch(API_PATHS.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  await handleApiError(res);
}

export function useLogInMutation(options?: RequestMutationOptions<void, string>) {
  return useMutation({ mutationFn: logIn, ...options });
}
