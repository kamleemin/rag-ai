import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExtractTikTokResponse } from "@rag-ai/shared";
import { useCategoryField } from "@/hooks/use-category-field";
import { useEnterKey } from "@/hooks/use-enter-key";
import { API_PATHS } from "@/lib/api-paths";
import { handleApiError } from "@/lib/api-request-error";
import { recipeCategories } from "@/lib/mock-data";
import { PATHNAMES } from "@/lib/pathnames";
import { EXTRACTED_RECIPE_QUERY_KEY } from "@/lib/query-keys";
import { toUserMessage } from "@/lib/user-error-messages";
import { ADD_RECIPE_ERROR_MESSAGES } from "./const";

type Tab = "video" | "manual";

async function extractTikTok(url: string): Promise<ExtractTikTokResponse> {
  const res = await fetch(API_PATHS.extractTikTok, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  await handleApiError(res);
  return res.json();
}

export function useAddRecipeForm() {
  const [tab, setTab] = useState<Tab>("video");
  const [videoUrl, setVideoUrl] = useState("");
  const categoryField = useCategoryField(recipeCategories[0]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const generateRecipe = useMutation({
    mutationFn: extractTikTok,
    onSuccess: (data) => {
      queryClient.setQueryData(EXTRACTED_RECIPE_QUERY_KEY, data);
      router.push(PATHNAMES.addRecipeReview);
    },
  });

  function submitVideoLink() {
    if (!videoUrl.trim()) {
      return;
    }
    generateRecipe.mutate(videoUrl);
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
    isGenerating: generateRecipe.isPending,
    generateErrorMessage: generateRecipe.error
      ? toUserMessage(generateRecipe.error, ADD_RECIPE_ERROR_MESSAGES)
      : null,
    submitVideoLink,
    saveRecipe,
    handleVideoLinkKeyDown,
  };
}
