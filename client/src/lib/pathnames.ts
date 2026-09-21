export const PATHNAMES = {
  homepage: "/",
  recipes: "/recipes",
  ingredients: "/ingredients",
  addRecipe: "/recipes/add",
  addRecipeReview: "/recipes/add/review",
} as const;

export type Pathname = (typeof PATHNAMES)[keyof typeof PATHNAMES];
