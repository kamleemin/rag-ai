import { eq, isNotNull } from "drizzle-orm";
import {
  normalizeVideoUrl,
  RECIPE_CATEGORIES,
  type AddRecipeResponse,
  type ParsedRecipe,
} from "@rag-ai/shared";
import {
  pendingVideos,
  recipes,
  recipeSummaryColumns,
  toRecipeSummary,
} from "@rag-ai/shared/db";
import { db } from "../db/index.js";
import { extractFromTikTok } from "../extraction/index.js";
import { parseRecipe } from "../parsing/index.js";
import { embedRecipe } from "./embedding.js";

const BLANK_RECIPE: ParsedRecipe = {
  title: null,
  description: null,
  servings: null,
  prepMinutes: null,
  cookMinutes: null,
  ingredients: [],
  instructions: null,
  category: null,
  calories: null,
  calorieConfidence: null,
  calorieBreakdown: [],
};

async function findSavedRecipeId(url: string): Promise<number | null> {
  const [row] = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(eq(recipes.sourceUrl, url))
    .limit(1);
  return row?.id ?? null;
}

async function getCategories(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ category: recipes.category })
    .from(recipes)
    .where(isNotNull(recipes.category));
  const saved = rows.map((r) => r.category).filter((c) => c !== null);
  return [...new Set([...RECIPE_CATEGORIES, ...saved])];
}

/**
 * Extracts, parses, embeds and saves a video as a draft (`needs_review = true`).
 * A URL already in `recipes` is never re-processed. A URL sitting in `pending_videos`
 * *is* processed — that's the queue being drained — and its pending row is removed on
 * success or marked failed on error.
 */
export async function addRecipe(rawUrl: string): Promise<AddRecipeResponse> {
  const url = normalizeVideoUrl(rawUrl);

  const existingId = await findSavedRecipeId(url);
  if (existingId !== null) {
    await db.delete(pendingVideos).where(eq(pendingVideos.url, url));
    return { status: "already_saved", recipeId: existingId };
  }

  try {
    const extraction = await extractFromTikTok(url);
    const parsed = await parseRecipe(extraction, await getCategories());
    const recipe = parsed ?? BLANK_RECIPE;
    const embedding = await embedRecipe(recipe);

    const [row] = await db
      .insert(recipes)
      .values({ ...recipe, sourceUrl: url, needsReview: true, embedding })
      .onConflictDoNothing({ target: recipes.sourceUrl })
      .returning(recipeSummaryColumns);

    await db.delete(pendingVideos).where(eq(pendingVideos.url, url));

    // No row back means a concurrent request saved the same URL first.
    if (!row) {
      return { status: "already_saved", recipeId: (await findSavedRecipeId(url))! };
    }
    return { status: "saved", recipe: toRecipeSummary(row) };
  } catch (err) {
    await db
      .update(pendingVideos)
      .set({ status: "failed" })
      .where(eq(pendingVideos.url, url));
    throw err;
  }
}
