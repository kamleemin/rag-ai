import type { ParsedIngredient } from "@rag-ai/shared";
import {
  DESCRIPTOR_WORDS,
  GENERIC_WORDS,
  HARMLESS_PHRASES,
  NAME_SYNONYMS,
  PACKAGE_UNITS,
  PACKAGED_TERMS,
  PENALTY_WORDS,
  PLAIN_WORDS,
  POWDER_WHEN_DRY,
} from "./const.js";
import type { UsdaFood } from "./usda.js";
import { words } from "./words.js";

const packagedTerms = PACKAGED_TERMS.map(words);
const packageUnits = new Set(PACKAGE_UNITS.flatMap(words));
const descriptorWords = new Set(DESCRIPTOR_WORDS.flatMap(words));
const penaltyWords = new Set(PENALTY_WORDS.flatMap(words));
const plainWords = new Set(PLAIN_WORDS);
const genericWords = new Set(GENERIC_WORDS.flatMap(words));
const powderWhenDry = new Set(POWDER_WHEN_DRY);

/** Whether `term` appears as consecutive words in `nameWords`: "chili oil" in "red chili oil". */
function containsTerm(nameWords: string[], term: string[]): boolean {
  return nameWords.some((_, start) => term.every((word, i) => nameWords[start + i] === word));
}

/** Sauces, seasoning mixes, bread, canned goods… — left blank until you add your brand. */
export function isPackaged(ingredient: ParsedIngredient): boolean {
  const nameWords = words(ingredient.name);
  const unitWords = words(`${ingredient.unit} ${ingredient.amount}`);
  return (
    packagedTerms.some((term) => containsTerm(nameWords, term)) ||
    unitWords.some((word) => packageUnits.has(word))
  );
}

/** The words a USDA name must contain, e.g. "2 large eggs" → ["egg"]. */
export function requiredWords(name: string): string[] {
  const significant = words(name).filter((word) => !descriptorWords.has(word));
  const phrase = (significant.length > 0 ? significant : words(name)).join(" ");
  return words(NAME_SYNONYMS[phrase] ?? phrase);
}

type Ranked = { food: UsdaFood; points: number };

function score(food: UsdaFood, required: string[]): Ranked | null {
  const description = HARMLESS_PHRASES.reduce((text, p) => text.replace(p, ""), food.description);
  const descriptionWords = words(description);
  const firstPart = words(description.split(",")[0]);

  const hasAllWords = required.every((word) => descriptionWords.includes(word));
  // Otherwise the food itself must lead the name: "Rice, white, long-grain" for "jasmine rice".
  const leadsWithHead = firstPart.includes(required[required.length - 1]);
  if (!hasAllWords && !leadsWithHead) return null;

  let points = hasAllWords ? 100 : 0;
  // USDA names lead with the food: "Egg, whole, raw" is an egg, "Bread, egg" is bread,
  // "Parmesan cheese topping" is a topping. "Spices, cinnamon" leads with a plain category.
  if (firstPart.every((word) => required.includes(word) || plainWords.has(word) || word === "spice")) {
    points += 20;
  }
  // Each word counts once: "whole grain, 51% whole wheat" isn't twice as plain.
  const uniqueWords = new Set(descriptionWords);
  for (const word of uniqueWords) {
    if (plainWords.has(word)) points += 5;
    if (penaltyWords.has(word) && !required.includes(word)) points -= 15;
  }
  if ([...uniqueWords].some((word) => genericWords.has(word))) points += 8;
  if (
    (uniqueWords.has("dry") || uniqueWords.has("dried")) &&
    required.some((word) => powderWhenDry.has(word))
  ) {
    points -= 20;
  }
  // Skin alone ("Chicken, skin (drumsticks and thighs)", "Potatoes, raw, skin") isn't what
  // a recipe means. "Meat and skin" is a real cut but recipes usually mean skinless, so it
  // only loses a little to "meat only"; potatoes' "flesh and skin" is the whole potato.
  if (uniqueWords.has("skin") && !required.includes("skin")) {
    if (uniqueWords.has("meat")) points -= 5;
    else if (!uniqueWords.has("flesh")) points -= 15;
  }
  // Brand names are in capitals: "DENNY'S", "QUAKER".
  if (/\b[A-Z]{3,}\b/.test(food.description)) points -= 10;
  // SR Legacy has household measures ("1 clove"); Foundation often only a "RACC".
  if (food.dataType === "SR Legacy") points += 3;
  // Shorter names are the basic food; longer ones are specific variants.
  points -= descriptionWords.length;
  return { food, points };
}

/** USDA's results best-first, keeping only foods that are the same ingredient. */
export function rankFoods(candidates: UsdaFood[], required: string[]): UsdaFood[] {
  return candidates
    .map((food) => score(food, required))
    .filter((ranked): ranked is Ranked => ranked !== null)
    .sort((a, b) => b.points - a.points)
    .map((ranked) => ranked.food);
}
