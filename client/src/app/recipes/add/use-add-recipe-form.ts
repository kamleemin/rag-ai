import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCategoryField } from "@/hooks/use-category-field";
import { useEnterKey } from "@/hooks/use-enter-key";
import { recipeCategories } from "@/lib/mock-data";
import { PATHNAMES } from "@/lib/pathnames";
import { EXTRACTED_RECIPE_QUERY_KEY } from "@/lib/query-keys";
import { toUserMessage } from "@/lib/user-error-messages";
import { useExtractTikTokMutation } from "@/requests/extract-tiktok";
import { ADD_RECIPE_ERROR_MESSAGES } from "./const";

type Tab = "video" | "manual";

export function useAddRecipeForm() {
  const [tab, setTab] = useState<Tab>("video");
  const [videoUrl, setVideoUrl] = useState("");
  const categoryField = useCategoryField(recipeCategories[0]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useExtractTikTokMutation({
    onSuccess: (data) => {
      queryClient.setQueryData(EXTRACTED_RECIPE_QUERY_KEY, data);
      router.push(PATHNAMES.addRecipeReview);
    },
  });

  function submitVideoLink() {
    if (!videoUrl.trim()) {
      return;
    }
    mutate(videoUrl);
  }

  function saveRecipe() {
    router.push(PATHNAMES.recipes);
  }

  const handleVideoLinkKeyDown = useEnterKey(submitVideoLink);

  return {
    tab,
    setTab,
    videoUrl,
    setVideoUrl,
    ...categoryField,
    isGenerating: isPending,
    generateErrorMessage: error
      ? toUserMessage(error, ADD_RECIPE_ERROR_MESSAGES)
      : null,
    submitVideoLink,
    saveRecipe,
    handleVideoLinkKeyDown,
  };
}
