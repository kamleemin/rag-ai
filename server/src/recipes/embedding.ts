import { eq, isNull } from "drizzle-orm";
import { categories, recipeCategoryJoin, recipes } from "@rag-ai/shared/db";
import { db } from "../db/index.js";
import { embed } from "../ollama/index.js";

type EmbeddableRecipe = Pick<
  typeof recipes.$inferSelect,
  "title" | "ingredients" | "instructions"
> & {
  /** The category's name (recipes store its id). */
  category: string | null;
};

/** Title + category + ingredient names + steps — amounts/units only add noise to similarity. */
export function recipeEmbeddingText(recipe: EmbeddableRecipe): string {
  return [
    recipe.title,
    recipe.category,
    recipe.ingredients.map((i) => i.name).join(", "),
    recipe.instructions,
  ]
    .filter(Boolean)
    .join("\n");
}

export function embedRecipe(recipe: EmbeddableRecipe): Promise<number[]> {
  return embed("search_document", recipeEmbeddingText(recipe));
}

/**
 * Recipes edited in the cloud (where there's no Ollama) get their embedding cleared,
 * so backfill any nulls before searching. Returns how many were embedded.
 */
export async function embedMissingRecipes(): Promise<number> {
  const missing = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      category: categories.name,
      ingredients: recipes.ingredients,
      instructions: recipes.instructions,
    })
    .from(recipes)
    .leftJoin(categories, recipeCategoryJoin)
    .where(isNull(recipes.embedding));

  for (const recipe of missing) {
    const embedding = await embedRecipe(recipe);
    await db.update(recipes).set({ embedding }).where(eq(recipes.id, recipe.id));
  }
  return missing.length;
}
