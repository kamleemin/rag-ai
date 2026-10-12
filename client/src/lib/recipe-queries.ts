import { eq } from "drizzle-orm";
import type { RecipeSummary } from "@rag-ai/shared";
import {
  categories,
  recipeCategoryJoin,
  recipeColumns,
  recipes,
  recipeSummaryColumns,
  toRecipe,
  toRecipeSummary,
  type Recipe,
} from "@rag-ai/shared/db";
import { db } from "@/db/db";

// Reads of a recipe with its category's name joined in. Inserts and updates can't return
// joined columns, so routes that write a recipe read it back with these.

export async function findRecipeByShortId(shortId: string): Promise<Recipe | null> {
  const [row] = await db
    .select(recipeColumns)
    .from(recipes)
    .leftJoin(categories, recipeCategoryJoin)
    .where(eq(recipes.shortId, shortId))
    .limit(1);
  return row ? toRecipe(row) : null;
}

export async function findRecipeSummaryById(id: string): Promise<RecipeSummary | null> {
  const [row] = await db
    .select(recipeSummaryColumns)
    .from(recipes)
    .leftJoin(categories, recipeCategoryJoin)
    .where(eq(recipes.id, id))
    .limit(1);
  return row ? toRecipeSummary(row) : null;
}

/** True when a category with this id exists — checked before linking a recipe to it. */
export async function categoryExists(id: string): Promise<boolean> {
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  return row !== undefined;
}
