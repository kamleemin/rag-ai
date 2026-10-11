import { IngredientSource } from "@rag-ai/shared";
import type { ApiErrorCode, IngredientFormValues } from "@/types";

/** The two ways to add an ingredient. */
export enum AddIngredientTab {
  Manual = "manual",
  Search = "search",
}

// Search first: it's the default tab.
export const ADD_INGREDIENT_TABS = [
  { value: AddIngredientTab.Search, label: "SEARCH OPEN FOOD FACTS" },
  { value: AddIngredientTab.Manual, label: "TYPE IT IN" },
];

export const EMPTY_INGREDIENT_FORM: IngredientFormValues = {
  name: "",
  brand: "",
  kcalPer100g: "",
  fatPer100g: "",
  carbsPer100g: "",
  fibrePer100g: "",
  proteinPer100g: "",
  source: IngredientSource.Manual,
  openFoodFactsCode: null,
};

type NutrientKey = "kcalPer100g" | "fatPer100g" | "carbsPer100g" | "fibrePer100g" | "proteinPer100g";

/** The form's number fields, in order. Only calories are required. */
export const NUTRIENT_FIELDS: { key: NutrientKey; label: string; suffix: string }[] = [
  { key: "kcalPer100g", label: "Calories *", suffix: "kcal/100g" },
  { key: "fatPer100g", label: "Fat", suffix: "g/100g" },
  { key: "carbsPer100g", label: "Carbs", suffix: "g/100g" },
  { key: "fibrePer100g", label: "Fibre", suffix: "g/100g" },
  { key: "proteinPer100g", label: "Protein", suffix: "g/100g" },
];

export const MISSING_FIELDS_MESSAGE = "Add a name and the calories per 100 g.";
export const INVALID_NUMBER_MESSAGE = "Nutrition values must be numbers, e.g. 13.3.";

export const SAVE_INGREDIENT_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_BODY: MISSING_FIELDS_MESSAGE,
  INGREDIENT_EXISTS: "You already have an ingredient with this name — edit that one instead.",
  NOT_FOUND: "This ingredient no longer exists.",
};

export const SEARCH_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_QUERY: "Type at least 2 letters to search.",
  OPEN_FOOD_FACTS_RATE_LIMITED: "Too many searches in a row — wait a minute, then try again.",
  OPEN_FOOD_FACTS_FAILED:
    "Couldn't search Open Food Facts right now. Try again, or type the ingredient in.",
};

export const MIN_SEARCH_LENGTH = 2;
