import type { CalorieEstimate, ParsedIngredient } from "@rag-ai/shared";
import { CALORIE_BADGES } from "@/const";

/** 640 → "≈ 640 kcal"; null (not worked out yet) → "—". */
export function formatCalories(calories: number | null): string {
  return calories === null ? "—" : `≈ ${calories} kcal`;
}

/** The badge for a recipe's calories: EXACT, ESTIMATED, or NOT YET when there's no total. */
export function toCalorieBadge({
  calories,
  calorieConfidence,
}: Pick<CalorieEstimate, "calories" | "calorieConfidence">) {
  return CALORIE_BADGES[calories === null ? "pending" : (calorieConfidence ?? "estimated")];
}

/** One line under a calculated total: how many ingredients aren't counted, or where the values came from. */
export function toCalorieNote({ calorieConfidence, calorieBreakdown }: CalorieEstimate): string {
  const uncounted = calorieBreakdown.filter((line) => line.kcal === null).length;
  if (uncounted > 0) {
    return `${uncounted} ingredient${uncounted === 1 ? "" : "s"} not counted yet`;
  }
  return calorieConfidence === "exact"
    ? "Every ingredient matched your list"
    : "Some ingredients use USDA estimates";
}

/** { amount: "2", unit: "tbsp", name: "butter" } → "2 tbsp butter". */
export function formatIngredient({ amount, unit, name }: ParsedIngredient): string {
  return [amount, unit, name].filter(Boolean).join(" ");
}

/** The stored "1. Boil water\n2. Cook pasta" → ["Boil water", "Cook pasta"]. */
export function toSteps(instructions: string | null): string[] {
  return (instructions ?? "")
    .split("\n")
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}
