import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import type { ListPendingVideosResponse } from "@rag-ai/shared";
import { pendingVideos, toPendingVideo } from "@rag-ai/shared/db";
import { db } from "@/db/db";
import { rejectWithoutSession } from "@/lib/session";

/** Saved links waiting to be processed on the PC, newest first. */
export async function GET() {
  const unauthorized = await rejectWithoutSession();
  if (unauthorized) {
    return unauthorized;
  }

  const rows = await db
    .select()
    .from(pendingVideos)
    .orderBy(desc(pendingVideos.createdAt));

  const response: ListPendingVideosResponse = {
    pendingVideos: rows.map(toPendingVideo),
  };
  return NextResponse.json(response);
}
