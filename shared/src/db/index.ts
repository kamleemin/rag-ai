import type { PendingVideo, RecipeSummary } from "../index.js";
import { pendingVideos, recipes } from "./schema.js";

export * from "./schema.js";

/** Select shape for `RecipeSummary` — use with `db.select(recipeSummaryColumns)`. */
export const recipeSummaryColumns = {
  id: recipes.id,
  shortId: recipes.shortId,
  title: recipes.title,
  description: recipes.description,
  category: recipes.category,
  calories: recipes.calories,
  sourceUrl: recipes.sourceUrl,
  needsReview: recipes.needsReview,
  createdAt: recipes.createdAt,
};

type RecipeSummaryRow = Omit<RecipeSummary, "createdAt"> & { createdAt: Date };

export function toRecipeSummary(row: RecipeSummaryRow): RecipeSummary {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

/**
 * A full recipe as the API returns it: a `recipes` row without its search embedding, with
 * createdAt as an ISO string (JSON has no dates). Derived from the schema so it can't drift.
 */
export type Recipe = Omit<typeof recipes.$inferSelect, "embedding" | "createdAt"> & {
  createdAt: string;
};

/** Select shape for `Recipe` — every column except the embedding (768 numbers nobody reads). */
export const recipeColumns = {
  id: recipes.id,
  shortId: recipes.shortId,
  title: recipes.title,
  description: recipes.description,
  servings: recipes.servings,
  ingredients: recipes.ingredients,
  instructions: recipes.instructions,
  category: recipes.category,
  calories: recipes.calories,
  calorieConfidence: recipes.calorieConfidence,
  calorieBreakdown: recipes.calorieBreakdown,
  totalMinutes: recipes.totalMinutes,
  sourceUrl: recipes.sourceUrl,
  needsReview: recipes.needsReview,
  createdAt: recipes.createdAt,
};

export function toRecipe(row: Omit<typeof recipes.$inferSelect, "embedding">): Recipe {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export function toPendingVideo(row: typeof pendingVideos.$inferSelect): PendingVideo {
  return { ...row, createdAt: row.createdAt.toISOString() };
}
