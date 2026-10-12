"use client";

import { Input } from "@/components/ui/input";
import SegmentedTabs from "@/components/common/segmented-tabs";
import IngredientForm from "@/components/ingredient/ingredient-form";
import SectionHeader from "@/components/recipe/section-header";
import { ADD_INGREDIENT_TABS, AddIngredientTab } from "./const";
import IngredientList from "./ingredient-list";
import OpenFoodFactsSearch from "./open-food-facts-search";
import { useIngredientsPage } from "./use-ingredients-page";

export default function IngredientsPage() {
  const {
    tab,
    changeTab,
    isEditing,
    formHeading,
    isFormVisible,
    formKey,
    formInitialValues,
    submitLabel,
    cancelForm,
    saveIngredient,
    isSaving,
    saveErrorMessage,
    pickProduct,
    isLoading,
    loadErrorMessage,
    items,
    startEditing,
    confirmingDeleteId,
    askDelete,
    cancelDelete,
    deleteIngredient,
    isDeleting,
    deleteErrorMessage,
    addCardRef,
    listSearchText,
    setListSearchText,
    ingredientCount,
    emptyListMessage,
  } = useIngredientsPage();

  return (
    // The page fills the space under the navbar and never scrolls itself: `basis-0` keeps
    // its content from stretching the body, so only the list (and a tall add box) scroll.
    <main className="flex min-h-0 flex-1 basis-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-white px-5 py-6 sm:px-10">
        <h1 className="font-serif text-2xl font-semibold text-ink">Ingredients</h1>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-[720px] flex-1 flex-col px-5 pt-8 pb-6 sm:px-10">
        <p className="mb-7 shrink-0 text-sm leading-relaxed text-body-text">
          Your personal ingredient list — matched first when calculating a recipe&apos;s calories.
          Anything not listed here falls back to a generic estimate from the USDA food database.
        </p>

        <div className="shrink-0">
          <SectionHeader step="01" label={isEditing ? "Edit ingredient" : "Add ingredient"} />
        </div>
        {/* Scrolls inside itself when search results and the form make it tall. */}
        <div
          ref={addCardRef}
          className="mb-8 min-h-0 overflow-y-auto rounded-[10px] border border-border bg-white px-6 py-6 sm:px-8"
        >
          {isEditing ? (
            <h3 className="mb-5 font-serif text-lg font-semibold text-ink">{formHeading}</h3>
          ) : (
            <SegmentedTabs
              tabs={ADD_INGREDIENT_TABS}
              value={tab}
              onChange={changeTab}
              className="mb-6"
            />
          )}
          {!isEditing && tab === AddIngredientTab.Search && (
            <OpenFoodFactsSearch onUseProduct={pickProduct} />
          )}
          {isFormVisible && (
            <div className={tab === AddIngredientTab.Search && !isEditing ? "mt-6" : undefined}>
              <IngredientForm
                key={formKey}
                initialValues={formInitialValues}
                submitLabel={submitLabel}
                onSubmit={saveIngredient}
                onCancel={cancelForm}
                isSubmitting={isSaving}
                submitError={saveErrorMessage}
              />
            </div>
          )}
        </div>

        {/* The rest of the height, at least ~3 ingredients — a tall add box scrolls instead. */}
        <div className="flex min-h-[280px] flex-1 flex-col">
          <SectionHeader step="02" label="Your list" />
          {ingredientCount > 0 && (
            <Input
              value={listSearchText}
              onChange={(e) => setListSearchText(e.target.value)}
              placeholder={`Search your ${ingredientCount} ingredients`}
              className="mb-3 h-auto shrink-0 rounded-md border-border bg-muted px-3.5 py-2.5 text-sm text-ink"
            />
          )}
          {deleteErrorMessage && (
            <p role="alert" className="mb-3 text-[13px] text-red-600">
              {deleteErrorMessage}
            </p>
          )}
          {isLoading && <p className="text-sm text-tan">Loading ingredients…</p>}
          {loadErrorMessage && (
            <p role="alert" className="text-[13px] text-red-600">
              {loadErrorMessage}
            </p>
          )}
          {!isLoading && !loadErrorMessage && (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <IngredientList
                items={items}
                emptyMessage={emptyListMessage}
                confirmingDeleteId={confirmingDeleteId}
                isDeleting={isDeleting}
                onEdit={startEditing}
                onAskDelete={askDelete}
                onConfirmDelete={deleteIngredient}
                onCancelDelete={cancelDelete}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
