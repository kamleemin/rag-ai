import { NextResponse } from "next/server";
import { ingredients, toIngredient, type Ingredient } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { apiError } from "@/lib/api-error";
import { ingredientRequestSchema, isIngredientNameTaken } from "@/lib/ingredient-request-schema";
import { parseJsonBody } from "@/lib/parse-json-body";
import { rejectWithoutSession } from "@/lib/session";

/** Adds an ingredient to your list — typed in, or imported from an Open Food Facts product. */
export async function POST(request: Request) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const parsed = await parseJsonBody(request, ingredientRequestSchema);
  if (!parsed.success) {
    return parsed.response;
  }
  if (await isIngredientNameTaken(parsed.data.name)) {
    return apiError("INGREDIENT_EXISTS", `An ingredient named "${parsed.data.name}" already exists`);
  }

  const [row] = await db.insert(ingredients).values(parsed.data).returning();
  return NextResponse.json<Ingredient>(toIngredient(row), { status: 201 });
}
