import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { normalizeVideoUrl, type AddPendingVideoResponse } from "@rag-ai/shared";
import { pendingVideos, recipes, toPendingVideo } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { parseJsonBody } from "@/lib/parse-json-body";
import { rejectWithoutSession } from "@/lib/session";

const requestSchema = z.object({ url: z.url() });

/**
 * Saves a link to process later on the PC (e.g. pasted on a phone). Skipped when that
 * video's recipe is already saved or the link is already queued.
 */
export async function POST(request: Request) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const parsed = await parseJsonBody(request, requestSchema);
  if (!parsed.success) {
    return parsed.response;
  }
  const url = normalizeVideoUrl(parsed.data.url);

  const [savedRecipe] = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(eq(recipes.sourceUrl, url))
    .limit(1);
  if (savedRecipe) {
    return NextResponse.json<AddPendingVideoResponse>({ status: "already_saved" });
  }

  // The unique constraint on url makes this a no-op if the link is already queued.
  const [row] = await db
    .insert(pendingVideos)
    .values({ url })
    .onConflictDoNothing({ target: pendingVideos.url })
    .returning();
  if (!row) {
    return NextResponse.json<AddPendingVideoResponse>({ status: "already_saved" });
  }

  return NextResponse.json<AddPendingVideoResponse>(
    { status: "queued", pendingVideo: toPendingVideo(row) },
    { status: 201 }
  );
}
