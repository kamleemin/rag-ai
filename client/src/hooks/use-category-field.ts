import { useState } from "react";

export function useCategoryField(initialCategory: string) {
  const [category, setCategory] = useState(initialCategory);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  function toggleAddingCategory() {
    setIsAddingCategory((v) => !v);
  }

  /** Back to the starting category, with the "new category" box closed. */
  function resetCategory() {
    setCategory(initialCategory);
    setIsAddingCategory(false);
  }

  return { category, setCategory, isAddingCategory, toggleAddingCategory, resetCategory };
}
