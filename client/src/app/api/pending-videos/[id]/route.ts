import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { pendingVideos } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { rejectWithoutSession } from "@/lib/session";

const requestSchema = z.object({ status: z.enum(["done", "failed"]) });

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/pending-videos/[id]">
) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) return unauthorized;

  const id = Number((await ctx.params).id);
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!Number.isInteger(id) || !parsed.success) {
    return NextResponse.json(
      { error: 'Body must be { status: "done" | "failed" }' },
      { status: 400 }
    );
  }

  // "done" deletes the row: the recipe now lives in `recipes`, so the queue entry has no further use.
  const rows =
    parsed.data.status === "done"
      ? await db
          .delete(pendingVideos)
          .where(eq(pendingVideos.id, id))
          .returning({ id: pendingVideos.id })
      : await db
          .update(pendingVideos)
          .set({ status: "failed" })
          .where(eq(pendingVideos.id, id))
          .returning({ id: pendingVideos.id });

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
