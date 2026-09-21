import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtractionResult } from "@rag-ai/shared";
import {
  downloadBestAudio,
  fetchTikTokMetadata,
  pickCaptionTrack,
  type TikTokMetadata,
} from "./ytdlp.js";
import { transcribeAudio } from "./transcribe.js";
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

async function getAudioTranscript(url: string): Promise<string | null> {
  const dir = await mkdtemp(join(tmpdir(), "kamasak-"));
  const audioPath = join(dir, "audio");
  try {
    await downloadBestAudio(url, audioPath);
    return await transcribeAudio(audioPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
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

  if (!transcript) {
    try {
      transcript = await getAudioTranscript(url);
    } catch (err) {
      console.error("Failed to transcribe audio:", err);
    }
  }

  return { caption, transcript };
}
