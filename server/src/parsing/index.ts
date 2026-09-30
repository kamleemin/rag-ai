import * as z from "zod";
import type { ExtractionResult, ParsedRecipe } from "@rag-ai/shared";
import { chat } from "../ollama/index.js";
import { estimateCalories } from "../nutrition/calories.js";

const parsedRecipeSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  servings: z.string().nullable(),
  prepMinutes: z.string().nullable(),
  cookMinutes: z.string().nullable(),
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

const RECIPE_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: ["string", "null"] },
    description: { type: ["string", "null"] },
    servings: { type: ["string", "null"] },
    prepMinutes: { type: ["string", "null"] },
    cookMinutes: { type: ["string", "null"] },
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
    category: { type: ["string", "null"] },
  },
  required: [
    "title",
    "description",
    "servings",
    "prepMinutes",
    "cookMinutes",
    "ingredients",
    "steps",
    "category",
  ],
};

function buildPrompt(sourceText: string, categories: string[]): string {
  return `Extract a structured recipe from this TikTok video's caption and transcript.

Rules:
- Leave a field null (or an empty ingredients array) if it isn't clearly present in the text rather than guessing.
- ingredients: one entry per ingredient. "amount" is the number only (e.g. "2", "1/2"), "unit" is the unit only (e.g. "tbsp", "g"); use "" when missing.
- steps: one entry per step, in order, without numbering. Empty array if there are no steps.
- category: pick the best fit from [${categories.join(", ")}]. Only suggest a new short category if none fit.

Caption and transcript:
${sourceText}`;
}

/**
 * Fields the model can't confidently read from the source text come back null/empty —
 * the review screen already renders blanks, so we never invent placeholder values.
 * Returns null when there's no text at all to parse.
 */
export async function parseRecipe(
  extraction: ExtractionResult,
  categories: string[]
): Promise<ParsedRecipe | null> {
  const sourceText = [extraction.caption, extraction.transcript]
    .filter(Boolean)
    .join("\n\n");

  if (!sourceText.trim()) return null;

  const content = await chat({
    format: RECIPE_JSON_SCHEMA,
    messages: [{ role: "user", content: buildPrompt(sourceText, categories) }],
  });

  const { steps, ingredients: rawIngredients, ...rest } = parsedRecipeSchema.parse(
    JSON.parse(content)
  );

  const ingredients = rawIngredients.map(({ name, amount, unit }) => ({
    name,
    // The model often repeats the unit in the amount ("200g" + "g").
    amount: unit && amount.endsWith(unit) ? amount.slice(0, -unit.length).trim() : amount,
    unit,
  }));

  return {
    ...rest,
    ingredients,
    instructions: steps.length
      ? steps.map((step, i) => `${i + 1}. ${step}`).join("\n")
      : null,
    ...(await estimateCalories(ingredients)),
  };
}
