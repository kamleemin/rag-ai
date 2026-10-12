import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Category } from "@rag-ai/shared/db";
import { ADD_CATEGORY_ERROR_MESSAGES } from "@/const";
import { useEnterKey } from "@/hooks/use-enter-key";
import { CATEGORIES_QUERY_KEY } from "@/lib/query-keys";
import { toUserMessage } from "@/lib/user-error-messages";
import { useAddCategoryMutation } from "@/requests/add-category";
import { useCategoriesQuery } from "@/requests/list-categories";
import type { ListCategoriesResponse } from "@/types";

function byName(a: Category, b: Category): number {
  return a.name.localeCompare(b.name);
}

/** The recipe form's category: a dropdown of your categories, plus "+ Add new category". */
export function useCategoryField(initialCategoryId: string) {
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data } = useCategoriesQuery();
  const categories = data?.categories ?? [];

  const {
    mutate,
    isPending: isSavingCategory,
    error: addCategoryError,
    reset: resetAddCategory,
  } = useAddCategoryMutation({
    onSuccess: (category) => {
      // Into the cached list straight away, so the dropdown shows it without a refetch.
      queryClient.setQueryData<ListCategoriesResponse>(CATEGORIES_QUERY_KEY, (prev) => ({
        categories: [...(prev?.categories ?? []), category].sort(byName),
      }));
      selectAndClose(category.id);
    },
  });

  function selectAndClose(id: string) {
    setCategoryId(id);
    setIsAddingCategory(false);
    setNewCategoryName("");
  }

  function addCategory() {
    const name = newCategoryName.trim();
    if (!name || isSavingCategory) {
      return;
    }
    // Already in the list (ignoring case)? Just pick it — no need to ask the server.
    const existing = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      selectAndClose(existing.id);
      return;
    }
    mutate(name);
  }

  function toggleAddingCategory() {
    setIsAddingCategory((v) => !v);
    resetAddCategory();
  }

  /** Back to the starting category, with the "new category" box closed. */
  function resetCategory() {
    selectAndClose(initialCategoryId);
    resetAddCategory();
  }

  return {
    categories,
    categoryId,
    setCategoryId,
    isAddingCategory,
    toggleAddingCategory,
    newCategoryName,
    setNewCategoryName,
    addCategory,
    handleNewCategoryKeyDown: useEnterKey(addCategory),
    isSavingCategory,
    addCategoryErrorMessage: addCategoryError
      ? toUserMessage(addCategoryError, ADD_CATEGORY_ERROR_MESSAGES)
      : null,
    resetCategory,
  };
}
