import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { ingredients, toIngredient, type Ingredient } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { apiError } from "@/lib/api-error";
import {
  ingredientIdSchema,
  ingredientRequestSchema,
  isIngredientNameTaken,
} from "@/lib/ingredient-request-schema";
import { parseJsonBody } from "@/lib/parse-json-body";
import { rejectWithoutSession } from "@/lib/session";

/** Saves the edits to one ingredient in your list; returns the updated entry. */
export async function POST(request: Request, ctx: RouteContext<"/api/update-ingredient/[id]">) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const rawId = (await ctx.params).id;
  const parsedId = ingredientIdSchema.safeParse(rawId);
  if (!parsedId.success) {
    return apiError("INVALID_ID", `Ingredient id must be a UUID, got "${rawId}"`);
  }
  const id = parsedId.data;

  const parsed = await parseJsonBody(request, ingredientRequestSchema);
  if (!parsed.success) {
    return parsed.response;
  }
  if (await isIngredientNameTaken(parsed.data.name, id)) {
    return apiError("INGREDIENT_EXISTS", `An ingredient named "${parsed.data.name}" already exists`);
  }

  const [row] = await db
    .update(ingredients)
    .set(parsed.data)
    .where(eq(ingredients.id, id))
    .returning();
  if (!row) {
    return apiError("NOT_FOUND", `No ingredient with id ${id}`);
  }
  return NextResponse.json<Ingredient>(toIngredient(row));
}
