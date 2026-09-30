import type { PendingVideo, RecipeSummary } from "../index.js";
import { pendingVideos, recipes } from "./schema.js";

export * from "./schema.js";

/** Select shape for `RecipeSummary` — use with `db.select(recipeSummaryColumns)`. */
export const recipeSummaryColumns = {
  id: recipes.id,
  title: recipes.title,
  category: recipes.category,
  sourceUrl: recipes.sourceUrl,
  needsReview: recipes.needsReview,
  createdAt: recipes.createdAt,
};

type RecipeSummaryRow = Omit<RecipeSummary, "createdAt"> & { createdAt: Date };

export function toRecipeSummary(row: RecipeSummaryRow): RecipeSummary {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export function toPendingVideo(row: typeof pendingVideos.$inferSelect): PendingVideo {
  return { ...row, createdAt: row.createdAt.toISOString() };
}
