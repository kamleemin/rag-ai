import { NextResponse } from "next/server";
import * as z from "zod";
import { generateShortId, normalizeVideoUrl, type RecipeSummary } from "@rag-ai/shared";
import { recipes, recipeSummaryColumns, toRecipeSummary } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { apiError } from "@/lib/api-error";
import { parseJsonBody } from "@/lib/parse-json-body";
import { recipeFieldsSchema, toRecipeColumns } from "@/lib/recipe-request-schemas";
import { rejectWithoutSession } from "@/lib/session";

const saveRecipeSchema = recipeFieldsSchema.extend({
  sourceUrl: z.url().nullable(),
});

/**
 * Saves a recipe the person has checked — typed in by hand, or reviewed after a video was
 * extracted. Calories come with the request: whatever "Calculate calories" worked out in
 * the form, or none. The search embedding is filled in later by the recipe server on the PC.
 */
export async function POST(request: Request) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const parsed = await parseJsonBody(request, saveRecipeSchema);
  if (!parsed.success) {
    return parsed.response;
  }
  const { sourceUrl, ...fields } = parsed.data;
  const normalizedUrl = sourceUrl ? normalizeVideoUrl(sourceUrl) : null;

  // The unique constraint on source_url catches a video that's already saved.
  const [row] = await db
    .insert(recipes)
    .values({
      ...toRecipeColumns(fields),
      shortId: generateShortId(),
      sourceUrl: normalizedUrl,
      needsReview: false,
    })
    .onConflictDoNothing({ target: recipes.sourceUrl })
    .returning(recipeSummaryColumns);
  if (!row) {
    return apiError("ALREADY_SAVED", `A recipe from ${normalizedUrl} is already saved`);
  }

  return NextResponse.json<RecipeSummary>(toRecipeSummary(row), { status: 201 });
}
