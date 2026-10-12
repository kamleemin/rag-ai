import { formatCalories, formatCaloriesPerServing } from "@/lib/format-recipe";
import { recipePath } from "@/lib/recipe-path";
import { toUserMessage } from "@/lib/user-error-messages";
import { useRecipesQuery } from "@/requests/list-recipes";

export function useAllRecipes() {
  const { data, isLoading, error } = useRecipesQuery();

  return {
    isLoading,
    errorMessage: error ? toUserMessage(error, {}) : null,
    items: (data?.recipes ?? []).map((recipe) => ({
      id: recipe.id,
      href: recipePath(recipe),
      title: recipe.title ?? "Untitled recipe",
      description: recipe.description,
      category: recipe.category,
      caloriesLabel: formatCalories(recipe.calories),
      perServingLabel: formatCaloriesPerServing(recipe.caloriesPerServing),
    })),
  };
}
