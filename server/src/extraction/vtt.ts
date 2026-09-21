const TIMESTAMP_LINE = /-->/;
const CUE_TAG = /<[^>]+>/g;

/**
 * TikTok auto-captions repeat overlapping lines across cues (rolling captions),
 * so dedupe consecutive identical lines rather than just stripping timestamps.
 */
export function vttToPlainText(vtt: string): string {
  const lines = vtt.split(/\r?\n/);
  const textLines: string[] = [];
  let lastLine: string | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line === "WEBVTT" || TIMESTAMP_LINE.test(line)) continue;
    if (/^\d+$/.test(line)) continue; // cue index

    const cleaned = line.replace(CUE_TAG, "").trim();
    if (!cleaned || cleaned === lastLine) continue;

    textLines.push(cleaned);
    lastLine = cleaned;
  }

  return textLines.join(" ").trim();
}
