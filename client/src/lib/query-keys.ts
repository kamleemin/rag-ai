export const EXTRACTED_RECIPE_QUERY_KEY = ["extractedRecipe"] as const;
export const RECIPES_QUERY_KEY = ["recipes"] as const;
export const CATEGORIES_QUERY_KEY = ["categories"] as const;
export const INGREDIENTS_QUERY_KEY = ["ingredients"] as const;
export const usdaFoodsQueryKey = (query: string) => ["usdaFoods", query] as const;
export const openFoodFactsQueryKey = (query: string) => ["openFoodFacts", query] as const;
export const recipeQueryKey = (shortId: string) => ["recipe", shortId] as const;
