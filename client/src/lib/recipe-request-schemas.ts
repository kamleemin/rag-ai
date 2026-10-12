import * as z from "zod";
import {
  calculateCaloriesPerServing,
  SHORT_ID_LENGTH,
  type CalorieEstimate,
} from "@rag-ai/shared";

// zod schemas for the recipe route handlers' request bodies and params.

export const shortIdSchema = z.string().regex(new RegExp(`^[a-z0-9]{${SHORT_ID_LENGTH}}$`));

export const ingredientSchema = z.object({
  name: z.string().trim(),
  amount: z.string().trim(),
  unit: z.string().trim(),
});

const calorieLineSchema = z.object({
  ingredient: z.string(),
  name: z.string().optional(),
  source: z.enum(["personal", "usda"]).nullable(),
  matchedFood: z.string().nullable(),
  portion: z.string().nullable(),
  kcal: z.number().int().nonnegative().nullable(),
  reviewReason: z
    .enum(["processed", "no_match", "no_amount", "unknown_unit", "lookup_failed"])
    .nullable(),
});

const calorieEstimateSchema = z.object({
  calories: z.number().int().nonnegative().nullable(),
  calorieConfidence: z.enum(["exact", "estimated"]).nullable(),
  calorieBreakdown: z.array(calorieLineSchema),
}) satisfies z.ZodType<CalorieEstimate>;

/** The editable fields of a recipe — the body of update-recipe, and most of save-recipe. */
export const recipeFieldsSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim(),
  servings: z.string().trim(),
  ingredients: z.array(ingredientSchema),
  instructions: z.string().trim(),
  categoryId: z.uuid(),
  calorieEstimate: calorieEstimateSchema.nullable(),
});

type RecipeFields = z.infer<typeof recipeFieldsSchema>;

/**
 * The recipes table columns for the edited fields. Blank text becomes null, blank
 * ingredient rows are dropped, and no calorie estimate clears the saved calories.
 * Calories per serving is worked out here, so it always matches calories and servings.
 */
export function toRecipeColumns({
  title,
  description,
  servings,
  ingredients,
  instructions,
  categoryId,
  calorieEstimate,
}: RecipeFields) {
  const calories = calorieEstimate?.calories ?? null;
  return {
    title,
    description: description || null,
    servings: servings || null,
    // Blank rows from the form ("+ Add ingredient" left empty) aren't ingredients.
    ingredients: ingredients.filter((ingredient) => ingredient.name),
    instructions: instructions || null,
    categoryId,
    calories,
    caloriesPerServing: calculateCaloriesPerServing(calories, servings || null),
    calorieConfidence: calorieEstimate?.calorieConfidence ?? null,
    calorieBreakdown: calorieEstimate?.calorieBreakdown ?? [],
  };
}
