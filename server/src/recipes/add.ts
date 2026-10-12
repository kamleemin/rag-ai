import { eq } from "drizzle-orm";
import {
  calculateCaloriesPerServing,
  generateShortId,
  normalizeVideoUrl,
  PendingVideoStatus,
  type AddRecipeResponse,
  type ParsedRecipe,
} from "@rag-ai/shared";
import {
  categories,
  pendingVideos,
  recipeCategoryJoin,
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
  totalMinutes: null,
  ingredients: [],
  instructions: null,
  categoryId: null,
  calories: null,
  calorieConfidence: null,
  calorieBreakdown: [],
};

async function findCategoryName(categoryId: string | null): Promise<string | null> {
  if (!categoryId) {
    return null;
  }
  const [row] = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);
  return row?.name ?? null;
}

async function findSavedRecipeId(url: string): Promise<string | null> {
  const [row] = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(eq(recipes.sourceUrl, url))
    .limit(1);
  return row?.id ?? null;
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
    const parsed = await parseRecipe(extraction);
    const recipe = parsed ?? BLANK_RECIPE;
    const embedding = await embedRecipe({
      ...recipe,
      category: await findCategoryName(recipe.categoryId),
    });

    const [row] = await db
      .insert(recipes)
      .values({
        ...recipe,
        caloriesPerServing: calculateCaloriesPerServing(recipe.calories, recipe.servings),
        shortId: generateShortId(),
        sourceUrl: url,
        needsReview: true,
        embedding,
      })
      .onConflictDoNothing({ target: recipes.sourceUrl })
      .returning({ id: recipes.id });

    await db.delete(pendingVideos).where(eq(pendingVideos.url, url));

    // No row back means a concurrent request saved the same URL first.
    if (!row) {
      return { status: "already_saved", recipeId: (await findSavedRecipeId(url))! };
    }
    // An insert can't return the joined category name, so read the summary back.
    const [summary] = await db
      .select(recipeSummaryColumns)
      .from(recipes)
      .leftJoin(categories, recipeCategoryJoin)
      .where(eq(recipes.id, row.id));
    return { status: "saved", recipe: toRecipeSummary(summary) };
  } catch (err) {
    await db
      .update(pendingVideos)
      .set({ status: PendingVideoStatus.Failed })
      .where(eq(pendingVideos.url, url));
    throw err;
  }
}
