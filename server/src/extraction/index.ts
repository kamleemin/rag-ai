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

export async function extractFromTikTok(url: string): Promise<ExtractionResult> {
  let caption = "";
  let metadata: TikTokMetadata | null = null;
  try {
    metadata = await fetchTikTokMetadata(url);
    caption = metadata.description;
  } catch (err) {
    console.error("Failed to fetch TikTok metadata:", err);
  }

  let transcript: string | null = null;
  try {
    transcript = metadata ? await getSubtitleTranscript(metadata) : null;
  } catch (err) {
    console.error("Failed to extract subtitles:", err);
  }

  return { caption, transcript };
}
