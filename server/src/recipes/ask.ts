import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import * as z from "zod";
import type { AskResponse } from "@rag-ai/shared";
import { categories, recipeCategoryJoin, recipes } from "@rag-ai/shared/db";
import { db } from "../db/index.js";
import { env } from "../env.js";
import { chat, embed } from "../ollama/index.js";
import { embedMissingRecipes } from "./embedding.js";

// Similarity finds candidates; llama3 then picks the ones that actually fit. Similarity
// alone can't decide: for "craving porridge", Shio Pan scored 0.594 against Chicken
// porridge's 0.668 — and 0.591 for "bread and butter", where it is the right answer.
const CANDIDATES = 8;

const NO_MATCH_ANSWER =
  "I couldn't find any saved recipes related to that question.";

type MatchedRecipe = Pick<
  typeof recipes.$inferSelect,
  "title" | "ingredients" | "instructions" | "calories" | "caloriesPerServing" | "totalMinutes"
> & {
  /** The category's name (recipes store its id). */
  category: string | null;
};

/**
 * The model's reply. recipeNumbers comes first so it decides which recipes fit before
 * writing the answer about them (it writes the fields in this order).
 */
function answerJsonSchema(candidateCount: number) {
  return {
    type: "object",
    properties: {
      recipeNumbers: {
        type: "array",
        items: { type: "integer", minimum: 1, maximum: candidateCount },
      },
      answer: { type: "string" },
    },
    required: ["recipeNumbers", "answer"],
  };
}

const answerSchema = z.object({
  recipeNumbers: z.array(z.number().int()),
  answer: z.string(),
});

function formatRecipeForPrompt(recipe: MatchedRecipe, index: number): string {
  const ingredients = recipe.ingredients
    .map((i) => `- ${[i.amount, i.unit, i.name].filter(Boolean).join(" ")}`)
    .join("\n");
  return [
    `## Recipe ${index + 1}: ${recipe.title ?? "Untitled recipe"}`,
    recipe.category && `Category: ${recipe.category}`,
    recipe.totalMinutes !== null && `Total time: ${recipe.totalMinutes} min`,
    // Per serving when known — a whole pot's total ("2106 kcal") reads alarmingly in an answer.
    recipe.caloriesPerServing !== null
      ? `Calories: about ${recipe.caloriesPerServing} kcal per serving`
      : recipe.calories !== null && `Calories: about ${recipe.calories} kcal for the whole recipe`,
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
      shortId: recipes.shortId,
      title: recipes.title,
      category: categories.name,
      ingredients: recipes.ingredients,
      instructions: recipes.instructions,
      calories: recipes.calories,
      caloriesPerServing: recipes.caloriesPerServing,
      totalMinutes: recipes.totalMinutes,
      similarity,
    })
    .from(recipes)
    .leftJoin(categories, recipeCategoryJoin)
    .where(gt(similarity, env.ASK_MIN_SIMILARITY))
    .orderBy(desc(similarity))
    .limit(CANDIDATES);

  if (matches.length === 0) {
    return { answer: NO_MATCH_ANSWER, recipes: [] };
  }

  const content = await chat({
    format: answerJsonSchema(matches.length),
    messages: [
      {
        role: "system",
        content:
          'You answer questions about the user\'s own saved recipes. Use only the recipes listed — never invent recipes or details. Talk to the user directly as "you" ("your Chicken porridge"); never say "the user" or "the recipes provided", and never mention recipe numbers.',
      },
      {
        role: "user",
        // Restating the rules after the recipes: an 8B model follows instructions closest to the question.
        content: `The user's saved recipes:\n\n${matches.map(formatRecipeForPrompt).join("\n\n")}\n\nQuestion: ${question}\n\nrecipeNumbers: the numbers of ONLY the recipes that fit the question. A recipe fits if it IS the kind of dish asked for (a porridge, a bread, a pasta — check its title and category), or if it uses any ingredient the user mentions (check its ingredients). Leave out recipes that are only loosely related. An empty list is fine when none fit.\nanswer: 1-3 sentences to the user ("you") about just those recipes, naming each by its exact title in double quotes with a brief reason. Don't mention recipe numbers. If none fit, say they don't have a saved recipe for that yet.`,
      },
    ],
  });

  const { recipeNumbers, answer } = answerSchema.parse(JSON.parse(content));
  // Valid, unique numbers only, in the model's order.
  const chosen = [...new Set(recipeNumbers)]
    .filter((n) => n >= 1 && n <= matches.length)
    .map((n) => matches[n - 1]);

  return {
    answer,
    recipes: chosen.map(({ id, shortId, title, category, similarity }) => ({
      id,
      shortId,
      title,
      category,
      similarity: Number(similarity),
    })),
  };
}
