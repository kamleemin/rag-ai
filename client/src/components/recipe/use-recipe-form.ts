import { useState } from "react";
import { useCategoryField } from "@/hooks/use-category-field";
import { useEditableRows } from "@/hooks/use-editable-rows";
import { RECIPE_CATEGORIES } from "@rag-ai/shared";
import { toParsedIngredients } from "@/lib/recipe-form-values";
import type { EditableRow, RecipeFormValues } from "@/types";
import { useCalorieEstimate } from "./use-calorie-estimate";

const emptyIngredientRow = (id: string): EditableRow => ({
  id,
  name: "",
  amount: "",
  unit: "",
});

export function useRecipeForm(
  initialValues: Partial<RecipeFormValues>,
  onSubmit: (values: RecipeFormValues) => void
) {
  const initialRows = initialValues.ingredients?.length
    ? initialValues.ingredients
    : [emptyIngredientRow("1")];
  const { rows, updateRow, removeRow, addRow, resetRows } = useEditableRows(
    initialRows,
    emptyIngredientRow
  );
  const { category, setCategory, isAddingCategory, toggleAddingCategory, resetCategory } =
    useCategoryField(
    initialValues.category ?? RECIPE_CATEGORIES[0]
  );
  const [title, setTitle] = useState(initialValues.title ?? "");
  const [description, setDescription] = useState(initialValues.description ?? "");
  const [servings, setServings] = useState(initialValues.servings ?? "");
  const [instructions, setInstructions] = useState(initialValues.instructions ?? "");
  const {
    calorieDisplay,
    isCalorieEstimateOutdated,
    canCalculateCalories,
    isCalculatingCalories,
    calculateCaloriesErrorMessage,
    calculateCalories,
    resetEstimate,
    savedEstimate,
  } = useCalorieEstimate(
    toParsedIngredients(rows),
    initialValues.calorieEstimate ?? null,
    toParsedIngredients(initialRows)
  );

  /** Every field back to the values the form started with. */
  function reset() {
    resetRows();
    resetCategory();
    setTitle(initialValues.title ?? "");
    setDescription(initialValues.description ?? "");
    setServings(initialValues.servings ?? "");
    setInstructions(initialValues.instructions ?? "");
    resetEstimate();
  }

  function handleSubmit() {
    onSubmit({
      title,
      description,
      servings,
      ingredients: rows,
      instructions,
      category,
      calorieEstimate: savedEstimate,
    });
  }

  return {
    rows,
    updateRow,
    removeRow,
    addRow,
    category,
    setCategory,
    isAddingCategory,
    toggleAddingCategory,
    title,
    setTitle,
    description,
    setDescription,
    servings,
    setServings,
    instructions,
    setInstructions,
    calorieDisplay,
    isCalorieEstimateOutdated,
    canCalculateCalories,
    isCalculatingCalories,
    calculateCaloriesErrorMessage,
    calculateCalories,
    reset,
    handleSubmit,
  };
}
