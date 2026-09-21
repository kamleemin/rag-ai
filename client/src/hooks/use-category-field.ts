import { useState } from "react";

export function useCategoryField(initialCategory: string) {
  const [category, setCategory] = useState(initialCategory);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  function toggleAddingCategory() {
    setIsAddingCategory((v) => !v);
  }

  return { category, setCategory, isAddingCategory, toggleAddingCategory };
}
