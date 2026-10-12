import { and, ne, sql } from "drizzle-orm";
import * as z from "zod";
import { IngredientSource } from "@rag-ai/shared";
import { ingredients } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import type { IngredientRequest } from "@/types";

// The request body of add-ingredient and update-ingredient, and the checks both need.

export const ingredientIdSchema = z.uuid();

const nutrientSchema = z.number().nonnegative().nullable();

export const ingredientRequestSchema = z.object({
  name: z.string().trim().min(1),
  brand: z
    .string()
    .trim()
    .nullable()
    .transform((brand) => brand || null),
  kcalPer100g: z.number().nonnegative(),
  fatPer100g: nutrientSchema,
  carbsPer100g: nutrientSchema,
  fibrePer100g: nutrientSchema,
  proteinPer100g: nutrientSchema,
  source: z.enum(IngredientSource),
  // Where an import came from — optional, so a missing field means none (null).
  openFoodFactsCode: z.string().trim().nullable().default(null),
  usdaFdcId: z.number().int().positive().nullable().default(null),
  sourceName: z
    .string()
    .trim()
    .nullable()
    .default(null)
    .transform((name) => name || null),
}) satisfies z.ZodType<IngredientRequest, unknown>;

/**
 * Recipes find an ingredient by name (ignoring case), so two entries with the same name
 * would make calories depend on which one wins. True when another entry has this name.
 */
export async function isIngredientNameTaken(name: string, exceptId?: string): Promise<boolean> {
  const sameName = sql`lower(${ingredients.name}) = ${name.toLowerCase()}`;
  const [row] = await db
    .select({ id: ingredients.id })
    .from(ingredients)
    .where(exceptId ? and(sameName, ne(ingredients.id, exceptId)) : sameName)
    .limit(1);
  return row !== undefined;
}
