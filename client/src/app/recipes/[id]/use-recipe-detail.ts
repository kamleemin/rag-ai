import { useState } from "react";
import { mockRecipes, recipeCategories } from "@/lib/mock-data";

export function useRecipeDetail(id: string) {
  const recipe = mockRecipes.find((r) => r.id === id);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [servings, setServings] = useState(String(recipe?.servings ?? ""));
  const [ingredientsText, setIngredientsText] = useState(
    recipe?.ingredients.join("\n") ?? ""
  );
  const [instructionsText, setInstructionsText] = useState(
    recipe?.instructions.map((step, i) => `${i + 1}. ${step}`).join("\n") ??
      ""
  );
  const [category, setCategory] = useState(
    recipe?.category ?? recipeCategories[0]
  );
  const [tagsText, setTagsText] = useState(recipe?.tags.join(", ") ?? "");

  function toggleEditing() {
    setEditing((v) => !v);
  }

  function cancelEditing() {
    setEditing(false);
  }

  function saveChanges() {
    setEditing(false);
  }

  return {
    recipe,
    editing,
    toggleEditing,
    cancelEditing,
    saveChanges,
    title,
    setTitle,
    description,
    setDescription,
    servings,
    setServings,
    ingredientsText,
    setIngredientsText,
    instructionsText,
    setInstructionsText,
    category,
    setCategory,
    tagsText,
    setTagsText,
  };
}
