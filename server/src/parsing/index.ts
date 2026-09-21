import Anthropic from "@anthropic-ai/sdk";
import * as z from "zod";
import type { ExtractionResult, ParsedRecipe } from "@rag-ai/shared";
import { env } from "../env.js";

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

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
  instructions: z.string().nullable(),
  category: z.string().nullable(),
});

const RECIPE_TOOL = {
  name: "record_recipe",
  description: "Records the structured recipe extracted from the video text.",
  input_schema: {
    type: "object" as const,
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
      instructions: { type: ["string", "null"] },
      category: { type: ["string", "null"] },
    },
    required: [
      "title",
      "description",
      "servings",
      "prepMinutes",
      "cookMinutes",
      "ingredients",
      "instructions",
      "category",
    ],
  },
};

/**
 * Fields the model can't confidently read from the source text come back null/empty —
 * the review screen already renders blanks, so we never invent placeholder values.
 */
export async function parseRecipe(
  extraction: ExtractionResult
): Promise<ParsedRecipe | null> {
  const sourceText = [extraction.caption, extraction.transcript]
    .filter(Boolean)
    .join("\n\n");

  if (!sourceText.trim()) return null;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2048,
    tools: [RECIPE_TOOL],
    tool_choice: { type: "tool", name: RECIPE_TOOL.name },
    messages: [
      {
        role: "user",
        content: `Extract a structured recipe from this TikTok video's caption and transcript. Leave a field null (or an empty ingredients array) if it isn't clearly present in the text rather than guessing.\n\n${sourceText}`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") return null;

  const result = parsedRecipeSchema.safeParse(toolUse.input);
  if (!result.success) {
    console.error("Recipe parsing returned an unexpected shape:", result.error);
    return null;
  }

  return result.data;
}
