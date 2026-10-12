import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { SHORT_ID_LENGTH } from "@rag-ai/shared";
import { recipes, type Recipe } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { apiError } from "@/lib/api-error";
import { parseJsonBody } from "@/lib/parse-json-body";
import { categoryExists, findRecipeByShortId } from "@/lib/recipe-queries";
import {
  recipeFieldsSchema,
  shortIdSchema,
  toRecipeColumns,
} from "@/lib/recipe-request-schemas";
import { rejectWithoutSession } from "@/lib/session";

/**
 * Saves the edits to a saved recipe (the recipe page's "Save changes") and returns the
 * updated recipe. The search embedding is cleared, so the recipe server on the PC embeds
 * the new text before its next search.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/update-recipe/[shortId]">) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const rawShortId = (await ctx.params).shortId;
  const parsedShortId = shortIdSchema.safeParse(rawShortId);
  if (!parsedShortId.success) {
    return apiError(
      "INVALID_ID",
      `Recipe short id must be ${SHORT_ID_LENGTH} lowercase letters or digits, got "${rawShortId}"`
    );
  }

  const parsed = await parseJsonBody(request, recipeFieldsSchema);
  if (!parsed.success) {
    return parsed.response;
  }
  if (!(await categoryExists(parsed.data.categoryId))) {
    return apiError("INVALID_BODY", `No category with id ${parsed.data.categoryId}`);
  }

  const [row] = await db
    .update(recipes)
    .set({ ...toRecipeColumns(parsed.data), embedding: null })
    .where(eq(recipes.shortId, parsedShortId.data))
    .returning({ id: recipes.id });
  if (!row) {
    return apiError("NOT_FOUND", `No recipe with short id ${parsedShortId.data}`);
  }

  // Read back with the category name joined in (an update can't return it).
  const recipe = await findRecipeByShortId(parsedShortId.data);
  return NextResponse.json<Recipe>(recipe!);
}
