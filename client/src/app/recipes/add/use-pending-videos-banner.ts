import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PENDING_VIDEOS_QUERY_KEY } from "@/lib/query-keys";
import { toUserMessage } from "@/lib/user-error-messages";
import { useDeletePendingVideoMutation } from "@/requests/delete-pending-video";
import { usePendingVideosQuery } from "@/requests/list-pending-videos";

/** "tiktok.com/@chef/video/7312…" — enough to recognise a link without the full URL. */
function shortLink(url: string): string {
  const { hostname, pathname } = new URL(url);
  const text = `${hostname.replace(/^www\./, "")}${pathname}`;
  return text.length > 48 ? `${text.slice(0, 47)}…` : text;
}

/** Links saved for later (e.g. shared from the phone), waiting to be turned into recipes. */
export function usePendingVideosBanner() {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const { data } = usePendingVideosQuery();
  const pendingVideos = data?.pendingVideos ?? [];

  const {
    mutate: removePendingVideo,
    isPending: isRemoving,
    error: removeError,
  } = useDeletePendingVideoMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_VIDEOS_QUERY_KEY });
    },
  });

  const count = pendingVideos.length;

  return {
    count,
    countLabel: `${count} video${count === 1 ? "" : "s"}`,
    isExpanded,
    toggleExpanded: () => setIsExpanded((v) => !v),
    items: pendingVideos.map((video) => ({
      id: video.id,
      url: video.url,
      label: shortLink(video.url),
    })),
    removePendingVideo,
    isRemoving,
    removeErrorMessage: removeError ? toUserMessage(removeError, {}) : null,
  };
}
