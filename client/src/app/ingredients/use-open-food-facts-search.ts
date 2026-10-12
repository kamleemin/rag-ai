import { useState } from "react";
import { useEnterKey } from "@/hooks/use-enter-key";
import { formatNutrients } from "@/lib/ingredients";
import { toUserMessage } from "@/lib/user-error-messages";
import { useOpenFoodFactsQuery } from "@/requests/search-open-food-facts";
import { MIN_SEARCH_LENGTH, SEARCH_ERROR_MESSAGES } from "./const";

/** Searches only when you press Search or Enter — Open Food Facts allows ~10 searches a minute. */
export function useOpenFoodFactsSearch() {
  const [searchText, setSearchText] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const { data, isFetching, error } = useOpenFoodFactsQuery(submittedQuery);

  const canSearch = searchText.trim().length >= MIN_SEARCH_LENGTH && !isFetching;

  function search() {
    if (!canSearch) {
      return;
    }
    setSubmittedQuery(searchText.trim());
  }

  const handleSearchKeyDown = useEnterKey(search);

  return {
    searchText,
    setSearchText,
    canSearch,
    search,
    handleSearchKeyDown,
    isSearching: isFetching,
    searchErrorMessage: error ? toUserMessage(error, SEARCH_ERROR_MESSAGES) : null,
    // undefined until the first search finishes — then [] means "nothing found".
    results: data?.products.map((product) => ({
      product,
      title: [product.name, product.brand].filter(Boolean).join(" · "),
      quantity: product.quantity,
      nutrients: formatNutrients(product),
    })),
  };
}
