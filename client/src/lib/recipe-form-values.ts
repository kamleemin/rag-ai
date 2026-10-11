import type { CalorieEstimate, ParsedIngredient } from "@rag-ai/shared";
import type { EditableRow, RecipeFormValues } from "@/types";

/** The fields a recipe form can start from — a saved recipe or a video extraction. */
type RecipeFormSource = {
  title: string | null;
  description: string | null;
  servings: string | null;
  ingredients: ParsedIngredient[];
  instructions: string | null;
  category: string | null;
};

/** A recipe → RecipeForm's starting values. */
export function toRecipeFormValues(
  recipe: RecipeFormSource,
  calorieEstimate: CalorieEstimate | null = null
): Partial<RecipeFormValues> {
  return {
    title: recipe.title ?? "",
    description: recipe.description ?? "",
    servings: recipe.servings ?? "",
    ingredients: recipe.ingredients.map((ingredient, i) => ({ id: String(i + 1), ...ingredient })),
    instructions: recipe.instructions ?? "",
    ...(recipe.category ? { category: recipe.category } : {}),
    calorieEstimate,
  };
}

/**
 * The form's ingredient rows as the API takes them: without React's row `id`, trimmed,
 * and without blank rows ("+ Add ingredient" left empty).
 */
export function toParsedIngredients(rows: EditableRow[]): ParsedIngredient[] {
  return rows
    .map(({ name = "", amount = "", unit = "" }) => ({
      name: name.trim(),
      amount: amount.trim(),
      unit: unit.trim(),
    }))
    .filter((ingredient) => ingredient.name);
}

/** Compares ingredient lists, to tell whether calories were calculated for the current ones. */
export function ingredientsKey(ingredients: ParsedIngredient[]): string {
  return JSON.stringify(ingredients);
}
