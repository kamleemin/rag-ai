import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { SAVE_RECIPE_ERROR_MESSAGES } from "@/const";
import { PATHNAMES } from "@/lib/pathnames";
import { normalizeVideoUrl, type ListPendingVideosResponse } from "@rag-ai/shared";
import { EXTRACTED_RECIPE_QUERY_KEY, PENDING_VIDEOS_QUERY_KEY } from "@/lib/query-keys";
import { toRecipeFormValues } from "@/lib/recipe-form-values";
import { toUserMessage } from "@/lib/user-error-messages";
import { useSaveRecipeMutation } from "@/requests/save-recipe";
import type { ExtractedRecipe, RecipeFormValues } from "@/types";

export function useReviewRecipeForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const extracted = queryClient.getQueryData<ExtractedRecipe>(EXTRACTED_RECIPE_QUERY_KEY);
  const recipe = extracted?.recipe ?? undefined;

  const { mutate, isPending, error } = useSaveRecipeMutation({
    onSuccess: () => {
      // Saving removed this link from your queue. Others still waiting → back to the add
      // page, where the banner offers the next one; otherwise to the saved recipes.
      const pending =
        queryClient.getQueryData<ListPendingVideosResponse>(PENDING_VIDEOS_QUERY_KEY);
      const thisUrl = extracted ? normalizeVideoUrl(extracted.sourceUrl) : null;
      const othersWaiting = (pending?.pendingVideos ?? []).some((video) => video.url !== thisUrl);
      queryClient.invalidateQueries({ queryKey: PENDING_VIDEOS_QUERY_KEY });
      router.push(othersWaiting ? PATHNAMES.addRecipe : PATHNAMES.recipes);
    },
  });

  function saveRecipe(values: RecipeFormValues) {
    mutate({ values, sourceUrl: extracted?.sourceUrl });
  }

  function discardRecipe() {
    router.push(PATHNAMES.addRecipe);
  }

  return {
    initialValues: recipe ? toRecipeFormValues(recipe) : {},
    sourceUrl: extracted?.sourceUrl ?? null,
    saveRecipe,
    isSaving: isPending,
    saveErrorMessage: error ? toUserMessage(error, SAVE_RECIPE_ERROR_MESSAGES) : null,
    discardRecipe,
  };
}
