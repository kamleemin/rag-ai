import { useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { GENERATE_RECIPE_ERROR_MESSAGES } from "@/const";
import { useGenerateRecipe } from "@/hooks/use-generate-recipe";
import { PATHNAMES } from "@/lib/pathnames";
import { PENDING_VIDEOS_QUERY_KEY } from "@/lib/query-keys";
import { toUserMessage } from "@/lib/user-error-messages";
import { useRecipeServerQuery } from "@/requests/check-recipe-server";
import { useDeletePendingVideoMutation } from "@/requests/delete-pending-video";
import { usePendingVideosQuery } from "@/requests/list-pending-videos";

/** "tiktok.com/@chef/video/7312…" — enough to recognise a link without the full URL. */
function shortLink(url: string): string {
  const { hostname, pathname } = new URL(url);
  const text = `${hostname.replace(/^www\./, "")}${pathname}`;
  return text.length > 48 ? `${text.slice(0, 47)}…` : text;
}

/**
 * The banner under the navbar for links saved for later (e.g. shared from the phone).
 * × hides it on the current page only — it's back on the next page or after a refresh.
 */
export function usePendingVideosBanner() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isLoginPage = pathname === PATHNAMES.login;
  const [dismissedOnPath, setDismissedOnPath] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Logged out on the login page, so there's nothing to ask for there.
  const { data } = usePendingVideosQuery({ enabled: !isLoginPage });
  const { data: serverStatus, isError: isServerUnreachable } = useRecipeServerQuery({
    enabled: !isLoginPage,
  });
  const canGenerate = serverStatus?.ok === true;

  const {
    mutate: generate,
    isPending: isGenerating,
    variables: generatingUrl,
    error: generateError,
  } = useGenerateRecipe();

  const {
    mutate: removePendingVideo,
    isPending: isRemoving,
    error: removeError,
  } = useDeletePendingVideoMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_VIDEOS_QUERY_KEY });
    },
  });

  const pendingVideos = data?.pendingVideos ?? [];
  const count = pendingVideos.length;
  const countLabel = `${count} video${count === 1 ? "" : "s"}`;

  return {
    isVisible: !isLoginPage && count > 0 && dismissedOnPath !== pathname,
    dismiss: () => setDismissedOnPath(pathname),
    message: isServerUnreachable
      ? `You have ${countLabel} waiting — open Kamasak on your PC to turn them into recipes.`
      : `You have ${countLabel} waiting to be turned into recipes.`,
    canGenerate,
    isExpanded,
    toggleExpanded: () => setIsExpanded((v) => !v),
    items: pendingVideos.map((video) => ({
      id: video.id,
      url: video.url,
      label: shortLink(video.url),
      isGenerating: isGenerating && generatingUrl === video.url,
    })),
    generate,
    isGenerating,
    removePendingVideo,
    isRemoving,
    errorMessage: generateError
      ? toUserMessage(generateError, GENERATE_RECIPE_ERROR_MESSAGES)
      : removeError
        ? toUserMessage(removeError, {})
        : null,
  };
}
