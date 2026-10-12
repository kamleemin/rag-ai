import { useState } from "react";
import {
  calculateCaloriesPerServing,
  type CalorieEstimate,
  type CalorieLine,
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
 * "Change" when USDA matched a food (it may be the wrong one), "Find it" when it matched
 * nothing. Packaged items and amounts that can't be converted aren't fixed by picking a food.
 */
function toFixLabel({ source, kcal, reviewReason }: CalorieLine): string | null {
  if (source === "usda" && kcal !== null) {
    return "Change";
  }
  if (reviewReason === "no_match" || reviewReason === "lookup_failed") {
    return "Find it";
  }
  return null;
}

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
  // The breakdown line whose "Change" / "Find it" panel is open.
  const [fixingLineIndex, setFixingLineIndex] = useState<number | null>(null);

  const { mutate, isPending, error, reset: resetMutation } = useCalculateCaloriesMutation({
    onSuccess: (result, calculatedIngredients) => {
      setEstimate(result);
      setCalculatedForKey(ingredientsKey(calculatedIngredients));
      setFixingLineIndex(null);
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
    setFixingLineIndex(null);
    resetMutation();
  }

  /** A fix was saved to your ingredient list — recalculate so the line uses it. */
  function handleFixSaved() {
    setFixingLineIndex(null);
    calculateCalories();
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
        // Older saved breakdowns have no name; the full line is close enough to search with.
        name: line.name ?? line.ingredient,
        fixLabel: toFixLabel(line),
      })),
    },
    isCalorieEstimateOutdated: isOutdated,
    canCalculateCalories: ingredients.length > 0 && !isPending,
    isCalculatingCalories: isPending,
    calculateCaloriesErrorMessage: error ? toUserMessage(error, {}) : null,
    calculateCalories,
    resetEstimate,
    fixingLineIndex,
    startFix: setFixingLineIndex,
    closeFix: () => setFixingLineIndex(null),
    handleFixSaved,
    /** What saving sends: the estimate, unless the ingredients changed since it was calculated. */
    savedEstimate: isOutdated ? null : estimate,
  };
}
