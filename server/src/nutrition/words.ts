/** "cloves" → "clove", "tomatoes" → "tomato", "dishes" → "dish", "glass" stays. */
export function singular(word: string): string {
  if (/(s|x|z|ch|sh|o)es$/.test(word)) return word.slice(0, -2);
  if (/[^s]s$/.test(word)) return word.slice(0, -1);
  return word;
}

/** "All-purpose Flour" → ["all", "purpose", "flour"], "Onions, raw" → ["onion", "raw"]. */
export function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean)
    .map(singular);
}
