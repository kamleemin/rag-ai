import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExtractTikTokResponse } from "@rag-ai/shared";
import { useCategoryField } from "@/hooks/use-category-field";
import { useEnterKey } from "@/hooks/use-enter-key";
import { recipeCategories } from "@/lib/mock-data";
import { PATHNAMES } from "@/lib/pathnames";
import { EXTRACTED_RECIPE_QUERY_KEY } from "@/lib/query-keys";

type Tab = "video" | "manual";

async function extractTikTok(url: string): Promise<ExtractTikTokResponse> {
  const res = await fetch("/api/extract-tiktok", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error("Failed to extract recipe from video");
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
    if (!videoUrl.trim()) return;
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
    generateError: generateRecipe.isError,
    submitVideoLink,
    saveRecipe,
    handleVideoLinkKeyDown,
  };
}
