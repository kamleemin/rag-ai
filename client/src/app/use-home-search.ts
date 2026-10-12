import { useState } from "react";
import { recipePath } from "@/lib/recipe-path";
import { toUserMessage } from "@/lib/user-error-messages";
import { useAskRecipesMutation } from "@/requests/ask-recipes";
import { ASK_ERROR_MESSAGES } from "./const";

/** The home page's Ask box: searches your saved recipes and shows the answer below it. */
export function useHomeSearch() {
  const [query, setQuery] = useState("");
  const { mutate, data, isPending, error, variables } = useAskRecipesMutation();

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isPending) {
      return;
    }
    mutate(trimmed);
  }

  function handleAsk(e: React.SubmitEvent) {
    e.preventDefault();
    ask(query);
  }

  /** A suggestion chip fills the box and asks straight away. */
  function askSuggestion(suggestion: string) {
    setQuery(suggestion);
    ask(suggestion);
  }

  return {
    query,
    setQuery,
    handleAsk,
    askSuggestion,
    canAsk: query.trim() !== "" && !isPending,
    isAsking: isPending,
    // The question the shown answer (or error) is for — the box may have changed since.
    askedQuestion: variables ?? null,
    askErrorMessage: error ? toUserMessage(error, ASK_ERROR_MESSAGES) : null,
    answer: data?.answer ?? null,
    matchedRecipes: (data?.recipes ?? []).map((recipe) => ({
      id: recipe.id,
      href: recipePath(recipe),
      title: recipe.title ?? "Untitled recipe",
      category: recipe.category,
    })),
  };
}
