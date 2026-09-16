import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCategoryField } from "@/hooks/use-category-field";
import { useEnterKey } from "@/hooks/use-enter-key";
import { recipeCategories } from "@/lib/mock-data";
import { PATHNAMES } from "@/lib/pathnames";

type Tab = "video" | "manual";

export function useAddRecipeForm() {
  const [tab, setTab] = useState<Tab>("video");
  const categoryField = useCategoryField(recipeCategories[0]);
  const router = useRouter();

  function goToGenerating() {
    router.push(PATHNAMES.addRecipeGenerating);
  }

  function saveRecipe() {
    router.push(PATHNAMES.recipes);
  }

  const handleVideoLinkKeyDown = useEnterKey(goToGenerating);

  return {
    tab,
    setTab,
    ...categoryField,
    goToGenerating,
    saveRecipe,
    handleVideoLinkKeyDown,
  };
}
