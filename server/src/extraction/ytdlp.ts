import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type CaptionTrack = { url: string; ext: string };

export type TikTokMetadata = {
  description: string;
  subtitles: Record<string, CaptionTrack[]>;
  automaticCaptions: Record<string, CaptionTrack[]>;
};

export async function fetchTikTokMetadata(
  url: string
): Promise<TikTokMetadata> {
  const { stdout } = await execFileAsync("yt-dlp", [
    "--dump-json",
    "--skip-download",
    url,
  ]);
  const data = JSON.parse(stdout);

  return {
    description: data.description ?? "",
    subtitles: data.subtitles ?? {},
    automaticCaptions: data.automatic_captions ?? {},
  };
}

/** Picks a caption track, preferring creator-authored subtitles over auto-generated ones. */
export function pickCaptionTrack(
  metadata: TikTokMetadata
): CaptionTrack | null {
  const fromTracks = (tracks: Record<string, CaptionTrack[]>) => {
    const [lang] = Object.keys(tracks);
    if (!lang) return null;
    return (
      tracks[lang].find((t) => t.ext === "vtt") ?? tracks[lang][0] ?? null
    );
  };

  return fromTracks(metadata.subtitles) ?? fromTracks(metadata.automaticCaptions);
}
