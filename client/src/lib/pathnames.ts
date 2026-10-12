export const PATHNAMES = {
  homepage: "/",
  login: "/login",
  recipes: "/recipes",
  ingredients: "/ingredients",
  addRecipe: "/recipes/add",
  addRecipeReview: "/recipes/add/review",
} as const;

export type Pathname = (typeof PATHNAMES)[keyof typeof PATHNAMES];
