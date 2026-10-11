import { useState } from "react";
import {
  calculateCaloriesPerServing,
  type CalorieEstimate,
  type ParsedIngredient,
} from "@rag-ai/shared";
import {
  formatCalories,
  formatCaloriesPerServing,
  toCalorieBadge,
  toCalorieNote,
} from "@/lib/format-recipe";
import { ingredientsKey } from "@/lib/recipe-form-values";
import { toUserMessage } from "@/lib/user-error-messages";
import { useCalculateCaloriesMutation } from "@/requests/calculate-calories";
import { CALORIE_REVIEW_REASON_LABELS } from "./const";

/**
 * The recipe form's "Calculate calories": works out calories for the current ingredients
 * and remembers which ingredients they were for. Once the ingredients change, the result
 * is outdated — still shown, but `savedEstimate` is null so it's never saved.
 */
export function useCalorieEstimate(
  ingredients: ParsedIngredient[],
  /** The form's servings as typed — per serving follows it as you edit. */
  servings: string,
  initialEstimate: CalorieEstimate | null,
  initialIngredients: ParsedIngredient[]
) {
  const initialKey = initialEstimate ? ingredientsKey(initialIngredients) : null;
  const [estimate, setEstimate] = useState(initialEstimate);
  // The ingredients the estimate was calculated for.
  const [calculatedForKey, setCalculatedForKey] = useState(initialKey);

  const { mutate, isPending, error, reset: resetMutation } = useCalculateCaloriesMutation({
    onSuccess: (result, calculatedIngredients) => {
      setEstimate(result);
      setCalculatedForKey(ingredientsKey(calculatedIngredients));
    },
  });

  const isOutdated = estimate !== null && calculatedForKey !== ingredientsKey(ingredients);

  function calculateCalories() {
    if (ingredients.length === 0) {
      return;
    }
    mutate(ingredients);
  }

  /** Back to the estimate the form started with. */
  function resetEstimate() {
    setEstimate(initialEstimate);
    setCalculatedForKey(initialKey);
    resetMutation();
  }

  return {
    calorieDisplay: estimate && {
      caloriesLabel: formatCalories(estimate.calories),
      perServingLabel: formatCaloriesPerServing(
        calculateCaloriesPerServing(estimate.calories, servings)
      ),
      badge: toCalorieBadge(estimate),
      note: toCalorieNote(estimate),
      lines: estimate.calorieBreakdown.map((line) => ({
        ingredient: line.ingredient,
        kcalLabel: line.kcal === null ? "—" : `${line.kcal} kcal`,
        detail: line.reviewReason
          ? CALORIE_REVIEW_REASON_LABELS[line.reviewReason]
          : [line.matchedFood, line.portion].filter(Boolean).join(" · "),
        needsValue: line.reviewReason !== null,
      })),
    },
    isCalorieEstimateOutdated: isOutdated,
    canCalculateCalories: ingredients.length > 0 && !isPending,
    isCalculatingCalories: isPending,
    calculateCaloriesErrorMessage: error ? toUserMessage(error, {}) : null,
    calculateCalories,
    resetEstimate,
    /** What saving sends: the estimate, unless the ingredients changed since it was calculated. */
    savedEstimate: isOutdated ? null : estimate,
  };
}
