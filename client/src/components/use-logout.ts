import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { PATHNAMES } from "@/lib/pathnames";
import { useLogOutMutation } from "@/requests/logout";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useLogOutMutation({
    onSuccess: () => {
      queryClient.clear();
      router.replace(PATHNAMES.login);
      router.refresh();
    },
  });

  return { logOut: () => mutate(), isLoggingOut: isPending };
}
