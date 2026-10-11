"use client";

import SegmentedTabs from "@/components/common/segmented-tabs";
import SectionHeader from "@/components/recipe/section-header";
import { ADD_INGREDIENT_TABS, AddIngredientTab } from "./const";
import IngredientForm from "./ingredient-form";
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
  } = useIngredientsPage();

  return (
    <main className="flex-1">
      <div className="border-b border-border bg-white px-5 py-6 sm:px-10">
        <h1 className="font-serif text-2xl font-semibold text-ink">Ingredients</h1>
      </div>

      <div className="mx-auto max-w-[720px] px-5 py-8 pb-20 sm:px-10">
        <p className="mb-7 text-sm leading-relaxed text-body-text">
          Your personal ingredient list — matched first when calculating a recipe&apos;s
          calories. Anything not listed here falls back to a generic estimate from the USDA
          food database.
        </p>

        <SectionHeader step="01" label={isEditing ? "Edit ingredient" : "Add ingredient"} />
        <div className="mb-10 rounded-[10px] border border-border bg-white px-6 py-6 sm:px-8">
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

        <SectionHeader step="02" label="Your list" />
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
          <IngredientList
            items={items}
            confirmingDeleteId={confirmingDeleteId}
            isDeleting={isDeleting}
            onEdit={startEditing}
            onAskDelete={askDelete}
            onConfirmDelete={deleteIngredient}
            onCancelDelete={cancelDelete}
          />
        )}
      </div>
    </main>
  );
}
