import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { SHORT_ID_LENGTH } from "@rag-ai/shared";
import { recipeColumns, recipes, toRecipe, type Recipe } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { apiError } from "@/lib/api-error";
import { shortIdSchema } from "@/lib/recipe-request-schemas";
import { rejectWithoutSession } from "@/lib/session";

/** One saved recipe, by the short id in its link — everything the recipe page and edit form need. */
export async function GET(_request: Request, ctx: RouteContext<"/api/recipes/[shortId]">) {
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

  const [row] = await db
    .select(recipeColumns)
    .from(recipes)
    .where(eq(recipes.shortId, parsedShortId.data))
    .limit(1);
  if (!row) {
    return apiError("NOT_FOUND", `No recipe with short id ${parsedShortId.data}`);
  }

  return NextResponse.json<Recipe>(toRecipe(row));
}
