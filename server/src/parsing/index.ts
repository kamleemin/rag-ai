import * as z from "zod";
import type { ExtractionResult, ParsedRecipe } from "@rag-ai/shared";
import { chat } from "../ollama/index.js";
import { asc } from "drizzle-orm";
import {
  categories as categoriesTable,
  categoryColumns,
  ingredients as personalIngredientsTable,
  type Category,
} from "@rag-ai/shared/db";
import { estimateCalories } from "@rag-ai/shared/nutrition";
import { db } from "../db/index.js";
import { env } from "../env.js";

const parsedRecipeSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  servings: z.string().nullable(),
  totalMinutes: z.number().nullable(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string(),
      unit: z.string(),
    })
  ),
  steps: z.array(z.string()),
  category: z.string().nullable(),
});

// The model's answer when no category fits. llama3 rarely chooses a bare null from a list
// (it picked "Dessert" for a beef stew), but it does pick an explicit "None".
const NO_CATEGORY = "None";

/**
 * Ollama's structured output: the model can only produce this shape. `category` is limited
 * to your category names (or "None"), so it never invents one.
 */
function recipeJsonSchema(categoryNames: string[]) {
  return {
    type: "object",
    properties: {
      title: { type: ["string", "null"] },
      description: { type: ["string", "null"] },
      servings: { type: ["string", "null"] },
      totalMinutes: { type: ["integer", "null"] },
      ingredients: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            amount: { type: "string" },
            unit: { type: "string" },
          },
          required: ["name", "amount", "unit"],
        },
      },
      // An array, not one string: llama3 insists on listing steps and mangles a string slot.
      steps: { type: "array", items: { type: "string" } },
      category: { type: "string", enum: [...categoryNames, NO_CATEGORY] },
    },
    required: [
      "title",
      "description",
      "servings",
      "totalMinutes",
      "ingredients",
      "steps",
      "category",
    ],
  };
}

function buildPrompt(sourceText: string, categoryNames: string[]): string {
  return `Extract a structured recipe from this TikTok video's caption and transcript.

Rules:
- Leave a field null (or an empty ingredients array) if it isn't clearly present in the text rather than guessing.
- ingredients: one entry per ingredient. "amount" is the number only (e.g. "2", "1/2"), "unit" is the unit only (e.g. "tbsp", "g"); use "" when missing.
- steps: one entry per step, in order, without numbering. Empty array if there are no steps.
- category: pick the best fit from [${categoryNames.join(", ")}]. Answer "${NO_CATEGORY}" if none of them really fits — don't force a poor match.
- totalMinutes: the one field to estimate rather than leave null — total minutes from start to finish (prep + cooking + any resting). Use times stated in the text; otherwise estimate from the steps (e.g. "cook pasta 10 minutes" + chopping). null only if there are no steps.

Caption and transcript:
${sourceText}`;
}

/** "dessert" → Dessert's id; "None" or anything not in the list → null. */
function toCategoryId(name: string | null, categories: Category[]): string | null {
  const match = categories.find((c) => c.name.toLowerCase() === name?.trim().toLowerCase());
  return match?.id ?? null;
}

/**
 * Fields the model can't confidently read from the source text come back null/empty —
 * the review screen already renders blanks, so we never invent placeholder values.
 * Returns null when there's no text at all to parse.
 */
export async function parseRecipe(extraction: ExtractionResult): Promise<ParsedRecipe | null> {
  const sourceText = [extraction.caption, extraction.transcript]
    .filter(Boolean)
    .join("\n\n");

  if (!sourceText.trim()) return null;

  const categories = await db
    .select(categoryColumns)
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.name));
  const categoryNames = categories.map((c) => c.name);

  const content = await chat({
    format: recipeJsonSchema(categoryNames),
    messages: [{ role: "user", content: buildPrompt(sourceText, categoryNames) }],
  });

  const {
    steps,
    ingredients: rawIngredients,
    totalMinutes,
    category,
    ...rest
  } = parsedRecipeSchema.parse(JSON.parse(content));

  const ingredients = rawIngredients.map(({ name, amount, unit }) => ({
    name,
    // The model often repeats the unit in the amount ("200g" + "g").
    amount: unit && amount.endsWith(unit) ? amount.slice(0, -unit.length).trim() : amount,
    unit,
  }));

  return {
    ...rest,
    // 0 or negative means the model had nothing to go on.
    totalMinutes: totalMinutes !== null && totalMinutes > 0 ? Math.round(totalMinutes) : null,
    categoryId: toCategoryId(category, categories),
    ingredients,
    instructions: steps.length
      ? steps.map((step, i) => `${i + 1}. ${step}`).join("\n")
      : null,
    ...(await estimateCalories(ingredients, {
      usdaApiKey: env.USDA_API_KEY,
      personalIngredients: await db.select().from(personalIngredientsTable),
    })),
  };
}
