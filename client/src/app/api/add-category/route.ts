import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import * as z from "zod";
import { categories, categoryColumns, type Category } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { apiError } from "@/lib/api-error";
import { parseJsonBody } from "@/lib/parse-json-body";
import { rejectWithoutSession } from "@/lib/session";

const addCategorySchema = z.object({
  name: z.string().trim().min(1).max(40),
});

/** Adds a recipe category ("+ Add new category" in the recipe form). */
export async function POST(request: Request) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const parsed = await parseJsonBody(request, addCategorySchema);
  if (!parsed.success) {
    return parsed.response;
  }
  const { name } = parsed.data;

  // "dessert" and "Dessert" would be the same category to anyone reading the list.
  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(sql`lower(${categories.name}) = ${name.toLowerCase()}`)
    .limit(1);
  if (existing) {
    return apiError("CATEGORY_EXISTS", `A category named "${name}" already exists`);
  }

  const [row] = await db.insert(categories).values({ name }).returning(categoryColumns);
  return NextResponse.json<Category>(row, { status: 201 });
}
