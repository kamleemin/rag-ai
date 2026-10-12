import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { Recipe } from "@rag-ai/shared/db";
import { ApiRequestError } from "@/lib/api-request-error";
import {
  formatCalories,
  formatCaloriesPerServing,
  formatIngredient,
  toCalorieBadge,
  toCalorieNote,
  toSteps,
} from "@/lib/format-recipe";
import { RECIPES_QUERY_KEY, recipeQueryKey } from "@/lib/query-keys";
import { toRecipeFormValues } from "@/lib/recipe-form-values";
import { recipePath, shortIdFromSlug } from "@/lib/recipe-path";
import { toUserMessage } from "@/lib/user-error-messages";
import { useRecipeQuery } from "@/requests/get-recipe";
import { useUpdateRecipeMutation } from "@/requests/update-recipe";
import type { RecipeFormValues } from "@/types";
import { RecipeDetailState, UPDATE_RECIPE_ERROR_MESSAGES } from "./const";

/** Never calculated → no estimate, so the form shows "Calculate calories" fresh. */
function toCalorieEstimate({ calories, calorieConfidence, calorieBreakdown }: Recipe) {
  return calories === null && calorieBreakdown.length === 0
    ? null
    : { calories, calorieConfidence, calorieBreakdown };
}

function toCalorieDescription(recipe: Recipe): string {
  const estimate = toCalorieEstimate(recipe);
  return estimate
    ? toCalorieNote(estimate)
    : "Not calculated yet — edit the recipe and use Calculate calories.";
}

/** The API said there's no such recipe (or the id in the URL isn't a valid one). */
function isMissingRecipe(error: Error): boolean {
  return (
    error instanceof ApiRequestError &&
    (error.code === "NOT_FOUND" || error.code === "INVALID_ID")
  );
}

/** `slug` is the last part of the page URL, e.g. "shio-pan-x7kp2m". */
export function useRecipeDetail(slug: string) {
  const shortId = shortIdFromSlug(slug);
  const { data: recipe, isPending, error } = useRecipeQuery(shortId);
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    mutate: updateRecipe,
    isPending: isSaving,
    error: saveError,
    reset: resetSave,
  } = useUpdateRecipeMutation({
    onSuccess: (updated) => {
      queryClient.setQueryData(recipeQueryKey(shortId), updated);
      queryClient.invalidateQueries({ queryKey: RECIPES_QUERY_KEY });
      setEditing(false);
      // A new title changes the readable part of the link.
      router.replace(recipePath(updated));
    },
  });

  if (isPending) {
    return { state: RecipeDetailState.Loading } as const;
  }
  if (error) {
    return isMissingRecipe(error)
      ? ({ state: RecipeDetailState.NotFound } as const)
      : ({ state: RecipeDetailState.Error, errorMessage: toUserMessage(error, {}) } as const);
  }

  function startEditing() {
    resetSave();
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  function saveChanges(values: RecipeFormValues) {
    updateRecipe({ shortId, values });
  }

  return {
    state: RecipeDetailState.Ready,
    recipe,
    editing,
    title: recipe.title ?? "Untitled recipe",
    initialValues: toRecipeFormValues(recipe, toCalorieEstimate(recipe)),
    // "Serves 4 · 50 min total" — parts that aren't known yet are left out.
    summary: [
      recipe.servings && `Serves ${recipe.servings}`,
      recipe.totalMinutes !== null && `${recipe.totalMinutes} min total`,
    ]
      .filter(Boolean)
      .join(" · "),
    ingredientLines: recipe.ingredients.map(formatIngredient),
    steps: toSteps(recipe.instructions),
    caloriesLabel: formatCalories(recipe.calories),
    caloriesPerServing: formatCaloriesPerServing(recipe.caloriesPerServing),
    calorieBadge: toCalorieBadge(recipe),
    calorieNote: toCalorieDescription(recipe),
    startEditing,
    cancelEditing,
    saveChanges,
    isSaving,
    saveErrorMessage: saveError ? toUserMessage(saveError, UPDATE_RECIPE_ERROR_MESSAGES) : null,
  } as const;
}
