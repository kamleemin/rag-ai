import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { pendingVideos } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { apiError } from "@/lib/api-error";
import { rejectWithoutSession } from "@/lib/session";

const idSchema = z.uuid();

/**
 * Removes one saved link from the queue, e.g. one saved by mistake or a video that keeps
 * failing. Processing a link doesn't need this — the PC server's /add-recipe removes the
 * link itself once its recipe is saved.
 */
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/delete-pending-video/[id]">
) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const rawId = (await ctx.params).id;
  const parsedId = idSchema.safeParse(rawId);
  if (!parsedId.success) {
    return apiError("INVALID_ID", `Pending video id must be a UUID, got "${rawId}"`);
  }
  const id = parsedId.data;

  const rows = await db
    .delete(pendingVideos)
    .where(eq(pendingVideos.id, id))
    .returning({ id: pendingVideos.id });
  if (rows.length === 0) {
    return apiError("NOT_FOUND", `No pending video with id ${id}`);
  }
  return new NextResponse(null, { status: 204 });
}
