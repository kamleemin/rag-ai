import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEnterKey } from "@/hooks/use-enter-key";
import { PATHNAMES } from "@/lib/pathnames";
import { EXTRACTED_RECIPE_QUERY_KEY, PENDING_VIDEOS_QUERY_KEY } from "@/lib/query-keys";
import { toUserMessage } from "@/lib/user-error-messages";
import { SAVE_RECIPE_ERROR_MESSAGES } from "@/const";
import { useAddPendingVideoMutation } from "@/requests/add-pending-video";
import { useRecipeServerQuery } from "@/requests/check-recipe-server";
import { useSaveRecipeMutation } from "@/requests/save-recipe";
import { useExtractTikTokMutation } from "@/requests/extract-tiktok";
import type { ExtractedRecipe, RecipeFormValues } from "@/types";
import {
  ADD_RECIPE_ERROR_MESSAGES,
  AddRecipeTab,
  INVALID_LINK_MESSAGE,
  SAVE_FOR_LATER_ERROR_MESSAGES,
} from "./const";

/** A web link (http/https) — what Generate and Save for later accept. */
function isWebLink(text: string): boolean {
  return URL.canParse(text) && /^https?:$/.test(new URL(text).protocol);
}

/**
 * `sharedUrl`: a link opened from the phone's share sheet (/recipes/add?url=…). It's filled
 * in but never started automatically — you tap Generate (or Save for later) yourself.
 */
export function useAddRecipeForm(sharedUrl: string | null) {
  const [tab, setTab] = useState(AddRecipeTab.Video);
  const [videoUrl, setVideoUrl] = useState(sharedUrl ?? "");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [savedForLaterNotice, setSavedForLaterNotice] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Generating needs the recipe server on the PC; from a phone, links are saved for later.
  const { data: serverStatus, isError: isServerUnreachable } = useRecipeServerQuery();
  const canGenerate = serverStatus?.ok === true;

  const {
    mutate: extract,
    isPending: isGenerating,
    error: generateError,
    reset: resetGenerate,
  } = useExtractTikTokMutation({
    // Keep the link with the extraction so the review screen can save it as the source.
    onSuccess: (data, url) => {
      queryClient.setQueryData<ExtractedRecipe>(EXTRACTED_RECIPE_QUERY_KEY, {
        ...data,
        sourceUrl: url,
      });
      router.push(PATHNAMES.addRecipeReview);
    },
  });

  const {
    mutate: saveForLater,
    isPending: isSavingForLater,
    error: saveForLaterError,
  } = useAddPendingVideoMutation({
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: PENDING_VIDEOS_QUERY_KEY });
      if (result.status === "queued") {
        setVideoUrl("");
        setSavedForLaterNotice("Saved for later — turn it into a recipe on your PC.");
        return;
      }
      setSavedForLaterNotice("This video is already saved, or already waiting in your queue.");
    },
  });

  const {
    mutate: saveRecipe,
    isPending: isSavingRecipe,
    error: saveRecipeError,
  } = useSaveRecipeMutation({
    onSuccess: () => {
      router.push(PATHNAMES.recipes);
    },
  });

  /** Reads the recipe from a video — the typed link, or one from your queue. */
  function generate(url: string) {
    setSavedForLaterNotice(null);
    extract(url);
  }

  /** Generate when the PC is reachable; otherwise save the link to the queue. */
  function submitVideoLink() {
    const url = videoUrl.trim();
    if (!url) {
      return;
    }
    if (!isWebLink(url)) {
      setLinkError(INVALID_LINK_MESSAGE);
      return;
    }
    setLinkError(null);
    resetGenerate();
    setSavedForLaterNotice(null);
    if (isServerUnreachable) {
      saveForLater(url);
      return;
    }
    generate(url);
  }

  function saveManualRecipe(values: RecipeFormValues) {
    saveRecipe({ values });
  }

  const handleVideoLinkKeyDown = useEnterKey(submitVideoLink);

  return {
    tab,
    setTab,
    videoUrl,
    setVideoUrl,
    canGenerate,
    isServerUnreachable,
    submitLabel: isServerUnreachable
      ? isSavingForLater
        ? "Saving…"
        : "Save for later"
      : "Generate",
    isSubmittingLink: isSavingForLater,
    isGenerating,
    generate,
    videoLinkErrorMessage:
      linkError ??
      (generateError ? toUserMessage(generateError, ADD_RECIPE_ERROR_MESSAGES) : null) ??
      (saveForLaterError ? toUserMessage(saveForLaterError, SAVE_FOR_LATER_ERROR_MESSAGES) : null),
    savedForLaterNotice,
    submitVideoLink,
    saveManualRecipe,
    isSavingRecipe,
    saveRecipeErrorMessage: saveRecipeError
      ? toUserMessage(saveRecipeError, SAVE_RECIPE_ERROR_MESSAGES)
      : null,
    handleVideoLinkKeyDown,
  };
}
