import { useState } from "react";
import { IngredientSource } from "@rag-ai/shared";
import { openFoodFactsProductUrl, usdaFoodUrl } from "@/lib/ingredients";
import type { IngredientFormValues, IngredientRequest } from "@/types";
import { INVALID_NUMBER_MESSAGE, MISSING_FIELDS_MESSAGE } from "./const";

/** "13,3" or "13.3" → 13.3; blank → null; anything else → NaN. */
function parseNutrient(text: string): number | null {
  const trimmed = text.trim().replace(",", ".");
  return trimmed === "" ? null : Number(trimmed);
}

function isInvalid(value: number | null): boolean {
  return value !== null && (Number.isNaN(value) || value < 0);
}

/** Where an imported entry came from, with a link to it; null for one typed in. */
function toSourceLink({ source, openFoodFactsCode, usdaFdcId, sourceName }: IngredientFormValues) {
  if (source === IngredientSource.OpenFoodFacts && openFoodFactsCode) {
    return { from: "Open Food Facts", name: sourceName, url: openFoodFactsProductUrl(openFoodFactsCode) };
  }
  if (source === IngredientSource.Usda && usdaFdcId) {
    return { from: "USDA", name: sourceName, url: usdaFoodUrl(usdaFdcId) };
  }
  return null;
}

export function useIngredientForm(
  initialValues: IngredientFormValues,
  onSubmit: (ingredient: IngredientRequest) => void
) {
  const [values, setValues] = useState(initialValues);
  const [validationError, setValidationError] = useState<string | null>(null);

  function setField(key: keyof IngredientFormValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const name = values.name.trim();
    const kcalPer100g = parseNutrient(values.kcalPer100g);
    if (!name || kcalPer100g === null) {
      setValidationError(MISSING_FIELDS_MESSAGE);
      return;
    }
    const nutrients = {
      fatPer100g: parseNutrient(values.fatPer100g),
      carbsPer100g: parseNutrient(values.carbsPer100g),
      fibrePer100g: parseNutrient(values.fibrePer100g),
      proteinPer100g: parseNutrient(values.proteinPer100g),
    };
    if ([kcalPer100g, ...Object.values(nutrients)].some(isInvalid)) {
      setValidationError(INVALID_NUMBER_MESSAGE);
      return;
    }

    setValidationError(null);
    onSubmit({
      name,
      brand: values.brand.trim() || null,
      kcalPer100g,
      ...nutrients,
      source: values.source,
      openFoodFactsCode: values.openFoodFactsCode,
      usdaFdcId: values.usdaFdcId,
      sourceName: values.sourceName,
    });
  }

  return {
    values,
    setField,
    sourceLink: toSourceLink(initialValues),
    validationError,
    handleSubmit,
  };
}
