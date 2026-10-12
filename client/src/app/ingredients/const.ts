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
  usdaFdcId: null,
  sourceName: null,
};

export const SEARCH_ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  INVALID_QUERY: "Type at least 2 letters to search.",
  OPEN_FOOD_FACTS_RATE_LIMITED: "Too many searches in a row — wait a minute, then try again.",
  OPEN_FOOD_FACTS_FAILED:
    "Couldn't search Open Food Facts right now. Try again, or type the ingredient in.",
};

export const MIN_SEARCH_LENGTH = 2;

// The badge on each entry in your list.
export const INGREDIENT_SOURCE_LABELS: Record<IngredientSource, string> = {
  [IngredientSource.Manual]: "MANUAL",
  [IngredientSource.OpenFoodFacts]: "OPEN FOOD FACTS",
  [IngredientSource.Usda]: "USDA",
};
