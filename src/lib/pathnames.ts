export const PATHNAMES = {
  homepage: "/",
  recipes: "/recipes",
  ingredients: "/ingredients",
  addRecipe: "/recipes/add",
  addRecipeGenerating: "/recipes/add/generating",
  addRecipeReview: "/recipes/add/review",
} as const;

export type Pathname = (typeof PATHNAMES)[keyof typeof PATHNAMES];
