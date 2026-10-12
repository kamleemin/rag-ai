import { NextResponse } from "next/server";
import * as z from "zod";
import type { CalorieEstimate } from "@rag-ai/shared";
import { ingredients as personalIngredientsTable } from "@rag-ai/shared/db";
import { estimateCalories } from "@rag-ai/shared/nutrition";
import { serverEnv } from "@/data/serverEnv";
import { db } from "@/db/db";
import { parseJsonBody } from "@/lib/parse-json-body";
import { ingredientSchema } from "@/lib/recipe-request-schemas";
import { rejectWithoutSession } from "@/lib/session";

const calculateCaloriesSchema = z.object({
  ingredients: z.array(ingredientSchema),
});

/**
 * Works out a recipe's calories from its ingredients — your personal ingredient list
 * first, then USDA. Saves nothing: the recipe form shows the result and sends it along
 * when the recipe is saved.
 */
export async function POST(request: Request) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const parsed = await parseJsonBody(request, calculateCaloriesSchema);
  if (!parsed.success) {
    return parsed.response;
  }

  const estimate = await estimateCalories(
    parsed.data.ingredients.filter((ingredient) => ingredient.name),
    {
      usdaApiKey: serverEnv.USDA_API_KEY,
      personalIngredients: await db.select().from(personalIngredientsTable),
    }
  );
  return NextResponse.json<CalorieEstimate>(estimate);
}
