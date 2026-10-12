// Next.js API routes (src/app/api/...) that the frontend calls.
export const API_PATHS = {
  login: "/api/login",
  logout: "/api/logout",
  extractTikTok: "/api/extract-tiktok",
  recipes: "/api/recipes",
  recipeByShortId: (shortId: string) => `/api/recipes/${shortId}`,
  saveRecipe: "/api/save-recipe",
  updateRecipe: (shortId: string) => `/api/update-recipe/${shortId}`,
  calculateCalories: "/api/calculate-calories",
  pendingVideos: "/api/pending-videos",
  categories: "/api/categories",
  addCategory: "/api/add-category",
  ingredients: "/api/ingredients",
  addIngredient: "/api/add-ingredient",
  updateIngredient: (id: string) => `/api/update-ingredient/${id}`,
  deleteIngredient: (id: string) => `/api/delete-ingredient/${id}`,
  usdaFoods: (query: string) => `/api/usda-foods?${new URLSearchParams({ query })}`,
  openFoodFacts: (query: string) => `/api/open-food-facts?${new URLSearchParams({ query })}`,
  addPendingVideo: "/api/add-pending-video",
  deletePendingVideo: (id: string) => `/api/delete-pending-video/${id}`,
} as const;

// The recipe server running on your PC (server/ workspace). Its route paths are in
// LOCAL_SERVER_PATHS from @rag-ai/shared, since the server defines the same routes.
export const LOCAL_SERVER_URL = "http://localhost:8080";
