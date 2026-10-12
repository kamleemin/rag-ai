import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SAVE_INGREDIENT_ERROR_MESSAGES } from "@/const";
import { useEnterKey } from "@/hooks/use-enter-key";
import { formatNutrients, usdaFoodToFormValues } from "@/lib/ingredients";
import { INGREDIENTS_QUERY_KEY } from "@/lib/query-keys";
import { toUserMessage } from "@/lib/user-error-messages";
import { useAddIngredientMutation } from "@/requests/add-ingredient";
import { useUsdaFoodsQuery } from "@/requests/search-usda-foods";
import type { UsdaFoodResult } from "@/types";
import { MIN_USDA_SEARCH_LENGTH, USDA_SEARCH_ERROR_MESSAGES } from "./const";

/**
 * Fixing one calorie line: search USDA (starting with the ingredient's name), pick a food,
 * review it in the add-ingredient form, and save it to your list — which recipes check
 * before USDA, so the fix applies to every recipe. Nothing is saved until you approve.
 */
export function useCalorieFix(ingredientName: string, onSaved: () => void) {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState(ingredientName);
  // Searches straight away for the ingredient's own name.
  const [submittedQuery, setSubmittedQuery] = useState(ingredientName.trim());
  const [pickedFood, setPickedFood] = useState<UsdaFoodResult | null>(null);

  const { data, isFetching, error } = useUsdaFoodsQuery(
    submittedQuery.length >= MIN_USDA_SEARCH_LENGTH ? submittedQuery : ""
  );
  const {
    mutate: saveIngredient,
    isPending: isSaving,
    error: saveError,
  } = useAddIngredientMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INGREDIENTS_QUERY_KEY });
      onSaved();
    },
  });

  const canSearch = searchText.trim().length >= MIN_USDA_SEARCH_LENGTH && !isFetching;

  function search() {
    if (!canSearch) {
      return;
    }
    setSubmittedQuery(searchText.trim());
    setPickedFood(null);
  }

  const handleSearchKeyDown = useEnterKey(search);

  return {
    searchText,
    setSearchText,
    canSearch,
    search,
    handleSearchKeyDown,
    isSearching: isFetching,
    searchErrorMessage: error ? toUserMessage(error, USDA_SEARCH_ERROR_MESSAGES) : null,
    // undefined until the first search finishes — then [] means "nothing found".
    results: data?.foods.map((food) => ({ food, nutrients: formatNutrients(food) })),
    pickFood: setPickedFood,
    backToResults: () => setPickedFood(null),
    // The form for approving the pick, named after the ingredient as the recipe writes it.
    formInitialValues: pickedFood ? usdaFoodToFormValues(pickedFood, ingredientName) : null,
    pickedFoodId: pickedFood?.fdcId ?? null,
    saveIngredient,
    isSaving,
    saveErrorMessage: saveError ? toUserMessage(saveError, SAVE_INGREDIENT_ERROR_MESSAGES) : null,
  };
}
