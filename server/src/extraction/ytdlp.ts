import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type CaptionTrack = { url: string; ext: string };

export type TikTokMetadata = {
  description: string;
  subtitles: Record<string, CaptionTrack[]>;
  automaticCaptions: Record<string, CaptionTrack[]>;
};

// TikTok photo posts (slideshows) live at /@user/photo/<id>, which yt-dlp rejects as an
// "Unsupported URL". Asking for the same id as /@user/video/<id> works and returns the
// caption, which is where those posts put the recipe.
const PHOTO_POST_PATH = /(tiktok\.com\/@[^/?#]+)\/photo\//;

/** The /video/ form of a TikTok photo-post URL, or null for anything else. */
function photoPostAsVideo(url: string): string | null {
  return PHOTO_POST_PATH.test(url) ? url.replace(PHOTO_POST_PATH, "$1/video/") : null;
}

function dumpMetadata(url: string) {
  return execFileAsync(
    "yt-dlp",
    ["--dump-json", "--skip-download", "--impersonate", "chrome", url],
    { timeout: 30_000 }
  );
}

export async function fetchTikTokMetadata(
  url: string
): Promise<TikTokMetadata> {
  let stdout: string;
  try {
    ({ stdout } = await dumpMetadata(photoPostAsVideo(url) ?? url));
  } catch (err) {
    // A short link (vt.tiktok.com/…) only turns out to be a photo post after yt-dlp follows
    // the redirect: it then fails with "Unsupported URL: …/photo/…". Retry that as /video/.
    const stderr = (err as { stderr?: string }).stderr ?? "";
    const unsupportedUrl = stderr.match(/Unsupported URL: (\S+)/)?.[1];
    const retryUrl = unsupportedUrl ? photoPostAsVideo(unsupportedUrl) : null;
    if (!retryUrl) {
      throw err;
    }
    ({ stdout } = await dumpMetadata(retryUrl));
  }
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
