import { SHORT_ID_LENGTH } from "@rag-ai/shared";
import { PATHNAMES } from "./pathnames";

/** "Shio Pan (塩パン)!" → "shio-pan"; titles with nothing usable become "recipe". */
function toSlug(title: string | null): string {
  const slug = (title ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // accents: "jalapeño" → "jalapeno"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "recipe";
}

/**
 * A recipe's page: /recipes/shio-pan-x7kp2m. Only the short id at the end is used to find
 * the recipe — the title part is for people, so renaming a recipe never breaks old links.
 */
export function recipePath(recipe: { title: string | null; shortId: string }): string {
  return `${PATHNAMES.recipes}/${toSlug(recipe.title)}-${recipe.shortId}`;
}

/** "shio-pan-x7kp2m" → "x7kp2m". */
export function shortIdFromSlug(slug: string): string {
  return slug.slice(-SHORT_ID_LENGTH);
}
