import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { ExtractTikTokResponse } from "@rag-ai/shared";
import { useCategoryField } from "@/hooks/use-category-field";
import { useEditableRows } from "@/hooks/use-editable-rows";
import { recipeCategories } from "@/lib/mock-data";
import { PATHNAMES } from "@/lib/pathnames";
import { EXTRACTED_RECIPE_QUERY_KEY } from "@/lib/query-keys";
import type { EditableRow } from "@/types";

const emptyRow = (id: string): EditableRow => ({
  id,
  name: "",
  amount: "",
  unit: "",
});

export function useReviewRecipeForm() {
  const queryClient = useQueryClient();
  const extracted = queryClient.getQueryData<ExtractTikTokResponse>(
    EXTRACTED_RECIPE_QUERY_KEY
  );
  const recipe = extracted?.recipe;

  const initialRows: EditableRow[] = recipe?.ingredients.length
    ? recipe.ingredients.map((ingredient, i) => ({
        id: String(i + 1),
        ...ingredient,
      }))
    : [emptyRow("1")];

  const ingredientRows = useEditableRows(initialRows, emptyRow);
  const categoryField = useCategoryField(recipe?.category ?? recipeCategories[0]);
  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [servings, setServings] = useState(recipe?.servings ?? "");
  const [prepMinutes, setPrepMinutes] = useState(recipe?.prepMinutes ?? "");
  const [cookMinutes, setCookMinutes] = useState(recipe?.cookMinutes ?? "");
  const [instructions, setInstructions] = useState(recipe?.instructions ?? "");
  const router = useRouter();

  function saveRecipe() {
    router.push(PATHNAMES.recipes);
  }

  return {
    ...ingredientRows,
    ...categoryField,
    title,
    setTitle,
    description,
    setDescription,
    servings,
    setServings,
    prepMinutes,
    setPrepMinutes,
    cookMinutes,
    setCookMinutes,
    instructions,
    setInstructions,
    saveRecipe,
  };
}
