import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import * as z from "zod";
import {
  normalizeVideoUrl,
  type AddPendingVideoResponse,
  type ListPendingVideosResponse,
} from "@rag-ai/shared";
import { pendingVideos, recipes, toPendingVideo } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { rejectWithoutSession } from "@/lib/session";

const requestSchema = z.object({ url: z.url() });

export async function GET() {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) return unauthorized;

  const rows = await db
    .select()
    .from(pendingVideos)
    .orderBy(desc(pendingVideos.createdAt));

  const response: ListPendingVideosResponse = {
    pendingVideos: rows.map(toPendingVideo),
  };
  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Body must be { url: string }" },
      { status: 400 }
    );
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
