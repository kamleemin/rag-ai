import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEnterKey } from "@/hooks/use-enter-key";
import { PATHNAMES } from "@/lib/pathnames";
import { EXTRACTED_RECIPE_QUERY_KEY } from "@/lib/query-keys";
import { toUserMessage } from "@/lib/user-error-messages";
import { SAVE_RECIPE_ERROR_MESSAGES } from "@/const";
import { useSaveRecipeMutation } from "@/requests/save-recipe";
import { useExtractTikTokMutation } from "@/requests/extract-tiktok";
import type { ExtractedRecipe, RecipeFormValues } from "@/types";
import { ADD_RECIPE_ERROR_MESSAGES, AddRecipeTab } from "./const";

export function useAddRecipeForm() {
  const [tab, setTab] = useState(AddRecipeTab.Video);
  const [videoUrl, setVideoUrl] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useExtractTikTokMutation({
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
    mutate: saveRecipe,
    isPending: isSavingRecipe,
    error: saveRecipeError,
  } = useSaveRecipeMutation({
    onSuccess: () => {
      router.push(PATHNAMES.recipes);
    },
  });

  function submitVideoLink() {
    if (!videoUrl.trim()) {
      return;
    }
    mutate(videoUrl);
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
    isGenerating: isPending,
    generateErrorMessage: error
      ? toUserMessage(error, ADD_RECIPE_ERROR_MESSAGES)
      : null,
    submitVideoLink,
    saveManualRecipe,
    isSavingRecipe,
    saveRecipeErrorMessage: saveRecipeError
      ? toUserMessage(saveRecipeError, SAVE_RECIPE_ERROR_MESSAGES)
      : null,
    handleVideoLinkKeyDown,
  };
}
