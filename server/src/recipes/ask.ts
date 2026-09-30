import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import type { AskResponse } from "@rag-ai/shared";
import { recipes } from "@rag-ai/shared/db";
import { db } from "../db/index.js";
import { env } from "../env.js";
import { chat, embed } from "../ollama/index.js";
import { embedMissingRecipes } from "./embedding.js";

const TOP_K = 5;

const NO_MATCH_ANSWER =
  "I couldn't find any saved recipes related to that question.";

type MatchedRecipe = Pick<
  typeof recipes.$inferSelect,
  "title" | "category" | "ingredients" | "instructions" | "calories"
>;

function formatRecipeForPrompt(recipe: MatchedRecipe): string {
  const ingredients = recipe.ingredients
    .map((i) => `- ${[i.amount, i.unit, i.name].filter(Boolean).join(" ")}`)
    .join("\n");
  return [
    `## ${recipe.title ?? "Untitled recipe"}`,
    recipe.category && `Category: ${recipe.category}`,
    recipe.calories !== null && `Estimated calories: ${recipe.calories} kcal`,
    ingredients && `Ingredients:\n${ingredients}`,
    recipe.instructions && `Steps:\n${recipe.instructions}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function askRecipes(question: string): Promise<AskResponse> {
  await embedMissingRecipes();

  const questionEmbedding = await embed("search_query", question);
  const similarity = sql<number>`1 - (${cosineDistance(recipes.embedding, questionEmbedding)})`;

  const matches = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      category: recipes.category,
      ingredients: recipes.ingredients,
      instructions: recipes.instructions,
      calories: recipes.calories,
      similarity,
    })
    .from(recipes)
    .where(gt(similarity, env.ASK_MIN_SIMILARITY))
    .orderBy(desc(similarity))
    .limit(TOP_K);

  if (matches.length === 0) {
    return { answer: NO_MATCH_ANSWER, recipes: [] };
  }

  const answer = await chat({
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You answer questions about the user's saved recipe collection. Answer using only the recipes provided below — never invent recipes or details that aren't in them. Mention every recipe you use by its exact title. If none of them actually answer the question, say so briefly.",
      },
      {
        role: "user",
        // Restating the rules after the recipes: an 8B model follows instructions closest to the question.
        content: `Recipes:\n\n${matches.map(formatRecipeForPrompt).join("\n\n")}\n\nQuestion: ${question}\n\nAnswer in 1-4 sentences using only the recipes above. Name each recipe you recommend by its exact title in double quotes and say briefly why it fits. If none fit, say so.`,
      },
    ],
  });

  return {
    answer,
    recipes: matches.map(({ id, title, category, similarity }) => ({
      id,
      title,
      category,
      similarity: Number(similarity),
    })),
  };
}
