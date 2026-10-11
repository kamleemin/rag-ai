import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { ingredients } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { apiError } from "@/lib/api-error";
import { ingredientIdSchema } from "@/lib/ingredient-request-schema";
import { rejectWithoutSession } from "@/lib/session";

/** Removes one ingredient from your list. Calories already saved on recipes stay as they are. */
export async function DELETE(_request: Request, ctx: RouteContext<"/api/delete-ingredient/[id]">) {
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

  const rows = await db
    .delete(ingredients)
    .where(eq(ingredients.id, id))
    .returning({ id: ingredients.id });
  if (rows.length === 0) {
    return apiError("NOT_FOUND", `No ingredient with id ${id}`);
  }
  return new NextResponse(null, { status: 204 });
}
