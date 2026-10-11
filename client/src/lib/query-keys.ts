export const EXTRACTED_RECIPE_QUERY_KEY = ["extractedRecipe"] as const;
export const RECIPES_QUERY_KEY = ["recipes"] as const;
export const recipeQueryKey = (shortId: string) => ["recipe", shortId] as const;
