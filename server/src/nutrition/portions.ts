import type { ParsedIngredient } from "@rag-ai/shared";
import type { UsdaMeasure } from "./usda.js";
import { singular, words } from "./words.js";

const UNICODE_FRACTIONS: Record<string, string> = {
  "½": " 1/2", "⅓": " 1/3", "⅔": " 2/3", "¼": " 1/4", "¾": " 3/4", "⅛": " 1/8",
};

const GRAMS_PER_WEIGHT_UNIT: Record<string, number> = {
  g: 1, gram: 1, grams: 1, gr: 1,
  kg: 1000, kilogram: 1000, kilograms: 1000,
  mg: 0.001,
  oz: 28.35, ounce: 28.35, ounces: 28.35,
  lb: 453.6, lbs: 453.6, pound: 453.6, pounds: 453.6,
};

const ML_PER_VOLUME_UNIT: Record<string, number> = {
  tsp: 4.93, teaspoon: 4.93, teaspoons: 4.93,
  tbsp: 14.79, tbs: 14.79, tbl: 14.79, tablespoon: 14.79, tablespoons: 14.79,
  cup: 236.6, cups: 236.6, c: 236.6,
  ml: 1, milliliter: 1, milliliters: 1, millilitre: 1, millilitres: 1,
  l: 1000, liter: 1000, liters: 1000, litre: 1000, litres: 1000,
  "fl oz": 29.57,
};

// USDA rarely lists "1 small"; its "1 whole"/"1 medium" is scaled instead.
const SIZE_FACTORS: Record<string, number> = { small: 0.7, medium: 1, large: 1.3 };

/** "1/2" → 0.5, "1 1/2" → 1.5, "½" → 0.5, "2-3" → 2.5, "" → null. */
export function parseAmount(amount: string): number | null {
  let text = amount.trim();
  for (const [glyph, fraction] of Object.entries(UNICODE_FRACTIONS)) {
    text = text.replaceAll(glyph, fraction);
  }

  const range = text.split(/\s*(?:-|–|to)\s*/);
  if (range.length === 2) {
    const [low, high] = range.map(parseAmount);
    if (low !== null && high !== null) return (low + high) / 2;
  }

  const parts = text.trim().split(/\s+/);
  let total = 0;
  for (const part of parts) {
    const fraction = part.match(/^(\d+)\/(\d+)$/);
    const value = fraction
      ? Number(fraction[1]) / Number(fraction[2])
      : Number(part);
    if (Number.isNaN(value)) break;
    total += value;
  }
  return total > 0 ? total : null;
}

function normalizeUnit(unit: string): string {
  // The model sometimes puts preparation notes in the unit: "cloves, minced" → "cloves".
  const trimmed = unit.split(",")[0].trim().replace(/\.$/, "");
  // Recipe shorthand: capital T is tablespoon, lowercase t is teaspoon.
  if (trimmed === "T") return "tbsp";
  if (trimmed === "t") return "tsp";
  return trimmed.toLowerCase();
}


type ParsedMeasure = { base: number; label: string; grams: number };

/** "1 cup" → { base: 1, label: "cup" }, "1/2 cup" → { base: 0.5, label: "cup" }. */
function parseMeasure(measure: UsdaMeasure): ParsedMeasure {
  const match = measure.text.match(/^([\d\s./½⅓⅔¼¾⅛]+)\s+(.*)$/);
  const base = match ? parseAmount(match[1]) : null;
  return {
    base: base ?? 1,
    label: (match ? match[2] : measure.text).toLowerCase(),
    grams: measure.grams,
  };
}

function volumeMlOf(label: string): number | null {
  for (const [unit, ml] of Object.entries(ML_PER_VOLUME_UNIT)) {
    if (label === unit || label.startsWith(`${unit} `) || label.startsWith(`${unit},`)) {
      return ml;
    }
  }
  return null;
}

/** "1/2 cup ≈ 50 g"; with no unit the name stands in: "2 eggs ≈ 100 g". */
function formatPortion(ingredient: ParsedIngredient, grams: number): string {
  const amount = [ingredient.amount, ingredient.unit || ingredient.name].join(" ");
  return `${amount} ≈ ${Math.round(grams)} g`;
}

export function isWeightUnit(unit: string): boolean {
  return normalizeUnit(unit) in GRAMS_PER_WEIGHT_UNIT;
}

export type Weight =
  | { grams: number; portion: string }
  | { grams: null; reason: "no_amount" | "unknown_unit" };

/**
 * Works out how many grams an ingredient line weighs, using the matched food's
 * household measures from USDA ("1 cup = 100 g", "1 clove = 3 g").
 * Gives a reason instead when it can't — better blank than a guess.
 */
export function gramsFor(ingredient: ParsedIngredient, measures: UsdaMeasure[]): Weight {
  // The model sometimes puts the unit inside the amount: amount "8 oz", unit "".
  const unitInAmount = ingredient.unit
    ? null
    : ingredient.amount.match(/^([\d\s./½⅓⅔¼¾⅛–-]+?)\s*([a-zA-Z].*)$/);
  const unit = normalizeUnit(unitInAmount ? unitInAmount[2] : ingredient.unit);
  const quantity = parseAmount(unitInAmount ? unitInAmount[1] : ingredient.amount);
  const parsedMeasures = measures.map(parseMeasure);

  const result = (grams: number): Weight => ({ grams, portion: formatPortion(ingredient, grams) });
  const unknownUnit: Weight = { grams: null, reason: "unknown_unit" };

  // No amount ("pasta water", "chili oil to garnish"): left blank. USDA's "quantity not
  // specified" is a whole serving of the matched food — 255 g for a garnish of chili oil.
  if (quantity === null) return { grams: null, reason: "no_amount" };

  const gramsPerUnit = GRAMS_PER_WEIGHT_UNIT[unit];
  if (gramsPerUnit !== undefined) return result(quantity * gramsPerUnit);

  // Volume (cup/tbsp/tsp/ml): any volume measure of this food gives its density.
  const unitMl = ML_PER_VOLUME_UNIT[unit];
  if (unitMl !== undefined) {
    // "1 cup, whipped" is half air — only use it when the recipe says whipped.
    const isWhipped = words(ingredient.name).includes("whipped");
    const volumeMeasures = parsedMeasures.filter(
      (m) => volumeMlOf(m.label) !== null && (isWhipped || !words(m.label).includes("whipped"))
    );
    const reference =
      volumeMeasures.find((m) => volumeMlOf(m.label) === unitMl) ?? volumeMeasures[0];
    if (!reference) return unknownUnit;
    const gramsPerMl = reference.grams / (reference.base * volumeMlOf(reference.label)!);
    return result(quantity * unitMl * gramsPerMl);
  }

  // Counted things: "5 cloves" → "1 clove", "1 small" → "1 small",
  // no unit ("1 egg") → "1 egg" (the ingredient's own name).
  const nameWord = words(ingredient.name).pop() ?? "";
  // Match the measure's first word: "1 large" for "large", not "1 cup (4.86 large eggs)".
  const measureWith = (word: string) =>
    parsedMeasures.find((m) => words(m.label)[0] === word);
  const counted = measureWith(unit ? singular(unit) : nameWord);
  if (counted) return result((quantity / counted.base) * counted.grams);

  // "1/2 small onion", "1 large egg", "1 lime" when USDA only lists a one-item measure —
  // "1 medium", "1 whole", "1 regular carrot", or "1 fruit" (SR Legacy's word for a lime
  // or avocado) — scaled by the size.
  const sizeFactor = unit ? SIZE_FACTORS[unit] : 1;
  if (sizeFactor !== undefined) {
    const oneItem = [nameWord, "medium", "whole", "regular", "fruit"]
      .map(measureWith)
      .find(Boolean);
    if (oneItem) return result((quantity / oneItem.base) * oneItem.grams * sizeFactor);
  }
  return unknownUnit;
}
