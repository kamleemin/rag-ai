import { type NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import type { ListRecipesResponse } from "@rag-ai/shared";
import { recipes, recipeSummaryColumns, toRecipeSummary } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { rejectWithoutSession } from "@/lib/session";

/** `?needsReview=true` lists only drafts still waiting on the review screen. */
export async function GET(request: NextRequest) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const needsReviewOnly =
    request.nextUrl.searchParams.get("needsReview") === "true";

  const rows = await db
    .select(recipeSummaryColumns)
    .from(recipes)
    .where(needsReviewOnly ? eq(recipes.needsReview, true) : undefined)
    .orderBy(desc(recipes.createdAt));

  const response: ListRecipesResponse = { recipes: rows.map(toRecipeSummary) };
  return NextResponse.json(response);
}
