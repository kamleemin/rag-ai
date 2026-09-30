import type { ExtractionResult } from "@rag-ai/shared";
import { fetchTikTokMetadata, pickCaptionTrack, type TikTokMetadata } from "./ytdlp.js";
import { vttToPlainText } from "./vtt.js";

async function getSubtitleTranscript(
  metadata: TikTokMetadata
): Promise<string | null> {
  const track = pickCaptionTrack(metadata);
  if (!track) return null;

  const res = await fetch(track.url);
  if (!res.ok) return null;
  const vtt = await res.text();
  return vttToPlainText(vtt) || null;
}

/**
 * Throws if yt-dlp can't fetch the video at all (private, deleted, network, yt-dlp broken) —
 * that's a retryable failure, not a recipe. A video with no caption and no subtitles
 * still succeeds, just with blank text.
 */
export async function extractFromTikTok(url: string): Promise<ExtractionResult> {
  const metadata = await fetchTikTokMetadata(url);

  let transcript: string | null = null;
  try {
    transcript = await getSubtitleTranscript(metadata);
  } catch (err) {
    console.error("Failed to extract subtitles:", err);
  }

  return { caption: metadata.description, transcript };
}
