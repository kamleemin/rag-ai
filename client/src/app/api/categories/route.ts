import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { categories, categoryColumns } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { rejectWithoutSession } from "@/lib/session";
import type { ListCategoriesResponse } from "@/types";

/** Your recipe categories, A–Z — the recipe form's category dropdown. */
export async function GET() {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const rows = await db.select(categoryColumns).from(categories).orderBy(asc(categories.name));
  return NextResponse.json<ListCategoriesResponse>({ categories: rows });
}
