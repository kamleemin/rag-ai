import { useRouter } from "next/navigation";
import { useCategoryField } from "@/hooks/use-category-field";
import { useEditableRows } from "@/hooks/use-editable-rows";
import { recipeCategories } from "@/lib/mock-data";
import { PATHNAMES } from "@/lib/pathnames";
import type { EditableRow } from "@/types";

const initialRows: EditableRow[] = [
  { id: "1", name: "Pasta", amount: "250", unit: "g" },
  { id: "2", name: "Unsalted butter", amount: "2", unit: "tbsp" },
  { id: "3", name: "Garlic, minced", amount: "4", unit: "cloves" },
  { id: "4", name: "", amount: "", unit: "" },
];

export function useReviewRecipeForm() {
  const ingredientRows = useEditableRows(initialRows, (id) => ({
    id,
    name: "",
    amount: "",
    unit: "",
  }));
  const categoryField = useCategoryField(recipeCategories[0]);
  const router = useRouter();

  function saveRecipe() {
    router.push(PATHNAMES.recipes);
  }

  return { ...ingredientRows, ...categoryField, saveRecipe };
}
