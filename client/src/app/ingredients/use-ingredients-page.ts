import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IngredientSource } from "@rag-ai/shared";
import type { Ingredient } from "@rag-ai/shared/db";
import { INGREDIENTS_QUERY_KEY } from "@/lib/query-keys";
import { toUserMessage } from "@/lib/user-error-messages";
import { useAddIngredientMutation } from "@/requests/add-ingredient";
import { useDeleteIngredientMutation } from "@/requests/delete-ingredient";
import { useIngredientsQuery } from "@/requests/list-ingredients";
import { useUpdateIngredientMutation } from "@/requests/update-ingredient";
import type { IngredientFormValues, IngredientRequest, OpenFoodFactsProduct } from "@/types";
import {
  AddIngredientTab,
  EMPTY_INGREDIENT_FORM,
  SAVE_INGREDIENT_ERROR_MESSAGES,
} from "./const";
import { formatNutrients, ingredientToFormValues, productToFormValues } from "./utils";

/** What the form is filled with: an imported product, or a saved ingredient being edited. */
type Draft = { values: IngredientFormValues; editingId: string | null };

export function useIngredientsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(AddIngredientTab.Search);
  const [draft, setDraft] = useState<Draft | null>(null);
  // Bumped to remount the form, so it starts again from the new draft's values.
  const [formKey, setFormKey] = useState(0);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const { data, isPending: isLoading, error: loadError } = useIngredientsQuery();

  function closeDraft() {
    setDraft(null);
    setFormKey((key) => key + 1);
    resetAdd();
    resetUpdate();
  }

  function onSaved() {
    queryClient.invalidateQueries({ queryKey: INGREDIENTS_QUERY_KEY });
    closeDraft();
  }

  const {
    mutate: addIngredient,
    isPending: isAdding,
    error: addError,
    reset: resetAdd,
  } = useAddIngredientMutation({ onSuccess: onSaved });
  const {
    mutate: updateIngredient,
    isPending: isUpdating,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateIngredientMutation({ onSuccess: onSaved });
  const {
    mutate: deleteIngredient,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteIngredientMutation({
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: INGREDIENTS_QUERY_KEY });
      setConfirmingDeleteId(null);
      if (draft?.editingId === id) {
        closeDraft();
      }
    },
  });

  function openDraft(next: Draft) {
    setDraft(next);
    setFormKey((key) => key + 1);
    resetAdd();
    resetUpdate();
  }

  function changeTab(next: AddIngredientTab) {
    setTab(next);
    closeDraft();
  }

  function pickProduct(product: OpenFoodFactsProduct) {
    openDraft({ values: productToFormValues(product), editingId: null });
  }

  function startEditing(ingredient: Ingredient) {
    openDraft({ values: ingredientToFormValues(ingredient), editingId: ingredient.id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveIngredient(ingredient: IngredientRequest) {
    if (draft?.editingId) {
      updateIngredient({ id: draft.editingId, ingredient });
      return;
    }
    addIngredient(ingredient);
  }

  const saveError = addError ?? updateError;
  const editingName = draft?.editingId ? draft.values.name : null;

  return {
    tab,
    changeTab,
    isEditing: editingName !== null,
    formHeading: editingName ? `Editing “${editingName}”` : null,
    // "Type it in" always shows the form; search shows it once a product is picked.
    isFormVisible: tab === AddIngredientTab.Manual || draft !== null,
    formKey,
    formInitialValues: draft?.values ?? EMPTY_INGREDIENT_FORM,
    submitLabel: editingName ? "Save changes" : "Save ingredient",
    cancelForm: draft ? closeDraft : undefined,
    saveIngredient,
    isSaving: isAdding || isUpdating,
    saveErrorMessage: saveError ? toUserMessage(saveError, SAVE_INGREDIENT_ERROR_MESSAGES) : null,
    pickProduct,
    isLoading,
    loadErrorMessage: loadError ? toUserMessage(loadError, {}) : null,
    items: (data?.ingredients ?? []).map((ingredient) => ({
      ingredient,
      title: [ingredient.name, ingredient.brand].filter(Boolean).join(" · "),
      nutrients: formatNutrients(ingredient),
      sourceLabel: ingredient.source === IngredientSource.OpenFoodFacts ? "OPEN FOOD FACTS" : "MANUAL",
    })),
    startEditing,
    confirmingDeleteId,
    askDelete: setConfirmingDeleteId,
    cancelDelete: () => setConfirmingDeleteId(null),
    deleteIngredient,
    isDeleting,
    deleteErrorMessage: deleteError ? toUserMessage(deleteError, {}) : null,
  };
}
