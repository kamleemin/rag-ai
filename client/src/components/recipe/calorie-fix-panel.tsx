"use client";

import { Input } from "@/components/ui/input";
import IngredientForm from "@/components/ingredient/ingredient-form";
import { useCalorieFix } from "./use-calorie-fix";

/** Under a calorie line: pick the right USDA food, review it, and add it to your list. */
export default function CalorieFixPanel({
  ingredientName,
  onSaved,
  onClose,
}: {
  ingredientName: string;
  /** After the pick is saved to your list — the form recalculates. */
  onSaved: () => void;
  onClose: () => void;
}) {
  const {
    searchText,
    setSearchText,
    canSearch,
    search,
    handleSearchKeyDown,
    isSearching,
    searchErrorMessage,
    results,
    pickFood,
    backToResults,
    formInitialValues,
    pickedFoodId,
    saveIngredient,
    isSaving,
    saveErrorMessage,
  } = useCalorieFix(ingredientName, onSaved);

  return (
    <div className="mt-2 mb-1 rounded-lg border border-border bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <p className="text-xs text-body-text">
          Pick the right food for &quot;{ingredientName}&quot;. You&apos;ll check it before
          it&apos;s added to your ingredient list, and every recipe uses it from then on.
        </p>
        <button type="button" onClick={onClose} className="shrink-0 text-xs text-tan underline">
          Close
        </button>
      </div>

      {formInitialValues ? (
        <IngredientForm
          key={pickedFoodId}
          initialValues={formInitialValues}
          submitLabel="Add to ingredient list"
          onSubmit={saveIngredient}
          onCancel={backToResults}
          isSubmitting={isSaving}
          submitError={saveErrorMessage}
        />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2.5">
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search USDA foods"
              className="h-auto min-w-[180px] flex-1 rounded-md border-border bg-muted px-3 py-2.5 text-sm text-ink"
            />
            <button
              type="button"
              onClick={search}
              disabled={!canSearch}
              className="rounded-md border border-border px-4 font-sans text-[13px] font-semibold text-ink disabled:opacity-60"
            >
              {isSearching ? "Searching…" : "Search"}
            </button>
          </div>
          {searchErrorMessage && (
            <p role="alert" className="mb-2 text-[13px] text-red-600">
              {searchErrorMessage}
            </p>
          )}
          {isSearching && !results && <p className="text-xs text-tan">Searching USDA…</p>}
          {results && results.length === 0 && (
            <p className="text-[13px] text-body-text">
              No USDA foods found — try other words, or add it on the Ingredients page.
            </p>
          )}
          {results && results.length > 0 && (
            <ul className="max-h-[280px] divide-y divide-border overflow-y-auto rounded-md border border-border">
              {results.map(({ food, nutrients }) => (
                <li key={food.fdcId} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-[13px] text-ink">{food.name}</div>
                    <div className="text-xs text-tan-tint-text">{nutrients} per 100 g</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => pickFood(food)}
                    className="shrink-0 rounded-md border border-border px-3 py-1.5 font-sans text-xs font-semibold text-ink"
                  >
                    Use
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
