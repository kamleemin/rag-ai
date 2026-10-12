import { eq } from "drizzle-orm";
import type { PendingVideo, RecipeSummary } from "../index.js";
import { categories, ingredients, pendingVideos, recipes } from "./schema.js";

export * from "./schema.js";

/**
 * Join condition for a recipe's category, so selects can return its name:
 * `.from(recipes).leftJoin(categories, recipeCategoryJoin)`.
 */
export const recipeCategoryJoin = eq(recipes.categoryId, categories.id);

/** Select shape for `RecipeSummary` — use with `db.select(recipeSummaryColumns)` and recipeCategoryJoin. */
export const recipeSummaryColumns = {
  id: recipes.id,
  shortId: recipes.shortId,
  title: recipes.title,
  description: recipes.description,
  category: categories.name,
  calories: recipes.calories,
  caloriesPerServing: recipes.caloriesPerServing,
  sourceUrl: recipes.sourceUrl,
  needsReview: recipes.needsReview,
  createdAt: recipes.createdAt,
};

type RecipeSummaryRow = Omit<RecipeSummary, "createdAt"> & { createdAt: Date };

export function toRecipeSummary(row: RecipeSummaryRow): RecipeSummary {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

type RecipeRow = Omit<typeof recipes.$inferSelect, "embedding"> & {
  /** The category's name, joined in for display; categoryId is what the form edits. */
  category: string | null;
};

/**
 * A full recipe as the API returns it: a `recipes` row without its search embedding, plus
 * its category's name, with createdAt as an ISO string (JSON has no dates). Derived from
 * the schema so it can't drift.
 */
export type Recipe = Omit<RecipeRow, "createdAt"> & { createdAt: string };

/**
 * Select shape for `Recipe` — every column except the embedding (768 numbers nobody reads),
 * plus the category name. Use with recipeCategoryJoin.
 */
export const recipeColumns = {
  id: recipes.id,
  shortId: recipes.shortId,
  title: recipes.title,
  description: recipes.description,
  servings: recipes.servings,
  ingredients: recipes.ingredients,
  instructions: recipes.instructions,
  categoryId: recipes.categoryId,
  category: categories.name,
  calories: recipes.calories,
  caloriesPerServing: recipes.caloriesPerServing,
  calorieConfidence: recipes.calorieConfidence,
  calorieBreakdown: recipes.calorieBreakdown,
  totalMinutes: recipes.totalMinutes,
  sourceUrl: recipes.sourceUrl,
  needsReview: recipes.needsReview,
  createdAt: recipes.createdAt,
};

export function toRecipe(row: RecipeRow): Recipe {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export function toPendingVideo(row: typeof pendingVideos.$inferSelect): PendingVideo {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

/** One entry in your ingredient list as the API returns it (createdAt as an ISO string). */
export type Ingredient = Omit<typeof ingredients.$inferSelect, "createdAt"> & {
  createdAt: string;
};

export function toIngredient(row: typeof ingredients.$inferSelect): Ingredient {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

/** A recipe category as the API returns it. */
export type Category = { id: string; name: string };

export const categoryColumns = { id: categories.id, name: categories.name };
