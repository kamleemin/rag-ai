import { IngredientSource } from "@rag-ai/shared";
import type { Ingredient } from "@rag-ai/shared/db";
import type { IngredientFormValues, OpenFoodFactsProduct } from "@/types";

type Nutrients = Pick<
  Ingredient,
  "kcalPer100g" | "fatPer100g" | "carbsPer100g" | "fibrePer100g" | "proteinPer100g"
>;

/** "367 kcal · fat 1.7 g · carbs 73.3 g · protein 13.3 g" — per 100 g, unknown values left out. */
export function formatNutrients({
  kcalPer100g,
  fatPer100g,
  carbsPer100g,
  fibrePer100g,
  proteinPer100g,
}: Nutrients): string {
  return [
    `${kcalPer100g} kcal`,
    fatPer100g !== null && `fat ${fatPer100g} g`,
    carbsPer100g !== null && `carbs ${carbsPer100g} g`,
    fibrePer100g !== null && `fibre ${fibrePer100g} g`,
    proteinPer100g !== null && `protein ${proteinPer100g} g`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function toText(value: number | null): string {
  return value === null ? "" : String(value);
}

/** A saved ingredient → the form, for editing. */
export function ingredientToFormValues(ingredient: Ingredient): IngredientFormValues {
  return {
    name: ingredient.name,
    brand: ingredient.brand ?? "",
    kcalPer100g: toText(ingredient.kcalPer100g),
    fatPer100g: toText(ingredient.fatPer100g),
    carbsPer100g: toText(ingredient.carbsPer100g),
    fibrePer100g: toText(ingredient.fibrePer100g),
    proteinPer100g: toText(ingredient.proteinPer100g),
    source: ingredient.source,
    openFoodFactsCode: ingredient.openFoodFactsCode,
  };
}

/**
 * An Open Food Facts product → the form. The name is only a starting point: recipes find
 * ingredients by name, so it should be changed to how recipes write it ("Bread flour").
 */
export function productToFormValues(product: OpenFoodFactsProduct): IngredientFormValues {
  return {
    name: product.name,
    brand: product.brand ?? "",
    kcalPer100g: toText(product.kcalPer100g),
    fatPer100g: toText(product.fatPer100g),
    carbsPer100g: toText(product.carbsPer100g),
    fibrePer100g: toText(product.fibrePer100g),
    proteinPer100g: toText(product.proteinPer100g),
    source: IngredientSource.OpenFoodFacts,
    openFoodFactsCode: product.code,
  };
}

/** The product's page on Open Food Facts. */
export function openFoodFactsProductUrl(code: string): string {
  return `https://world.openfoodfacts.org/product/${code}`;
}
