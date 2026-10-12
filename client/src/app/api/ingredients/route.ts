import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { ingredients, toIngredient } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { rejectWithoutSession } from "@/lib/session";
import type { ListIngredientsResponse } from "@/types";

/** Your ingredient list, A–Z. */
export async function GET() {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const rows = await db.select().from(ingredients).orderBy(asc(ingredients.name));
  return NextResponse.json<ListIngredientsResponse>({ ingredients: rows.map(toIngredient) });
}
