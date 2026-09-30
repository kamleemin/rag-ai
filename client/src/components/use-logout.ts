import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_PATHS } from "@/lib/api-paths";
import { PATHNAMES } from "@/lib/pathnames";

async function logOut(): Promise<void> {
  await fetch(API_PATHS.logout, { method: "POST" });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = useMutation({
    mutationFn: logOut,
    onSuccess: () => {
      queryClient.clear();
      router.replace(PATHNAMES.login);
      router.refresh();
    },
  });

  return { logOut: () => logout.mutate(), isLoggingOut: logout.isPending };
}
