import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { PATHNAMES } from "@/lib/pathnames";
import { EXTRACTED_RECIPE_QUERY_KEY } from "@/lib/query-keys";
import { useExtractTikTokMutation } from "@/requests/extract-tiktok";
import type { ExtractedRecipe } from "@/types";

/**
 * Reads a video's recipe on the PC, then opens the review screen with it — from the add
 * page's Generate and from the waiting-videos banner. The link is kept with the extraction
 * so the review screen can save it as the recipe's source.
 */
export function useGenerateRecipe() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useExtractTikTokMutation({
    onSuccess: (data, url) => {
      queryClient.setQueryData<ExtractedRecipe>(EXTRACTED_RECIPE_QUERY_KEY, {
        ...data,
        sourceUrl: url,
      });
      router.push(PATHNAMES.addRecipeReview);
    },
  });
}
