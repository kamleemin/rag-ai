import type {
  CalorieConfidence,
  CalorieLine,
  CalorieReviewReason,
  ParsedIngredient,
} from "@rag-ai/shared";
import { ingredients as personalIngredients } from "@rag-ai/shared/db";
import { db } from "../db/index.js";
import { isPackaged, rankFoods, requiredWords } from "./matching.js";
import { gramsFor, isWeightUnit } from "./portions.js";
import { getUsdaMeasures, searchUsdaFoods, type UsdaFood, type UsdaMeasure } from "./usda.js";

export type CalorieEstimate = {
  calories: number | null;
  calorieConfidence: CalorieConfidence | null;
  calorieBreakdown: CalorieLine[];
};

type PersonalIngredient = typeof personalIngredients.$inferSelect;

function describeIngredient(ingredient: ParsedIngredient): string {
  return [ingredient.amount, ingredient.unit, ingredient.name].filter(Boolean).join(" ");
}

function personalLabel(personal: PersonalIngredient): string {
  return [personal.name, personal.brand].filter(Boolean).join(" · ");
}

async function loadPersonalIngredients(): Promise<Map<string, PersonalIngredient>> {
  const rows = await db.select().from(personalIngredients);
  return new Map(rows.map((row) => [row.name.trim().toLowerCase(), row]));
}

// When the best match has no measure for the unit (Foundation's "Garlic, raw" has no
// "clove"), the next matches may — but only ones with nearly the same kcal, so the
// food itself never silently changes (Greek yogurt whole milk 97 vs nonfat 59 kcal).
const MEASURE_ALTERNATIVES = 8;
const SAME_FOOD_KCAL_TOLERANCE = 0.2;

/** The plain USDA food for an ingredient plus its household measures, or null when USDA failed. */
async function lookUpUsda(
  ingredient: ParsedIngredient
): Promise<{ food: UsdaFood | null; measures: UsdaMeasure[] } | null> {
  try {
    const required = requiredWords(ingredient.name);
    const ranked = rankFoods(await searchUsdaFoods(required.join(" ")), required);
    const [best] = ranked;
    if (!best || isWeightUnit(ingredient.unit)) return { food: best ?? null, measures: [] };

    const sameFood = ranked
      .slice(0, MEASURE_ALTERNATIVES)
      .filter(
        (food) =>
          Math.abs(food.kcalPer100g - best.kcalPer100g) <=
          best.kcalPer100g * SAME_FOOD_KCAL_TOLERANCE
      );
    for (const food of sameFood) {
      const measures = await getUsdaMeasures(food);
      if (gramsFor(ingredient, measures).grams !== null) return { food, measures };
    }
    return { food: best, measures: await getUsdaMeasures(best) };
  } catch (err) {
    console.error(`USDA lookup failed for "${ingredient.name}":`, err);
    return null;
  }
}

async function calorieLineFor(
  ingredient: ParsedIngredient,
  personal: PersonalIngredient | undefined
): Promise<CalorieLine> {
  const needsReview = (
    reviewReason: CalorieReviewReason,
    usdaFood: UsdaFood | null = null
  ): CalorieLine => ({
    ingredient: describeIngredient(ingredient),
    source: personal ? "personal" : usdaFood ? "usda" : null,
    matchedFood: personal ? personalLabel(personal) : (usdaFood?.description ?? null),
    portion: null,
    kcal: null,
    reviewReason,
  });

  // Packaged items (sauces, seasoning mixes, bread…) vary by brand: they stay blank until
  // you add your brand to your personal list — never a generic USDA value.
  if (!personal && isPackaged(ingredient)) return needsReview("processed");

  // A personal entry with a weight ("200 g") needs nothing from USDA. Otherwise USDA
  // still supplies the household measures ("1 cup = 100 g") to turn the amount into grams.
  const lookup =
    personal && isWeightUnit(ingredient.unit)
      ? { food: null, measures: [] }
      : await lookUpUsda(ingredient);
  if (!lookup && !personal) return needsReview("lookup_failed");
  const food = lookup?.food ?? null;
  if (!food && !personal) return needsReview("no_match");

  const weight = gramsFor(ingredient, lookup?.measures ?? []);
  if (weight.grams === null) return needsReview(weight.reason, food);

  const kcalPer100g = personal ? personal.kcalPer100g : food!.kcalPer100g;
  return {
    ingredient: describeIngredient(ingredient),
    source: personal ? "personal" : "usda",
    matchedFood: personal ? personalLabel(personal) : food!.description,
    portion: weight.portion,
    kcal: Math.round((weight.grams * kcalPer100g) / 100),
    reviewReason: null,
  };
}

/**
 * Per-ingredient calories: your personal ingredient list first, then USDA's basic foods
 * (raw produce, meat, staples) matched by fixed rules — no model guessing. Processed
 * items and anything that can't be matched keep kcal = null with a reviewReason, so the
 * review screen can ask you for exactly those values.
 */
export async function estimateCalories(
  ingredients: ParsedIngredient[]
): Promise<CalorieEstimate> {
  if (ingredients.length === 0) {
    return { calories: null, calorieConfidence: null, calorieBreakdown: [] };
  }

  const personalByName = await loadPersonalIngredients();
  // All lines in parallel — it's only USDA requests now, no model calls.
  const calorieBreakdown = await Promise.all(
    ingredients.map((ingredient) =>
      calorieLineFor(ingredient, personalByName.get(ingredient.name.trim().toLowerCase()))
    )
  );

  const knownKcal = calorieBreakdown.flatMap((line) => (line.kcal === null ? [] : [line.kcal]));
  if (knownKcal.length === 0) {
    return { calories: null, calorieConfidence: null, calorieBreakdown };
  }

  // "exact" only when every line came from your own list; anything else is an estimate.
  const isExact = calorieBreakdown.every(
    (line) => line.source === "personal" && line.kcal !== null
  );
  return {
    calories: knownKcal.reduce((sum, kcal) => sum + kcal, 0),
    calorieConfidence: isExact ? "exact" : "estimated",
    calorieBreakdown,
  };
}
