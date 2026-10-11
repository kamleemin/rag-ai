export type ExtractionResult = {
  caption: string;
  transcript: string | null;
};

export type ParsedIngredient = {
  name: string;
  amount: string;
  unit: string;
};

export type ParsedRecipe = {
  title: string | null;
  description: string | null;
  servings: string | null;
  /** Start-to-finish minutes from a video (stated in it, or estimated from the steps); null for recipes typed in. */
  totalMinutes: number | null;
  ingredients: ParsedIngredient[];
  instructions: string | null;
  category: string | null;
  /** Sum of the known per-ingredient kcal; null if none could be worked out. */
  calories: number | null;
  calorieConfidence: CalorieConfidence | null;
  calorieBreakdown: CalorieLine[];
};

/** A recipe's calories as worked out from its ingredients ("Calculate calories" in the recipe form). */
export type CalorieEstimate = {
  /** Sum of the known per-ingredient kcal; null if none could be worked out. */
  calories: number | null;
  calorieConfidence: CalorieConfidence | null;
  calorieBreakdown: CalorieLine[];
};

/**
 * "exact" = every ingredient matched your personal ingredient list.
 * "estimated" = at least one used USDA data or couldn't be worked out.
 */
export type CalorieConfidence = "exact" | "estimated";

/** How one ingredient's calories were worked out — shown on the review screen. */
export type CalorieLine = {
  ingredient: string;
  /** Where the kcal/100g came from; null when no food matched. */
  source: "personal" | "usda" | null;
  /** The matched food, e.g. "Cheese, Parmesan, dry grated". */
  matchedFood: string | null;
  /** The weight used, e.g. "1/2 cup ≈ 50 g"; null when it couldn't be worked out. */
  portion: string | null;
  kcal: number | null;
  /** Why kcal is null and the line needs your value on the review screen; null when calculated. */
  reviewReason: CalorieReviewReason | null;
};

/**
 * - processed: sauces, seasoning mixes, broths, bread, canned/packaged items — they vary
 *   by brand, so they're never guessed from USDA.
 * - no_match: no USDA basic food matched the name.
 * - no_amount: "pasta water", "chives to garnish".
 * - unknown_unit: the unit couldn't be converted to grams ("3 sprigs").
 * - lookup_failed: USDA was unreachable.
 */
export type CalorieReviewReason =
  | "processed"
  | "no_match"
  | "no_amount"
  | "unknown_unit"
  | "lookup_failed";

export type ExtractTikTokRequest = {
  url: string;
};

export type ExtractTikTokResponse = {
  extraction: ExtractionResult;
  recipe: ParsedRecipe | null;
};

export const RECIPE_CATEGORIES = [
  "Pasta",
  "Breakfast",
  "Appetizer",
  "Asian",
  "Dessert",
  "Salad",
];

/**
 * TikTok share links carry tracking query params (?is_from_webapp=1&sender_device=pc…)
 * that differ per share, so dedupe on the URL without query/hash/trailing slash.
 */
export function normalizeVideoUrl(url: string): string {
  const parsed = new URL(url.trim());
  parsed.search = "";
  parsed.hash = "";
  parsed.hostname = parsed.hostname.toLowerCase();
  return parsed.toString().replace(/\/$/, "");
}

export type RecipeSummary = {
  id: string;
  /** For links: /recipes/<title-slug>-<shortId>. */
  shortId: string;
  title: string | null;
  description: string | null;
  category: string | null;
  /** null until it's been worked out after saving. */
  calories: number | null;
  sourceUrl: string | null;
  needsReview: boolean;
  createdAt: string;
};

// ---- Local server (runs on the PC) ----

export type HealthResponse =
  | { ok: true; chatModel: string; embedModel: string }
  | { ok: false; error: string };

export type AddRecipeRequest = { url: string };

export type AddRecipeResponse =
  | { status: "saved"; recipe: RecipeSummary }
  | { status: "already_saved"; recipeId: string };

export type AskRequest = { question: string };

export type AskRecipe = {
  id: string;
  shortId: string;
  title: string | null;
  category: string | null;
  similarity: number;
};

export type AskResponse = { answer: string; recipes: AskRecipe[] };

// ---- Cloud (Next.js route handlers) ----

/** A saved link's state in the `pending_videos` table. */
export enum PendingVideoStatus {
  Pending = "pending",
  Failed = "failed",
}

export type PendingVideo = {
  id: string;
  url: string;
  status: PendingVideoStatus;
  createdAt: string;
};

export type AddPendingVideoRequest = { url: string };

export type AddPendingVideoResponse =
  | { status: "queued"; pendingVideo: PendingVideo }
  | { status: "already_saved" };

export type ListPendingVideosResponse = { pendingVideos: PendingVideo[] };

export type ListRecipesResponse = { recipes: RecipeSummary[] };

// ---- Route paths on the local server (PC). server.ts defines them; the client calls them. ----

export const LOCAL_SERVER_PATHS = {
  health: "/health",
  addRecipe: "/add-recipe",
  ask: "/ask",
  extractTikTok: "/extract-tiktok",
} as const;

const SHORT_ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
export const SHORT_ID_LENGTH = 6;

/**
 * The short, URL-friendly recipe id ("x7kp2m") used in links like /recipes/shio-pan-x7kp2m.
 * 36^6 ≈ 2 billion values; the unique constraint on recipes.short_id catches the odd clash.
 */
export function generateShortId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SHORT_ID_LENGTH));
  return Array.from(bytes, (byte) => SHORT_ID_ALPHABET[byte % SHORT_ID_ALPHABET.length]).join("");
}
